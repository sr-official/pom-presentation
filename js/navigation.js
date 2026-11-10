// Navigation — renders the right-hand section list and wires keyboard controls.
const Nav = (() => {

  let sections = [];
  let currentIndex = 0;
  let onChange = null;
  let listEl = null;

  function init(sectionList, changeCallback) {
    sections = sectionList;
    onChange = changeCallback;
    listEl = document.getElementById('nav-list');
    renderList();
    bindKeyboard();
  }

  function renderList() {
    listEl.innerHTML = sections.map((s, i) => `
      <li class="nav-item${i === currentIndex ? ' active' : ''}"
          data-index="${i}" tabindex="0" role="button"
          aria-current="${i === currentIndex ? 'true' : 'false'}">
        <span class="nav-num mono">${String(i + 1).padStart(2, '0')}</span>
        <span class="nav-name">${s.name}</span>
      </li>`).join('');

    listEl.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => goTo(parseInt(item.dataset.index, 10)));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(parseInt(item.dataset.index, 10)); }
      });
    });
  }

  function goTo(index) {
    if (index < 0 || index >= sections.length) return;
    currentIndex = index;
    updateActiveHighlight();
    if (onChange) onChange(currentIndex, sections[currentIndex]);
  }

  function updateActiveHighlight() {
    listEl.querySelectorAll('.nav-item').forEach((item, i) => {
      const active = i === currentIndex;
      item.classList.toggle('active', active);
      item.setAttribute('aria-current', active ? 'true' : 'false');
    });
    const activeEl = listEl.querySelector('.nav-item.active');
    if (activeEl && activeEl.scrollIntoView) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  function bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Ignore when typing in an input/slider is being dragged via keys intentionally,
      // but allow global nav otherwise.
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' && e.target.type === 'range') {
        // Let range inputs handle their own left/right; don't hijack navigation
        // when the user is actively focused on a slider.
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault(); next(); break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault(); prev(); break;
        case 'Escape':
          e.preventDefault(); goTo(0); break;
        case ' ':
          if (tag !== 'BUTTON' && tag !== 'INPUT') {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('dipto:toggle-anim'));
          }
          break;
        default:
          if (/^[1-9]$/.test(e.key)) {
            const idx = parseInt(e.key, 10) - 1;
            if (idx < sections.length) goTo(idx);
          }
      }
    });
  }

  function getCurrentIndex() { return currentIndex; }

  return { init, goTo, next, prev, getCurrentIndex };
})();
