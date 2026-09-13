(function () {
  "use strict";

  var toggle = document.getElementById("mobile-menu-toggle");
  var menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  var OPEN_LABEL = "メニューを開く";
  var CLOSE_LABEL = "メニューを閉じる";

  function openMenu() {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", CLOSE_LABEL);
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", OPEN_LABEL);
    document.body.style.overflow = "";
  }

  toggle.addEventListener("click", function () {
    if (menu.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menu.querySelectorAll("[data-menu-close]").forEach(function (el) {
    el.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  var pcBreakpoint = window.matchMedia("(min-width: 768px)");

  function handleBreakpointChange(e) {
    if (e.matches && menu.classList.contains("is-open")) {
      closeMenu();
    }
  }

  if (pcBreakpoint.addEventListener) {
    pcBreakpoint.addEventListener("change", handleBreakpointChange);
  } else if (pcBreakpoint.addListener) {
    pcBreakpoint.addListener(handleBreakpointChange);
  }
})();
