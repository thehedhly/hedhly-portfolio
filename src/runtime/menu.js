(() => {
  'use strict';

  const menu = document.querySelector('[data-menu]');
  const region = document.querySelector('[data-document-region]');
  const overviewHeading = document.querySelector('[data-overview-heading]');
  const status = document.querySelector('[data-navigation-status]');
  if (!menu || !region || !overviewHeading || !status) return;

  const links = Array.from(menu.querySelectorAll('.menu-link'));
  let activePage = document.body.dataset.page;
  let controller;
  let navigationVersion = 0;

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
  menu.addEventListener('keydown', event => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    if (!/^[1-4]$/.test(event.key)) return;
    event.preventDefault();
    const link = links[Number(event.key) - 1];
    link?.focus({ preventScroll: true });
    link?.click();
  });
  window.addEventListener('popstate', () => navigate(new URL(window.location.href), false));
})();
