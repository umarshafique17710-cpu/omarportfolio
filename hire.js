(function () {
  "use strict";

  var EMAIL = "umar.media164@gmail.com";
  var ENDPOINT = "https://formsubmit.co/ajax/" + EMAIL;

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

  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
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
  }

  function submitForm(formData) {
    var button = document.getElementById("hireSubmit");
    if (button) {
      button.disabled = true;
      button.textContent = "Sending...";
    }

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(formData)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("network");
        return res.json();
      })
      .then(function (data) {
        if (data && data.success === "false") throw new Error(data.message || "rejected");
        showSuccess();
        if (button) button.textContent = "Send Request";
      })
      .catch(function (err) {
        openMailFallback(formData, err);
      });
  }

  function openMailFallback(formData, err) {
    var button = document.getElementById("hireSubmit");
    if (button) {
      button.disabled = false;
      button.textContent = "Send Request";
    }

    var subject = encodeURIComponent("New Hire Request: " + formData.task);
    var body =
      encodeURIComponent(
        "Name: " + formData.name + "\n" +
        "Email: " + formData.email + "\n" +
        "Task: " + formData.task + "\n\n" +
        "Project Details:\n" + formData.message
      );
    var mailto = "mailto:" + EMAIL + "?subject=" + subject + "&body=" + body;
    window.location.href = mailto;

    showError(
      "Automatic sending is unavailable on this page (it needs a web server). " +
      "Your email app has opened with the details pre-filled — just press Send. " +
      "Tip: run the site through a server (start-server.bat) for automatic delivery."
    );
  }

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

      submitForm({
        name: name,
        email: email,
        task: task,
        message: message,
        _subject: "New Hire Request: " + task,
        _template: "table",
        _captcha: "false"
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initYear();
    initHireForm();
  });
})();
