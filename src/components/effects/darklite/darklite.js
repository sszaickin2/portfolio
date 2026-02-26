// Подключение функционала "Чертоги фрилансера
import { isMobile, FLS } from "@js/common/functions.js";

import './darklite.scss'

function getHours() {
	const now = new Date()
	const hours = now.getHours()
	return hours
}

function darkliteInit() {
	// HTML
	const htmlBlock = document.documentElement;

	// Получаем сохранённую тему
	const saveUserTheme = localStorage.getItem('fls-user-theme');

	let userTheme;

	if (document.querySelector('[data-fls-darklite-time]')) {
		// Пользовательский промежуток времени
		let customRange = document.querySelector('[data-fls-darklite-time]').dataset.flsDarkliteTime
		customRange = customRange || '18,5'
		const timeFrom = +customRange.split(',')[0]
		const timeTo = +customRange.split(',')[1]
		console.log(timeFrom);
		// Работа со временем
		userTheme = getHours() >= timeFrom && getHours() <= timeTo ? 'dark' : 'light'
	} else {
		// Работа с системными настройками
		if (window.matchMedia) {
			userTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
			!saveUserTheme ? changeTheme() : null;
		});
	}

	// Смена темы по клику
	const themeButton = document.querySelector('[data-fls-darklite-set]')
	const resetButton = document.querySelector('[data-fls-darklite-reset]')

	if (themeButton) {
		themeButton.addEventListener("click", function (e) {
			changeTheme(true);
		})
	}
	if (resetButton) {
		resetButton.addEventListener("click", function (e) {
			localStorage.setItem('fls-user-theme', '');
		})
	}
	// Функция добавления класса темы
	function setThemeClass() {
		htmlBlock.setAttribute(`data-fls-darklite-${saveUserTheme ? saveUserTheme : userTheme}`, '')
	}
	// Добавляем класс темы
	setThemeClass();

	// Функция смены темы
	function changeTheme(saveTheme = false) {
		let currentTheme = htmlBlock.hasAttribute('data-fls-darklite-light') ? 'light' : 'dark';
		let newTheme;

		if (currentTheme === 'light') {
			newTheme = 'dark';
		} else if (currentTheme === 'dark') {
			newTheme = 'light';
		}
		htmlBlock.removeAttribute(`data-fls-darklite-${currentTheme}`)
		htmlBlock.setAttribute(`data-fls-darklite-${newTheme}`, '')
		saveTheme ? localStorage.setItem('fls-user-theme', newTheme) : null;
	}
}
document.querySelector('[data-fls-darklite]') ?
	window.addEventListener("load", darkliteInit) : null
