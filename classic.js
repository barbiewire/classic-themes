// if this breaks after a roblox update im not even surprised tbh

const root = document.documentElement;
const skins = { '2011': 'frame', '2010': 'frame', '2014': 'bar', '2016': 'bar rail' };
root.classList.add('rc-on', 'rc-2011', 'rc-frame');   // guess now, storage fixes it a tick later, saves a flash

// only one era class at a time or the knobs fight each other
function wear(pick) {
  document.querySelectorAll('.rc-ad').forEach(n => n.remove());
  root.classList.remove('rc-frame', 'rc-bar', 'rc-rail', ...Object.keys(skins).map(s => 'rc-' + s));
  if (pick === 'off') { root.classList.remove('rc-on'); return; }
  const era = skins[pick] ? pick : '2011';
  root.classList.add('rc-on', 'rc-' + era, ...skins[era].split(' ').map(k => 'rc-' + k));
}

let me = null;      // { id, name } once meta[user-data] is parsed, null if logged out
let tmr = 0;        // sign timer. gets its own line bc it earned it

// Profile/Friends/Inventory need the user id, so this is built after the meta is read
function navlist() {
  const u = me ? me.id : null;
  const my = me ? [
    ['Home', '/home'],
    ['Profile', `/users/${u}/profile`],
    ['Inbox', '/my/messages/#!/inbox'],
    ['Friends', `/users/${u}/friends`],
    ['Character', '/my/avatar'],
    ['Inventory', `/users/${u}/inventory`],
    ['Groups', '/communities'],
    ['Places', 'https://create.roblox.com/dashboard/creations'], // places live over there now apparently
    ['Trade', '/trades'],
    ['Money', '/transactions'],
    ['Account', '/my/account'],
  ] : null;

  return [
    ['My ROBLOX', me ? '/home' : '/login', my],
    ['Games', '/charts'],
    ['Catalog', '/catalog'],
    ['People', '/search/users'],
    // BC -> Premium -> Roblox Plus, same slot
    ['Builders Club', '/plus'],
    // no forum on the main site anymore, DevForum is the closest thing
    ['Forum', 'https://devforum.roblox.com/'],
    ['News', 'https://corp.roblox.com/newsroom/'],
    ['Parents', 'https://corp.roblox.com/parents/'],
    ['Help', 'https://en.help.roblox.com/'],
  ];
}

function whoami() {
  const m = document.querySelector('meta[name="user-data"]');
  if (!m || !m.dataset.userid) return null;
  return { id: m.dataset.userid, name: m.dataset.name || m.dataset.displayname || '' };
}

// typing document.createElement 40 times was making me sad
function el(tag, attrs, kids) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === 'text') e.textContent = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  if (kids) kids.forEach(c => c && e.appendChild(c));
  return e;
}

function banner() {
  const top = el('div', { id: 'rc-top' });
  top.appendChild(el('a', { id: 'rc-logo', href: me ? '/home' : '/', title: 'ROBLOX' }));

  const span = el('span');
  if (me) {
    span.append('Logged in as ', el('a', { class: 'rc-me', href: `/users/${me.id}/profile` }, [el('b', { text: me.name })]));
    const out = el('a', { class: 'rc-btn', href: '#', text: 'Logout' });
    out.addEventListener('click', e => { e.preventDefault(); logout(out); });
    span.appendChild(out);
  } else {
    span.append(
      el('a', { class: 'rc-btn', href: '/login', text: 'Login' }),
      el('a', { class: 'rc-btn', href: '/signup', text: 'Sign Up' })
    );
  }
  top.appendChild(el('div', { id: 'rc-auth' }, [span]));

  if (me) {
    top.appendChild(el('div', { id: 'rc-alerts' }, [
      el('div', { class: 'rc-rows' }, [
        slot('rc-msg', '/my/messages', 'Inbox'),
        slot('rc-fr', `/users/${me.id}/friends#!/friend-requests`, 'Friend requests'),
        slot('rc-bux rc-wide', '/transactions', 'ROBUX'),
      ]),
    ]));
  }

  const nav = el('ul', { id: 'rc-nav' });
  for (const [label, href, sub] of navlist()) {
    const a = el('a', { href, text: label });
    const li = el('li', null, [a]);
    if (sub) {
      a.appendChild(el('span', { class: 'rc-arrow' }));
      li.appendChild(el('ul', null, sub.map(([t, h]) => el('li', null, [el('a', { href: h, text: t })]))));
    }
    nav.appendChild(li);
  }
  top.appendChild(nav);
  return top;
}

function rail() {
  const u = me ? me.id : null;
  const links = me ? [
    ['Home', '/home'],
    ['Profile', `/users/${u}/profile`],
    ['Messages', '/my/messages/#!/inbox'],
    ['Friends', `/users/${u}/friends`],
    ['Avatar', '/my/avatar'],
    ['Inventory', `/users/${u}/inventory`],
    ['Trade', '/trades'],
    ['Groups', '/communities'],
    null,
    ['Blog', 'https://blog.roblox.com/'],
    ['Gift Cards', '/giftcards'],
  ] : [
    ['Home', '/home'],
    ['Games', '/charts'],
    ['Catalog', '/catalog'],
    null,
    ['Blog', 'https://blog.roblox.com/'],
  ];

  const box = el('div', { id: 'rc-rail' });
  for (const item of links) {
    if (!item) { box.appendChild(el('hr')); continue; }
    const [label, href] = item;
    const a = el('a', { href, text: label });
    if (location.pathname === href) a.className = 'rc-here';
    box.appendChild(a);
  }
  return box;
}

// one line on the wooden sign: icon + count
function slot(cls, href, title) {
  return el('a', { class: cls, href, title }, [el('i'), el('span', { text: '-' })]);
}

// (not like i have that problem. 80 robux gang)
function abbr(n) {
  if (n < 10000) return n.toLocaleString('en-US');
  if (n < 1e6) return Math.floor(n / 1000) + 'K+';
  return (Math.floor(n / 1e5) / 10) + 'M+';
}

// wanted to call it fetch but fetch was taken
async function grab(url) {
  const r = await fetch(url, { credentials: 'include' });
  if (!r.ok) throw new Error(url + ' -> ' + r.status);
  return r.json();
}

function put(cls, val) {
  const a = document.querySelector(`#rc-alerts .${cls}`);
  if (!a) return;
  a.querySelector('span').textContent = val;
  a.classList.toggle('rc-lit', typeof val === 'number' ? val > 0 : val !== '-');
}

async function poll() {
  if (!me || document.hidden) return;

  const [msg, fr, bux] = await Promise.allSettled([
    grab('https://privatemessages.roblox.com/v1/messages/unread/count'),
    grab('https://friends.roblox.com/v1/user/friend-requests/count'),
    grab(`https://economy.roblox.com/v1/users/${me.id}/currency`),
  ]);

  put('rc-msg', msg.status === 'fulfilled' ? msg.value.count : '-');
  put('rc-fr', fr.status === 'fulfilled' ? fr.value.count : '-');

  if (bux.status === 'fulfilled') {
    put('rc-bux', 'R$ ' + abbr(bux.value.robux));
  } else {
    // economy api gets rate limited now and then, the (hidden) modern header still has the number
    const amt = document.querySelector('#nav-robux-amount');
    put('rc-bux', amt && amt.textContent.trim() ? 'R$ ' + amt.textContent.trim() : '-');
  }
}

// Same flow the site uses: first POST gets a 403 carrying a fresh token, second one goes through
async function logout(btn) {
  btn.textContent = '...'; // dramatic pause
  const url = 'https://auth.roblox.com/v2/logout';
  const meta = document.querySelector('meta[name="csrf-token"]');
  let tok = meta ? meta.dataset.token : '';
  try {
    let r = await fetch(url, { method: 'POST', credentials: 'include', headers: { 'x-csrf-token': tok } });
    if (r.status === 403 && r.headers.get('x-csrf-token')) {
      tok = r.headers.get('x-csrf-token');
      r = await fetch(url, { method: 'POST', credentials: 'include', headers: { 'x-csrf-token': tok } });
    }
    if (!r.ok) throw new Error('logout ' + r.status);
    location.href = '/';
  } catch (err) {
    // fall back to the real settings page, logout is in there
    console.warn('[Classic ROBLOX]', err);
    location.href = '/my/account';
  }
}

function theme() {
  // sorry dark mode ppl, 2011 didnt have you
  const b = document.body;
  if (!b) return;
  if (root.classList.contains('rc-on')) {
    const was = ['dark-theme', 'system-theme'].find(c => b.classList.contains(c));
    if (was) {
      b.classList.replace(was, 'light-theme');
      b.dataset.rctheme = was;
    }
  } else if (b.dataset.rctheme) {
    b.classList.replace('light-theme', b.dataset.rctheme);
    delete b.dataset.rctheme;
  }
}

const words = [
  [/\bExperiences\b/g, 'Games'],
  [/\bExperience\b/g, 'Game'],
  [/\bMarketplace\b/g, 'Catalog'],
  [/\bCommunities\b/g, 'Groups'],
  [/\bCommunity\b/g, 'Group'],
  [/\bConnections\b/g, 'Friends'],
  [/\bRobux\b/g, 'ROBUX'],
  // roblox renames something every year so this list is never getting finished lol
];
const wsel = '.container-header h2, .container-header h3, .games-list-header h1, .home-sort-header-container, .rbx-tab-heading, #footer-container a';

function reword(scope) {
  (scope || document).querySelectorAll(wsel).forEach(node => {
    const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let t;
    while ((t = w.nextNode())) {
      let v = t.nodeValue;
      for (const [re, to] of words) v = v.replace(re, to);
      if (v !== t.nodeValue) t.nodeValue = v;
    }
  });
  const h1 = document.querySelector('#HomeContainer > .section h1');
  const tn = h1 && h1.firstChild;
  if (tn && tn.nodeType === 3 && tn.nodeValue.trim() === 'Home') tn.nodeValue = 'My ROBLOX';
  if (/Roblox/.test(document.title)) document.title = document.title.replace(/\bRoblox\b/g, 'ROBLOX');
}

// checked the 2011 captures: the home page ran a 728x90 up top and a 300x250 below it,
// slots Roblox_Home_Only_Top_728x90 and Roblox_Home_Only_Medium_Rectangle_300x250. no towers
const adcount = {
  '2010': { lb: 6, mr: 3 },
  '2011': { lb: 6, mr: 3 },
  '2014': { lb: 8 },
  '2016': { lb: 8 },
};
const adsize = { lb: [728, 90], mr: [300, 250] };

function era() {
  return Object.keys(skins).find(k => root.classList.contains('rc-' + k)) || '2011';
}

function adpick(e, kind, used) {
  const free = [];
  for (let i = 1; i <= adcount[e][kind]; i++) if (!used.has(kind + i)) free.push(i);
  const pool = free.length ? free : [1];
  const n = pool[Math.floor(Math.random() * pool.length)];
  used.add(kind + n);
  return chrome.runtime.getURL(`img/ads/${e}-${kind}-${n}.png`);
}

function adbox(e, kind, used) {
  const [w, h] = adsize[kind];
  const img = el('img', { src: adpick(e, kind, used), alt: 'Advertisement', width: w, height: h });
  // the old pages had a [ report ] link under the slot instead of a label, so keep that
  const tag = root.classList.contains('rc-frame')
    ? el('a', { class: 'rc-adlabel rc-adreport', title: 'click to report an offensive ad', text: '[ report ]' })
    : el('span', { class: 'rc-adlabel', text: 'Advertisement' });
  const box = el('div', { class: 'rc-ad rc-ad-' + kind, title: 'fake ad. click it for a different one' }, [img, tag]);
  // a real one took you to the game, this one just deals you another
  box.addEventListener('click', () => { img.src = adpick(e, kind, new Set()); });
  return box;
}

function ads() {
  if (!root.classList.contains('rc-ads') || !root.classList.contains('rc-on')) {
    document.querySelectorAll('.rc-ad').forEach(n => n.remove());
    return;
  }
  const main = document.getElementById('container-main');
  if (!main) return;
  const e = era();
  const used = new Set();

  const top = document.getElementById('content') || main.firstElementChild;
  if (top && !document.getElementById('rc-ad-top')) {
    const b = adbox(e, 'lb', used);
    b.id = 'rc-ad-top';
    top.parentNode.insertBefore(b, top);
  }

  // 2008-2012 got the rectangle down the page, 2014 on kept a second leaderboard
  const foot = document.getElementById('footer-container');
  if (foot && !document.getElementById('rc-ad-bot')) {
    const b = adbox(e, adcount[e].mr ? 'mr' : 'lb', used);
    b.id = 'rc-ad-bot';
    foot.parentNode.insertBefore(b, foot);
  }
}

// the grids work out their columns from --home-feed-width, and roblox fills that in off the
// whole window like our rail isnt even there. so measure the real column and tell it the truth
function fit() {
  const box = document.getElementById('container-main');
  const g = document.querySelector('.game-grid, .game-carousel');
  if (!box || !g) return;
  const cs = getComputedStyle(g);
  // clientWidth already drops the border and any scrollbar, the -1 is for its rounding
  const w = g.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 1;
  if (w > 200) box.style.setProperty('--home-feed-width', Math.floor(w) + 'px');
}

function unfit() {
  const box = document.getElementById('container-main');
  if (box) box.style.removeProperty('--home-feed-width');
}

// ---- boot ----

function mount() {
  const wrap = document.getElementById('wrap');
  if (!wrap) return false;

  // bar eras keep the real header, so bin the banner if we came from a frame era
  if (!root.classList.contains('rc-frame')) {
    const old = document.getElementById('rc-top');
    if (old) { old.remove(); clearInterval(tmr); }
    const wantsrail = root.classList.contains('rc-rail');
    const oldrail = document.getElementById('rc-rail');
    if (wantsrail && !oldrail) {
      me = whoami();
      wrap.insertBefore(rail(), wrap.firstChild);
    } else if (!wantsrail && oldrail) {
      oldrail.remove();
    }
    theme();
    reword();
    fit();
    ads();
    return true;
  }

  const stale = document.getElementById('rc-rail');
  if (stale) stale.remove();

  if (!document.getElementById('rc-top')) {
    me = whoami();
    wrap.insertBefore(banner(), wrap.firstChild);
    poll();
    clearInterval(tmr);
    tmr = setInterval(poll, 90 * 1000);
  }
  theme();
  reword();
  fit();
  ads();
  return true;
}

let queued = false;
const obs = new MutationObserver(() => {
  if (queued) return;
  queued = true;
  // raf so this doesnt fire like 500 times a second when react sneezes
  requestAnimationFrame(() => {
    queued = false;
    if (root.classList.contains('rc-on')) mount();
  });
});
// separate one for <body class>, the site sometimes re-applies dark-theme after load
const tobs = new MutationObserver(theme);

function start() {
  obs.observe(document, { childList: true, subtree: true });
  const hook = () => tobs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  if (document.body) hook();
  else document.addEventListener('DOMContentLoaded', hook, { once: true });
  mount();
}

document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
addEventListener('resize', () => { if (root.classList.contains('rc-on')) fit(); });

// `on` is the v1.0 setting, kept so nobody gets the skin flipped on after updating
chrome.storage.sync.get({ skin: null, on: true, ads: false }, s => {
  const pick = s.skin || (s.on ? '2011' : 'off');
  root.classList.toggle('rc-ads', !!s.ads);
  wear(pick);
  if (pick !== 'off') start();
});

// popup picker, no reload needed
chrome.storage.onChanged.addListener((ch, area) => {
  if (area !== 'sync') return;
  if (ch.ads) { root.classList.toggle('rc-ads', !!ch.ads.newValue); ads(); }
  if (!ch.skin) return;
  wear(ch.skin.newValue);
  if (ch.skin.newValue !== 'off') start();
  else { obs.disconnect(); tobs.disconnect(); unfit(); theme(); } // back to 2026. gross
});
