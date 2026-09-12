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

  var photoList = Object.keys(photoData).map(function (key) {
    return { key: key, src: "assets/images/gallery/" + key + ".webp" };
  });

  var mainImg = modal.querySelector(".photo-modal__image--main");
  var prevBtn = modal.querySelector(".photo-modal__nav--prev");
  var nextBtn = modal.querySelector(".photo-modal__nav--next");
  var panel = modal.querySelector(".photo-modal__panel");
  var titleEl = modal.querySelector(".photo-modal__title");
  var locationEl = modal.querySelector(".photo-modal__location");
  var locationTextEl = modal.querySelector(".photo-modal__location-text");
  var commentEl = modal.querySelector(".photo-modal__comment");
  var triggerButton = null;
  var pendingLoadHandler = null;
  var addedInertSiblings = [];
  var previousBodyOverflow = "";
  var suppressFocusPause = false;
  var currentIndex = 0;
  var isAnimating = false;

  var SLIDE_TRANSITION = "transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.32s ease";

  function fileKeyFromSrc(src) {
    var name = src.split("/").pop();
    return name.replace(/\.[a-zA-Z0-9]+$/, "");
  }

  function altForKey(key) {
    var data = photoData[key];
    return (data && data.title) || "スナップ写真";
  }

  function revealImage() {
    pendingLoadHandler = null;
    mainImg.classList.remove("is-loading");
    mainImg.style.transition = SLIDE_TRANSITION;
    mainImg.style.transform = "translateX(0)";
    mainImg.style.opacity = "1";
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

  function setSlideContent(index) {
    var current = photoList[index];
    var data = photoData[current.key] || {};

    setField(titleEl, null, data.title);
    setField(locationEl, locationTextEl, data.location);
    setField(commentEl, null, data.comment);

    mainImg.alt = altForKey(current.key);
  }

  function openModal(button) {
    triggerButton = button.__realButton || button;

    var img = button.querySelector("img");
    var key = fileKeyFromSrc(img.getAttribute("src"));
    var index = photoList.findIndex(function (p) {
      return p.key === key;
    });
    currentIndex = index === -1 ? 0 : index;

    setSlideContent(currentIndex);

    if (!modal.classList.contains("is-open")) {
      previousBodyOverflow = document.body.style.overflow;
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setBackgroundInert(true);
    modal.querySelector(".photo-modal__close").focus();

    if (pendingLoadHandler) {
      mainImg.removeEventListener("load", pendingLoadHandler);
      pendingLoadHandler = null;
    }

    mainImg.style.transition = "none";
    mainImg.style.transform = "translateX(0)";
    mainImg.classList.add("is-loading");
    mainImg.src = photoList[currentIndex].src;

    if (mainImg.complete && mainImg.currentSrc) {
      revealImage();
    } else {
      pendingLoadHandler = revealImage;
      mainImg.addEventListener("load", revealImage, { once: true });
    }
  }

  function navigate(direction) {
    if (!modal.classList.contains("is-open") || isAnimating) return;
    var newIndex = (currentIndex + direction + photoList.length) % photoList.length;
    animateSwap(newIndex, direction);
  }

  var SLIDE_STEP_MS = 320;
  var swapTimeouts = [];

  function animateSwap(newIndex, direction) {
    isAnimating = true;
    mainImg.style.transition = SLIDE_TRANSITION;
    mainImg.style.transform = "translateX(" + direction * -46 + "px)";
    mainImg.style.opacity = "0";

    swapTimeouts.push(
      window.setTimeout(function () {
        currentIndex = newIndex;
        setSlideContent(currentIndex);
        mainImg.src = photoList[currentIndex].src;

        mainImg.style.transition = "none";
        mainImg.style.transform = "translateX(" + direction * 46 + "px)";
        mainImg.style.opacity = "0";
        void mainImg.offsetWidth;

        mainImg.style.transition = SLIDE_TRANSITION;
        mainImg.style.transform = "translateX(0)";
        mainImg.style.opacity = "1";

        swapTimeouts.push(
          window.setTimeout(function () {
            isAnimating = false;
          }, SLIDE_STEP_MS)
        );
      }, SLIDE_STEP_MS)
    );
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousBodyOverflow;
    setBackgroundInert(false);
    swapTimeouts.forEach(window.clearTimeout);
    swapTimeouts = [];
    isAnimating = false;
    if (triggerButton) {
      var triggerTrack = triggerButton.closest(".gallery-row__track");
      suppressFocusPause = true;
      triggerButton.focus();
      suppressFocusPause = false;
      if (triggerTrack) {
        triggerTrack.classList.remove("is-focus-paused");
        // Reduced-motion tracks have no timeline anim; scrollLeft there is the real scroll position, not a stray offset to reset.
        if (trackHasTimelineAnim(triggerTrack)) {
          var triggerRow = triggerTrack.closest(".gallery-row");
          if (triggerRow && triggerRow.scrollLeft !== 0) triggerRow.scrollLeft = 0;
        }
      }
    }
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
      if (suppressFocusPause) return;
      if (!e.target.matches(":focus-visible")) return;
      track.classList.add("is-focus-paused");
      bringIntoView(track, e.target);
    });

    track.addEventListener("focusout", function (e) {
      if (track.contains(e.relatedTarget)) return;
      track.classList.remove("is-focus-paused");
    });
  });

  function trackTimelineAnim(track) {
    var anim = typeof track.getAnimations === "function" ? track.getAnimations()[0] : null;
    return anim && anim.effect && typeof anim.effect.getTiming === "function" ? anim : null;
  }

  function trackHasTimelineAnim(track) {
    return !!trackTimelineAnim(track);
  }

  function bringIntoView(track, button) {
    var row = track.closest(".gallery-row");
    if (!row) return;

    var anim = trackTimelineAnim(track);

    if (!anim) {
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

  prevBtn.addEventListener("click", function () {
    navigate(-1);
  });

  nextBtn.addEventListener("click", function () {
    navigate(1);
  });

  var touchStartX = null;

  modal.querySelector(".photo-modal__stage").addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );

  modal.querySelector(".photo-modal__stage").addEventListener(
    "touchend",
    function (e) {
      if (touchStartX === null) return;
      var deltaX = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      var threshold = 40;
      if (deltaX > threshold) {
        navigate(-1);
      } else if (deltaX < -threshold) {
        navigate(1);
      }
    },
    { passive: true }
  );

  document.addEventListener("keydown", function (e) {
    if (!modal.classList.contains("is-open")) return;

    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "Tab") {
      trapFocus(e);
    } else if (e.key === "ArrowLeft") {
      navigate(-1);
    } else if (e.key === "ArrowRight") {
      navigate(1);
    }
  });
})();
