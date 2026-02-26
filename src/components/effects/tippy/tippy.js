// Подключение функционала "Чертоги фрилансера"
import { isMobile, FLS } from "@js/common/functions.js";

// Подключение из node_modules
import tippy from 'tippy.js';

// Подключение стилей из src/scss/libs
import "./tippy.scss";
// Подключение стилей из node_modules
//import 'tippy.js/dist/tippy.css';

// Запускаем и добавляем в объект модулей
document.querySelector('[data-fls-tippy-content]') ?
	tippy('[data-fls-tippy-content]', {}) : null
