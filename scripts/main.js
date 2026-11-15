/* ==========================================================================
   Voxly — site scripts
   Без зависимостей: мобильное меню, sticky-header, reveal-анимации,
   активная навигация, год и подстановка ссылок на релизы.
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     Ссылки на сборки.
     Вариант 1: заполнить здесь.
     Вариант 2: положить рядом с index.html файл releases.json:
       { "setup": "https://github.com/<owner>/<repo>/releases/download/v1/VoxlyCode-Setup.exe",
         "portable": "https://.../VoxlyCode-Portable.exe" }
     ---------------------------------------------------------------------- */
  var RELEASES = {
    setup: '',
    portable: '',
    apk: ''
  };

  var doc = document;
  var root = doc.documentElement;
  var body = doc.body;

  root.classList.add('js-ready');

  /* ------------------------------- Меню -------------------------------- */
  var header = doc.getElementById('header');
  var nav = doc.getElementById('nav');
  var burger = doc.getElementById('burger');

  function setMenu(open) {
    if (!nav || !burger) return;
    nav.classList.toggle('is-open', open);
    burger.classList.toggle('is-active', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Меню');
    if (body) body.style.overflow = open && window.innerWidth <= 760 ? 'hidden' : '';
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });
  }

  if (nav) {
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
  }

  doc.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setMenu(false);
  });

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      if (window.innerWidth > 760) setMenu(false);
    }, 120);
  });

  /* --------------------------- Sticky header --------------------------- */
  var lastScrolled = null;

  function onScroll() {
    var scrolled = window.scrollY > 8;
    if (!header || scrolled === lastScrolled) return;
    lastScrolled = scrolled;
    header.classList.toggle('is-scrolled', scrolled);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------ Reveal ------------------------------- */
  var revealItems = Array.prototype.slice.call(doc.querySelectorAll('.reveal'));

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  } else {
    // Небольшая каскадная задержка для соседей внутри одной секции.
    var groups = new Map();
    revealItems.forEach(function (item) {
      var parent = item.parentElement;
      var list = groups.get(parent) || [];
      list.push(item);
      groups.set(parent, list);
    });

    groups.forEach(function (list) {
      list.forEach(function (item, index) {
        item.style.transitionDelay = Math.min(index * 70, 350) + 'ms';
      });
    });

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  /* --------------------------- Активный пункт -------------------------- */
  var navLinks = nav
    ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'))
    : [];

  var linkBySection = {};
  var sections = [];

  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var section = id ? doc.getElementById(id) : null;
    if (!section) return;
    linkBySection[id] = link;
    sections.push(section);
  });

  if ('IntersectionObserver' in window && sections.length) {
    var visible = new Set();

    function syncActive() {
      var current = null;
      sections.forEach(function (section) {
        if (visible.has(section.id)) current = section.id;
      });

      navLinks.forEach(function (link) {
        link.classList.toggle(
          'is-active',
          current !== null && link === linkBySection[current]
        );
      });
    }

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        syncActive();
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* -------------------------------- Год -------------------------------- */
  var year = doc.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ------------------------------ Релизы ------------------------------- */
  var downloadLinks = Array.prototype.slice.call(
    doc.querySelectorAll('[data-download]')
  );
  var hint = doc.getElementById('download-hint');

  var RELEASE_HINT =
    'Сборки на GitHub Releases: VoxlyCode 0.1.0 для Windows 10/11 (x64) и Voxly для Android.';

  function isDownloadUrl(url) {
    if (typeof url !== 'string') return false;
    url = url.trim();
    if (!url || url === '#') return false;
    // Абсолютная ссылка (GitHub Releases) либо файл рядом с сайтом.
    return (
      /^(https?:\/\/|\/|\.{1,2}\/)/i.test(url) ||
      /\.(exe|msi|apk|zip|dmg)$/i.test(url)
    );
  }

  function applyReleases(data) {
    if (!data || typeof data !== 'object') return false;
    var applied = 0;

    downloadLinks.forEach(function (link) {
      var key = link.getAttribute('data-download');
      var url = data[key];
      if (!isDownloadUrl(url)) return;

      url = url.trim();
      link.setAttribute('href', url);
      if (/^https?:\/\//i.test(url)) link.setAttribute('rel', 'noopener');
      link.removeAttribute('aria-disabled');
      link.classList.remove('is-pending');
      applied += 1;
    });

    if (applied > 0 && hint) hint.textContent = RELEASE_HINT;

    return applied > 0;
  }

  if (downloadLinks.length) {
    var hasInline = applyReleases(RELEASES);

    if (!hasInline && window.fetch && location.protocol !== 'file:') {
      window
        .fetch('releases.json', { cache: 'no-cache' })
        .then(function (response) {
          return response.ok ? response.json() : null;
        })
        .then(function (data) {
          if (data) applyReleases(data);
        })
        .catch(function () {
          /* файла может не быть — оставляем подсказку по умолчанию */
        });
    }
  }
})();
