(() => {
  'use strict';
  // Preserve old published section URLs while keeping the entry screen sparse.
  const followLegacyAnchor = () => {
    const id = window.location.hash.slice(1);
    const link = Array.from(document.querySelectorAll('[data-legacy-link]')).find(item => item.id === id);
    if (link) window.location.replace(link.href);
  };
  followLegacyAnchor();
  window.addEventListener('hashchange', followLegacyAnchor);
})();
