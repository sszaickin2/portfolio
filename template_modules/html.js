// Настройка шаблона
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'
// Навигационная панель
import { navPanel } from './navpanel.js'

import { globSync } from 'glob'
import fs from 'fs'

// Обработка HTML
import posthtml from 'posthtml'
import prerenderHTML from './posthtml/prerender.js'
import posthtmBeautify from 'posthtml-beautify'

import nunjucks from 'vite-plugin-nunjucks'

import pugAliases from "pug-alias"
import pugPlugin from "./pug.js"

const isProduction = process.env.NODE_ENV === 'production'
const isWp = process.argv.includes('--wp')

export const htmlPlugins = [
	// Предобработка Include, Extend, Expressions
	prerenderHTML({}),
	// Nunjucks 
	nunjucks(),
	// Навигационная панель
	...((!isWp && ((!isProduction && templateConfig.navpanel.dev) || (isProduction && templateConfig.navpanel.build))) ? [{
		name: 'nav-panel',
		order: 'pre',
		transformIndexHtml(html) {
			html = html.replace("</body>", `${navPanel()}</body>`)
			return html
		},
	}] : []),
	// Для открытия в проводнике
	...((isProduction && templateConfig.server.buildforlocal) ? [{
		name: 'build-for-local',
		order: 'post',
		transformIndexHtml(html) {
			html = html.replace(new RegExp(`type="module"`, 'gi'), ``)
			html = html.replace(new RegExp(`crossorigin`, 'gi'), `defer`)
			return html
		},
	}] : []),
	// Препроцессор PUG
	...((templateConfig.pug.enable) ?
		[pugPlugin({
			plugins: [
				pugAliases({ '@pug': 'src/pug' })
			]
		})] : []),
	// Постобработка HTML-файлов
	{
		name: 'add-posthtml',
		apply: 'build',
		enforce: 'post',
		closeBundle: async () => {
			const htmlFiles = globSync(`dist/*.html`)
			htmlFiles.forEach(async htmlFile => {
				let content = fs.readFileSync(htmlFile, 'utf-8')
				// Пути SVG-спрайта
				if (templateConfig.images.svgsprite && content.includes('__spritemap')) {
					content = content.replace(new RegExp('__spritemap', 'gi'), `${templateConfig.server.path}assets/img/spritemap.svg`)
				}
				// Форматирование
				if (templateConfig.html.beautify.enable) {
					const render = await new Promise((resolve) => {
						const output = {}
						const plugins = [
							posthtmBeautify({
								rules: {
									indent: templateConfig.html.beautify.indent,
									blankLines: '',
									sortAttrs: true
								},
							})
						]
						posthtml(plugins).process(content).catch(error => {
							output.error = error
							console.log(error);
							resolve(output)
						}).then(result => {
							output.content = result?.html
							resolve(output)
						})
					})
					content = render.content
				}

				// Замена common.js
				content = content.replace(/<script\s+type="module"\s+crossorigin=""\s+src="(.\/js\/common\.min\.js\?v=\d+)"><\/script>/, '<link rel="modulepreload" crossorigin href="$1">')

				fs.writeFileSync(htmlFile, content, 'utf-8');
			})
		}
	}
]