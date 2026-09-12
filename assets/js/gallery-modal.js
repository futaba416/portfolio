(function () {
  "use strict";

  var modal = document.getElementById("photo-modal");
  if (!modal) return;

  var photoData = {
    DSCF2930: {
      title: "ぎおん祭り",
      location: "新潟県柏崎市",
      comment: ""
    },
    DSCF2938: {
      title: "ぎおん祭り",
      location: "新潟県柏崎市",
      comment: ""
    },
    DSCF0092: {
      title: "わたしのカメラ",
      location: "",
      comment: ""
    },
    DSCF1229: {
      title: "愛車と月",
      location: "",
      comment: ""
    },
    DSCF0665: {
      title: "藤",
      location: "新潟県新潟市",
      comment: ""
    },
    DSCF9654: {
      title: "わたしの愛車",
      location: "",
      comment: ""
    },
    DSCF8620: {
      title: "梅",
      location: "群馬県高崎市",
      comment: ""
    },
    DSCF9318: {
      title: "風鈴",
      location: "新潟県新潟市",
      comment: ""
    },
    DSCF8414: {
      title: "クリスマスツリー",
      location: "新潟県長岡市",
      comment: ""
    },
    DSCF9327: {
      title: "紫陽花",
      location: "新潟県新潟市",
      comment: ""
    },
    IMG_1093: {
      title: "わたし",
      location: "新潟県柏崎市",
      comment: ""
    },
    DSCF8853: {
      title: "チーズケーキと紫陽花",
      location: "新潟県新潟市",
      comment: ""
    },
    DSCF9320: {
      title: "風鈴",
      location: "新潟県新潟市",
      comment: ""
    },
    DSCF9951: {
      title: "さくら",
      location: "新潟県妙高市",
      comment: ""
    },
    DSCF8324: {
      title: "イルミネーション",
      location: "新潟県長岡市",
      comment: ""
    },
    IMG_1095: {
      title: "わたし",
      location: "新潟県上越市",
      comment: ""
    },
    DSCF9897: {
      title: "さくらと山",
      location: "新潟県妙高市",
      comment: ""
    },
    DSCF8397: {
      title: "イルミネーション",
      location: "新潟県長岡市",
      comment: ""
    },
    DSCF3229: {
      title: "ハナトラノオ",
      location: "新潟県見附市",
      comment: ""
    },
    DSCF7637: {
      title: "ケーキ",
      location: "新潟県新潟市",
      comment: ""
    },
    IMG_1917: {
      title: "わたし",
      location: "群馬県前橋市",
      comment: ""
    },
    DSCF8316: {
      title: "イルミネーション",
      location: "新潟県長岡市",
      comment: ""
    },
    DSCF7685: {
      title: "喫茶店",
      location: "新潟県新潟市",
      comment: ""
    },
    DSCF0042: {
      title: "さくら",
      location: "新潟県妙高市",
      comment: ""
    },
    DSCF3027: {
      title: "サントピアワールド",
      location: "新潟県阿賀野市",
      comment: ""
    }
  };

  var image = modal.querySelector(".photo-modal__image");
  var panel = modal.querySelector(".photo-modal__panel");
  var titleEl = modal.querySelector(".photo-modal__title");
  var locationEl = modal.querySelector(".photo-modal__location");
  var locationTextEl = modal.querySelector(".photo-modal__location-text");
  var commentEl = modal.querySelector(".photo-modal__comment");
  var triggerButton = null;
  var pendingLoadHandler = null;
  var addedInertSiblings = [];
  var previousBodyOverflow = "";

  function fileKeyFromSrc(src) {
    var name = src.split("/").pop();
    return name.replace(/\.[a-zA-Z0-9]+$/, "");
  }

  function revealImage() {
    image.classList.remove("is-loading");
  }

  function setField(el, textEl, value) {
    if (value) {
      (textEl || el).textContent = value;
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  }

  function accessibleNameFor(key) {
    var data = photoData[key];
    if (data && data.title) {
      return data.title + "の写真を拡大";
    }
    return "スナップ写真を拡大";
  }

  function getFocusableElements(container) {
    var candidates = container.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    return Array.prototype.filter.call(candidates, function (el) {
      return !el.hidden && el.offsetParent !== null;
    });
  }

  function trapFocus(e) {
    var focusable = getFocusableElements(panel);
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    var activeInPanel = panel.contains(document.activeElement);

    if (e.shiftKey) {
      if (!activeInPanel || document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (!activeInPanel || document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function setBackgroundInert(makeInert) {
    if (makeInert) {
      addedInertSiblings = Array.prototype.filter.call(document.body.children, function (el) {
        return el !== modal && el.tagName !== "SCRIPT" && !el.hasAttribute("inert");
      });
      addedInertSiblings.forEach(function (el) {
        el.setAttribute("inert", "");
      });
    } else {
      addedInertSiblings.forEach(function (el) {
        el.removeAttribute("inert");
      });
      addedInertSiblings = [];
    }
  }

  function openModal(button) {
    triggerButton = button.__realButton || button;

    var img = button.querySelector("img");
    var newSrc = img.getAttribute("src");
    var data = photoData[fileKeyFromSrc(newSrc)] || {};

    function show() {
      pendingLoadHandler = null;
      setField(titleEl, null, data.title);
      setField(locationEl, locationTextEl, data.location);
      setField(commentEl, null, data.comment);

      if (!modal.classList.contains("is-open")) {
        previousBodyOverflow = document.body.style.overflow;
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      setBackgroundInert(true);
      modal.querySelector(".photo-modal__close").focus();
      revealImage();
    }

    if (pendingLoadHandler) {
      image.removeEventListener("load", pendingLoadHandler);
      pendingLoadHandler = null;
    }

    image.classList.add("is-loading");
    image.src = newSrc;
    image.alt = img.alt || "";

    if (image.complete && image.currentSrc) {
      show();
    } else {
      pendingLoadHandler = show;
      image.addEventListener("load", show, { once: true });
    }
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousBodyOverflow;
    setBackgroundInert(false);
    if (triggerButton) triggerButton.focus();
  }

  document.querySelectorAll(".gallery-row__track").forEach(function (track) {
    var imgs = Array.prototype.slice.call(track.querySelectorAll("img"));
    var realButtons = [];

    imgs.forEach(function (img) {
      var isDuplicate = img.getAttribute("aria-hidden") === "true";
      var key = fileKeyFromSrc(img.getAttribute("src"));

      var button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-photo-btn";

      if (isDuplicate) {
        button.tabIndex = -1;
        button.setAttribute("aria-hidden", "true");
      } else {
        button.setAttribute("aria-label", accessibleNameFor(key));
      }

      img.parentNode.insertBefore(button, img);
      button.appendChild(img);
      button.addEventListener("click", function () {
        openModal(button);
      });

      if (!isDuplicate) {
        realButtons.push(button);
      }
    });

    var duplicateButtons = Array.prototype.slice.call(
      track.querySelectorAll('.gallery-photo-btn[tabindex="-1"]')
    );
    duplicateButtons.forEach(function (dupBtn, i) {
      dupBtn.__realButton = realButtons[i] || null;
    });
  });

  document.querySelectorAll(".gallery-row__track").forEach(function (track) {
    track.addEventListener("focusin", function (e) {
      if (!e.target.classList.contains("gallery-photo-btn")) return;
      track.classList.add("is-focus-paused");
      bringIntoView(track, e.target);
    });

    track.addEventListener("focusout", function (e) {
      if (track.contains(e.relatedTarget)) return;
      track.classList.remove("is-focus-paused");
    });
  });

  function bringIntoView(track, button) {
    var row = track.closest(".gallery-row");
    if (!row) return;

    var anim = typeof track.getAnimations === "function" ? track.getAnimations()[0] : null;
    var hasTimelineAnim = !!(anim && anim.effect && typeof anim.effect.getTiming === "function");

    if (!hasTimelineAnim) {
      button.scrollIntoView({ block: "nearest", inline: "nearest" });
      return;
    }

    if (row.scrollLeft !== 0) {
      row.scrollLeft = 0;
    }

    var rowRect = row.getBoundingClientRect();
    var btnRect = button.getBoundingClientRect();
    var margin = 4;
    var overflowLeft = rowRect.left + margin - btnRect.left;
    var overflowRight = btnRect.right - (rowRect.right - margin);

    var deltaPx;
    if (overflowLeft > 0) {
      deltaPx = overflowLeft;
    } else if (overflowRight > 0) {
      deltaPx = -overflowRight;
    } else {
      return;
    }

    var duration = anim.effect.getTiming().duration;
    var trackHalfWidth = track.scrollWidth / 2;
    if (!duration || !trackHalfWidth) return;

    var deltaTime = (-deltaPx * duration) / trackHalfWidth;
    var lapTime = (((anim.currentTime || 0) % duration) + duration) % duration;
    var idealTime = lapTime + deltaTime;

    var newTime = Math.min(Math.max(idealTime, 0), duration - 1);
    anim.currentTime = newTime;
  }

  modal.querySelectorAll("[data-modal-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (e) {
    if (!modal.classList.contains("is-open")) return;

    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "Tab") {
      trapFocus(e);
    }
  });
})();
