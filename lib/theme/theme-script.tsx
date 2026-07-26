import { THEME_STORAGE_KEY } from "./theme-constants";

// Runs synchronously (no async/defer) before the rest of <body> paints, so
// the correct .dark class — and the matching color-scheme, for native form
// controls/scrollbars — is already applied before first paint. This is what
// prevents a flash of the wrong theme on load; it must stay a plain inline
// script rather than a React effect, since effects only run after paint.
const THEME_INIT_SCRIPT = `(function() {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var theme = stored === "light" || stored === "dark" ? stored : null;
    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    var root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    root.style.colorScheme = theme;
  } catch (e) {}
})();`;

export function ThemeScript() {
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
