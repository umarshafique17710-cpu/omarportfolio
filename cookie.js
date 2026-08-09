(function () {
  "use strict";

  var STORAGE_KEY = "omar_cookie_consent";

  function getBanner() { return document.getElementById("cookieBanner"); }

  function setChoice(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    var banner = getBanner();
    if (banner) {
      banner.classList.remove("show");
      banner.setAttribute("aria-hidden", "true");
    }
  }

  function init() {
    var banner = getBanner();
    if (!banner) return;

    var choice = null;
    try { choice = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (choice === "accepted" || choice === "declined") return;

    setTimeout(function () {
      banner.classList.add("show");
      banner.setAttribute("aria-hidden", "false");
    }, 1200);

    var accept = document.getElementById("cookieAccept");
    var decline = document.getElementById("cookieDecline");
    if (accept) accept.addEventListener("click", function () { setChoice("accepted"); });
    if (decline) decline.addEventListener("click", function () { setChoice("declined"); });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
