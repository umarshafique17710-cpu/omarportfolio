/* ============================================================
   CONFIG — change these values to connect your own backend.
   ============================================================ */

window.OMAR_CONFIG = {
  // Email that receives hire requests (also used for mailto fallback)
  ownerEmail: "umar.media164@gmail.com",

  // ---- Google Sheets backend (recommended) -------------------
  // SETUP (takes ~5 minutes, free, no server needed):
  //   1. Create a Google Sheet (sheets.new)
  //   2. Extensions > Apps Script. Delete any code, paste the contents
  //      of backend/Code.gs, save.
  //   3. Deploy > New deployment > Web app:
  //        - Execute as:  Me
  //        - Who has access:  Anyone
  //   4. Copy the /exec URL and paste it below (e.g.
  //      "https://script.google.com/macros/s/AKfyc.../exec")
  //   The script auto-creates a "Reviews" and "HireRequests" tab.
  // When enabled, reviews AND hire requests are stored centrally in
  // your Google Sheet, and reviews are served to all visitors.
  backendUrl: "",

  // ---- Email delivery for hire requests ----------------------
  // FormSubmit.co delivers the hire form to your email automatically.
  // It needs the page served over http(s), not file://. First use
  // sends an activation email — click the link in it once.
  formSubmitEnabled: true
};
