/**
 * Универсальная функция для замены алиасов в строках, объектах или массивах.
 * @param {string | object | Array} data - Данные для обработки (строка, объект или массив).
 * @param {Object} options - Опции для замены.
 * @param {boolean} [options.prependDot=false] - Добавлять ли точку ('.') в начале пути.
 * @param {boolean} [options.normalizePath=true] - Нормализовать ли путь (убирать двойные слэши).
 * @param {boolean} [options.sortAliases=true] - Сортировать ли алиасы по длине (более длинные — первыми).
 * @param {boolean} [options.preserveOriginal=true] - Возвращать ли исходные данные, если алиасов нет.
 * @param {Function} [options.transformReplacement] - Функция для трансформации значения замены.
 * @returns {string | object | Array} - Обработанные данные с заменёнными алиасами.
 */
import templateCfg from '../../template.config.js'

const replaceAliases = (data, { prependDot = false, normalizePath = true, sortAliases = true, preserveOriginal = true, transformReplacement } = {}) => {
	const aliases = templateCfg.aliases || {}

	// Если алиасов нет и preserveOriginal включён, возвращаем исходные данные
	if (preserveOriginal && Object.keys(aliases).length === 0) {
		return data
	}
	// Функция для экранирования специальных символов в регулярных выражениях
	const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

	// Обработка строк
	if (typeof data === 'string') {
		let result = data
		// Сортируем алиасы по длине (более длинные — первыми), если sortAliases включён
		const sortedAliases = sortAliases
			? Object.keys(aliases).sort((a, b) => b.length - a.length)
			: Object.keys(aliases)

		sortedAliases.forEach((alias) => {
			const regex = new RegExp(escapeRegExp(alias), 'g')
			if (result.match(regex)) {
				let replacement = aliases[alias]
				// Добавляем точку, если нужно
				if (prependDot) {
					replacement = `.${replacement}`
				}
				// Применяем кастомную трансформацию, если передана
				if (typeof transformReplacement === 'function') {
					replacement = transformReplacement(replacement, alias)
				}
				result = result.replace(regex, replacement)
			}
		})
		// Нормализуем путь, если нужно
		if (normalizePath && !result.startsWith('http')) {
			result = result.replace(/\/+/g, '/')
		}
		// Убираем SRC
		const src = new RegExp('src/', 'g')
		result = result.includes('src/') ? result.replace(src, '') : result

		return result
	}

	// Обработка массивов
	if (Array.isArray(data)) {
		return data.map(item => replaceAliases(item, { prependDot, normalizePath, sortAliases, preserveOriginal, transformReplacement }))
	}

	// Обработка объектов
	if (data && typeof data === 'object') {
		return Object.fromEntries(
			Object.entries(data).map(([key, value]) => [
				key,
				replaceAliases(value, { prependDot, normalizePath, sortAliases, preserveOriginal, transformReplacement }),
			])
		)
	}

	// Возвращаем неизменённые данные, если это не строка, массив или объект
	return data
}

export default replaceAliases