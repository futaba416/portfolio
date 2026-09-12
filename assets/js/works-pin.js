(function () {
  "use strict";

  var pin = document.querySelector(".works-pin");
  if (!pin) return;

  var cards = Array.prototype.slice.call(pin.querySelectorAll(".work-card"));
  if (!cards.length) return;

  var currentIndex = -1;
  var zCounter = 1;
  var ticking = false;

  function setActive(index) {
    if (index === currentIndex) return;
    currentIndex = index;

    cards.forEach(function (card, i) {
      var active = i === index;

      card.tabIndex = active ? 0 : -1;
      card.setAttribute("aria-hidden", active ? "false" : "true");
      card.classList.toggle("is-interactive", active);
      card.classList.toggle("is-active", active);

      if (active) {
        card.style.zIndex = String(++zCounter);
      }
    });
  }

  function update() {
    ticking = false;

    var rect = pin.getBoundingClientRect();
    var totalScrollable = rect.height - window.innerHeight;

    if (totalScrollable <= 0) {
      setActive(0);
      return;
    }

    var scrolled = Math.min(Math.max(-rect.top, 0), totalScrollable);
    var progress = Math.min(scrolled / totalScrollable, 0.999999);

    setActive(Math.floor(progress * cards.length));
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();
  pin.classList.add("works-pin--enhanced");
})();
