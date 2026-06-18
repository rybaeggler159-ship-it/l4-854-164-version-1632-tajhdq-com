(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('#siteNav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.textContent = isOpen ? '×' : '☰';
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => showSlide(current + 1), 6200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showSlide(Number(dot.dataset.slide || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        showSlide(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        showSlide(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  const searchInput = document.querySelector('#searchInput');
  const regionFilter = document.querySelector('#regionFilter');
  const yearFilter = document.querySelector('#yearFilter');
  const typeFilter = document.querySelector('#typeFilter');
  const clearFilters = document.querySelector('#clearFilters');
  const resultCards = Array.from(document.querySelectorAll('#movieResults .movie-card'));

  if (searchInput && resultCards.length) {
    searchInput.value = initialQuery;

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const filterCards = () => {
      const keyword = normalize(searchInput.value);
      const region = regionFilter ? regionFilter.value : '';
      const year = yearFilter ? yearFilter.value : '';
      const type = typeFilter ? typeFilter.value : '';

      resultCards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        const matchKeyword = !keyword || haystack.includes(keyword);
        const matchRegion = !region || card.dataset.region === region;
        const matchYear = !year || card.dataset.year === year;
        const matchType = !type || card.dataset.type === type;
        card.hidden = !(matchKeyword && matchRegion && matchYear && matchType);
      });
    };

    [searchInput, regionFilter, yearFilter, typeFilter].forEach((control) => {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    if (clearFilters) {
      clearFilters.addEventListener('click', () => {
        searchInput.value = '';
        if (regionFilter) {
          regionFilter.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        if (typeFilter) {
          typeFilter.value = '';
        }
        filterCards();
      });
    }

    filterCards();
  }
})();
