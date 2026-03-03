// Подключение функционала "Чертоги фрилансера"
import { isMobile, FLS } from "@js/common/functions.js";
import "./fullpage.scss";

// =====================================================
// FullPage
// =====================================================
class FullPage {
  constructor(element, options) {
    const config = {
      noEventSelector: "[data-fls-fullpage-noevent]",

      classInit: "--fullpage-init",
      wrapperAnimatedClass: "--fullpage-switching",

      selectorSection: "[data-fls-fullpage-section]",
      activeClass: "--fullpage-active-section",
      previousClass: "--fullpage-previous-section",
      nextClass: "--fullpage-next-section",
      idActiveSection: 0,

      // Эффекты: fade, cards, slider
      mode: element.dataset.flsFullpageEffect ? element.dataset.flsFullpageEffect : "slider",

      bullets: element.hasAttribute("data-fls-fullpage-bullets"),
      bulletsClass: "--fullpage-bullets",
      bulletClass: "--fullpage-bullet",
      bulletActiveClass: "--fullpage-bullet-active",

      onInit() {},
      onSwitching() {},
      onDestroy() {},
    };

    this.options = Object.assign(config, options);

    this.wrapper = element;
    this.sections = this.wrapper.querySelectorAll(this.options.selectorSection);

    this.activeSection = false;
    this.activeSectionId = false;

    this.previousSection = false;
    this.previousSectionId = false;

    this.nextSection = false;
    this.nextSectionId = false;

    this.bulletsWrapper = false;

    this.stopEvent = false;
    this.clickOrTouch = false;

    // iOS preventDefault handler (remove on destroy)
    this._iOSPreventTouchMove = null;

    // resize raf
    this._resizeRaf = 0;

    if (this.sections.length) this.init();
  }

  // ===============================
  init() {
    if (this.options.idActiveSection > this.sections.length - 1) return;

    this.setId();
    this.activeSectionId = this.options.idActiveSection;

    this.setEffectsClasses();
    this.setClasses();
    this.setStyle();

    if (this.options.bullets) {
      this.setBullets();
      this.setActiveBullet(this.activeSectionId);
    }

    this.bindEvents();
    this.setEvents();

    setTimeout(() => {
      FLS("_FLS_FULLPAGE_START", this.sections.length);

      document.documentElement.classList.add(this.options.classInit);

      this.options.onInit(this);
      document.dispatchEvent(new CustomEvent("fpinit", { detail: { fp: this } }));
    }, 0);
  }

  // ===============================
  destroy() {
    this.removeEvents();
    this.removeClasses();

    document.documentElement.classList.remove(this.options.classInit);
    document.documentElement.classList.remove(this.options.wrapperAnimatedClass);
    this.wrapper.classList.remove(this.options.wrapperAnimatedClass);

    this.removeEffectsClasses();
    this.removeZIndex();
    this.removeStyle();
    this.removeId();
    this.removeBullets();

    if (this._resizeRaf) {
      cancelAnimationFrame(this._resizeRaf);
      this._resizeRaf = 0;
    }

    this.options.onDestroy(this);
    document.dispatchEvent(new CustomEvent("fpdestroy", { detail: { fp: this } }));
  }

  // ===============================
  setId() {
    for (let i = 0; i < this.sections.length; i++) {
      this.sections[i].setAttribute("data-fls-fullpage-id", i);
    }
  }
  removeId() {
    for (let i = 0; i < this.sections.length; i++) {
      this.sections[i].removeAttribute("data-fls-fullpage-id");
    }
  }

  // ===============================
  setClasses() {
    this.previousSectionId = this.activeSectionId - 1 >= 0 ? this.activeSectionId - 1 : false;
    this.nextSectionId = this.activeSectionId + 1 < this.sections.length ? this.activeSectionId + 1 : false;

    this.activeSection = this.sections[this.activeSectionId];
    this.activeSection.classList.add(this.options.activeClass);

    for (let i = 0; i < this.sections.length; i++) {
      document.documentElement.classList.remove(`--fullpage-section-${i}`);
    }
    document.documentElement.classList.add(`--fullpage-section-${this.activeSectionId}`);

    if (this.previousSectionId !== false) {
      this.previousSection = this.sections[this.previousSectionId];
      this.previousSection.classList.add(this.options.previousClass);
    } else {
      this.previousSection = false;
    }

    if (this.nextSectionId !== false) {
      this.nextSection = this.sections[this.nextSectionId];
      this.nextSection.classList.add(this.options.nextClass);
    } else {
      this.nextSection = false;
    }
  }

  removeClasses() {
    for (let i = 0; i < this.sections.length; i++) {
      const s = this.sections[i];
      s.classList.remove(this.options.activeClass, this.options.previousClass, this.options.nextClass);
      document.documentElement.classList.remove(`--fullpage-section-${i}`);
    }
    document.documentElement.classList.remove("--fullpage-up", "--fullpage-down");
  }

  // ===============================
  setEffectsClasses() {
    switch (this.options.mode) {
      case "slider":
        this.wrapper.classList.add("slider-mode");
        break;
      case "cards":
        this.wrapper.classList.add("cards-mode");
        this.setZIndex();
        break;
      case "fade":
        this.wrapper.classList.add("fade-mode");
        this.setZIndex();
        break;
    }
  }

  // ✅ BUGFIX: убираем z-index, а не ставим
  removeEffectsClasses() {
    switch (this.options.mode) {
      case "slider":
        this.wrapper.classList.remove("slider-mode");
        break;
      case "cards":
        this.wrapper.classList.remove("cards-mode");
        this.removeZIndex();
        break;
      case "fade":
        this.wrapper.classList.remove("fade-mode");
        this.removeZIndex();
        break;
    }
  }

  // ===============================
  setStyle() {
    switch (this.options.mode) {
      case "slider":
        this.styleSlider();
        break;
      case "cards":
        this.styleCards();
        break;
      case "fade":
        this.styleFade();
        break;
    }
  }

  styleSlider() {
    for (let i = 0; i < this.sections.length; i++) {
      const s = this.sections[i];
      if (i === this.activeSectionId) s.style.transform = "translate3D(0,0,0)";
      else if (i < this.activeSectionId) s.style.transform = "translate3D(0,-100%,0)";
      else s.style.transform = "translate3D(0,100%,0)";
    }
  }

  styleCards() {
    for (let i = 0; i < this.sections.length; i++) {
      const s = this.sections[i];
      if (i >= this.activeSectionId) s.style.transform = "translate3D(0,0,0)";
      else s.style.transform = "translate3D(0,-100%,0)";
    }
  }

  styleFade() {
    for (let i = 0; i < this.sections.length; i++) {
      const s = this.sections[i];
      if (i === this.activeSectionId) {
        s.style.opacity = "1";
        s.style.pointerEvents = "all";
      } else {
        s.style.opacity = "0";
        s.style.pointerEvents = "none";
      }
    }
  }

  removeStyle() {
    for (let i = 0; i < this.sections.length; i++) {
      const s = this.sections[i];
      s.style.opacity = "";
      s.style.visibility = "";
      s.style.transform = "";
      s.style.pointerEvents = "";
    }
  }

  // ===============================
  haveScroll(element) {
    return element.scrollHeight !== window.innerHeight;
  }

  checkScroll(yCoord, element) {
    this.goScroll = false;

    if (!this.stopEvent && element) {
      this.goScroll = true;

      if (this.haveScroll(element)) {
        this.goScroll = false;
        const position = Math.round(element.scrollHeight - element.scrollTop);

        if (
          (Math.abs(position - element.scrollHeight) < 2 && yCoord <= 0) ||
          (Math.abs(position - element.clientHeight) < 2 && yCoord >= 0)
        ) {
          this.goScroll = true;
        }
      }
    }
  }

  // ===============================
  bindEvents() {
    this.events = {
      wheel: this.wheel.bind(this),

      touchdown: this.touchDown.bind(this),
      touchup: this.touchUp.bind(this),
      touchmove: this.touchMove.bind(this),
      touchcancel: this.touchUp.bind(this),

      transitionEnd: this.transitionend.bind(this),

      click: this.clickBullets.bind(this),

      // ✅ NEW: resize reflow
      resize: this.resize.bind(this),
    };

    if (isMobile.iOS()) {
      this._iOSPreventTouchMove = (e) => {
        if (e.cancelable) e.preventDefault();
      };
      document.addEventListener("touchmove", this._iOSPreventTouchMove, { passive: false });
    }
  }

  setEvents() {
    this.wrapper.addEventListener("wheel", this.events.wheel);
    this.wrapper.addEventListener("touchstart", this.events.touchdown, { passive: true });

    // ✅ NEW
    window.addEventListener("resize", this.events.resize);

    if (this.options.bullets && this.bulletsWrapper) {
      this.bulletsWrapper.addEventListener("click", this.events.click);
    }
  }

  // ✅ BUGFIX: снимали не то событие (touchdown вместо touchstart)
  removeEvents() {
    this.wrapper.removeEventListener("wheel", this.events.wheel);
    this.wrapper.removeEventListener("touchstart", this.events.touchdown);

    this.wrapper.removeEventListener("touchend", this.events.touchup);
    this.wrapper.removeEventListener("touchcancel", this.events.touchup);
    this.wrapper.removeEventListener("touchmove", this.events.touchmove);

    // ✅ NEW
    window.removeEventListener("resize", this.events.resize);

    if (this.bulletsWrapper) {
      this.bulletsWrapper.removeEventListener("click", this.events.click);
    }

    if (this._iOSPreventTouchMove) {
      document.removeEventListener("touchmove", this._iOSPreventTouchMove);
      this._iOSPreventTouchMove = null;
    }
  }

  // ✅ NEW: resize handler (throttle via rAF)
  resize() {
    if (this.stopEvent) return;

    if (this._resizeRaf) cancelAnimationFrame(this._resizeRaf);
    this._resizeRaf = requestAnimationFrame(() => {
      this._resizeRaf = 0;

      // пересчитать transforms под новую геометрию
      this.setStyle();

      // снять залипшие классы анимации (иногда devtools оставляет)
      document.documentElement.classList.remove(this.options.wrapperAnimatedClass);
      this.wrapper.classList.remove(this.options.wrapperAnimatedClass);

      // если были зафиксированы состояния вверх/вниз — не трогаем
    });
  }

  // ===============================
  clickBullets(e) {
    const bullet = e.target.closest(`.${this.options.bulletClass}`);
    if (!bullet) return;

    const arr = Array.from(this.bulletsWrapper.children);
    const id = arr.indexOf(bullet);
    this.switchingSection(id);
  }

  setActiveBullet(idButton) {
    if (!this.bulletsWrapper) return;

    const bullets = this.bulletsWrapper.children;
    for (let i = 0; i < bullets.length; i++) {
      if (idButton === i) bullets[i].classList.add(this.options.bulletActiveClass);
      else bullets[i].classList.remove(this.options.bulletActiveClass);
    }
  }

  // ===============================
  touchDown(e) {
    this._yP = e.changedTouches[0].pageY;
    this._eventElement = e.target.closest(`.${this.options.activeClass}`);
    if (!this._eventElement) return;

    this._eventElement.addEventListener("touchend", this.events.touchup, { passive: true });
    this._eventElement.addEventListener("touchcancel", this.events.touchup, { passive: true });
    this._eventElement.addEventListener("touchmove", this.events.touchmove, { passive: false });

    this.clickOrTouch = true;

    if (isMobile.iOS()) {
      if (this._eventElement.scrollHeight !== this._eventElement.clientHeight) {
        if (this._eventElement.scrollTop === 0) this._eventElement.scrollTop = 1;
        if (this._eventElement.scrollTop === this._eventElement.scrollHeight - this._eventElement.clientHeight) {
          this._eventElement.scrollTop = this._eventElement.scrollHeight - this._eventElement.clientHeight - 1;
        }
      }
      this.allowUp = this._eventElement.scrollTop > 0;
      this.allowDown = this._eventElement.scrollTop < this._eventElement.scrollHeight - this._eventElement.clientHeight;
      this.lastY = e.changedTouches[0].pageY;
    }
  }

  touchMove(e) {
    const targetElement = e.target.closest(`.${this.options.activeClass}`);

    if (isMobile.iOS()) {
      const up = e.changedTouches[0].pageY > this.lastY;
      const down = !up;
      this.lastY = e.changedTouches[0].pageY;

      if (targetElement) {
        if ((up && this.allowUp) || (down && this.allowDown)) e.stopPropagation();
        else if (e.cancelable) e.preventDefault();
      }
    }

    if (!this.clickOrTouch || e.target.closest(this.options.noEventSelector)) return;

    const yCoord = this._yP - e.changedTouches[0].pageY;
    this.checkScroll(yCoord, targetElement);

    if (this.goScroll && Math.abs(yCoord) > 20) this.choiceOfDirection(yCoord);
  }

  touchUp() {
    if (!this._eventElement) return (this.clickOrTouch = false);

    this._eventElement.removeEventListener("touchend", this.events.touchup);
    this._eventElement.removeEventListener("touchcancel", this.events.touchup);
    this._eventElement.removeEventListener("touchmove", this.events.touchmove);

    this.clickOrTouch = false;
  }

  transitionend() {
    this.stopEvent = false;
    document.documentElement.classList.remove(this.options.wrapperAnimatedClass);
    this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
  }

  wheel(e) {
    if (e.target.closest(this.options.noEventSelector)) return;

    const yCoord = e.deltaY;
    const targetElement = e.target.closest(`.${this.options.activeClass}`);

    this.checkScroll(yCoord, targetElement);
    if (this.goScroll) this.choiceOfDirection(yCoord);
  }

  choiceOfDirection(direction) {
    if (direction > 0 && this.nextSection !== false) {
      this.activeSectionId = this.activeSectionId + 1 < this.sections.length ? ++this.activeSectionId : this.activeSectionId;
    } else if (direction < 0 && this.previousSection !== false) {
      this.activeSectionId = this.activeSectionId - 1 >= 0 ? --this.activeSectionId : this.activeSectionId;
    }
    this.switchingSection(this.activeSectionId, direction);
  }

  switchingSection(idSection = this.activeSectionId, direction) {
    if (!direction) {
      if (idSection < this.activeSectionId) direction = -100;
      else if (idSection > this.activeSectionId) direction = 100;
    }
    this.activeSectionId = idSection;

    this.stopEvent = true;
    if ((this.previousSectionId === false && direction < 0) || (this.nextSectionId === false && direction > 0)) {
      this.stopEvent = false;
    }
    if (!this.stopEvent) return;

    document.documentElement.classList.add(this.options.wrapperAnimatedClass);
    this.wrapper.classList.add(this.options.wrapperAnimatedClass);

    this.removeClasses();
    this.setClasses();
    this.setStyle();

    if (this.options.bullets) this.setActiveBullet(this.activeSectionId);

    let delaySection;
    if (direction < 0) {
      delaySection = this.activeSection.dataset.flsFullpageDirectionUp ? parseInt(this.activeSection.dataset.flsFullpageDirectionUp) : 500;
      document.documentElement.classList.add("--fullpage-up");
      document.documentElement.classList.remove("--fullpage-down");
    } else {
      delaySection = this.activeSection.dataset.flsFullpageDirectionDown
        ? parseInt(this.activeSection.dataset.flsFullpageDirectionDown)
        : 500;
      document.documentElement.classList.remove("--fullpage-up");
      document.documentElement.classList.add("--fullpage-down");
    }

    FLS("_FLS_FULLPAGE_GOTO", idSection);

    setTimeout(() => {
      this.events.transitionEnd();
    }, delaySection);

    this.options.onSwitching(this);
    document.dispatchEvent(new CustomEvent("fpswitching", { detail: { fp: this } }));
  }

  // ===============================
  setBullets() {
    this.bulletsWrapper = document.querySelector(`.${this.options.bulletsClass}`);

    if (!this.bulletsWrapper) {
      const bullets = document.createElement("div");
      bullets.classList.add(this.options.bulletsClass);
      this.wrapper.append(bullets);
      this.bulletsWrapper = bullets;
    }

    this.bulletsWrapper.innerHTML = "";

    for (let i = 0; i < this.sections.length; i++) {
      const span = document.createElement("span");
      span.classList.add(this.options.bulletClass);
      this.bulletsWrapper.append(span);
    }
  }

  removeBullets() {
    if (!this.bulletsWrapper) return;

    const inside = this.wrapper.contains(this.bulletsWrapper);
    if (inside) this.bulletsWrapper.remove();
    else this.bulletsWrapper.innerHTML = "";

    this.bulletsWrapper = false;
  }

  // ===============================
  setZIndex() {
    let z = this.sections.length;
    for (let i = 0; i < this.sections.length; i++) {
      this.sections[i].style.zIndex = z;
      z--;
    }
  }

  removeZIndex() {
    for (let i = 0; i < this.sections.length; i++) {
      this.sections[i].style.zIndex = "";
    }
  }

  // =====================================================
  // ✅ FIX SCROLLTO IN FULLPAGE:
  // Перехватываем клики по [data-fls-scrollto] в CAPTURE,
  // жестко глушим scroll/to и переводим в switchingSection.
  // =====================================================
  static bindScrollToBridge() {
    if (FullPage._scrollBridgeBound) return;
    FullPage._scrollBridgeBound = true;

    document.addEventListener(
      "click",
      (e) => {
        const link = e.target.closest("[data-fls-scrollto]");
        if (!link) return;

        // fullpage выключен (<=991) -> пусть работает обычный scrollto
        if (!window.flsFullpage) return;

        const selector = link.dataset.flsScrollto;
        if (!selector) return;

        const target = document.querySelector(selector);
        if (!target) return;

        const section = target.closest("[data-fls-fullpage-section]");
        if (!section) return;

        const id = Number(section.getAttribute("data-fls-fullpage-id"));
        if (Number.isNaN(id)) return;

        // Жёстко глушим любые scrollto/якоря
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();

        // убираем hash, чтобы не было hashchange-скролла из других скриптов
        if (location.hash) {
          history.replaceState(null, "", location.pathname + location.search);
        }

        window.flsFullpage.switchingSection(id);
      },
      true // ✅ capture
    );
  }
}

// включить мост scrollto->fullpage один раз
FullPage.bindScrollToBridge();

// =====================================================
// Responsive enable/disable: >= 992px enable, <= 991px disable
// ✅ FIX: сохраняем секцию, при enable сбрасываем scroll,
// при disable скроллим к секции обычным способом.
// =====================================================
const fpRoot = document.querySelector("[data-fls-fullpage]");

if (fpRoot) {
  const mq = window.matchMedia("(min-width: 992px)");
  let lastSectionId = 0;

  const getSectionById = (id) =>
    fpRoot.querySelector(`[data-fls-fullpage-id="${id}"]`) || fpRoot.querySelector("[data-fls-fullpage-section]");

  const enableFP = () => {
    if (window.flsFullpage) return;

    // ✅ критично: убираем обычный скролл страницы перед включением fullpage
    window.scrollTo(0, 0);

    window.flsFullpage = new FullPage(fpRoot, {
      idActiveSection: lastSectionId,
    });

    // ✅ добиваем стили после инициализации (devtools/toolbar дергают размеры)
    setTimeout(() => {
      if (window.flsFullpage) window.flsFullpage.setStyle();
    }, 0);
  };

  const disableFP = () => {
    if (!window.flsFullpage) return;

    // ✅ сохраняем текущую секцию
    lastSectionId = window.flsFullpage.activeSectionId || 0;

    window.flsFullpage.destroy();
    window.flsFullpage = null;

    // ✅ переводим в ту же секцию уже обычным скроллом
    const section = getSectionById(lastSectionId);
    if (section) section.scrollIntoView({ block: "start" });
  };

  const syncFP = () => {
    if (mq.matches) enableFP();
    else disableFP();
  };

  window.addEventListener("load", syncFP);

  if (mq.addEventListener) mq.addEventListener("change", syncFP);
  else mq.addListener(syncFP);
}