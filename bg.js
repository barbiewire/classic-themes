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

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (!msg || !msg.ad) return;
  grab(msg.ad).then(reply, () => reply(null));
  return true;   // keeps the channel open for the async reply
});
