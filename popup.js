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
