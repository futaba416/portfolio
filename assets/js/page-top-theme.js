(function () {
  "use strict";

  var button = document.getElementById("back-to-top");
  if (!button) return;

  var label = button.querySelector("span");
  if (!label) return;

  var themedSections = Array.prototype.slice
    .call(document.querySelectorAll("[data-header-theme], [data-pagetop-theme]"))
    .filter(function (el) {
      return !el.classList.contains("work-card");
    });
  if (!themedSections.length || !("IntersectionObserver" in window)) return;

  function themeOf(el) {
    return el.getAttribute("data-pagetop-theme") || el.getAttribute("data-header-theme");
  }

  function resolveTheme(winner) {
    var activeCard = winner.querySelector(
      ".work-card.is-active[data-pagetop-theme], .work-card.is-active[data-header-theme]"
    );
    return activeCard ? themeOf(activeCard) : themeOf(winner);
  }

  var intersecting = [];
  var currentWinner = null;
  var observer = null;

  function applyTheme(theme) {
    button.classList.toggle("back-to-top--theme-dark", theme === "dark");
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

  function reapply() {
    if (currentWinner) {
      applyTheme(resolveTheme(currentWinner));
    }
  }

  function handleEntries(entries) {
    entries.forEach(function (entry) {
      var i = intersecting.indexOf(entry.target);
      if (entry.isIntersecting) {
        if (i === -1) intersecting.push(entry.target);
      } else if (i !== -1) {
        intersecting.splice(i, 1);
      }
    });

    currentWinner = pickInnermost(intersecting);
    reapply();
  }

  var cardContainer = document.querySelector(".works-pin");
  if (cardContainer && "MutationObserver" in window) {
    new MutationObserver(reapply).observe(cardContainer, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true
    });
  }

  function createObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    var rect = label.getBoundingClientRect();
    var lineY = rect.top + rect.height / 2;
    var topMargin = Math.max(lineY, 0);
    var bottomMargin = Math.max(window.innerHeight - lineY - 1, 0);

    observer = new IntersectionObserver(handleEntries, {
      root: null,
      rootMargin: "-" + topMargin + "px 0px -" + bottomMargin + "px 0px",
      threshold: 0
    });

    themedSections.forEach(function (el) {
      observer.observe(el);
    });
  }

  createObserver();
  window.addEventListener("resize", createObserver);
})();
