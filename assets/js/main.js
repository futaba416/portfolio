(function () {
  "use strict";

  var button = document.getElementById("back-to-top");
  if (!button) return;

  var image = button.querySelector("img");
  var normalSrc = image.getAttribute("src");
  var activeSrc = normalSrc.replace("footer-mascot-1", "footer-mascot-2");
  var hero = document.getElementById("hero");
  var showThreshold = function () {
    return window.innerHeight * 0.6;
  };

  function updateVisibility() {
    if (window.scrollY > showThreshold()) {
      button.classList.add("is-visible");
    } else {
      button.classList.remove("is-visible");
      image.src = normalSrc;
    }
  }

  button.addEventListener("click", function () {
    image.src = activeSrc;
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  window.addEventListener("scroll", updateVisibility, { passive: true });
  updateVisibility();
})();
