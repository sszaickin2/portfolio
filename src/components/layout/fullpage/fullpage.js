// Подключение функционала "Чертоги фрилансера
import { isMobile, FLS } from "@js/common/functions.js";

import './fullpage.scss'

// Класс FullPage
class FullPage {
	constructor(element, options) {
		let config = {
			//===============================
			// Селектор, на котором не работает событие свайпа/колеса
			noEventSelector: '[data-fls-fullpage-noevent]',
			//===============================
			// Настройки оболочки
			// Класс при инициализации плагина
			classInit: '--fullpage-init',
			// Класс для врапера во время пролистывания
			wrapperAnimatedClass: '--fullpage-switching',
			//===============================
			// Настройки секций
			// СЕЛЕКТОР для секций
			selectorSection: '[data-fls-fullpage-section]',
			// Класс для активной секции
			activeClass: '--fullpage-active-section',
			// Класс для предыдущей секции
			previousClass: '--fullpage-previous-section',
			// Класс для следующей секции
			nextClass: '--fullpage-next-section',
			// id изначально активного класса
			idActiveSection: 0,
			//===============================
			// Прочие настройки
			// Свайп мышью
			// touchSimulator: false,
			//===============================
			// Эффекты
			// Эффекты: fade, cards, slider
			mode: element.dataset.flsFullpageEffect ? element.dataset.flsFullpageEffect : 'slider',
			//===============================
			// Буллеты
			// Активация буллетов
			bullets: element.hasAttribute('data-fls-fullpage-bullets') ? true : false,
			// Класс оболочки буллетов
			bulletsClass: '--fullpage-bullets',
			// Класс буллета
			bulletClass: '--fullpage-bullet',
			// Класс активного буллета
			bulletActiveClass: '--fullpage-bullet-active',
			//===============================
			// События
			// Событие создания
			onInit: function () { },
			// Событие перелистывания секции
			onSwitching: function () { },
			// Событие разрушения плагина
			onDestroy: function () { },
		}
		this.options = Object.assign(config, options);
		// Родительский элемент
		this.wrapper = element;
		this.sections = this.wrapper.querySelectorAll(this.options.selectorSection);
		// Активный слайд
		this.activeSection = false;
		this.activeSectionId = false;
		// Предыдущий слайд
		this.previousSection = false;
		this.previousSectionId = false;
		// Следующий слайд
		this.nextSection = false;
		this.nextSectionId = false;
		// Оболочка буллетов
		this.bulletsWrapper = false;
		// Вспомогательная переменная
		this.stopEvent = false;
		if (this.sections.length) {
			// Инициализация элементов
			this.init();
		}
	}
	//===============================
	// Начальная инициализация
	init() {
		if (this.options.idActiveSection > (this.sections.length - 1)) return
		// Расставляем id
		this.setId();
		this.activeSectionId = this.options.idActiveSection;
		// Присвоение классов с разными эффектами
		this.setEffectsClasses();
		// Установка классов
		this.setClasses();
		// Установка стилей
		this.setStyle();
		// Установка буллетов
		if (this.options.bullets) {
			this.setBullets();
			this.setActiveBullet(this.activeSectionId);
		}
		// Установка событий
		this.events();
		// Устанавливаем init класс
		setTimeout(() => {
			FLS('_FLS_FULLPAGE_START', this.sections.length)

			document.documentElement.classList.add(this.options.classInit);
			// Создание кастомного события
			this.options.onInit(this);
			document.dispatchEvent(new CustomEvent("fpinit", {
				detail: {
					fp: this
				}
			}));
		}, 0);
	}
	//===============================
	// Удалить
	destroy() {
		// Удаление событий
		this.removeEvents();
		// Удаление классов у секций
		this.removeClasses();
		// Удаление класса инициализации
		document.documentElement.classList.remove(this.options.classInit);
		// Удаление класса анимации
		this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
		// Удаление классов эффектов
		this.removeEffectsClasses();
		// Удаление z-index у секций
		this.removeZIndex();
		// Удаление стилей
		this.removeStyle();
		// Удаление ID
		this.removeId();
		// Создание кастомного события
		this.options.onDestroy(this);
		document.dispatchEvent(new CustomEvent("fpdestroy", {
			detail: {
				fp: this
			}
		}));
	}
	//===============================
	// Установка ID для секций
	setId() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.setAttribute('data-fls-fullpage-id', index);
		}
	}
	//===============================
	// Удаление ID для секций
	removeId() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.removeAttribute('data-fls-fullpage-id');
		}
	}
	//===============================
	// Функция установки классов для первой, активной и следующей секций
	setClasses() {
		// Сохранение id для ПРЕДЫДУЩЕГО слайда (если такой есть)
		this.previousSectionId = (this.activeSectionId - 1) >= 0 ?
			this.activeSectionId - 1 : false;

		// Сохранение id для СЛЕДУЮЩЕГО слайда (если такой есть)
		this.nextSectionId = (this.activeSectionId + 1) < this.sections.length ?
			this.activeSectionId + 1 : false;

		// Установка класса и присвоение элемента для АКТИВНОГО слайда
		this.activeSection = this.sections[this.activeSectionId];
		this.activeSection.classList.add(this.options.activeClass);

		for (let index = 0; index < this.sections.length; index++) {
			document.documentElement.classList.remove(`--fullpage-section-${index}`);
		}
		document.documentElement.classList.add(`--fullpage-section-${this.activeSectionId}`);

		// Установка класса и присвоение элемента для ПРЕДЫДУЩЕГО слайда
		if (this.previousSectionId !== false) {
			this.previousSection = this.sections[this.previousSectionId];
			this.previousSection.classList.add(this.options.previousClass);
		} else {
			this.previousSection = false;
		}

		// Установка класса и присвоение элемента для СЛЕДУЮЩЕГО слайда
		if (this.nextSectionId !== false) {
			this.nextSection = this.sections[this.nextSectionId];
			this.nextSection.classList.add(this.options.nextClass);
		} else {
			this.nextSection = false;
		}
	}
	//===============================
	// Снятие классов эффектов
	removeEffectsClasses() {
		switch (this.options.mode) {
			case 'slider':
				this.wrapper.classList.remove('slider-mode');
				break;

			case 'cards':
				this.wrapper.classList.remove('cards-mode');
				this.setZIndex();
				break;

			case 'fade':
				this.wrapper.classList.remove('fade-mode');
				this.setZIndex();
				break;

			default:
				break;
		}
	}
	//===============================
	// Присвоение классов с разными эффектами
	setEffectsClasses() {
		switch (this.options.mode) {
			case 'slider':
				this.wrapper.classList.add('slider-mode');
				break;

			case 'cards':
				this.wrapper.classList.add('cards-mode');
				this.setZIndex();
				break;

			case 'fade':
				this.wrapper.classList.add('fade-mode');
				this.setZIndex();
				break;

			default:
				break;
		}
	}
	//===============================
	// Блокировка направлений скролла
	//===============================
	// Функция установки стилей
	setStyle() {
		switch (this.options.mode) {
			case 'slider':
				this.styleSlider();
				break;

			case 'cards':
				this.styleCards();
				break;

			case 'fade':
				this.styleFade();
				break;
			default:
				break;
		}
	}
	// slider-mode
	styleSlider() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			if (index === this.activeSectionId) {
				section.style.transform = 'translate3D(0,0,0)';
			} else if (index < this.activeSectionId) {
				section.style.transform = 'translate3D(0,-100%,0)';
			} else if (index > this.activeSectionId) {
				section.style.transform = 'translate3D(0,100%,0)';
			}
		}
	}
	// cards mode
	styleCards() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			if (index >= this.activeSectionId) {
				section.style.transform = 'translate3D(0,0,0)';
			} else if (index < this.activeSectionId) {
				section.style.transform = 'translate3D(0,-100%,0)';
			}
		}
	}
	// fade style 
	styleFade() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			if (index === this.activeSectionId) {
				section.style.opacity = '1';
				section.style.pointerEvents = 'all';
				//section.style.visibility = 'visible';
			} else {
				section.style.opacity = '0';
				section.style.pointerEvents = 'none';
				//section.style.visibility = 'hidden';
			}
		}
	}
	//===============================
	// Удаление стилей
	removeStyle() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.style.opacity = '';
			section.style.visibility = '';
			section.style.transform = '';
		}
	}
	//===============================
	// Функция проверки полностью ли был прокручен элемент
	checkScroll(yCoord, element) {
		this.goScroll = false;

		// Есть ли элемент и готов ли к работе 
		if (!this.stopEvent && element) {
			this.goScroll = true;
			// Если высота секции не равна высоте окна
			if (this.haveScroll(element)) {
				this.goScroll = false;
				const position = Math.round(element.scrollHeight - element.scrollTop);
				// Проверка на то, полностью ли прокручена секция
				if (
					((Math.abs(position - element.scrollHeight) < 2) && yCoord <= 0) ||
					((Math.abs(position - element.clientHeight) < 2) && yCoord >= 0)
				) {
					this.goScroll = true;
				}
			}
		}
	}
	//===============================
	// Проверка высоты 
	haveScroll(element) {
		return element.scrollHeight !== window.innerHeight
	}
	//===============================
	// Удаление классов 
	removeClasses() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.classList.remove(this.options.activeClass);
			section.classList.remove(this.options.previousClass);
			section.classList.remove(this.options.nextClass);
		}
	}
	//===============================
	// Сборник событий...
	events() {
		this.events = {
			// Колесо мыши
			wheel: this.wheel.bind(this),

			// Свайп
			touchdown: this.touchDown.bind(this),
			touchup: this.touchUp.bind(this),
			touchmove: this.touchMove.bind(this),
			touchcancel: this.touchUp.bind(this),

			// Конец анимации
			transitionEnd: this.transitionend.bind(this),

			// Клик для буллетов
			click: this.clickBullets.bind(this),
		}
		if (isMobile.iOS()) {
			document.addEventListener('touchmove', (e) => {
				e.preventDefault();
			});
		}
		this.setEvents();
	}
	setEvents() {
		// Событие колеса мыши
		this.wrapper.addEventListener('wheel', this.events.wheel);
		// Событие нажатия на экран
		this.wrapper.addEventListener('touchstart', this.events.touchdown);
		// Событие клика по буллетам
		if (this.options.bullets && this.bulletsWrapper) {
			this.bulletsWrapper.addEventListener('click', this.events.click);
		}
	}
	removeEvents() {
		this.wrapper.removeEventListener('wheel', this.events.wheel);
		this.wrapper.removeEventListener('touchdown', this.events.touchdown);
		this.wrapper.removeEventListener('touchup', this.events.touchup);
		this.wrapper.removeEventListener('touchcancel', this.events.touchup);
		this.wrapper.removeEventListener('touchmove', this.events.touchmove);
		if (this.bulletsWrapper) {
			this.bulletsWrapper.removeEventListener('click', this.events.click);
		}
	}
	//===============================
	// Функция клика по буллетам
	clickBullets(e) {
		// Нажатый буллет
		const bullet = e.target.closest(`.${this.options.bulletClass}`);
		if (bullet) {
			// Массив всех буллетов
			const arrayChildren = Array.from(this.bulletsWrapper.children);

			// id нажатого буллета
			const idClickBullet = arrayChildren.indexOf(bullet)

			// Переключение секции
			this.switchingSection(idClickBullet)
		}
	}
	//===============================
	// Установка стилей для буллетов
	setActiveBullet(idButton) {
		if (!this.bulletsWrapper) return
		// Все буллеты
		const bullets = this.bulletsWrapper.children;

		for (let index = 0; index < bullets.length; index++) {
			const bullet = bullets[index];
			if (idButton === index) bullet.classList.add(this.options.bulletActiveClass);
			else bullet.classList.remove(this.options.bulletActiveClass);
		}
	}
	//===============================
	// Функция нажатия тач/пера/курсора
	touchDown(e) {
		// Переменная для свайпа
		this._yP = e.changedTouches[0].pageY;
		this._eventElement = e.target.closest(`.${this.options.activeClass}`);
		if (this._eventElement) {
			// Вешаем события touchmove и touchup
			this._eventElement.addEventListener('touchend', this.events.touchup);
			this._eventElement.addEventListener('touchcancel', this.events.touchup);
			this._eventElement.addEventListener('touchmove', this.events.touchmove);
			// Тач произошел
			this.clickOrTouch = true;

			//==============================
			if (isMobile.iOS()) {
				if (this._eventElement.scrollHeight !== this._eventElement.clientHeight) {
					if (this._eventElement.scrollTop === 0) {
						this._eventElement.scrollTop = 1;
					}
					if (this._eventElement.scrollTop === this._eventElement.scrollHeight - this._eventElement.clientHeight) {
						this._eventElement.scrollTop = this._eventElement.scrollHeight - this._eventElement.clientHeight - 1;
					}
				}
				this.allowUp = this._eventElement.scrollTop > 0;
				this.allowDown = this._eventElement.scrollTop < (this._eventElement.scrollHeight - this._eventElement.clientHeight);
				this.lastY = e.changedTouches[0].pageY;
			}
			//===============================
		}
	}
	//===============================
	// Событие движения тач/пера/курсора
	touchMove(e) {
        // Получение секции, на которой срабатывает событие
		const targetElement = e.target.closest(`.${this.options.activeClass}`);
		//===============================
		if (isMobile.iOS()) {
			let up = e.changedTouches[0].pageY > this.lastY;
			let down = !up;
			this.lastY = e.changedTouches[0].pageY;
			if (targetElement) {
				if ((up && this.allowUp) || (down && this.allowDown)) {
					e.stopPropagation();
				} else if (e.cancelable) {
					e.preventDefault();
				}
			}
		}
		//===============================
		// Проверка на завершение анимации и наличие НЕ СОБЫТИЙНОГО блока
		if (!this.clickOrTouch || e.target.closest(this.options.noEventSelector)) return
		// Получение направления движения
		let yCoord = this._yP - e.changedTouches[0].pageY;
		// Разрешен ли переход? 
		this.checkScroll(yCoord, targetElement);
		// Переход
		if (this.goScroll && Math.abs(yCoord) > 20) {
			this.choiceOfDirection(yCoord);
		}
	}
	//===============================
	// Событие отпускания от экрана тач/пера/курсора
	touchUp(e) {
		// Удаление событий
		this._eventElement.removeEventListener('touchend', this.events.touchup);
		this._eventElement.removeEventListener('touchcancel', this.events.touchup);
		this._eventElement.removeEventListener('touchmove', this.events.touchmove);
		return this.clickOrTouch = false;
	}
	//===============================
	// Конец срабатывания перехода
	transitionend(e) {
		//if (e.target.closest(this.options.selectorSection)) {
		this.stopEvent = false;
		document.documentElement.classList.remove(this.options.wrapperAnimatedClass);
		this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
		//}
	}
	//===============================
	// Событие прокрутки колесом мыши
	wheel(e) {
		// Проверка на наличие НЕ СОБЫТИЙНОГО блока
		if (e.target.closest(this.options.noEventSelector)) return
		// Получение направления движения
		const yCoord = e.deltaY;
		// Получение секции, на которой срабатывает событие
		const targetElement = e.target.closest(`.${this.options.activeClass}`);
		// Разрешен ли переход? 
		this.checkScroll(yCoord, targetElement);
		// Переход
		if (this.goScroll) this.choiceOfDirection(yCoord);
	}
	//===============================
	// Функция выбора направления
	choiceOfDirection(direction) {
		// Установка нужных id
		if (direction > 0 && this.nextSection !== false) {
			this.activeSectionId = (this.activeSectionId + 1) < this.sections.length ?
				++this.activeSectionId : this.activeSectionId;
		} else if (direction < 0 && this.previousSection !== false) {
			this.activeSectionId = (this.activeSectionId - 1) >= 0 ?
				--this.activeSectionId : this.activeSectionId;
		}
		// Смена слайдов
		this.switchingSection(this.activeSectionId, direction);
	}
	//===============================
	// Функция переключения слайдов
	switchingSection(idSection = this.activeSectionId, direction) {
		if (!direction) {
			if (idSection < this.activeSectionId) {
				direction = -100;
			} else if (idSection > this.activeSectionId) {
				direction = 100;
			}
		}
		this.activeSectionId = idSection;

		// Останавливаем работу событий
		this.stopEvent = true;
		// Если слайд крайний, то позволяем события
		if (((this.previousSectionId === false) && direction < 0) || ((this.nextSectionId === false) && direction > 0)) {
			this.stopEvent = false;
		}

		if (this.stopEvent) {
			// Установка события окончания проигрывания анимации
			document.documentElement.classList.add(this.options.wrapperAnimatedClass);
			this.wrapper.classList.add(this.options.wrapperAnimatedClass);
			//this.wrapper.addEventListener('transitionend', this.events.transitionEnd);
			// Удаление классов
			this.removeClasses();
			// Смена классов 
			this.setClasses();
			// Смена стилей
			this.setStyle();
			// Установка стилей для буллетов
			if (this.options.bullets) this.setActiveBullet(this.activeSectionId);

			// Устанавливаем задержку переключения
			// Добавляем классы направления движения
			let delaySection;
			if (direction < 0) {
				delaySection = this.activeSection.dataset.flsFullpageDirectionUp ? parseInt(this.activeSection.dataset.flsFullpageDirectionUp) : 500;
				document.documentElement.classList.add('--fullpage-up');
				document.documentElement.classList.remove('--fullpage-down');
			} else {
				delaySection = this.activeSection.dataset.flsFullpageDirectionDown ? parseInt(this.activeSection.dataset.flsFullpageDirectionDown) : 500;
				document.documentElement.classList.remove('--fullpage-up');
				document.documentElement.classList.add('--fullpage-down');
			}

			FLS('_FLS_FULLPAGE_GOTO', idSection)

			setTimeout(() => {
				this.events.transitionEnd();
			}, delaySection);


			// Создание события
			this.options.onSwitching(this);
			document.dispatchEvent(new CustomEvent("fpswitching", {
				detail: {
					fp: this
				}
			}));
		}
	}
	//===============================
	// Установка буллетов
	setBullets() {
		// Поиск оболочки буллетов
		this.bulletsWrapper = document.querySelector(`.${this.options.bulletsClass}`);

		// Если нет — создаем
		if (!this.bulletsWrapper) {
			const bullets = document.createElement('div');
			bullets.classList.add(this.options.bulletsClass);
			this.wrapper.append(bullets);
			this.bulletsWrapper = bullets;
		}

		// Создание буллетов
		if (this.bulletsWrapper) {
			for (let index = 0; index < this.sections.length; index++) {
				const span = document.createElement('span');
				span.classList.add(this.options.bulletClass);
				this.bulletsWrapper.append(span);
			}
		}
	}
	//===============================
	// Z-INDEX
	setZIndex() {
		let zIndex = this.sections.length
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.style.zIndex = zIndex;
			--zIndex;
		}
	}
	removeZIndex() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.style.zIndex = ''
		}
	}
}
// Запускаем и добавляем в объект модулей
if (document.querySelector('[data-fls-fullpage]')) {
	window.addEventListener('load', () => window.flsFullpage = new FullPage(document.querySelector('[data-fls-fullpage]')))
}
