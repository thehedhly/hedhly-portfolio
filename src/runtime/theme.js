(() => {
  'use strict';

  const storageKey = 'hedhly-theme';
  const allowed = new Set(['ayu-dark', 'ayu-light']);
  const root = document.documentElement;
  const controls = Array.from(document.querySelectorAll('[data-theme-choice]'));
  if (controls.length === 0) return;

  const readStoredTheme = () => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      return allowed.has(saved) ? saved : null;
    } catch {
      return null;
    }
  };

  const applyTheme = theme => {
    if (!allowed.has(theme)) return;
    root.dataset.theme = theme;
    controls.forEach(control => {
      control.value = theme;
      control.disabled = false;
    });

    document.querySelectorAll('[data-theme-color]').forEach(meta => {
      meta.content = theme === 'ayu-light' ? '#f8f9fa' : '#0b0e14';
    });
  };

  controls.forEach(control => {
    control.disabled = false;
    control.value = root.dataset.theme || 'ayu-dark';
    control.addEventListener('change', () => {
      if (!allowed.has(control.value)) return;
      applyTheme(control.value);
      try {
        window.localStorage.setItem(storageKey, control.value);
      } catch {
        // Theme changes still work for this page if persistence is blocked.
      }
    });
  });

  window.addEventListener('pageshow', () => {
    const stored = readStoredTheme();
    if (stored) applyTheme(stored);
  });

  window.addEventListener('storage', event => {
    if (event.key === storageKey && allowed.has(event.newValue)) applyTheme(event.newValue);
  });
})();
