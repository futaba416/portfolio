(function () {
  "use strict";

  var cursor = document.getElementById("custom-cursor");
  var works = document.querySelector(".works-section");
  if (!cursor || !works) return;

  var mouseX = 0;
  var mouseY = 0;
  var cursorX = 0;
  var cursorY = 0;
  var half = cursor.offsetWidth / 2 || 60;
  var active = false;
  var rafId = null;

  function updateCursorSize() {
    half = cursor.offsetWidth / 2 || 60;
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function tick() {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;

    cursor.style.transform =
      "translate3d(" +
      (cursorX - half) +
      "px, " +
      (cursorY - half) +
      "px, 0)";

    rafId = window.requestAnimationFrame(tick);
  }

  function activate(e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    if (active) return;

    active = true;
    updateCursorSize();

    cursorX = mouseX = e.clientX;
    cursorY = mouseY = e.clientY;

    cursor.style.transform =
      "translate3d(" +
      (cursorX - half) +
      "px, " +
      (cursorY - half) +
      "px, 0)";

    cursor.classList.add("is-active");
    document.documentElement.classList.add("custom-cursor-active");

    window.addEventListener("mousemove", onMouseMove, {
      passive: true,
    });

    rafId = window.requestAnimationFrame(tick);
  }

  function deactivate() {
    if (!active) return;

    active = false;

    cursor.classList.remove("is-active");
    document.documentElement.classList.remove("custom-cursor-active");

    window.removeEventListener("mousemove", onMouseMove);

    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  window.addEventListener("resize", updateCursorSize);

  works.addEventListener("pointerenter", activate);
  works.addEventListener("pointerleave", deactivate);
})();