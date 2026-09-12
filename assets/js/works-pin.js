(function () {
  "use strict";

  var pin = document.querySelector(".works-pin");
  if (!pin) return;

  var cards = Array.prototype.slice.call(pin.querySelectorAll(".work-card"));
  var sticky = pin.querySelector(".works-pin__sticky");
  if (!cards.length || !sticky) return;

  var currentIndex = -1;
  var targetIndex = 0;
  var transitionTimer = null;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var ticking = false;

  function finishTransition() {
    window.clearTimeout(transitionTimer);
    transitionTimer = null;
    pin.classList.remove("is-transitioning");
    cards.forEach(function (card) {
      card.classList.remove("is-previous");
    });
  }

  function setActive(index, animate) {
    if (index === currentIndex) return;
    var previousIndex = currentIndex;

    if (animate) cards[index].getBoundingClientRect();
    pin.classList.toggle("is-transitioning", animate);
    currentIndex = index;

    cards.forEach(function (card, i) {
      var active = i === index;

      card.tabIndex = active ? 0 : -1;
      card.setAttribute("aria-hidden", active ? "false" : "true");
      card.classList.toggle("is-interactive", active);
      card.classList.toggle("is-active", active);
      card.classList.toggle("is-previous", animate && i === previousIndex);
      card.style.zIndex = active ? "2" : i === previousIndex ? "1" : "0";
    });

    if (animate) {
      transitionTimer = window.setTimeout(function () {
        finishTransition();
        requestUpdate();
      }, 650);
    }
  }

  function update() {
    ticking = false;

    var rect = pin.getBoundingClientRect();
    var stickyHeight = sticky.getBoundingClientRect().height;
    var totalScrollable = rect.height - stickyHeight;

    if (totalScrollable <= 0) {
      finishTransition();
      setActive(0, false);
      return;
    }

    var scrolled = Math.min(Math.max(-rect.top, 0), totalScrollable);
    var step = totalScrollable / cards.length;
    var nextTarget = Math.min(Math.floor(scrolled / step), cards.length - 1);
    var isPinned = rect.top < -1 && rect.bottom > stickyHeight + 1;

    if (isPinned) {
      var tolerance = Math.min(20, step * 0.04);
      if (nextTarget > targetIndex && scrolled < (targetIndex + 1) * step + tolerance) {
        nextTarget = targetIndex;
      } else if (nextTarget < targetIndex && scrolled > targetIndex * step - tolerance) {
        nextTarget = targetIndex;
      }
    }
    targetIndex = nextTarget;

    if (currentIndex === -1 || !isPinned || reducedMotion.matches) {
      finishTransition();
      setActive(targetIndex, false);
    } else if (transitionTimer === null && targetIndex !== currentIndex) {
      setActive(currentIndex + (targetIndex > currentIndex ? 1 : -1), true);
    }
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener("change", requestUpdate);
  } else if (reducedMotion.addListener) {
    reducedMotion.addListener(requestUpdate);
  }

  pin.style.setProperty("--works-count", String(cards.length));
  pin.classList.add("works-pin--enhanced");
  update();
})();
