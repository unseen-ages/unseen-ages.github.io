/* Unseen Ages — subpages v4 reveals.
   The homepage v4 motion language (home-v4.js section 1) for articles
   and simple pages: IntersectionObserver scroll reveals, children of
   .rv-group stagger in via --i, and a group is marked .done once it
   has settled so hover states answer instantly afterwards.
   No-JS keeps everything visible (hidden states live under html.js
   in pages-v4.css); reduced motion shows final states immediately. */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
})();
