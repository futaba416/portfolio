(function () {
  "use strict";

  var elements = Array.prototype.slice.call(document.querySelectorAll(".header-timestamp"));
  if (!elements.length) return;

  var DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function formatTimestamp(date) {
    var year = date.getFullYear();
    var month = pad2(date.getMonth() + 1);
    var day = pad2(date.getDate());

    var hours24 = date.getHours();
    var ampm = hours24 < 12 ? "am" : "pm";
    var hours12 = hours24 % 12;
    if (hours12 === 0) hours12 = 12;
    var minutes = pad2(date.getMinutes());

    var weekday = DAY_NAMES[date.getDay()];

    return year + "/" + month + "/" + day + " " + hours12 + ":" + minutes + " (" + ampm + ") - " + weekday;
  }

  function update() {
    var text = formatTimestamp(new Date());
    elements.forEach(function (el) {
      el.textContent = text;
    });
  }

  update();
  setInterval(update, 30000);
})();
