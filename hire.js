(function () {
  "use strict";

  var cfg = window.OMAR_CONFIG || { ownerEmail: "umar.media164@gmail.com", backendUrl: "", formSubmitEnabled: true };
  var EMAIL = cfg.ownerEmail;
  var ENDPOINT = "https://formsubmit.co/ajax/" + EMAIL;

  /* ---------- Small helpers ---------- */

  function backendEnabled() {
    return !!(cfg.backendUrl && cfg.backendUrl.length > 5);
  }

  function sendToBackend(payload) {
    return fetch(cfg.backendUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (res) { return res.json(); });
  }

  function sendToFormSubmit(payload) {
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (res) { return res.json(); });
  }

  function showError(message) {
    var error = document.getElementById("hireError");
    if (error) error.textContent = message;
  }

  function showSuccess() {
    var form = document.getElementById("hireForm");
    var success = document.getElementById("hireSuccess");
    if (form) form.hidden = true;
    if (success) success.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setButton(state) {
    var button = document.getElementById("hireSubmit");
    if (!button) return;
    if (state === "busy") {
      button.disabled = true;
      button.textContent = "Sending...";
    } else {
      button.disabled = false;
      button.textContent = "Send Request";
    }
  }

  function mailtoFallback(formData) {
    var subject = encodeURIComponent("New Hire Request: " + formData.task);
    var body = encodeURIComponent(
      "Name: " + formData.name + "\n" +
      "Email: " + formData.email + "\n" +
      "Task: " + formData.task + "\n\n" +
      "Project details:\n" + formData.message
    );
    window.location.href = "mailto:" + EMAIL + "?subject=" + subject + "&body=" + body;
    showError(
      "Online delivery isn't available from this page. Your email app opened with the details pre-filled — just press Send."
    );
  }

  /* ---------- Delivery pipeline ---------- */

  function submitForm(formData) {
    setButton("busy");

    if (backendEnabled()) {
      sendToBackend({ action: "addHire", name: formData.name, email: formData.email, task: formData.task, message: formData.message })
        .then(function (data) {
          if (data && data.success) {
            setButton("idle");
            showSuccess();
          } else {
            sendViaFormSubmit(formData);
          }
        })
        .catch(function () { sendViaFormSubmit(formData); });
    } else {
      sendViaFormSubmit(formData);
    }
  }

  function sendViaFormSubmit(formData) {
    if (!cfg.formSubmitEnabled) {
      setButton("idle");
      mailtoFallback(formData);
      return;
    }
    sendToFormSubmit({
      name: formData.name,
      email: formData.email,
      task: formData.task,
      message: formData.message,
      _subject: "New Hire Request: " + formData.task,
      _template: "table",
      _captcha: "false"
    })
      .then(function (data) {
        setButton("idle");
        if (data && data.success !== "false") {
          showSuccess();
        } else {
          mailtoFallback(formData);
        }
      })
      .catch(function () {
        setButton("idle");
        mailtoFallback(formData);
      });
  }

  /* ---------- Form ---------- */

  function initHireForm() {
    var form = document.getElementById("hireForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      showError("");

      var name = document.getElementById("hName").value.trim();
      var email = document.getElementById("hEmail").value.trim();
      var task = document.getElementById("hTask").value;
      var message = document.getElementById("hMessage").value.trim();

      if (!name) { showError("Please enter your name."); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError("Please enter a valid email address."); return; }
      if (!task) { showError("Please select a task."); return; }
      if (!message) { showError("Please describe your project."); return; }

      submitForm({ name: name, email: email, task: task, message: message });
    });
  }

  /* ---------- Nav / misc ---------- */

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

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initHeader();
    initYear();
    initHireForm();
  });
})();
