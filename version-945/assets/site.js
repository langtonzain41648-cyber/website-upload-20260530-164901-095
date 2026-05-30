const $all = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function bindMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function bindHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = $all('[data-hero-slide]', hero);
  const dots = $all('[data-hero-dot]', hero);
  if (slides.length === 0) {
    return;
  }
  let index = 0;
  let timer = null;
  const show = next => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };
  const start = () => {
    timer = window.setInterval(() => show(index + 1), 5600);
  };
  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    start();
  };
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      show(i);
      restart();
    });
  });
  show(0);
  start();
}

function bindScrollTop() {
  const button = document.querySelector('[data-scroll-top]');
  if (!button) {
    return;
  }
  const update = () => {
    button.classList.toggle('is-visible', window.scrollY > 360);
  };
  window.addEventListener('scroll', update, { passive: true });
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  update();
}

function normalizeText(value) {
  return (value || '').toString().toLowerCase().trim();
}

function bindLibraryFilter() {
  const searchInput = document.querySelector('[data-library-search]');
  const typeSelect = document.querySelector('[data-filter-type]');
  const yearSelect = document.querySelector('[data-filter-year]');
  const cards = $all('.movie-card');
  const empty = document.querySelector('[data-empty]');
  if (!searchInput && !typeSelect && !yearSelect) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q && searchInput) {
    searchInput.value = q;
  }
  const apply = () => {
    const query = normalizeText(searchInput ? searchInput.value : '');
    const type = normalizeText(typeSelect ? typeSelect.value : '');
    const year = normalizeText(yearSelect ? yearSelect.value : '');
    let visible = 0;
    cards.forEach(card => {
      const haystack = normalizeText([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year
      ].join(' '));
      const matchQuery = !query || haystack.includes(query);
      const matchType = !type || normalizeText(card.dataset.type) === type;
      const matchYear = !year || normalizeText(card.dataset.year) === year;
      const matched = matchQuery && matchType && matchYear;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  };
  [searchInput, typeSelect, yearSelect].filter(Boolean).forEach(control => {
    control.addEventListener('input', apply);
    control.addEventListener('change', apply);
  });
  apply();
}

function bindHeaderSearch() {
  $all('[data-search-form]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const target = form.getAttribute('action') || 'search.html';
      const value = input ? input.value.trim() : '';
      const url = value ? `${target}?q=${encodeURIComponent(value)}` : target;
      window.location.href = url;
    });
  });
}

function setupCinemaPlayer(source) {
  const video = document.querySelector('[data-player-video]');
  const overlay = document.querySelector('[data-player-overlay]');
  const button = document.querySelector('[data-player-button]');
  if (!video || !source) {
    return;
  }
  let started = false;
  const begin = () => {
    if (started) {
      video.play().catch(() => {});
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.play().catch(() => {});
  };
  if (button) {
    button.addEventListener('click', begin);
  }
  if (overlay) {
    overlay.addEventListener('click', event => {
      if (event.target === overlay) {
        begin();
      }
    });
  }
  video.addEventListener('click', () => {
    if (!started) {
      begin();
    }
  });
}

window.setupCinemaPlayer = setupCinemaPlayer;

document.addEventListener('DOMContentLoaded', () => {
  bindMobileMenu();
  bindHero();
  bindScrollTop();
  bindLibraryFilter();
  bindHeaderSearch();
});
