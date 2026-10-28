(() => {
  'use strict';

  document.querySelectorAll('[data-contact]').forEach(contact => {
    const prompt = contact.querySelector('[data-address-prompt]');
    const reveal = contact.querySelector('[data-reveal-address]');
    const result = contact.querySelector('[data-address-result]');
    const emailText = contact.querySelector('[data-address-text]');
    const copyButton = contact.querySelector('[data-copy-address]');
    const emailLink = contact.querySelector('[data-email-link]');
    const error = contact.querySelector('[data-address-error]');
    const errorText = contact.querySelector('[data-address-error-text]');
    const retryButton = contact.querySelector('[data-retry-address]');
    const status = contact.querySelector('[data-address-status]');
    if (!prompt || !reveal || !result || !emailText || !emailLink || !status) return;

    let address = '';
    let pending = false;

    const announce = message => {
      status.textContent = '';
      window.requestAnimationFrame(() => { status.textContent = message; });
    };

    const showError = () => {
      if (error) error.hidden = false;
      if (errorText) errorText.textContent = contact.dataset.revealError;
      reveal.disabled = false;
      pending = false;
      announce(contact.dataset.revealError);
    };

    const revealAddress = async () => {
      if (pending || address) return;
      pending = true;
      reveal.disabled = true;

      try {
        const module = await import(contact.dataset.addressModule);
        address = module.revealAddress();
        emailText.textContent = address;
        emailLink.href = `mailto:${address}`;
        emailLink.hidden = false;
        result.hidden = false;
        prompt.hidden = true;
        if (error) error.hidden = true;
        reveal.disabled = false;
        copyButton?.focus({ preventScroll: true });
        announce(contact.dataset.revealStatus);
      } catch {
        showError();
      }
    };

    reveal.addEventListener('click', revealAddress);
    retryButton?.addEventListener('click', revealAddress);
    copyButton?.addEventListener('click', async () => {
      if (!address) return;
      try {
        await navigator.clipboard.writeText(address);
        announce(contact.dataset.copySuccess);
      } catch {
        announce(contact.dataset.copyError);
      }
    });
  });
})();
