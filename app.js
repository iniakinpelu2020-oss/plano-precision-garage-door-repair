/* Plano Precision — dispatch board */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var PHONE = "+14695187734";
  var TZ = "America/Chicago";

  var boot = $("#boot");
  if (boot) { window.setTimeout(function () { if (boot.parentNode) { boot.parentNode.removeChild(boot); } }, 2600); }

  /* ---------- dispatch status ---------- */
  (function status() {
    var out = $("#dispatchState");
    var rows = $$(".hours tr[data-day]");
    if (!out) { return; }
    var now = new Date();
    var day = "Mon", hour = 12, minute = 0;
    try {
      var parts = new Intl.DateTimeFormat("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).formatToParts(now);
      parts.forEach(function (p) {
        if (p.type === "weekday") { day = p.value; }
        if (p.type === "hour") { hour = parseInt(p.value, 10) % 24; }
        if (p.type === "minute") { minute = parseInt(p.value, 10); }
      });
    } catch (e) { day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()]; hour = now.getHours(); minute = now.getMinutes(); }

    var open = { Mon: [7, 19], Tue: [7, 19], Wed: [7, 19], Thu: [7, 19], Fri: [7, 19], Sat: [8, 16], Sun: null }[day];
    var mins = hour * 60 + minute;
    var isOpen = !!open && mins >= open[0] * 60 && mins < open[1] * 60;
    out.textContent = isOpen ? "Open now" : (open ? "Closed now" : "Closed today");

    rows.forEach(function (row) {
      if (row.getAttribute("data-day") === day) {
        row.classList.add("is-today");
        var cell = $(".hours__now", row);
        if (cell) { cell.textContent = isOpen ? "Open" : "Today"; }
      }
    });
  })();

  /* ---------- state ---------- */
  var state = { service: "Torsion Spring Replacement", price: 195, doors: { add: 0, label: "Single door" }, timing: { add: 0, label: "Scheduled" } };
  var money = function (n) { return "$" + n; };
  var total = function () { return state.price + state.doors.add + state.timing.add; };

  var panelJob = $("#panelJob"), panelTotal = $("#panelTotal"), panelRows = $("#panelRows"), panelRef = $("#panelRef");
  var drawerJob = $("#drawerJob"), drawerTotal = $("#drawerTotal"), drawerList = $("#drawerList");
  var drawerCall = $("#drawerCall"), drawerText = $("#drawerText");

  function render(pop) {
    var t = total();
    if (panelJob) { panelJob.textContent = state.service; }
    if (panelTotal) {
      panelTotal.textContent = money(t);
      if (pop) { panelTotal.classList.add("pop"); window.setTimeout(function () { panelTotal.classList.remove("pop"); }, 240); }
    }
    if (panelRef) { panelRef.textContent = "PP-" + t; }
    var rows = [
      [state.service, money(state.price)],
      [state.doors.label, "+" + money(state.doors.add)],
      [state.timing.label, "+" + money(state.timing.add)]
    ];
    if (panelRows) {
      panelRows.innerHTML = rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("");
    }
    if (drawerJob) { drawerJob.textContent = state.service; }
    if (drawerTotal) { drawerTotal.textContent = money(t); }
    if (drawerList) {
      drawerList.innerHTML = rows.map(function (r) { return "<li><span>" + r[0] + "</span><span>" + r[1] + "</span></li>"; }).join("");
    }
    var body = encodeURIComponent("Hi Plano Precision — quote " + "PP-" + t + ": " + state.service + " " + money(state.price) +
      " · " + state.doors.label + " +" + money(state.doors.add) + " · " + state.timing.label + " +" + money(state.timing.add) +
      " = " + money(t) + ". Can you confirm?");
    if (drawerCall) { drawerCall.href = "tel:" + PHONE; }
    if (drawerText) { drawerText.href = "sms:" + PHONE + "?&body=" + body; }
  }

  /* ---------- service cards ---------- */
  function selectCard(card) {
    $$(".card").forEach(function (c) { c.classList.toggle("is-on", c === card); });
    state.service = card.getAttribute("data-service");
    state.price = parseInt(card.getAttribute("data-price"), 10) || 0;
    render(true);
  }

  $$(".card").forEach(function (card) {
    card.addEventListener("click", function () { selectCard(card); });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectCard(card); }
    });
  });

  /* ---------- filters ---------- */
  $$(".filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".filter").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var f = btn.getAttribute("data-filter");
      $$(".card").forEach(function (card) {
        var show = f === "all" || card.getAttribute("data-cat") === f;
        card.hidden = !show;
      });
    });
  });

  /* ---------- segments ---------- */
  $$(".segs").forEach(function (wrap) {
    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("button") : null;
      if (!btn || !wrap.contains(btn)) { return; }
      $$("button", wrap).forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      var group = wrap.getAttribute("data-group");
      var data = { add: parseInt(btn.getAttribute("data-add") || "0", 10), label: btn.getAttribute("data-label") };
      if (group === "doors") { state.doors = data; } else { state.timing = data; }
      render(true);
    });
  });

  render(false);

  /* ---------- drawer ---------- */
  var drawer = $("#drawer"), scrim = $("#scrim"), drawerClose = $("#drawerClose"), lastFocus = null;

  function openDrawer() {
    if (!drawer) { return; }
    lastFocus = document.activeElement;
    render(false);
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (scrim) { scrim.hidden = false; scrim.classList.add("is-open"); }
    document.body.style.overflow = "hidden";
    if (drawerClose) { drawerClose.focus(); }
  }

  function closeDrawer() {
    if (!drawer) { return; }
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (scrim) {
      scrim.classList.remove("is-open");
      window.setTimeout(function () { if (!drawer.classList.contains("is-open")) { scrim.hidden = true; } }, 380);
    }
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  $$("[data-open-quote]").forEach(function (b) { b.addEventListener("click", openDrawer); });
  if (drawerClose) { drawerClose.addEventListener("click", closeDrawer); }
  if (scrim) { scrim.addEventListener("click", closeDrawer); }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) { closeDrawer(); }
  });
})();
