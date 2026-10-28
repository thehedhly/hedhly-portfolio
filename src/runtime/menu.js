(() => {
  'use strict';

  const menu = document.querySelector('[data-menu]');
  const region = document.querySelector('[data-document-region]');
  const overviewHeading = document.querySelector('[data-overview-heading]');
  const status = document.querySelector('[data-navigation-status]');
  if (!menu || !region || !overviewHeading || !status) return;

  const shortcutStorageKey = 'hedhly-shortcuts';
  const shortcutToggle = document.querySelector('[data-shortcut-toggle]');
  const links = Array.from(menu.querySelectorAll('.menu-link'));
  let activePage = document.body.dataset.page;
  let controller;
  let navigationVersion = 0;

  // Number shortcuts are on by default. The visitor can switch them off; the choice is kept locally.
  const readShortcutsEnabled = () => {
    try {
      return window.localStorage.getItem(shortcutStorageKey) !== 'off';
    } catch {
      return true;
    }
  };
  let shortcutsEnabled = readShortcutsEnabled();

  const saveShortcutsEnabled = enabled => {
    try {
      window.localStorage.setItem(shortcutStorageKey, enabled ? 'on' : 'off');
    } catch {
      // The toggle still works for this page if storage is blocked.
    }
  };

  const syncShortcutToggle = () => {
    if (!shortcutToggle) return;
    shortcutToggle.hidden = false;
    shortcutToggle.setAttribute('aria-pressed', String(shortcutsEnabled));
  };

  // Sets the length used by the CSS typing animation. CSSOM is allowed by the CSP, unlike inline style attributes.
  const prepareTyping = root => {
    root.querySelectorAll('[data-typed]').forEach(element => {
      element.style.setProperty('--len', String(element.textContent.trim().length));
      element.classList.add('is-typing');
    });
  };

  const navigate = async (url, pushHistory = true) => {
    if (url.origin !== window.location.origin) return;
    controller?.abort();
    controller = new AbortController();
    const version = ++navigationVersion;
    region.setAttribute('aria-busy', 'true');
    status.textContent = status.dataset.loading;

    try {
      const response = await fetch(url.href, { signal: controller.signal, cache: 'no-cache' });
      if (!response.ok) throw new Error('Document unavailable');
      const next = new DOMParser().parseFromString(await response.text(), 'text/html');
      const nextRegion = next.querySelector('[data-document-region]');
      const nextHeading = next.querySelector('[data-overview-heading]');
      const nextPage = next.body.dataset.page;
      if (!nextRegion || !nextHeading || next.documentElement.lang !== document.documentElement.lang) throw new Error('Not a terminal document');
      if (version !== navigationVersion) return;

      // Only the selected document changes. The introduction, revealed contact,
      // menu focus, theme, and scroll position stay in place like a terminal.
      region.replaceChildren(...Array.from(nextRegion.childNodes, node => document.importNode(node, true)));
      prepareTyping(region);
      document.dispatchEvent(new CustomEvent('terminal:swap'));
      overviewHeading.replaceChildren(...Array.from(nextHeading.childNodes, node => document.importNode(node, true)));
      links.forEach(link => {
        const selected = link.dataset.documentId === nextPage;
        link.classList.toggle('menu-link--current', selected);
        if (selected) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      document.querySelectorAll('.language-switch a[hreflang]').forEach(link => {
        const counterpart = next.querySelector(`.language-switch a[hreflang="${link.hreflang}"]`);
        if (counterpart) link.href = counterpart.href;
      });

      const metadata = 'meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], link[rel="alternate"][hreflang], script[type="application/ld+json"]';
      document.head.querySelectorAll(metadata).forEach(node => node.remove());
      next.head.querySelectorAll(metadata).forEach(node => document.head.append(document.importNode(node, true)));
      document.title = next.title;
      document.body.dataset.page = nextPage;
      activePage = nextPage;
      if (pushHistory && url.href !== window.location.href) history.pushState(null, '', url.href);
      const selectedLabel = links.find(link => link.dataset.documentId === nextPage)?.lastElementChild.textContent;
      status.textContent = nextPage === 'explore' ? status.dataset.closed : status.dataset.opened.replace('{label}', selectedLabel || '');
      // Bring an opened document into view when it starts below the fold. Focus stays on the menu.
      const output = region.querySelector('.document-output');
      if (output && output.getBoundingClientRect().top > window.innerHeight * 0.5) {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        output.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
      }
    } catch (error) {
      if (error.name !== 'AbortError' && version === navigationVersion) window.location.assign(url.href);
    } finally {
      if (version === navigationVersion) region.removeAttribute('aria-busy');
    }
  };

  menu.addEventListener('click', event => {
    const link = event.target.closest('.menu-link');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const destination = link.dataset.documentId === activePage ? menu.dataset.overviewUrl : link.href;
    navigate(new URL(destination, window.location.href));
  });
  region.addEventListener('click', event => {
    const reset = event.target.closest('[data-menu-reset]');
    if (!reset || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(new URL(reset.href));
    links[0]?.focus({ preventScroll: true });
  });

  // Shortcuts apply only while focus is inside the menu or the open document, never in form controls.
  // Focus stays on the menu so repeated number presses keep working.
  const handleShortcut = event => {
    if (!shortcutsEnabled || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;

    if (/^[1-4]$/.test(event.key)) {
      event.preventDefault();
      const link = links[Number(event.key) - 1];
      link?.focus({ preventScroll: true });
      link?.click();
      return;
    }
    if ((event.key === '0' || event.key === 'Escape') && activePage !== 'explore') {
      event.preventDefault();
      links[0]?.focus({ preventScroll: true });
      navigate(new URL(menu.dataset.overviewUrl, window.location.href));
    }
  };
  menu.addEventListener('keydown', handleShortcut);
  region.addEventListener('keydown', handleShortcut);

  shortcutToggle?.addEventListener('click', () => {
    shortcutsEnabled = !shortcutsEnabled;
    saveShortcutsEnabled(shortcutsEnabled);
    syncShortcutToggle();
  });

  window.addEventListener('popstate', () => navigate(new URL(window.location.href), false));

  prepareTyping(region);
  syncShortcutToggle();
})();
