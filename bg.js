// roblox only allows images from itself, rbxcdn or data:, so an archive.org url in an
// <img> just gets blocked. mv3 content scripts cant do the cross origin fetch either,
// so the worker grabs it and hands back a data url instead
const base = 'https://archive.org/download/RobloxAdverts/';

function b64(buf) {
  const bytes = new Uint8Array(buf);
  let s = '';
  // chunked, one big fromCharCode call on 200kb blows the arg limit
  for (let i = 0; i < bytes.length; i += 8192) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
  }
  return btoa(s);
}

async function grab(name) {
  const key = 'ad:' + name;
  const hit = await chrome.storage.local.get(key);
  if (hit[key]) return hit[key];

  const res = await fetch(base + name);
  if (!res.ok) throw new Error(res.status);
  const type = res.headers.get('content-type') || 'image/png';
  const url = `data:${type};base64,${b64(await res.arrayBuffer())}`;
  // fetched once and it lives here after, archive.org doesnt need the traffic
  chrome.storage.local.set({ [key]: url });
  return url;
}

// ---- update check ----
// no web store means no auto update, so ask github what the current version is

const src = 'https://raw.githubusercontent.com/barbiewire/classic-themes/main/manifest.json';
const gap = 6 * 60 * 60 * 1000;

function newer(a, b) {
  const x = a.split('.').map(Number), y = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((x[i] | 0) !== (y[i] | 0)) return (x[i] | 0) > (y[i] | 0);
  }
  return false;
}

async function check(force) {
  const mine = chrome.runtime.getManifest().version;
  const seen = (await chrome.storage.local.get({ upd: null })).upd;
  if (!force && seen && Date.now() - seen.at < gap) return seen;
  try {
    const res = await fetch(src, { cache: 'no-store' });
    const there = (await res.json()).version;
    const upd = { at: Date.now(), mine, latest: there, stale: newer(there, mine) };
    await chrome.storage.local.set({ upd });
    return upd;
  } catch (e) {
    // offline, rate limited, whatever. dont nag about it
    return seen || { at: 0, mine, latest: null, stale: false };
  }
}

// ---- toolbar badge, so you can see which era is on without opening anything ----

const tags = { '2010': '10', '2011': '11', '2014': '14', '2016': '16' };

function now(s) {
  return s.skin || (s.on ? '2011' : 'off');
}

async function badge() {
  const s = await chrome.storage.sync.get({ skin: null, on: true });
  const upd = (await chrome.storage.local.get({ upd: null })).upd;
  chrome.action.setBadgeText({ text: tags[now(s)] || '' });
  // goes orange when github has a newer build, so you notice without opening anything
  chrome.action.setBadgeBackgroundColor({ color: upd && upd.stale ? '#e08a00' : '#00a2ff' });
  chrome.action.setTitle({
    title: upd && upd.stale ? `Classic ROBLOX - update to ${upd.latest}` : 'Classic ROBLOX',
  });
}

chrome.runtime.onInstalled.addListener(() => check(true).then(badge));
chrome.runtime.onStartup.addListener(() => check(false).then(badge));
chrome.storage.onChanged.addListener((ch, area) => {
  if (area === 'sync' && (ch.skin || ch.on)) badge();
});

// ---- the hotkey, for when a page breaks and you want out right now ----

chrome.commands.onCommand.addListener(async cmd => {
  if (cmd !== 'toggle') return;
  const s = await chrome.storage.sync.get({ skin: null, on: true, last: '2011' });
  const cur = now(s);
  if (cur === 'off') chrome.storage.sync.set({ skin: s.last || '2011' });
  else chrome.storage.sync.set({ skin: 'off', last: cur });
});

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (!msg) return;
  if (msg.ad) { grab(msg.ad).then(reply, () => reply(null)); return true; }
  if (msg.check) { check(msg.force).then(reply, () => reply(null)); return true; }
});
