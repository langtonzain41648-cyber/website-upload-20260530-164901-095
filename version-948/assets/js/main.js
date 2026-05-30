
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function uniqueValues(cards, attr) {
    var values = [];
    var seen = Object.create(null);
    cards.forEach(function (card) {
      var value = card.getAttribute("data-" + attr);
      if (value && !seen[value]) {
        seen[value] = true;
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-Hans-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select || select.options.length > 1) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-card-list]"));
    lists.forEach(function (list) {
      var scope = list.closest(".content-section") || document;
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var input = scope.querySelector("[data-card-search]");
      var yearSelect = scope.querySelector('[data-filter="year"]');
      var typeSelect = scope.querySelector('[data-filter="type"]');
      var regionSelect = scope.querySelector('[data-filter="region"]');
      var emptyState = scope.querySelector("[data-empty-state]");

      fillSelect(yearSelect, uniqueValues(cards, "year"));
      fillSelect(typeSelect, uniqueValues(cards, "type"));
      fillSelect(regionSelect, uniqueValues(cards, "region"));

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-category"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" ").toLowerCase();
          var matched = true;
          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (year && card.getAttribute("data-year") !== year) {
            matched = false;
          }
          if (type && card.getAttribute("data-type") !== type) {
            matched = false;
          }
          if (region && card.getAttribute("data-region") !== region) {
            matched = false;
          }
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, yearSelect, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
