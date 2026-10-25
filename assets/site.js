const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
const ja = document.documentElement.lang === 'ja';
// Keep the current theme filter when changing language.
document.querySelectorAll('.language-switch a').forEach(link => {
  const target = new URL(link.href);
  target.search = location.search;
  target.hash = location.hash;
  link.href = target.href;
});

if (menu && navigation) {
  document.documentElement.classList.add('has-js');
  function closeMenu(restoreFocus = false) {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    if (restoreFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header-inner')) closeMenu();
  });
  matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());
}

const filterLinks = [...document.querySelectorAll('[data-filter]')];
const entries = [...document.querySelectorAll('.writing-entries .entry')];
if (filterLinks.length) {
  const topic = new URLSearchParams(location.search).get('topic') || 'all';
  const chosen = filterLinks.some(item => item.dataset.filter === topic) ? topic : 'all';
  filterLinks.forEach(item => { if (item.dataset.filter === chosen) item.setAttribute('aria-current', 'true'); });
  entries.forEach(item => { item.hidden = chosen !== 'all' && item.dataset.category !== chosen; });
  const count = entries.filter(item => !item.hidden).length;
  const status = document.querySelector('.filter-result');
  if (status && chosen !== 'all') status.textContent = ja ? `${count}件のテーマを表示しています。「すべて」で一覧に戻れます。` : `${count} theme${count === 1 ? '' : 's'} shown. Choose All to see every theme.`;
}

document.querySelector('[data-copy-link]')?.addEventListener('click', async () => {
  const status = document.querySelector('.copy-status');
  try {
    await navigator.clipboard.writeText(location.href);
    const local = location.protocol === 'file:' || ['localhost','127.0.0.1'].includes(location.hostname);
    status.textContent = local ? (ja ? 'リンクをコピーしました。このリンクはこのコンピューターで開けます。' : 'Page link copied. This link works on this computer.') : (ja ? 'ページのリンクをコピーしました。' : 'Page link copied.');
  } catch {
    status.textContent = ja ? `ブラウザーのアドレスをコピーしてください：${location.href}` : `Copy the address from your browser: ${location.href}`;
  }
});
