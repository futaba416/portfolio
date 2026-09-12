(function () {
  "use strict";

  var hero = document.getElementById("hero");
  if (!hero) return;

  var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero__slide"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero__dot"));
  if (slides.length < 2) return;

  var mq = window.matchMedia("(min-width: 641px)");
  var LOCK_MS = 700; 
  var GESTURE_GAP_MS = 200; 

  var currentIndex = 0;
  var lastIndex = slides.length - 1;

  var isTransitionLocked = false;
  var isGestureActive = false;
  var actedThisGesture = false;
  var canExitHero = true;

  var gestureTimer = null;

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

  function onGestureEnd() {
    isGestureActive = false;
    if (currentIndex === lastIndex && !canExitHero) {
      canExitHero = true;
    }
  }

  function registerGestureActivity() {
    if (!isGestureActive) {
      actedThisGesture = false;
    }
    isGestureActive = true;
    if (gestureTimer) {
      window.clearTimeout(gestureTimer);
    }
    gestureTimer = window.setTimeout(onGestureEnd, GESTURE_GAP_MS);
  }

  function advance(delta) {
    actedThisGesture = true;
    setActive(currentIndex + delta);

    isTransitionLocked = true;
    window.setTimeout(function () {
      isTransitionLocked = false;
    }, LOCK_MS);

    if (currentIndex === lastIndex) {
      canExitHero = false;
    }
  }

  function handleWheel(e) {
    if (!mq.matches) return;
    if (window.scrollY > 0) return;

    registerGestureActivity();

    if (e.deltaY > 0) {
      if (currentIndex === lastIndex) {
        if (canExitHero) {
          return;
        }
        e.preventDefault();
        return;
      }

      e.preventDefault();
      if (isTransitionLocked || actedThisGesture) return;
      advance(1);
    } else if (e.deltaY < 0) {
      if (currentIndex === 0) {
        return;
      }

      e.preventDefault();
      if (isTransitionLocked || actedThisGesture) return;
      advance(-1);
    }
  }

  window.addEventListener("wheel", handleWheel, { passive: false });

  var backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      if (!mq.matches) return;
      setActive(0);
      canExitHero = true;
    });
  }
})();
