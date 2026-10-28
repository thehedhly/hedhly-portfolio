(function () {
  var root = document.documentElement;
  var storedTheme = null;
  try {
    storedTheme = window.localStorage.getItem('hedhly-theme');
  } catch {
    // Keep the default theme when local storage is unavailable.
  }
  root.dataset.theme = storedTheme === 'ayu-light' ? 'ayu-light' : 'ayu-dark';
  var themeColor = document.querySelector('[data-theme-color]');
  if (themeColor) themeColor.content = root.dataset.theme === 'ayu-light' ? '#f8f9fa' : '#0b0e14';
  root.dataset.js = 'true';
})();
