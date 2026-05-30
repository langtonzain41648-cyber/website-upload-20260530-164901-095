(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function nextSlide() {
      show(current + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(nextSlide, 6500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilter(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var category = scope.querySelector('[data-category-filter]');
    var year = scope.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('[data-empty]');

    if (!cards.length) {
      return;
    }

    if (year) {
      var years = cards.map(function (card) {
        return card.getAttribute('data-year') || '';
      }).filter(Boolean).filter(function (value, index, arr) {
        return arr.indexOf(value) === index;
      }).sort(function (a, b) {
        return Number(b) - Number(a);
      });

      years.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        year.appendChild(option);
      });
    }

    var query = new URLSearchParams(window.location.search).get('q');
    if (query && input) {
      input.value = query;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var cat = category ? category.value : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') || '').toLowerCase();
        var cardCat = card.getAttribute('data-category') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (cat && cardCat !== cat) {
          matched = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  Array.prototype.slice.call(document.querySelectorAll('.filter-scope')).forEach(setupFilter);
})();
