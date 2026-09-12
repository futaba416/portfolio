(function () {
  "use strict";

  var pin = document.querySelector(".project-showcase");
  if (!pin) return;

  var bgTarget = pin.closest(".feedback-section") || pin;

  if (window.matchMedia("(max-width: 900px)").matches) return;

  var FADE_END = 0.55; 
  var CROSSFADE_START = 0.4;
  var CROSSFADE_END = 0.7; 
  var ticking = false;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function setProgress(p) {
    pin.style.setProperty("--wide-opacity", String(1 - clamp(p / FADE_END, 0, 1)));

    var crossfade = clamp((p - CROSSFADE_START) / (CROSSFADE_END - CROSSFADE_START), 0, 1);
    pin.style.setProperty("--video-opacity", String(crossfade));
  }

  function update() {
    ticking = false;

    var rect = pin.getBoundingClientRect();
    var revealPx = window.innerHeight;
    var scrolledIntoReveal = clamp(-rect.top, 0, revealPx);
    var revealProgress = revealPx > 0 ? scrolledIntoReveal / revealPx : 1;

    setProgress(revealProgress);

    var totalScrollable = rect.height - window.innerHeight;
    var chatScrollable = totalScrollable - revealPx;
    var scrolledFull = clamp(-rect.top, 0, totalScrollable);
    var chatProgress = chatScrollable > 0
      ? clamp((scrolledFull - revealPx) / chatScrollable, 0, 1)
      : 1;

    bgTarget.style.setProperty("--chat-bg-progress", String(chatProgress));
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  update();
})();
