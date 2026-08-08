(function () {
  "use strict";

  var STORAGE_KEY = "omar_reviews";

  var defaultReviews = [
    {
      name: "Sarah Mitchell",
      role: "Business Owner",
      rating: 5,
      text: "Omar completely transformed our online presence. Sales have never been better — I honestly don't know what we did before hiring him.",
      initials: "SM"
    },
    {
      name: "David Chen",
      role: "Marketing Partner",
      rating: 5,
      text: "One of the most reliable professionals I've collaborated with. Strategic, creative, and always delivers ahead of schedule.",
      initials: "DC"
    },
    {
      name: "Amira Haddad",
      role: "Client",
      rating: 5,
      text: "Our website went from slow and outdated to fast and stunning. Omar's marketing campaigns doubled our customer inquiries in two months.",
      initials: "AH"
    },
    {
      name: "James Rodriguez",
      role: "Startup Founder",
      rating: 4.5,
      text: "Omar understands business goals, not just web design. He built our platform and drove thousands of signups. Highly recommend.",
      initials: "JR"
    },
    {
      name: "Lena Kovač",
      role: "E-commerce Owner",
      rating: 5,
      text: "Professional, communicative, and results-driven. Our ad campaigns finally show real ROI thanks to his data-focused approach.",
      initials: "LK"
    },
    {
      name: "Tom O'Brien",
      role: "Business Owner",
      rating: 5,
      text: "From branding to SEO, Omar handled everything. We rank #1 locally and our website converts visitors like crazy. Worth every penny.",
      initials: "TO"
    }
  ];

  function getReviews() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return defaultReviews;
  }

  function saveReviews(reviews) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {}
  }

  function starsHtml(rating) {
    var full = Math.round(rating);
    var out = "";
    for (var i = 1; i <= 5; i++) {
      out += i <= full ? "★" : "☆";
    }
    return out;
  }

  function avatarInitials(name) {
    var parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.trim().charAt(0).toUpperCase();
  }

  function renderReviews() {
    var grid = document.getElementById("reviewsGrid");
    var reviews = getReviews();
    if (!grid) return;

    grid.innerHTML = reviews
      .map(function (r) {
        return (
          '<article class="review-card">' +
          '<div class="review-stars">' + starsHtml(r.rating) + "</div>" +
          "<p class=\"review-text\">\"" + escapeHtml(r.text) + '"</p>' +
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
    var avg = total ? (sum / total) : 0;
    var scoreEl = document.getElementById("avgScore");
    var starsEl = document.getElementById("avgStars");
    var countEl = document.getElementById("ratingCount");
    if (scoreEl) scoreEl.textContent = avg.toFixed(1);
    if (starsEl) starsEl.textContent = starsHtml(avg);
    if (countEl) countEl.textContent = "Based on " + total + " review" + (total === 1 ? "" : "s");
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
  }

  /* Star picker */
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
      s.addEventListener("mouseenter", function () {
        setActive(Number(s.dataset.value));
      });
    });
    container.addEventListener("mouseleave", function () {
      setActive(Number(hidden.value));
    });
  }

  /* Form submit */
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

      var reviews = getReviews();
      reviews.unshift({
        name: name.value.trim(),
        role: role.value,
        rating: Number(rating.value),
        text: message.value.trim(),
        initials: avatarInitials(name.value)
      });
      saveReviews(reviews);
      renderReviews();

      error.textContent = "";
      form.reset();
      rating.value = 0;
      var container = document.getElementById("starInput");
      if (container) container.querySelectorAll(".star").forEach(function (s) { s.classList.remove("active"); });

      var flash = document.createElement("div");
      flash.textContent = "✓ Thank you! Your review has been published.";
      flash.style.cssText = "text-align:center;color:#00cec9;font-weight:700;";
      form.after(flash);
      setTimeout(function () { flash.remove(); }, 3500);
    });
  }

  /* Mobile nav */
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

  /* Header shadow on scroll */
  function initHeader() {
    var header = document.querySelector(".site-header");
    window.addEventListener("scroll", function () {
      if (header) header.style.boxShadow = window.scrollY > 10 ? "0 4px 20px rgba(0,0,0,0.3)" : "none";
    });
  }

  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initStarPicker();
    initReviewForm();
    initNav();
    initHeader();
    initYear();
    renderReviews();
  });
})();
