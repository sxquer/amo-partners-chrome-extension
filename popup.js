document.getElementById('goToShop').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.amocrm.ru/partners/cabinet/shop' });
});

const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');

function search() {
  const searchTerm = searchInput.value.toLowerCase();
  resultsDiv.innerHTML = '';

  if (!searchTerm) {
    return;
  }

  chrome.storage.local.get(null, (items) => {
    for (const id in items) {
      const companyName = items[id].toLowerCase();
      if (id.includes(searchTerm) || companyName.includes(searchTerm)) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'result-item';
        itemDiv.textContent = `${id}: ${items[id]}`;
        resultsDiv.appendChild(itemDiv);
      }
    }
  });
}

searchInput.addEventListener('input', search);
