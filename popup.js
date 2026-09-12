// 6 lines now. still peak engineering
const picks = document.querySelectorAll('input[name="skin"]');

chrome.storage.sync.get({ skin: null, on: true }, s => {
  const now = s.skin || (s.on ? '2011' : 'off');   // v1.0 only stored the on/off flag
  picks.forEach(p => { p.checked = p.value === now; });
});

// radios already handle the "only one at a time" bit, we just save whichever won
picks.forEach(p => p.addEventListener('change', () => chrome.storage.sync.set({ skin: p.value })));
