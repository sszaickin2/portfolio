// Подключение функционала " Чертоги фрилансера"
import { isMobile, gotoBlock, getHash, FLS, bodyUnlock } from "@js/common/functions.js";

// Плавная навигация по странице
export function pageNavigation() {
	// Работаем при нажатии на пункт
	document.addEventListener("click", pageNavigationAction);
	// Если подключен scrollWatcher, подсвечиваем текущий пункт меню
	document.addEventListener("watcherCallback", pageNavigationAction);
	// Основная функция
	function pageNavigationAction(e) {
		if (e.type === "click") {
			const targetElement = e.target;
			if (targetElement.closest('[data-fls-scrollto]')) {
				const gotoLink = targetElement.closest('[data-fls-scrollto]');
				const gotoLinkSelector = gotoLink.dataset.flsScrollto ? gotoLink.dataset.flsScrollto : '';
				const noHeader = gotoLink.hasAttribute('data-fls-scrollto-header') ? true : false;
				const gotoSpeed = gotoLink.dataset.flsScrolltoSpeed ? gotoLink.dataset.flsScrolltoSpeed : 500;
				const offsetTop = gotoLink.dataset.flsScrolltoTop ? parseInt(gotoLink.dataset.flsScrolltoTop) : 0;
				if (window.fullpage) {
					const fullpageSection = document.querySelector(`${gotoLinkSelector}`).closest('[data-fls-fullpage-section]');
					const fullpageSectionId = fullpageSection ? +fullpageSection.dataset.flsFullpageId : null;
					if (fullpageSectionId !== null) {
						window.fullpage.switchingSection(fullpageSectionId);
						// Закрываем меню, если оно открыто
						if (document.documentElement.hasAttribute("data-fls-menu-open")) {
							bodyUnlock()
							document.documentElement.removeAttribute("data-fls-menu-open")
						}
					}
				} else {
					gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
				}
				e.preventDefault();
			}
		} else if (e.type === "watcherCallback" && e.detail) {
			const entry = e.detail.entry;
			const targetElement = entry.target;
			// Обработка пунктов навигации: если указано значение navigator — подсвечиваем текущий пункт меню
			if (targetElement.dataset.flsWatcher === 'navigator') {
				const navigatorActiveItem = document.querySelector(`[data-fls-scrollto].--navigator-active`);
				let navigatorCurrentItem;
				if (targetElement.id && document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`)) {
					navigatorCurrentItem = document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`);
				} else if (targetElement.classList.length) {
					for (let index = 0; index < targetElement.classList.length; index++) {
						const element = targetElement.classList[index];
						if (document.querySelector(`[data-fls-scrollto=".${element}"]`)) {
							navigatorCurrentItem = document.querySelector(`[data-fls-scrollto=".${element}"]`);
							break;
						}
					}
				}
				if (entry.isIntersecting) {
					// Видим объект
					// navigatorActiveItem ? navigatorActiveItem.classList.remove('--navigator-active') : null;
					navigatorCurrentItem ? navigatorCurrentItem.classList.add('--navigator-active') : null;
					//const activeItems = document.querySelectorAll('.--navigator-active');
					//activeItems.length > 1 ? chooseOne(activeItems) : null
				} else {
					// Не видим объект
					navigatorCurrentItem ? navigatorCurrentItem.classList.remove('--navigator-active') : null;
				}
			}
		}
	}
	function chooseOne(activeItems) { }
	// Прокрутка по хэшу
	if (getHash()) {
		let goToHash;
		if (document.querySelector(`#${getHash()}`)) {
			goToHash = `#${getHash()}`;
		} else if (document.querySelector(`.${getHash()}`)) {
			goToHash = `.${getHash()}`;
		}
		goToHash ? gotoBlock(goToHash) : null;
	}
}

document.querySelector('[data-fls-scrollto]') ?
	window.addEventListener('load', pageNavigation) : null
