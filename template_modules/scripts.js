// Настройка шаблона
import templateConfig from '../template.config.js'
const finalAliases = templateConfig.aliases
// Логгер
import logger from './logger.js'

import { normalizePath } from 'vite'
import * as esbuild from 'esbuild'
import { Glob, globSync } from 'glob'
import fs from 'fs'

const isProduction = process.env.NODE_ENV === 'production'
const isWp = process.argv.includes('--wp')
const isAssets = templateConfig.server.isassets || isWp ? `assets/` : ``

const pathPrefix = isWp ? `src/components/wordpress/fls-theme/build/${isAssets}` : `dist/${isAssets}`

const pathToFiles = `${pathPrefix}js/*.js`
const pathToDev = `${pathPrefix}js/dev`
const pathToOptimize = `${pathPrefix}js`

export const scriptsPlugins = [
	// Обработка псевдонимов в JS-файлах
	{
		name: 'do-aliases',
		order: "pre",
		transform(html, file) {
			if (file.endsWith(".js")) {
				Object.keys(finalAliases).forEach((alias) => {
					if (html.includes(alias)) {
						finalAliases[alias] = finalAliases[alias].replace(new RegExp(`src`, "g"), ``)
						html = html.replace(new RegExp(alias, "g"), finalAliases[alias])
					}
				})
			}
			return html
		},
	},
	// Очистка от модуля FLS
	...((isProduction && templateConfig.logger.console.removeonbuild) ? [{
		name: 'fls-clean',
		apply: 'build',
		enforce: 'post',
		transform(src, id) {
			if (id.endsWith('.js')) {
				return src.replace(/(?<!function\s)FLS\(.*?\);?/gi, '')
			}
		}
	}] : []),
	// Создание копии файла(ов) для разработчиков
	...((isProduction && templateConfig.js.devfiles) ? [{
		name: "js-devfiles",
		apply: 'build',
		enforce: 'pre',
		closeBundle: {
			order: 'pre',
			handler: async () => {
				const jsFiles = globSync(pathToFiles)
				// Создание копий
				!fs.existsSync(pathToDev) ? fs.mkdirSync(pathToDev) : null
				jsFiles.forEach(async (jsFile) => {
					jsFile = normalizePath(jsFile)
					const devJsFile = jsFile.replace('.min', '').replace('/js/', '/js/dev/')
					fs.copyFileSync(jsFile, devJsFile)
				});
				logger('_IMG_JS_DEV_DONE')
				// Оптимизация файлов
				await esbuild.build({
					entryPoints: jsFiles,
					allowOverwrite: true,
					minify: true,
					outdir: pathToOptimize,
				})
			}
		}
	}] : []),
	// Динамическое добавление JS-модулей
	...(templateConfig.js.hotmodules ? [{
		name: 'hot-modules',
		transformIndexHtml: {
			order: 'pre',
			handler(html) {
				return insertModule(html)
			}
		},
	}] : []),
]
async function insertModule(html) {
	const modules = new Set()
	const moduleJSFiles = new Glob(`src/components/**/*.js`, { ignore: ['**/_*.*', '**/plugins/**', '**/wordpress/**'] })
	const modulePlugins = new Map()
	for (let moduleJSFile of moduleJSFiles) {
		moduleJSFile = normalizePath(moduleJSFile).replace('src', '')
		const moduleName = moduleJSFile.split('/').pop().replace('.js', '')
		const pluginFiles = globSync(`src/components/*/${moduleName}/plugins/**/*.js`)
		modulePlugins.set(moduleName, pluginFiles.map(plugin => normalizePath(plugin).replace('src', '')))

	}
	for (let moduleJSFile of moduleJSFiles) {
		moduleJSFile = normalizePath(moduleJSFile).replace('src', '')
		const moduleName = moduleJSFile.split('/').pop().replace('.js', '')
		const regex = new RegExp(`\\bdata-fls-${moduleName}\\b`)
		if (regex.test(html)) {
			modules.add(`<script type="module" src="${moduleJSFile}"></script>`)
			// Проверяем, есть ли плагины для этого модуля
			const curentModulePlugins = modulePlugins.get(moduleName)
			if (curentModulePlugins) {
				curentModulePlugins.forEach(curentModulePlugin => {
					const pluginName = curentModulePlugin.split('/').pop().replace('.js', '')
					const pluginRegex = new RegExp(`\\bdata-fls-${moduleName}-${pluginName}\\b`)
					if (pluginRegex.test(html)) {
						modules.add(`<script type="module" src="${curentModulePlugin}"></script>`)
					}
				})
			}
		}
	}
	return html.replace('</head>', `${Array.from(modules).join('')}</head>`)
}
