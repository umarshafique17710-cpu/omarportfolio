(function () {
  "use strict";

  var STORAGE_KEY = "omar_reviews";
  var CACHE_KEY = "omar_reviews_cache";
  var CACHE_TIME = 30 * 60 * 1000; // 30 minutes

  var cfg = window.OMAR_CONFIG || { ownerEmail: "umar.media164@gmail.com", backendUrl: "" };

  var defaultReviews = [
    { name: "Sarah Mitchell", role: "Business Owner", rating: 5, text: "Omar completely transformed our online presence. Sales have never been better — I honestly don't know what we did before hiring him.", initials: "SM" },
    { name: "David Chen", role: "Marketing Partner", rating: 5, text: "One of the most reliable professionals I've collaborated with. Strategic, creative, and always delivers ahead of schedule.", initials: "DC" },
    { name: "Amira Haddad", role: "Client", rating: 5, text: "Our website went from slow and outdated to fast and stunning. Omar's marketing campaigns doubled our customer inquiries in two months.", initials: "AH" },
    { name: "James Rodriguez", role: "Startup Founder", rating: 5, text: "Omar understands business goals, not just web design. He built our platform and drove thousands of signups. Highly recommend.", initials: "JR" },
    { name: "Lena Kovač", role: "E-commerce Owner", rating: 5, text: "Professional, communicative, and results-driven. Our ad campaigns finally show real ROI thanks to his data-focused approach.", initials: "LK" },
    { name: "Tom O'Brien", role: "Business Owner", rating: 5, text: "From branding to SEO, Omar handled everything. We rank #1 locally and our website converts visitors like crazy. Worth every penny.", initials: "TO" }
  ];

  /* ---------- Helpers ---------- */

  function backendEnabled() {
    return !!(cfg.backendUrl && cfg.backendUrl.length > 5);
  }

  function backendCall(params, isGet) {
    var url = cfg.backendUrl;
    if (isGet) {
      var qs = Object.keys(params).map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
      }).join("&");
      url += (url.indexOf("?") === -1 ? "?" : "&") + qs;
      return fetch(url, { redirect: "follow" });
    }
    return fetch(url, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
  }

  function starsHtml(rating) {
    var full = Math.round(rating);
    var out = "";
    for (var i = 1; i <= 5; i++) out += i <= full ? "★" : "☆";
    return out;
  }

  function avatarInitials(name) {
    var parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.trim().charAt(0).toUpperCase();
  }

  function loadCached() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {}
    return null;
  }

  function saveLocal(reviews) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews)); } catch (e) {}
  }

  /* ---------- Reviews ---------- */

  function getReviews(callback) {
    if (backendEnabled()) {
      backendCall({ action: "listReviews" }, true)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && Array.isArray(data)) {
            saveLocal(data);
            try { localStorage.setItem(CACHE_KEY + "_t", String(Date.now())); } catch (e) {}
            callback(data);
            return;
          }
          callback(fallbackReviews());
        })
        .catch(function () { callback(fallbackReviews()); });
    } else {
      callback(fallbackReviews());
    }
  }

  function fallbackReviews() {
    var cached = loadCached();
    return cached && cached.length ? cached : defaultReviews.slice();
  }

  function renderReviews(reviews) {
    var grid = document.getElementById("reviewsGrid");
    if (!grid) return;
    grid.innerHTML = reviews
      .map(function (r) {
        return (
          '<article class="review-card">' +
          '<div class="review-stars">' + starsHtml(r.rating) + "</div>" +
          '<p class="review-text">"' + escapeHtml(r.text) + '"</p>' +
          '<div class="review-author">' +
          '<span class="review-avatar">' + escapeHtml(r.initials || avatarInitials(r.name)) + "</span>" +
          "<div><strong>" + escapeHtml(r.name) + "</strong>" +
          "<span>" + escapeHtml(r.role) + "</span></div>" +
          "</div></article>"
        );
      })
      .join("");
    updateSummary(reviews);
  }

  function updateSummary(reviews) {
    var total = reviews.length;
    var sum = reviews.reduce(function (acc, r) { return acc + Number(r.rating); }, 0);
    var avg = total ? sum / total : 0;
    var scoreEl = document.getElementById("avgScore");
    var starsEl = document.getElementById("avgStars");
    var countEl = document.getElementById("ratingCount");
    if (scoreEl) scoreEl.textContent = avg.toFixed(1);
    if (starsEl) starsEl.textContent = starsHtml(avg);
    if (countEl) countEl.textContent = "Based on " + total + " review" + (total === 1 ? "" : "s");
  }

  /* ---------- Star picker ---------- */

  function initStarPicker() {
    var container = document.getElementById("starInput");
    var hidden = document.getElementById("rRating");
    if (!container || !hidden) return;

    var stars = container.querySelectorAll(".star");
    function setActive(value) {
      stars.forEach(function (s) {
        s.classList.toggle("active", Number(s.dataset.value) <= value);
      });
    }
    stars.forEach(function (s) {
      s.addEventListener("click", function () {
        var value = Number(s.dataset.value);
        hidden.value = value;
        setActive(value);
      });
      s.addEventListener("mouseenter", function () { setActive(Number(s.dataset.value)); });
    });
    container.addEventListener("mouseleave", function () { setActive(Number(hidden.value)); });
  }

  /* ---------- Review form ---------- */

  function initReviewForm() {
    var form = document.getElementById("reviewForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("rName");
      var role = document.getElementById("rRole");
      var rating = document.getElementById("rRating");
      var message = document.getElementById("rMessage");
      var error = document.getElementById("formError");

      if (!name.value.trim()) { error.textContent = "Please enter your name."; return; }
      if (!role.value) { error.textContent = "Please select your role."; return; }
      if (!Number(rating.value)) { error.textContent = "Please select a star rating."; return; }
      if (!message.value.trim()) { error.textContent = "Please write a short review."; return; }

      var payload = {
        action: "addReview",
        name: name.value.trim(),
        role: role.value,
        rating: Number(rating.value),
        text: message.value.trim()
      };

      if (backendEnabled()) {
        backendCall(payload, false)
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (data && data.success) {
              error.textContent = "";
              form.reset();
              rating.value = 0;
              clearStars();
              flash(form, "✓ Thank you! Your review has been published.");
              refreshReviews();
            } else {
              error.textContent = "Could not publish review online. It was saved on this device instead.";
              saveLocal(fallbackReviews().concat([{
                name: payload.name, role: payload.role, rating: payload.rating, text: payload.text,
                initials: avatarInitials(payload.name)
              }]));
              renderReviews(loadCached() || []);
            }
          })
          .catch(function () {
            error.textContent = "Could not publish review online. It was saved on this device instead.";
            saveLocal(fallbackReviews().concat([{
              name: payload.name, role: payload.role, rating: payload.rating, text: payload.text,
              initials: avatarInitials(payload.name)
            }]));
            renderReviews(loadCached() || []);
          });
      } else {
        var local = fallbackReviews().concat([{
          name: payload.name, role: payload.role, rating: payload.rating, text: payload.text,
          initials: avatarInitials(payload.name)
        }]);
        saveLocal(local);
        error.textContent = "";
        form.reset();
        rating.value = 0;
        clearStars();
        flash(form, "✓ Thank you! Your review has been added.");
        renderReviews(local);
      }
    });
  }

  function clearStars() {
    var container = document.getElementById("starInput");
    if (container) container.querySelectorAll(".star").forEach(function (s) { s.classList.remove("active"); });
  }

  function flash(afterEl, text) {
    var div = document.createElement("div");
    div.textContent = text;
    div.style.cssText = "text-align:center;color:#00cec9;font-weight:700;";
    afterEl.after(div);
    setTimeout(function () { div.remove(); }, 4000);
  }

  function refreshReviews() {
    getReviews(function (list) { renderReviews(list); });
  }

  /* ---------- Reveal animations ---------- */

  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("revealed"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 0.06 + "s";
      io.observe(el);
    });
  }

  /* ---------- Nav ---------- */

  function initNav() {
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (!toggle || !links) return;

    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initActiveNav() {
    var links = document.querySelectorAll(".nav-links a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (a) { a.classList.remove("active"); });
          var el = map[entry.target.id];
          if (el) el.classList.add("active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) {
      var target = document.getElementById(id);
      if (target) io.observe(target);
    });
  }

  /* ---------- Header / Back to top ---------- */

  function initHeader() {
    var header = document.querySelector(".site-header");
    var top = document.getElementById("backToTop");
    window.addEventListener("scroll", function () {
      if (header) header.style.boxShadow = window.scrollY > 10 ? "0 4px 20px rgba(0,0,0,0.3)" : "none";
      if (top) top.classList.toggle("visible", window.scrollY > 500);
    }, { passive: true });
    if (top) top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Boot ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    initStarPicker();
    initReviewForm();
    initNav();
    initActiveNav();
    initHeader();
    initReveal();
    initYear();
    refreshReviews();
  });
})();
