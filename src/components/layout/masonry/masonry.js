// Подключение функционала "Чертоги Фрилансера"
import { FLS } from "@js/common/functions.js";
// Подключение дополнения
import Isotope from 'isotope-layout/js/isotope.js';
// Подключение стилей
import './masonry.scss'
// Применение
function masonryRun() {
	document.addEventListener('click', documentActions);
	const isotope = document.querySelector('[data-fls-masonry]')
	const isotopeItems = new Isotope(isotope, {
		itemSelector: '[data-fls-masonry-item]',
		masonry: {
			fitWidth: true,
			gutter: 20
		}
	})
	// Функционал фильтра
	function documentActions(e) {
		const targetElement = e.target
		if (targetElement.closest('[data-fls-masonry-filter-link]')) {
			const filterItem = targetElement.closest('[data-fls-masonry-filter-link]')
			const filterValue = filterItem.dataset.flsMasonryFilterLink
			const filterActiveItem = document.querySelector('[data-fls-masonry-filter-link].--active')

			filterValue === "*" ? isotopeItems.arrange({ filter: `` }) :
				isotopeItems.arrange({ filter: `[data-fls-masonry-filter="${filterValue}"]` })

			filterActiveItem.classList.remove('--active')
			filterItem.classList.add('--active')

			e.preventDefault()
		}
	}
}
document.querySelector('[data-fls-masonry]') ?
	window.addEventListener('load', masonryRun) : null
