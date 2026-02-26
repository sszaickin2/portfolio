// Подключение функционала "Чертоги фрилансера"
import { FLS, getDigFormat } from "@js/common/functions.js";

// Модуль анимации цифрового счетчика
export function digitsCounter() {
	// Функция инициализации
	function digitsCountersInit(digitsCountersItems) {
		let digitsCounters = digitsCountersItems ? digitsCountersItems : document.querySelectorAll("[data-fls-digcounter]");
		if (digitsCounters.length) {

			FLS('_FLS_DIGCOUNTER_ANIM')

			digitsCounters.forEach(digitsCounter => {
				// Обнуление
				if (digitsCounter.hasAttribute('data-fls-digcounter-go')) return;
				digitsCounter.setAttribute('data-fls-digcounter-go', '');
				digitsCounter.dataset.flsDigcounter = digitsCounter.innerHTML;
				digitsCounter.innerHTML = `0`;
				// Анимация
				digitsCountersAnimate(digitsCounter);
			});
		}
	}
	// Функция анимации
	function digitsCountersAnimate(digitsCounter) {
		let startTimestamp = null;
		const duration = parseFloat(digitsCounter.dataset.flsDigcounterSpeed) ? parseFloat(digitsCounter.dataset.flsDigcounterSpeed) : 1000;
		const startValue = parseFloat(digitsCounter.dataset.flsDigcounter);
		const format = digitsCounter.dataset.flsDigcounterFormat ? digitsCounter.dataset.flsDigcounterFormat : ' ';
		const startPosition = 0;
		const step = (timestamp) => {
			if (!startTimestamp) startTimestamp = timestamp;
			const progress = Math.min((timestamp - startTimestamp) / duration, 1);
			const value = Math.floor(progress * (startPosition + startValue));
			digitsCounter.innerHTML = typeof digitsCounter.dataset.flsDigcounterFormat !== 'undefined' ? getDigFormat(value, format) : value;
			if (progress < 1) {
				window.requestAnimationFrame(step);
			} else {
				digitsCounter.removeAttribute('data-fls-digcounter-go');
			}
		};
		window.requestAnimationFrame(step);
	}
	function digitsCounterAction(e) {
		const entry = e.detail.entry;
		const targetElement = entry.target;
		if (
			targetElement.querySelectorAll("[data-fls-digcounter]").length &&
			!targetElement.querySelectorAll("[data-fls-watcher]").length &&
			entry.isIntersecting
		) {
			digitsCountersInit(targetElement.querySelectorAll("[data-fls-digcounter]"))
		}
	}
	document.addEventListener("watcherCallback", digitsCounterAction);
}
document.querySelector("[data-fls-digcounter]") ?
	window.addEventListener('load', digitsCounter) : null
