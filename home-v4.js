/* Unseen Ages — homepage v4 interactions.
   Motion language after the Fernhill reference: calm scroll reveals with
   staggered children, gentle parallax on photographs, hover lifts (CSS),
   animated counters, a draggable timeline shelf and year strip, and
   tap-to-open sealed finds with a live "finds opened" counter.
   1) Reveal on scroll (IntersectionObserver; children stagger via --i).
   2) Parallax on .px-img photographs (inside .px-frame).
   3) Animated counters (figures taken from the articles).
   4) Timeline explorer: draggable shelf of the seven stories, oldest
      first; selecting a stop swaps the panel. All panel text is copied
      from the homepage cards and the articles' own date lines.
   5) Year strip: drag-to-scroll (links stay clickable).
   6) "Sealed finds": tap-to-open reveal cards (article deks, verbatim);
      the counter counts each find the first time it is opened.
   Everything degrades gracefully: no-JS keeps the counters' final
   values, the first timeline stop, every story link and (via the
   noscript style) the sealed-find texts; reduced motion shows final
   states and keeps every interaction working. */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Localized homepages inject window.UA_STOPS / UA_TL / UA_BASE ahead
     of this script; English uses the built-in defaults below. */
  var UA = window.UA_TL || {};
  var BASE = window.UA_BASE || "";

  /* ---------- 1) reveals ---------- */
  var rvEls = document.querySelectorAll(".rv, .rv-group");
  function settle(group) {
    var n = group.querySelectorAll(".rv-i").length || 1;
    setTimeout(function () { group.classList.add("done"); }, 85 * n + 750);
  }
  if (reduced || !("IntersectionObserver" in window)) {
    rvEls.forEach(function (el) { el.classList.add("in", "done"); });
  } else {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          if (e.target.classList.contains("rv-group")) settle(e.target);
          rio.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    rvEls.forEach(function (el) { rio.observe(el); });
  }

  /* ---------- 2) parallax on photographs ---------- */
  var pxImgs = document.querySelectorAll(".px-img");
  if (pxImgs.length && !reduced) {
    var pxTick = false;
    function pxUpdate() {
      pxTick = false;
      var vh = window.innerHeight;
      pxImgs.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var progress = (r.top + r.height / 2 - vh / 2) / vh; /* about -0.5..0.5 */
        img.style.transform = "translateY(" + (progress * -20).toFixed(1) + "px) scale(1.12)";
      });
    }
    window.addEventListener("scroll", function () {
      if (!pxTick) { pxTick = true; requestAnimationFrame(pxUpdate); }
    }, { passive: true });
    pxUpdate();
  }

  /* ---------- 3) counters ---------- */
  var nums = document.querySelectorAll(".cnum[data-count]");
  function fmt(n, el) {
    return n.toLocaleString("en-GB") + (el.getAttribute("data-suffix") || "");
  }
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduced || !("requestAnimationFrame" in window)) { el.textContent = fmt(target, el); return; }
    var dur = 1500, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased), el);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (nums.length) {
    if ("IntersectionObserver" in window && !reduced) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      nums.forEach(function (el) { el.textContent = fmt(0, el); cio.observe(el); });
    } else {
      nums.forEach(runCounter);
    }
  }

  /* ---------- shared drag-to-scroll (a real drag must not click) ---------- */
  function makeDraggable(el) {
    if (!el) return;
    var down = false, startX = 0, startScroll = 0, moved = false;
    el.addEventListener("pointerdown", function (e) {
      down = true; moved = false;
      startX = e.clientX; startScroll = el.scrollLeft;
      el.classList.add("dragging");
    });
    el.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      el.scrollLeft = document.documentElement.dir === "rtl" ? startScroll + dx : startScroll - dx;
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
      el.addEventListener(ev, function () {
        down = false; el.classList.remove("dragging");
        if (moved) setTimeout(function () { moved = false; }, 150);
      });
    });
    el.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  }

  /* ---------- 4) timeline ---------- */
  var STOPS = window.UA_STOPS || [
    { slug: "gobekli-tepe", title: "Göbekli Tepe", tag: "Neolithic Anatolia",
      date: "About 9600 BC", img: "assets/gobekli-tepe-hero.webp",
      alt: "Excavated stone enclosures and T-shaped pillars at Göbekli Tepe",
      line: "A temple raised 6,000 years before Stonehenge — by hunter-gatherers.", contain: false },
    { slug: "tarkhan-dress", title: "The Tarkhan Dress", tag: "Ancient Egypt",
      date: "3482–3102 BC", img: "assets/tarkhan-dress-hero.webp",
      alt: "The Tarkhan Dress, a pleated linen garment over 5,000 years old",
      line: "A 5,000-year-old shirt that someone actually wore.", contain: false },
    { slug: "tutankhamun-meteorite-dagger", title: "Tutankhamun’s Meteorite Dagger", tag: "Ancient Egypt",
      date: "About 1323 BC", img: "assets/tutankhamun-meteorite-dagger-hero.webp",
      alt: "Tutankhamun's iron dagger with its gold sheath",
      line: "King Tut was buried with a blade made from a meteorite.", contain: true },
    { slug: "terracotta-army", title: "The Terracotta Army", tag: "Ancient China",
      date: "210 BC", img: "assets/terracotta-army-hero.webp",
      alt: "Rows of life-size terracotta soldiers standing in Pit 1 near Xi'an",
      line: "In 1974, farmers digging a well found an army of 8,000 clay soldiers.", contain: false },
    { slug: "antikythera-mechanism", title: "The Antikythera Mechanism", tag: "Ancient Greece",
      date: "About 150–100 BC", img: "assets/antikythera-mechanism-hero.webp",
      alt: "Fragment A of the Antikythera Mechanism, corroded bronze with visible gears",
      line: "A 2,000-year-old computer found at the bottom of the sea.", contain: false },
    { slug: "roman-self-healing-concrete", title: "Roman Self-Healing Concrete", tag: "Ancient Rome",
      date: "AD 128", img: "assets/roman-self-healing-concrete-hero.webp",
      alt: "The coffered concrete dome of the Pantheon in Rome, seen from inside",
      line: "Roman harbours still stand after 2,000 years in the sea. Ours crack in decades.", contain: false },
    { slug: "lycurgus-cup", title: "The Lycurgus Cup", tag: "Ancient Rome",
      date: "About AD 290–325", img: "assets/lycurgus-cup-hero.webp",
      alt: "The Lycurgus Cup, a Roman glass cage cup in the British Museum",
      line: "The Roman cup that changes colour — thanks to nanotech.", contain: false }
  ];

  var shelf = document.getElementById("tlShelf");
  var panel = document.getElementById("tlPanel");
  if (shelf && panel) {
    var img = document.getElementById("tlImg"),
        artLink = document.getElementById("tlArtLink"),
        tag = document.getElementById("tlTag"),
        date = document.getElementById("tlDate"),
        title = document.getElementById("tlTitle"),
        line = document.getElementById("tlLine"),
        more = document.getElementById("tlMore"),
        bar = document.getElementById("tlBar"),
        pos = document.getElementById("tlPos"),
        prev = document.getElementById("tlPrev"),
        next = document.getElementById("tlNext"),
        current = 0, stopEls = [];

    STOPS.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tl-stop";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.innerHTML = '<span class="thumb' + (s.contain ? " contain" : "") + '"><img src="' + BASE + s.img + '" alt=""></span>' +
                    '<span class="s-name">' + s.title + '</span>' +
                    '<span class="s-date">' + s.date + "</span>";
      b.addEventListener("click", function () { select(i, true); });
      shelf.appendChild(b);
      stopEls.push(b);
    });

    function select(i, scroll) {
      current = Math.max(0, Math.min(STOPS.length - 1, i));
      var s = STOPS[current];
      img.src = BASE + s.img; img.alt = s.alt;
      artLink.href = "articles/" + s.slug + ".html";
      artLink.classList.toggle("contain", !!s.contain);
      tag.textContent = s.tag;
      date.textContent = s.date;
      title.textContent = s.title;
      line.textContent = s.line;
      more.href = "articles/" + s.slug + ".html";
      stopEls.forEach(function (el, j) { el.setAttribute("aria-selected", j === current ? "true" : "false"); });
      bar.style.width = ((current + 1) / STOPS.length * 100) + "%";
      pos.textContent = (UA.pos ? UA.pos.replace("{n}", current + 1).replace("{t}", STOPS.length)
        : "Stop " + (current + 1) + " of " + STOPS.length) +
        (current === 0 ? (UA.oldest || " · the oldest") : current === STOPS.length - 1 ? (UA.newest || " · the newest") : "");
      prev.disabled = current === 0;
      next.disabled = current === STOPS.length - 1;
      if (!reduced) {
        panel.classList.remove("swap");
        void panel.offsetWidth; /* restart the swap animation */
        panel.classList.add("swap");
      }
      if (scroll) {
        stopEls[current].scrollIntoView({ block: "nearest", inline: "center", behavior: reduced ? "auto" : "smooth" });
      }
    }
    prev.addEventListener("click", function () { select(current - 1, true); });
    next.addEventListener("click", function () { select(current + 1, true); });
    select(0, false);
    makeDraggable(shelf);
  }

  /* ---------- 5) year strip drag ---------- */
  makeDraggable(document.getElementById("yearStrip"));

  /* ---------- 6) sealed finds + opened counter ---------- */
  var digCount = document.getElementById("digCount");
  var digTrack = document.getElementById("digTrack");
  var opened = {};
  function paintCount() {
    var n = Object.keys(opened).length;
    if (digCount) digCount.textContent = n;
    if (digTrack) digTrack.style.width = (n / 3 * 100) + "%";
  }
  document.querySelectorAll(".dig-top").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var body = document.getElementById(btn.getAttribute("aria-controls"));
      if (!body) return;
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      btn.closest(".dig-card").classList.toggle("open", !open);
      var label = btn.querySelector(".dig-open");
      if (open) { body.hidden = true; if (label) label.textContent = UA.tap || "Tap to open"; }
      else {
        body.hidden = false;
        if (label) label.textContent = UA.opened || "Opened";
        if (!opened[body.id]) { opened[body.id] = true; paintCount(); }
      }
    });
  });
  paintCount();
})();
