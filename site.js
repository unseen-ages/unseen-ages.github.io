/* Unseen Ages — tasteful motion only.
   Scroll reveals via IntersectionObserver + a gentle parallax on hero art.
   Content is never hidden without JS: reveal states apply only under html.js,
   and everything is disabled for prefers-reduced-motion. */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- scroll reveals --- */
  var items = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 3) * 70) + "ms";
      io.observe(el);
    });
  }

  /* --- gentle parallax on elements marked .parallax-img --- */
  var px = document.querySelectorAll(".parallax-img");
  if (!reduced && px.length) {
    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight;
      px.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var progress = (r.top + r.height / 2 - vh / 2) / vh; /* -0.5..0.5 */
        el.style.transform = "translateY(" + (progress * -14).toFixed(1) + "px) scale(1.06)";
      });
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }
})();

/* ---------- v4 features: theme toggle + language switcher ---------- */
(function () {
  var btn = document.querySelector(".theme-toggle");
  if (btn) {
    btn.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("ua-theme", next); } catch (e) {}
    });
  }
  var sel = document.querySelector(".lang-select");
  if (sel) {
    var cur = document.documentElement.lang || "en";
    sel.value = cur;
    sel.addEventListener("change", function () {
      var p = window.location.pathname.replace(/^\//, "");
      if (p === "" || p.charAt(p.length - 1) === "/") p += "index.html";
      var parts = p.split("/").filter(function (s) { return s !== ""; });
      /* page part = the file name, plus a leading "articles" segment if present */
      var page = [];
      if (parts.length) page.unshift(parts.pop());
      if (parts.length && parts[parts.length - 1] === "articles") page.unshift(parts.pop());
      /* drop the current language segment; what remains is the site base
         ("" at a domain root, or e.g. "unseen-ages-preview" on a project page) */
      if (cur !== "en" && parts.length && parts[parts.length - 1] === cur) parts.pop();
      var base = parts.length ? "/" + parts.join("/") + "/" : "/";
      var dest = sel.value === "en" ? "" : sel.value + "/";
      var tail = page.join("/");
      if (tail === "index.html") tail = ""; /* homepage links stay clean: no /index.html */
      window.location.href = base + dest + tail;
    });
  }
})();
