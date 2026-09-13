(function () {
  "use strict";

  var showcase = document.querySelector(".feedback-columns--showcase");
  if (!showcase) return;

  var leftColumn = showcase.querySelector(".feedback-column:not(.feedback-column--offset)");
  var rightColumn = showcase.querySelector(".feedback-column--offset");
  if (!leftColumn || !rightColumn) return;

  var mq = window.matchMedia("(max-width: 1100px)");

  var STEP_VH_RATIO = 0.48;
  var MIN_GAP_PX = 24; 

  function applyColumn(column, stepPx) {
    var blocks = Array.prototype.slice.call(column.querySelectorAll(".feedback-qa"));
    blocks.forEach(function (block, i) {
      if (i === blocks.length - 1) {
        block.style.marginBottom = "";
        return;
      }
      var ownHeight = block.getBoundingClientRect().height;
      var gap = Math.max(MIN_GAP_PX, stepPx * 2 - ownHeight);
      block.style.marginBottom = gap + "px";
    });
  }

  function resetInlineStyles() {
    rightColumn.style.marginTop = "";
    [leftColumn, rightColumn].forEach(function (column) {
      Array.prototype.slice.call(column.querySelectorAll(".feedback-qa")).forEach(function (block) {
        block.style.marginBottom = "";
      });
    });
  }

  function applyRhythm() {
    if (mq.matches) {
      resetInlineStyles();
      return;
    }

    var stepPx = window.innerHeight * STEP_VH_RATIO;

    applyColumn(leftColumn, stepPx);
    applyColumn(rightColumn, stepPx);
    rightColumn.style.marginTop = stepPx + "px";
  }

  applyRhythm();
  window.addEventListener("resize", applyRhythm);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(applyRhythm).catch(function () {});
  }
})();
