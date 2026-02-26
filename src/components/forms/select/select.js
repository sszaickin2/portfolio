// Подключение функционала "Чертоги фрилансера
import { isMobile, slideUp, slideDown, slideToggle, FLS } from "@js/common/functions.js";
// Подключение функционала модуля форм
import { formValidate } from "../_functions.js";

/*
Документация:
Сниппет (HTML): sel
*/

import "./select.scss";

// Класс построения Select
class SelectConstructor {
	constructor(props, data = null) {
		let defaultConfig = {
			init: true,
			speed: 150
		}
		this.config = Object.assign(defaultConfig, props);
		// CSS классы модуля
		this.selectClasses = {
			classSelect: "select", // Главный блок
			classSelectBody: "select__body", // Тело селекта
			classSelectTitle: "select__title", // Заголовок
			classSelectValue: "select__value", // Значение в заголовке
			classSelectLabel: "select__label", // Лейбл
			classSelectInput: "select__input", // Поле ввода
			classSelectText: "select__text", // Оболочка текстовых данных
			classSelectLink: "select__link", // Ссылка в элементе
			classSelectOptions: "select__options", // Выпадающий список
			classSelectOptionsScroll: "select__scroll", // Оболочка при скролле
			classSelectOption: "select__option", // Пункт
			classSelectContent: "select__content", // Оболочка контента в заголовке
			classSelectRow: "select__row", // Ряд
			classSelectData: "select__asset", // Дополнительные данные
			classSelectDisabled: "--select-disabled", // Запрещено
			classSelectTag: "--select-tag", // Класс тега
			classSelectOpen: "--select-open", // Список открыт
			classSelectActive: "--select-active", // Список выбран
			classSelectFocus: "--select-focus", // Список в фокусе
			classSelectMultiple: "--select-multiple", // Множественный выбор
			classSelectCheckBox: "--select-checkbox", // Стиль чекбокса
			classSelectOptionSelected: "--select-selected", // Выбранный пункт
			classSelectPseudoLabel: "--select-pseudo-label", // Псевдолейбл
		}
		this._this = this;
		// Запуск инициализации
		if (this.config.init) {
			// Получение всех select на странице
			const selectItems = data ? document.querySelectorAll(data) : document.querySelectorAll('select[data-fls-select]');
			if (selectItems.length) {
				this.selectsInit(selectItems);
				FLS(`_FLS_SELECT_START`, selectItems.length)
			} else {
				FLS('_FLS_SELECT_SLEEP')
			}
		}
	}
	// Конструктор CSS класса
	getSelectClass(className) {
		return `.${className}`;
	}
	// Геттер элементов псевдоселекта
	getSelectElement(selectItem, className) {
		return {
			originalSelect: selectItem.querySelector('select'),
			selectElement: selectItem.querySelector(this.getSelectClass(className)),
		}
	}
	// Функция инициализации всех селектов
	selectsInit(selectItems) {
		selectItems.forEach((originalSelect, index) => {
			this.selectInit(originalSelect, index + 1);
		});
		// Обработчики событий...
		// ...при клике
		document.addEventListener('click', function (e) {
			this.selectsActions(e);
		}.bind(this));
		// ...при нажатии клавиши
		document.addEventListener('keydown', function (e) {
			this.selectsActions(e);
		}.bind(this));
		// ...при фокусе
		document.addEventListener('focusin', function (e) {
			this.selectsActions(e);
		}.bind(this));
		// ...при потере фокуса
		document.addEventListener('focusout', function (e) {
			this.selectsActions(e);
		}.bind(this));
	}
	// Функция инициализации конкретного селекта
	selectInit(originalSelect, index) {
		// Присваиваем уникальный ID
		index ? originalSelect.dataset.flsSelectId = index : null;
		// Если есть элементы — продолжаем
		if (originalSelect.options.length) {
			const _this = this;
			// Создаем оболочку
			let selectItem = document.createElement("div");
			selectItem.classList.add(this.selectClasses.classSelect);
			// Выводим оболочку перед оригинальным селектом
			originalSelect.parentNode.insertBefore(selectItem, originalSelect);
			// Помещаем оригинальный селект в оболочку
			selectItem.appendChild(originalSelect);
			// Прячем оригинальный селект
			originalSelect.hidden = true;

			// Работа с плейсхолдером
			if (this.getSelectPlaceholder(originalSelect)) {
				// Запоминаем плейсхолдер
				originalSelect.dataset.placeholder = this.getSelectPlaceholder(originalSelect).value;
				// Если включен режим label
				if (this.getSelectPlaceholder(originalSelect).label.show) {
					const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
					selectItemTitle.insertAdjacentHTML('afterbegin', `<span class="${this.selectClasses.classSelectLabel}">${this.getSelectPlaceholder(originalSelect).label.text ? this.getSelectPlaceholder(originalSelect).label.text : this.getSelectPlaceholder(originalSelect).value}</span>`);
				}
			}
			// Конструктор основных элементов
			selectItem.insertAdjacentHTML('beforeend', `<div class="${this.selectClasses.classSelectBody}"><div hidden class="${this.selectClasses.classSelectOptions}"></div></div>`);
			// Запускаем конструктор псевдоселекта
			this.selectBuild(originalSelect);

			// Запоминаем скорость
			originalSelect.dataset.flsSelectSpeed = originalSelect.dataset.flsSelectSpeed ? originalSelect.dataset.flsSelectSpeed : this.config.speed;
			this.config.speed = +originalSelect.dataset.flsSelectSpeed

			// Событие при изменении оригинального select
			originalSelect.addEventListener('change', function (e) {
				_this.selectChange(e);
			});
		}
	}
	// Конструктор псевдоселекта
	selectBuild(originalSelect) {
		const selectItem = originalSelect.parentElement;
		// Переносим атрибут ID селекта
		if (originalSelect.id) {
			selectItem.id = originalSelect.id
			originalSelect.removeAttribute('id')
		}
		// Добавляем ID селекта
		selectItem.dataset.flsSelectId = originalSelect.dataset.flsSelectId;
		// Получаем класс оригинального селекта, создаем модификатор и добавляем его
		originalSelect.dataset.flsSelectModif ? selectItem.classList.add(`select--${originalSelect.dataset.flsSelectModif}`) : null;
		// Если множественный выбор — добавляем класс
		originalSelect.multiple ? selectItem.classList.add(this.selectClasses.classSelectMultiple) : selectItem.classList.remove(this.selectClasses.classSelectMultiple);
		// Стилизация элементов под checkbox (только для multiple)
		originalSelect.hasAttribute('data-fls-select-checkbox') && originalSelect.multiple ? selectItem.classList.add(this.selectClasses.classSelectCheckBox) : selectItem.classList.remove(this.selectClasses.classSelectCheckBox);
		// Сеттер значения заголовка селекта
		this.setSelectTitleValue(selectItem, originalSelect);
		// Сеттер элементов списка (options)
		this.setOptions(selectItem, originalSelect);
		// Если включена опция поиска data-search — запускаем обработчик
		originalSelect.hasAttribute('data-fls-select-search') ? this.searchActions(selectItem) : null;
		// Если указана настройка data-open — открываем селект
		originalSelect.hasAttribute('data-fls-select-open') ? this.selectAction(selectItem) : null;
		// Обработчик disabled
		this.selectDisabled(selectItem, originalSelect);
	}
	// Функция реакций на события
	selectsActions(e) {
		const t = e.target, type = e.type;
		const isSelect = t.closest(this.getSelectClass(this.selectClasses.classSelect));
		const isTag = t.closest(this.getSelectClass(this.selectClasses.classSelectTag));
		if (!isSelect && !isTag) return this.selectsСlose();

		const selectItem = isSelect || document.querySelector(`.${this.selectClasses.classSelect}[data-fls-select-id="${isTag.dataset.flsSelectId}"]`);
		const originalSelect = this.getSelectElement(selectItem).originalSelect;
		if (originalSelect.disabled) return;

		if (type === 'click') {
			const tag = t.closest(this.getSelectClass(this.selectClasses.classSelectTag));
			const title = t.closest(this.getSelectClass(this.selectClasses.classSelectTitle));
			const option = t.closest(this.getSelectClass(this.selectClasses.classSelectOption));
			if (tag) {
				const optionItem = document.querySelector(`.${this.selectClasses.classSelect}[data-fls-select-id="${tag.dataset.flsSelectId}"] .select__option[data-fls-select-value="${tag.dataset.flsSelectValue}"]`);
				this.optionAction(selectItem, originalSelect, optionItem);
			} else if (title) {
				this.selectAction(selectItem);
			} else if (option) {
				this.optionAction(selectItem, originalSelect, option);
			}
		} else if (type === 'focusin' || type === 'focusout') {
			if (isSelect) selectItem.classList.toggle(this.selectClasses.classSelectFocus, type === 'focusin');
		} else if (type === 'keydown' && e.code === 'Escape') {
			this.selectsСlose();
		}
	}
	// Функция закрытия всех селектов
	selectsСlose(selectOneGroup) {
		const selectsGroup = selectOneGroup ? selectOneGroup : document;
		const selectActiveItems = selectsGroup.querySelectorAll(`${this.getSelectClass(this.selectClasses.classSelect)}${this.getSelectClass(this.selectClasses.classSelectOpen)}`);
		if (selectActiveItems.length) {
			selectActiveItems.forEach(selectActiveItem => {
				this.selectСlose(selectActiveItem);
			});
		}
	}
	// Функция закрытия конкретного селекта
	selectСlose(selectItem) {
		const originalSelect = this.getSelectElement(selectItem).originalSelect;
		const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		if (!selectOptions.classList.contains('_slide')) {
			selectItem.classList.remove(this.selectClasses.classSelectOpen);
			slideUp(selectOptions, originalSelect.dataset.flsSelectSpeed);
			setTimeout(() => {
				selectItem.style.zIndex = '';
			}, originalSelect.dataset.flsSelectSpeed);
		}
	}
	// Функция открытия/закрытия конкретного селекта
	selectAction(selectItem) {
		const originalSelect = this.getSelectElement(selectItem).originalSelect;
		const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		const selectOptionsItems = selectOptions.querySelectorAll(`.${this.selectClasses.classSelectOption}`);
		const selectOpenzIndex = originalSelect.dataset.flsSelectZIndex ? originalSelect.dataset.flsSelectZIndex : 3;


		// Определяем, где отобразить выпадающий список
		this.setOptionsPosition(selectItem);

		// Если селекты размещены в элементе с дата-атрибутом data-one-select,
		// закрываем все открытые селекты
		if (originalSelect.closest('[data-fls-select-one]')) {
			const selectOneGroup = originalSelect.closest('[data-fls-select-one]');
			this.selectsСlose(selectOneGroup);
		}

		setTimeout(() => {
			if (!selectOptions.classList.contains('--slide')) {
				selectItem.classList.toggle(this.selectClasses.classSelectOpen);
				slideToggle(selectOptions, originalSelect.dataset.flsSelectSpeed);

				if (selectItem.classList.contains(this.selectClasses.classSelectOpen)) {
					selectItem.style.zIndex = selectOpenzIndex;
				} else {
					setTimeout(() => {
						selectItem.style.zIndex = '';
					}, originalSelect.dataset.flsSelectSpeed);
				}
			}
		}, 0);
	}
	// Сеттер значения заголовка селекта
	setSelectTitleValue(selectItem, originalSelect) {
		const selectItemBody = this.getSelectElement(selectItem, this.selectClasses.classSelectBody).selectElement;
		const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
		if (selectItemTitle) selectItemTitle.remove();
		selectItemBody.insertAdjacentHTML("afterbegin", this.getSelectTitleValue(selectItem, originalSelect));
		// Если включена опция поиска data-search — запускаем обработчик
		originalSelect.hasAttribute('data-fls-select-search') ? this.searchActions(selectItem) : null;
	}
	// Конструктор значения заголовка
	getSelectTitleValue(selectItem, originalSelect) {
		// Получаем выбранные текстовые значения
		let selectTitleValue = this.getSelectedOptionsData(originalSelect, 2).html;
		// Обработка значений множественного выбора
		// Если включен режим тегов (указана настройка data-fls-select-tags)
		if (originalSelect.multiple && originalSelect.hasAttribute('data-fls-select-tags')) {
			selectTitleValue = this.getSelectedOptionsData(originalSelect).elements.map(option => `<span role="button" data-fls-select-id="${selectItem.dataset.flsSelectId}" data-fls-select-value="${option.value}" class="--select-tag">${this.getSelectElementContent(option)}</span>`).join('');
			// Если вывод тегов во внешний блок
			if (originalSelect.dataset.flsSelectTags && document.querySelector(originalSelect.dataset.flsSelectTags)) {
				document.querySelector(originalSelect.dataset.flsSelectTags).innerHTML = selectTitleValue;
				if (originalSelect.hasAttribute('data-fls-select-search')) selectTitleValue = false;
			}
		}
		// Значение или плейсхолдер
		selectTitleValue = selectTitleValue.length ? selectTitleValue : (originalSelect.dataset.flsSelectPlaceholder || '')

		if (!originalSelect.hasAttribute('data-fls-select-tags')) {
			selectTitleValue = selectTitleValue ? selectTitleValue.map(item => item.replace(/"/g, '&quot;')) : ''
		}

		// Если включен режим pseudo
		let pseudoAttribute = '';
		let pseudoAttributeClass = '';
		if (originalSelect.hasAttribute('data-fls-select-pseudo-label')) {
			pseudoAttribute = originalSelect.dataset.flsSelectPseudoLabel ? ` data-fls-select-pseudo-label="${originalSelect.dataset.flsSelectPseudoLabel}"` : ` data-fls-select-pseudo-label="Заполните атрибут"`;
			pseudoAttributeClass = ` ${this.selectClasses.classSelectPseudoLabel}`;
		}
		// Если есть значение — добавляем класс
		this.getSelectedOptionsData(originalSelect).values.length ? selectItem.classList.add(this.selectClasses.classSelectActive) : selectItem.classList.remove(this.selectClasses.classSelectActive);
		// Возвращаем поле ввода для поиска или текст
		if (originalSelect.hasAttribute('data-fls-select-search')) {
			// Выводим поле ввода для поиска
			return `<div class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}"><input autocomplete="off" type="text" placeholder="${selectTitleValue}" data-fls-select-placeholder="${selectTitleValue}" class="${this.selectClasses.classSelectInput}"></span></div>`;
		} else {
			// Если выбран элемент со своим классом
			const customClass = this.getSelectedOptionsData(originalSelect).elements.length && this.getSelectedOptionsData(originalSelect).elements[0].dataset.flsSelectClass ? ` ${this.getSelectedOptionsData(originalSelect).elements[0].dataset.flsSelectClass}` : '';
			// Выводим текстовое значение
			return `<button type="button" class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}${pseudoAttributeClass}"><span class="${this.selectClasses.classSelectContent}${customClass}">${selectTitleValue}</span></span></button>`;
		}
	}
	// Конструктор данных для значения заголовка
	getSelectElementContent(selectOption) {
		// Если для элемента указано выводить картинку или текст — перестраиваем конструкцию
		const selectOptionData = selectOption.dataset.flsSelectAsset ? `${selectOption.dataset.flsSelectAsset}` : '';
		const selectOptionDataHTML = selectOptionData.indexOf('img') >= 0 ? `<img src="${selectOptionData}" alt="">` : selectOptionData;
		let selectOptionContentHTML = ``;
		selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectRow}">` : '';
		selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectData}">` : '';
		selectOptionContentHTML += selectOptionData ? selectOptionDataHTML : '';
		selectOptionContentHTML += selectOptionData ? `</span>` : '';
		selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectText}">` : '';
		selectOptionContentHTML += selectOption.textContent;
		selectOptionContentHTML += selectOptionData ? `</span>` : '';
		selectOptionContentHTML += selectOptionData ? `</span>` : '';
		return selectOptionContentHTML;
	}
	// Получение данных плейсхолдера
	getSelectPlaceholder(originalSelect) {
		const selectPlaceholder = Array.from(originalSelect.options).find(option => !option.value);
		if (selectPlaceholder) {
			return {
				value: selectPlaceholder.textContent,
				show: selectPlaceholder.hasAttribute("data-fls-select-show"),
				label: {
					show: selectPlaceholder.hasAttribute("data-fls-select-label"),
					text: selectPlaceholder.dataset.flsSelectLabel
				}
			}
		}
	}
	// Получение данных из выбранных элементов
	getSelectedOptionsData(originalSelect, type) {
		// Получаем все выбранные объекты из select
		let selectedOptions = [];
		if (originalSelect.multiple) {
			// Если множественный выбор
			// Убираем плейсхолдер, получаем остальные выбранные элементы
			selectedOptions = Array.from(originalSelect.options).filter(option => option.value).filter(option => option.selected);
		} else {
			// Если одиночный выбор
			selectedOptions.push(originalSelect.options[originalSelect.selectedIndex]);
		}
		return {
			elements: selectedOptions.map(option => option),
			values: selectedOptions.filter(option => option.value).map(option => option.value),
			html: selectedOptions.map(option => this.getSelectElementContent(option))
		}
	}
	// Конструктор элементов списка
	getOptions(originalSelect) {
		// Настройка скролла элементов
		const selectOptionsScroll = originalSelect.hasAttribute('data-fls-select-scroll') ? `` : '';
		const customMaxHeightValue = +originalSelect.dataset.flsSelectScroll ? +originalSelect.dataset.flsSelectScroll : null;
		// Получаем элементы списка
		let selectOptions = Array.from(originalSelect.options);
		if (selectOptions.length > 0) {
			let selectOptionsHTML = ``;
			// Если указана настройка data-fls-select-show — показываем плейсхолдер в списке
			if ((this.getSelectPlaceholder(originalSelect) && !this.getSelectPlaceholder(originalSelect).show) || originalSelect.multiple) {
				selectOptions = selectOptions.filter(option => option.value);
			}
			// Строим и выводим основную конструкцию
			selectOptionsHTML += `<div ${selectOptionsScroll} ${selectOptionsScroll ? `style="max-height: ${customMaxHeightValue}px"` : ''} class="${this.selectClasses.classSelectOptionsScroll}">`;
			selectOptions.forEach(selectOption => {
				// Получаем конструкцию конкретного элемента списка
				selectOptionsHTML += this.getOption(selectOption, originalSelect);
			});
			selectOptionsHTML += `</div>`;
			return selectOptionsHTML;
		}
	}
	// Конструктор конкретного элемента списка
	getOption(selectOption, originalSelect) {
		// Если элемент выбран и включен режим множественного выбора — добавляем класс
		const selectOptionSelected = selectOption.selected && originalSelect.multiple ? ` ${this.selectClasses.classSelectOptionSelected}` : '';
		// Если элемент выбран и нет настройки data-fls-select-show-selected — прячем элемент
		const selectOptionHide = selectOption.selected && !originalSelect.hasAttribute('data-fls-select-show-selected') && !originalSelect.multiple ? `hidden` : ``;
		// Если для элемента указан класс — добавляем
		const selectOptionClass = selectOption.dataset.flsSelectClass ? ` ${selectOption.dataset.flsSelectClass}` : '';
		// Если указан режим ссылки
		const selectOptionLink = selectOption.dataset.flsSelectHref ? selectOption.dataset.flsSelectHref : false;
		const selectOptionLinkTarget = selectOption.hasAttribute('data-fls-select-href-blank') ? `target="_blank"` : '';
		// Строим и возвращаем конструкцию элемента
		let selectOptionHTML = ``;
		selectOptionHTML += selectOptionLink ? `<a ${selectOptionLinkTarget} ${selectOptionHide} href="${selectOptionLink}" data-fls-select-value="${selectOption.value}" class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}">` : `<button ${selectOptionHide} class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}" data-fls-select-value="${selectOption.value}" type="button">`;
		selectOptionHTML += this.getSelectElementContent(selectOption);
		selectOptionHTML += selectOptionLink ? `</a>` : `</button>`;
		return selectOptionHTML;
	}
	// Сеттер элементов списка (options)
	setOptions(selectItem, originalSelect) {
		// Получаем объект тела псевдоселекта
		const selectItemOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		// Запускаем конструктор элементов списка (options) и добавляем в тело псевдоселекта
		selectItemOptions.innerHTML = this.getOptions(originalSelect)
	}
	// Определяем, где отобразить выпадающий список
	setOptionsPosition(selectItem) {
		const originalSelect = this.getSelectElement(selectItem).originalSelect;
		const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		const selectItemScroll = this.getSelectElement(selectItem, this.selectClasses.classSelectOptionsScroll).selectElement;
		const customMaxHeightValue = +originalSelect.dataset.flsSelectScroll ? `${+originalSelect.dataset.flsSelectScroll}px` : ``;
		const selectOptionsPosMargin = +originalSelect.dataset.flsSelectOptionsMargin ? +originalSelect.dataset.flsSelectOptionsMargin : 10;

		if (!selectItem.classList.contains(this.selectClasses.classSelectOpen)) {
			selectOptions.hidden = false;
			const selectItemScrollHeight = selectItemScroll.offsetHeight ? selectItemScroll.offsetHeight : parseInt(window.getComputedStyle(selectItemScroll).getPropertyValue('max-height'));
			const selectOptionsHeight = selectOptions.offsetHeight > selectItemScrollHeight ? selectOptions.offsetHeight : selectItemScrollHeight + selectOptions.offsetHeight;
			const selectOptionsScrollHeight = selectOptionsHeight - selectItemScrollHeight;
			selectOptions.hidden = true;

			const selectItemHeight = selectItem.offsetHeight;
			const selectItemPos = selectItem.getBoundingClientRect().top;
			const selectItemTotal = selectItemPos + selectOptionsHeight + selectItemHeight + selectOptionsScrollHeight;
			const selectItemResult = window.innerHeight - (selectItemTotal + selectOptionsPosMargin);

			if (selectItemResult < 0) {
				const newMaxHeightValue = selectOptionsHeight + selectItemResult;
				if (newMaxHeightValue < 100) {
					selectItem.classList.add('select--show-top');
					selectItemScroll.style.maxHeight = selectItemPos < selectOptionsHeight ? `${selectItemPos - (selectOptionsHeight - selectItemPos)}px` : customMaxHeightValue;
				} else {
					selectItem.classList.remove('select--show-top');
					selectItemScroll.style.maxHeight = `${newMaxHeightValue}px`;
				}
			}
		} else {
			setTimeout(() => {
				selectItem.classList.remove('select--show-top');
				selectItemScroll.style.maxHeight = customMaxHeightValue;
			}, +originalSelect.dataset.flsSelectSpeed);
		}
	}
	// Обработчик клика на пункт списка
	optionAction(selectItem, originalSelect, optionItem) {
		const optionsBox = selectItem.querySelector(this.getSelectClass(this.selectClasses.classSelectOptions));
		if (optionsBox.classList.contains('--slide')) return;

		if (originalSelect.multiple) {
			optionItem.classList.toggle(this.selectClasses.classSelectOptionSelected);
			const selectedEls = this.getSelectedOptionsData(originalSelect).elements;
			for (const el of selectedEls) {
				el.removeAttribute('selected');
			}
			const selectedUI = selectItem.querySelectorAll(this.getSelectClass(this.selectClasses.classSelectOptionSelected));
			for (const el of selectedUI) {
				const val = el.dataset.flsSelectValue;
				const opt = originalSelect.querySelector(`option[value="${val}"]`);
				if (opt) opt.setAttribute('selected', 'selected');
			}
		} else {
			if (!originalSelect.hasAttribute('data-fls-select-show-selected')) {
				setTimeout(() => {
					const hiddenOpt = selectItem.querySelector(`${this.getSelectClass(this.selectClasses.classSelectOption)}[hidden]`);
					if (hiddenOpt) hiddenOpt.hidden = false;
					optionItem.hidden = true;
				}, this.config.speed);
			}
			originalSelect.value = optionItem.dataset.flsSelectValue || optionItem.textContent;
			this.selectAction(selectItem);
		}
		this.setSelectTitleValue(selectItem, originalSelect);
		this.setSelectChange(originalSelect);
	}
	// Реакция на изменение оригинального select
	selectChange(e) {
		const originalSelect = e.target;
		this.selectBuild(originalSelect);
		this.setSelectChange(originalSelect);
	}
	// Обработчик изменения в селекте
	setSelectChange(originalSelect) {
		// Мгновенная валидация селекта
		if (originalSelect.hasAttribute('data-fls-select-validate')) {
			formValidate.validateInput(originalSelect)
		}
		// При изменении селекта отправляем форму
		if (originalSelect.hasAttribute('data-fls-select-submit') && originalSelect.value) {
			let tempButton = document.createElement("button");
			tempButton.type = "submit";
			originalSelect.closest('form').append(tempButton);
			tempButton.click();
			tempButton.remove();
		}
		const selectItem = originalSelect.parentElement;
		// Вызов коллбэк-функции
		this.selectCallback(selectItem, originalSelect);
	}
	// Обработчик disabled
	selectDisabled(selectItem, originalSelect) {
		if (originalSelect.disabled) {
			selectItem.classList.add(this.selectClasses.classSelectDisabled);
			this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = true;
		} else {
			selectItem.classList.remove(this.selectClasses.classSelectDisabled);
			this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = false;
		}
	}
	// Обработчик поиска по элементам списка
	searchActions(selectItem) {
		const selectInput = this.getSelectElement(selectItem, this.selectClasses.classSelectInput).selectElement;
		const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;

		selectInput.addEventListener("input", () => {
			const inputValue = selectInput.value.toLowerCase();
			const selectOptionsItems = selectOptions.querySelectorAll(`.${this.selectClasses.classSelectOption}`);

			selectOptionsItems.forEach(item => {
				const itemText = item.textContent.toLowerCase();
				item.hidden = !itemText.includes(inputValue);
			});

			// Открыть список, если он закрыт
			if (selectOptions.hidden) {
				this.selectAction(selectItem);
			}
		});
	}
	// Коллбэк-функция
	selectCallback(selectItem, originalSelect) {
		document.dispatchEvent(new CustomEvent("selectCallback", {
			detail: {
				select: originalSelect
			}
		}));
	}
}
document.querySelector('select[data-fls-select]') ?
	window.addEventListener('load', () => window.flsSelect = new SelectConstructor({})) : null
