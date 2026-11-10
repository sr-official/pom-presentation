// RealImage — a panel that shows a real photo from assets/images/ if one has
// been placed there, and otherwise shows the existing illustrated fallback
// with a small, clear hint on exactly which file to add. <img> tags (unlike
// fetch/XHR) load fine from local relative paths under file://, so this
// works with zero JavaScript-side file-existence checks — the browser's own
// onerror/onload events tell us whether the photo exists.
const RealImage = (() => {
  let counter = 0;

  /**
   * opts: { src, alt, caption, fallbackHtml, aspect ('wide'|'square'|'tall') }
   */
  function panel(opts) {
    counter++;
    const aspectClass = 'ri-aspect-' + (opts.aspect || 'wide');
    return `
      <div class="real-image-panel ${aspectClass}" id="ri-${counter}">
        <img src="${opts.src}" alt="${opts.alt || ''}"
             onload="this.closest('.real-image-panel').classList.add('loaded')"
             onerror="this.closest('.real-image-panel').classList.add('missing')">
        <div class="real-image-fallback">
          ${opts.fallbackHtml || ''}
        </div>
        <div class="real-image-hint">
          <span class="ri-hint-icon">${Icons.icon('image', { size: 13 })}</span>
          Add a real photo at <span class="mono">${opts.src}</span>
        </div>
        ${opts.caption ? `<div class="real-image-caption">${opts.caption}</div>` : ''}
      </div>`;
  }

  return { panel };
})();
