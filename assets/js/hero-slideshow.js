(function () {
  "use strict";

  var hero = document.getElementById("hero");
  if (!hero) return;

  var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero__slide"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero__dot"));
  if (slides.length < 2) return;

  var mq = window.matchMedia("(min-width: 768px)");
  var LOCK_MS = 700;
  var WHEEL_THRESHOLD = 60;
  var TOP_TOLERANCE = 2;

  var currentIndex = 0;
  var lastIndex = slides.length - 1;

  var lockedUntil = 0;
  var wheelTotal = 0;
  var lastWheelTime = 0;

  function setActive(index) {
    if (index === currentIndex) return;
    currentIndex = index;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === index);
    });

    dots.forEach(function (dot, i) {
      var active = i === index;
      dot.classList.toggle("is-active", active);
      if (active) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  function selectSlide(index) {
    setActive(index);
    wheelTotal = 0;
    lockedUntil = performance.now() + LOCK_MS;
  }

  function shouldHandle(direction, now) {
    if (!mq.matches || window.scrollY > TOP_TOLERANCE) return false;
    if (document.querySelector(".photo-modal.is-open, .mobile-menu.is-open")) return false;
    if (direction < 0 && currentIndex === 0) return false;
    return direction < 0 || currentIndex < lastIndex || now < lockedUntil;
  }

  function handleWheel(e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey || !e.cancelable) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

    var now = performance.now();
    var direction = e.deltaY > 0 ? 1 : -1;
    if (!shouldHandle(direction, now)) return;

    e.preventDefault();
    if (window.scrollY !== 0) window.scrollTo(0, 0);
    if (now < lockedUntil) return;

    var unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
    var delta = e.deltaY * unit;
    if (now - lastWheelTime > 250 || wheelTotal * delta < 0) wheelTotal = 0;
    lastWheelTime = now;
    wheelTotal += delta;

    if (Math.abs(wheelTotal) >= WHEEL_THRESHOLD) {
      selectSlide(currentIndex + direction);
    }
  }

  window.addEventListener("wheel", handleWheel, { passive: false });

  window.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest("a, button, input, textarea, select, [contenteditable]")) return;

    var direction;
    if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
      direction = 1;
    } else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
      direction = -1;
    } else {
      return;
    }

    var now = performance.now();
    if (!shouldHandle(direction, now)) return;
    e.preventDefault();
    if (window.scrollY !== 0) window.scrollTo(0, 0);
    if (now >= lockedUntil) selectSlide(currentIndex + direction);
  });

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      if (!mq.matches) return;
      selectSlide(i);
    });
  });

  var backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      if (!mq.matches) return;
      setActive(0);
      lockedUntil = 0;
      wheelTotal = 0;
    });
  }

  function resetInput() {
    lockedUntil = 0;
    wheelTotal = 0;
    lastWheelTime = 0;
  }

  if (mq.addEventListener) {
    mq.addEventListener("change", resetInput);
  } else if (mq.addListener) {
    mq.addListener(resetInput);
  }
})();
