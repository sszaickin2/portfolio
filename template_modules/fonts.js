// Настройка шаблона
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'

import { globSync } from 'glob'
import fs from 'node:fs';
import path from 'node:path'

// Конвертация шрифтов
import Fontmin from 'fontmin';
// Локальное подключение удалённых шрифтов
import webfontDownload from 'vite-plugin-webfont-dl'
// Создание шрифта из SVG иконок
import viteSvgToWebfont from 'vite-svg-2-webfont'
// Оптимизация SVG иконок
import { svgOptimaze } from './svgoptimaze.js'

const isProduction = process.env.NODE_ENV === 'production'
const isWp = process.argv.includes('--wp')

// Пути к файлам
const fontsHTMLFile = 'src/components/layout/head/fonts-preload.html'
const fontsCSSFile = 'src/styles/fonts/fonts.css'
const iconsCSSFile = 'src/styles/fonts/iconfont.css'
const iconsPreviewFiles = globSync('src/assets/svgicons/preview/*.*')
const iconsFiles = globSync('src/assets/svgicons/*.svg')

// Обработка шрифтов
async function fontWork() {
	const fontsFiles = globSync('src/assets/fonts/*.{otf,ttf}', { posix: true })
	// Конвертация шрифтов
	if (fontsFiles.length) {
		logger('_FONTS_START')
		const fontConverter = new Fontmin()
			.src('src/assets/fonts/*.{otf,ttf}')
			.dest('src/assets/fonts')
			.use(Fontmin.otf2ttf())
			.use(Fontmin.ttf2woff2())
		fontConverter.run(function (err, files, stream) {
			if (err) {
				throw err;
			}
			fontHtmlCss()
		})
	} else {
		fontHtmlCss()
	}
}
// Создание HTML, CSS файлов и подключение шрифтов
const fontHtmlCss = () => {
	const fontsFiles = globSync('src/assets/fonts/*.woff2', { posix: true })
	if (fontsFiles.length) {
		// Переменные
		let newFileOnly
		let linksToFonts = ``
		let fontsStyles = ``
		let counter = {
			all: 0
		}
		fontsFiles.forEach(fontsFile => {
			// Имя файла
			const fontFileName = fontsFile.replace(new RegExp(' ', 'g'), '-').split('/').pop().split('.').slice(0, -1).join('.');
			// Если шрифт не был обработан ранее
			if (newFileOnly !== fontFileName) {
				const [fontName, fontWeightStr] = fontFileName.replace('--', '-').split("-");
				const fontStyle = fontFileName.toLowerCase().includes("-italic") ? "italic" : "normal";
				// Карта для преобразования названий веса в числовые значения
				const fontWeightMap = { "thin": 100, "hairline": 100, "extralight": 200, "ultralight": 200, "light": 300, "medium": 500, "semibold": 600, "demibold": 600, "bold": 700, "extrabold": 800, "ultrabold": 800, "black": 900, "heavy": 900, "extrablack": 950, "ultrablack": 950, };
				// Проверка наличия веса в карте, если нет — используем 400 (обычный)
				let fontWeight = fontWeightStr ? fontWeightMap[fontWeightStr.toLowerCase()] || 400 : 400;
				// Формирование ссылок на шрифт
				linksToFonts += `<link rel="preload" href="@fonts/${fontFileName}.woff2" as="font" type="font/woff2" crossorigin="anonymous">\n`;
				// Формирование стилей для шрифтов
				fontsStyles += `@font-face {font-family: ${fontName};font-display: swap;src: url("@fonts/${fontFileName}.woff2") format("woff2");font-weight: ${fontWeight};font-style: ${fontStyle};}\n`;
				// Обновляем имя обработанного файла
				newFileOnly = fontFileName;
			}
			counter.all++
		})
		fs.writeFile(fontsHTMLFile, linksToFonts, cb)
		fs.writeFile(fontsCSSFile, fontsStyles, cb)

		// Удаляем исходные файлы
		const fontsSrcFiles = globSync('src/assets/fonts/*.*', { posix: true })
		for (const file of fontsSrcFiles) {
			if (file.endsWith('.otf') || file.endsWith('.ttf')) {
				fs.unlink(file, (err) => { if (err) throw err })
			} else {
				file.includes(' ') ? fs.rename(file, file.replace(' ', '-'), () => { }) : null
			}
		}
		logger(`_FONTS_DONE`, [counter.all])
	} else {
		// Если шрифтов нет
		fs.writeFile(fontsHTMLFile, '', cb)
		fs.writeFile(fontsCSSFile, '', cb)
	}
}
// Добавление иконного шрифта
function addIconFonts() {
	if (iconsFiles.length && templateConfig.fonts.iconsfont) {
		!isProduction ? logger('_FONTS_ICONS_ADD_DONE') : null
	} else {
		fs.rm('src/assets/svgicons/preview', { recursive: true, force: true }, err => {
			if (err) {
				throw err;
			}
		});
		fs.rm('src/assets/svgicons/fixed', { recursive: true, force: true }, err => {
			if (err) {
				throw err;
			}
		});
		fs.writeFile(iconsCSSFile, '', cb)
	}
}
// Добавление шрифта для WP 
async function addWpFonts() {
	const styles = []
	styles.push(`import '@styles/fonts/fonts.css'`)
	iconsFiles.length && templateConfig.fonts.iconsfont ? styles.push(`import '@styles/fonts/iconfont.css'`) : null
	fs.writeFile('src/components/wordpress/fls-wp-fonts.js', styles.join('\n'), () => { })
}
// Плагины
export const fontPlugins = [
	// Обработка шрифтов
	await fontWork(),
	// Создание шрифта из SVG иконок
	(iconsFiles.length && templateConfig.fonts.iconsfont) ? await svgOptimaze(iconsFiles) : [],
	(iconsFiles.length && templateConfig.fonts.iconsfont) ? {
		order: 'post',
		...viteSvgToWebfont({
			classPrefix: "--icon-",
			cssDest: path.resolve(iconsCSSFile),
			cssFontsUrl: path.resolve('src/assets/svgicons/preview'),
			types: ["woff2"],
			dest: "src/assets/svgicons/preview",
			cssTemplate: path.resolve('template_modules/iconfont/css.hbs'),
			htmlTemplate: path.resolve('template_modules/iconfont/html.hbs'),
			context: path.resolve('src/assets/svgicons/fixed'),
			normalize: true,
			inline: true,
			generateFiles: true //!iconsPreviewFiles.length
		})
	} : [],
	{
		order: 'post',
		...addIconFonts()
	},
	// Локальное подключение удалённых шрифтов
	...((templateConfig.fonts.download) ? [webfontDownload(
		[], {
		cache: true,
		embedFonts: false,
		injectAsStyleTag: false
	}
	)] : []),
	...(isWp ? [addWpFonts()] : []),
	...(isWp && !isProduction ? [{
		name: 'wp-iconfont-path',
		order: 'pre',
		transform(html, file) {
			if (file.endsWith("fonts.css")) {
				const reg = /\/assets\/fonts\//g
				return html.replace(reg, `http://${templateConfig.server.hostname}:${templateConfig.server.port}/assets/fonts/`)
			} else if (file.endsWith("iconfont.css")) {
				const reg = /\/assets\/svgicons\/preview\//g
				return html.replace(reg, `http://${templateConfig.server.hostname}:${templateConfig.server.port}/assets/svgicons/preview/`)
			}
		},
	}] : [])
]
// Функция
function cb(err) {
	if (err) {
		throw err;
	}
}
