// Runs before the page is drawn, so dark mode and the destination colour don't "flash".
(function () {
  var root = document.documentElement;
  try {
    var theme = JSON.parse(localStorage.getItem("sb.theme"));
    if (theme !== "light" && theme !== "dark") {
      theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    var dest = JSON.parse(localStorage.getItem("sb.destination"));
    root.dataset.theme = theme;
    root.dataset.dest = dest === "korea" ? "korea" : "mongolia";
  } catch {
    root.dataset.theme = "light";
    root.dataset.dest = "mongolia";
  }
})();
