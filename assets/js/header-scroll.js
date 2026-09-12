(function () {
  "use strict";

  var header = document.querySelector(".hero__nav .header-topbar");
  if (!header) return;

  var mq = window.matchMedia("(min-width: 641px)");
  var lastScrollY = window.scrollY;
  var ticking = false;

  function updateScrollState() {
    ticking = false;

    if (!mq.matches) {
      header.classList.remove("scrolled", "hide");
      lastScrollY = window.scrollY;
      return;
    }

    var currentScrollY = window.scrollY;

    if (currentScrollY <= 0) {
      header.classList.remove("scrolled");
      header.classList.remove("hide");
    } else {
      header.classList.add("scrolled");

      if (currentScrollY > lastScrollY) {
        header.classList.add("hide");
      } else if (currentScrollY < lastScrollY) {
        header.classList.remove("hide");
      }
    }

    lastScrollY = currentScrollY;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollState);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  updateScrollState();

  var themedSections = Array.prototype.slice.call(
    document.querySelectorAll("[data-header-theme]")
  );
  var themeObserver = null;
  var intersecting = [];

  var THEME_CLASSES = ["header--theme-light", "header--theme-sky"];

  function applyTheme(theme) {
    THEME_CLASSES.forEach(function (className) {
      header.classList.toggle(className, className === "header--theme-" + theme);
    });
  }

  function pickInnermost(elements) {
    var winner = null;
    elements.forEach(function (el) {
      if (!winner || winner.contains(el)) {
        winner = el;
      }
    });
    return winner;
  }

  function handleThemeEntries(entries) {
    entries.forEach(function (entry) {
      var i = intersecting.indexOf(entry.target);
      if (entry.isIntersecting) {
        if (i === -1) intersecting.push(entry.target);
      } else if (i !== -1) {
        intersecting.splice(i, 1);
      }
    });

    var winner = pickInnermost(intersecting);
    if (winner) {
      applyTheme(winner.getAttribute("data-header-theme"));
    }
  }

  function createThemeObserver() {
    if (themeObserver) {
      themeObserver.disconnect();
      themeObserver = null;
    }

    if (!mq.matches || !themedSections.length || !("IntersectionObserver" in window)) {
      return;
    }

    var lineY = 1;
    var bottomMargin = Math.max(window.innerHeight - lineY - 1, 0);
    themeObserver = new IntersectionObserver(handleThemeEntries, {
      root: null,
      rootMargin: "-" + lineY + "px 0px -" + bottomMargin + "px 0px",
      threshold: 0
    });

    themedSections.forEach(function (el) {
      themeObserver.observe(el);
    });
  }

  createThemeObserver();
  window.addEventListener("resize", createThemeObserver);
})();
