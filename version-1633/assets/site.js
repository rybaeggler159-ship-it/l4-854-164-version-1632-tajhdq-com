(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      var current = 0;
      var show = function (index) {
        current = index;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });
      setInterval(function () {
        show((current + 1) % slides.length);
      }, 5200);
    }

    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var search = root.querySelector("[data-filter-search]");
      var year = root.querySelector("[data-filter-year]");
      var region = root.querySelector("[data-filter-region]");
      var category = root.querySelector("[data-filter-category]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
      var count = root.querySelector("[data-filter-count]");
      var apply = function () {
        var query = text(search && search.value);
        var yearValue = text(year && year.value);
        var regionValue = text(region && region.value);
        var categoryValue = text(category && category.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = text(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-summary"));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) ok = false;
          if (yearValue && text(card.getAttribute("data-year")) !== yearValue) ok = false;
          if (regionValue && text(card.getAttribute("data-region")) !== regionValue) ok = false;
          if (categoryValue && text(card.getAttribute("data-category")) !== categoryValue) ok = false;
          card.classList.toggle("hidden-card", !ok);
          if (ok) visible += 1;
        });
        if (count) {
          count.textContent = "当前显示 " + visible + " 部影片";
        }
      };
      [search, year, region, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  });
})();
