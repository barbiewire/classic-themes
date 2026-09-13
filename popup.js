const picks = document.querySelectorAll('input[name="skin"]');
const adbox = document.getElementById('ads');

chrome.storage.sync.get({ skin: null, on: true, ads: false }, s => {
  const now = s.skin || (s.on ? '2011' : 'off');   // v1.0 only stored the on/off flag
  picks.forEach(p => { p.checked = p.value === now; });
  adbox.checked = !!s.ads;
});

// radios already handle the "only one at a time" bit, we just save whichever won
picks.forEach(p => p.addEventListener('change', () => chrome.storage.sync.set({ skin: p.value })));

// off by default, nobody asked to be advertised at
adbox.addEventListener('change', () => chrome.storage.sync.set({ ads: adbox.checked }));

document.getElementById('ver').textContent = 'v' + chrome.runtime.getManifest().version;

// github is the only place that knows about updates, theres no store doing it for us
chrome.runtime.sendMessage({ check: false }).then(u => {
  if (!u || !u.stale) return;
  document.getElementById('vnew').textContent = u.mine + ' → ' + u.latest;
  document.getElementById('upd').classList.add('on');
}).catch(() => {});

const line = 'irm https://raw.githubusercontent.com/barbiewire/classic-themes/main/install.ps1 | iex';
const cmd = document.getElementById('cmd');
cmd.addEventListener('click', () => {
  navigator.clipboard.writeText(line).then(() => {
    cmd.textContent = 'copied. go paste it';
  }, () => {
    cmd.textContent = line;   // clipboard said no, show it so it can be selected
  });
});
