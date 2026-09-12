(function () {
  "use strict";

  function setupRowReveal(selector, readyClass) {
    var targets = Array.prototype.slice.call(document.querySelectorAll(selector));
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      document.documentElement.classList.add(readyClass);
      return;
    }

    var timers = new WeakMap();

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        var target = entry.target;
        clearTimeout(timers.get(target));

        if (entry.isIntersecting) {
          var delay = i * 100;
          timers.set(target, setTimeout(function () {
            target.classList.add("is-visible");
          }, delay));
        } else {
          target.classList.remove("is-visible");
        }
      });
    }, {
      root: null,
      rootMargin: "0% 0% -15% 0%",
      threshold: 0,
    });

    targets.forEach(function (el) {
      observer.observe(el);
    });

    document.documentElement.classList.add(readyClass);
  }

  try {
    setupRowReveal(".chat-thread .chat-row", "chat-thread-reveal-ready");
  } catch (e) {}

  function setupFeedbackReveal() {
    var groups = Array.prototype.slice.call(document.querySelectorAll(".feedback-qa"));
    if (!groups.length) return;

    var rowDelay = 120;

    var timers = new WeakMap();

    function reveal(qa) {
      var rows = Array.prototype.slice.call(qa.querySelectorAll(".chat-row"));
      var ids = rows.map(function (row, j) {
        return setTimeout(function () {
          row.classList.add("is-visible");
        }, j * rowDelay);
      });
      timers.set(qa, ids);
    }

    function hide(qa) {
      var ids = timers.get(qa);
      if (ids) {
        ids.forEach(clearTimeout);
        timers.delete(qa);
      }
      var rows = Array.prototype.slice.call(qa.querySelectorAll(".chat-row"));
      rows.forEach(function (row) {
        row.classList.remove("is-visible");
      });
    }

    if (!("IntersectionObserver" in window)) {
      groups.forEach(reveal);
      document.documentElement.classList.add("feedback-reveal-ready");
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
        } else {
          hide(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: "0% 0% -15% 0%",
      threshold: 0,
    });

    groups.forEach(function (qa) {
      observer.observe(qa);
    });

    document.documentElement.classList.add("feedback-reveal-ready");
  }

  try {
    setupFeedbackReveal();
  } catch (e) {}
})();
