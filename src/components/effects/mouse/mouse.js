// Подключение функционала "Чертоги фрилансера
import { isMobile, FLS } from "@js/common/functions.js";

//Модуль параллакса мышью
// (c)Фрилансер по жизни, "Хмурый Кот"
// Документация: 

/*
Элементу, который будет двигаться за мышью, указать атрибут data-fls-mouse

// =========
Если нужны дополнительные настройки — указать

Атрибут											Значение по умолчанию
-------------------------------------------------------------------------------------------------------------------
data-fls-mouse-cx="коэффициент_х"					100							чем больше значение — тем меньше процент смещения
data-fls-mouse-cy="коэффициент_y"					100							чем больше значение — тем меньше процент смещения
data-fls-mouse-dxr																		против оси X
data-fls-mouse-dyr																		против оси Y
data-fls-mouse-a="скорость_анимации"				50								чем больше значение — тем выше скорость

// =========
Если нужно считывать движение мыши в родительском блоке — этому родителю указать атрибут data-fls-mouse-mouse-wrapper

Если в параллаксе картинка — растянуть её более чем на 100%.
Например:
	width: 130%;
	height: 130%;
	top: -15%;
	left: -15%;
*/
class MousePRLX {
	constructor(props, data = null) {
		let defaultConfig = {
			init: true,
		}
		this.config = Object.assign(defaultConfig, props);
		if (this.config.init) {
			const paralaxMouse = document.querySelectorAll('[data-fls-mouse]');
			if (paralaxMouse.length) {
				this.paralaxMouseInit(paralaxMouse);
				FLS(`_FLS_MOUSE_START`, paralaxMouse.length)
			} else {
				FLS(`_FLS_MOUSE_SLEEP`)
			}
		}
	}
	paralaxMouseInit(paralaxMouse) {
		paralaxMouse.forEach(el => {
			const paralaxMouseWrapper = el.closest('[data-fls-mouse-wrapper]');

			// Коэфф. X 
			const paramСoefficientX = +el.dataset.flsMouseCx || 100;
			// Коэфф. Y 
			const paramСoefficientY = +el.dataset.flsMouseCy || 100;
			// Напр. X
			const directionX = el.hasAttribute('data-fls-mouse-dxr') ? -1 : 1;
			// Напр. Y
			const directionY = el.hasAttribute('data-fls-mouse-dyr') ? -1 : 1;
			// Скорость анимации
			const paramAnimation = el.dataset.prlxA ? +el.dataset.prlxA : 50;


			// Объявление переменных
			let positionX = 0, positionY = 0;
			let coordXprocent = 0, coordYprocent = 0;

			setMouseParallaxStyle();

			// Проверяю наличие родителя, в котором будет считываться положение мыши
			if (paralaxMouseWrapper) {
				mouseMoveParalax(paralaxMouseWrapper);
			} else {
				mouseMoveParalax();
			}

			function setMouseParallaxStyle() {
				const distX = coordXprocent - positionX;
				const distY = coordYprocent - positionY;
				positionX = positionX + (distX * paramAnimation / 1000);
				positionY = positionY + (distY * paramAnimation / 1000);
				el.style.cssText = `transform: translate3D(${directionX * positionX / (paramСoefficientX / 10)}%,${directionY * positionY / (paramСoefficientY / 10)}%,0) rotate(0.02deg);`;
				requestAnimationFrame(setMouseParallaxStyle);
			}
			function mouseMoveParalax(wrapper = window) {
				wrapper.addEventListener("mousemove", function (e) {
					const offsetTop = el.getBoundingClientRect().top + window.scrollY;
					if (offsetTop >= window.scrollY || (offsetTop + el.offsetHeight) >= window.scrollY) {
						// Получение ширины и высоты блока
						const parallaxWidth = window.innerWidth;
						const parallaxHeight = window.innerHeight;
						// Ноль по центру
						const coordX = e.clientX - parallaxWidth / 2;
						const coordY = e.clientY - parallaxHeight / 2;
						// Получаем проценты
						coordXprocent = coordX / parallaxWidth * 100;
						coordYprocent = coordY / parallaxHeight * 100;
					}
				});
			}
		});
	}
}
// Запускаем
document.querySelector('[data-fls-mouse]') ?
	window.addEventListener('load', new MousePRLX({})) : null
