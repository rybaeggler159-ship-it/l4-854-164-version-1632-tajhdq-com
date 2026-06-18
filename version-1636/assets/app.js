(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
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

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".search-form"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function initSearchPage() {
    var page = document.querySelector(".search-page");
    if (!page) {
      return;
    }
    var input = page.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(page.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }

    function filter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        card.hidden = Boolean(keyword && text.indexOf(keyword) === -1);
      });
    }

    if (input) {
      input.addEventListener("input", filter);
    }
    filter();
  }

  function initFilterBar() {
    var group = document.querySelector("[data-filter-group]");
    var list = document.querySelector("[data-card-list]");
    if (!group || !list) {
      return;
    }
    var buttons = Array.prototype.slice.call(group.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        var field = button.getAttribute("data-filter-field");
        var value = button.getAttribute("data-filter-value");
        cards.forEach(function (card) {
          if (!value) {
            card.hidden = false;
            return;
          }
          var cardValue = card.getAttribute("data-" + field) || "";
          card.hidden = cardValue.indexOf(value) === -1;
        });
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initSearchPage();
    initFilterBar();
  });
})();
