function addCompanyColumn() {
  const header = document.querySelector('._text-s.grid-rows-40');
  if (header && !header.querySelector('.company-name-header')) {
    const newHeaderCell = document.createElement('div');
    newHeaderCell.className = 'p-12 company-name-header';
    newHeaderCell.innerHTML = '<p class="ml-8">Название компании</p>';
    // Вставляем после первого элемента (ID счета)
    header.children[0].insertAdjacentElement('afterend', newHeaderCell);
  }

  const rows = document.querySelectorAll('._text-s.bg-primary.grid-rows-40');
  rows.forEach(row => {
    if (row.querySelector('.company-name-cell')) {
      return; // Уже обработано
    }

    const idCell = row.querySelector('p._text-m.text-primary');
    if (!idCell) return;

    // Ищем все ячейки в строке
    const cells = row.querySelectorAll('p._text-m.text-primary');
    let accountId = null;

    // Ищем ID аккаунта. Предполагаем, что это второе числовое значение в строке.
    // Первое - это ID счета.
    if (cells.length > 1) {
        // Пробуем найти ID, который не является ID счета
        for (let i = 0; i < cells.length; i++) {
            const text = cells[i].textContent.trim();
            if (text.startsWith('#')) {
                // Это ID счета, пропускаем
                continue;
            }
            // Проверяем, является ли текст числом (возможно с пробелами)
            const potentialId = text.replace(/\s/g, '');
            if (!isNaN(potentialId) && potentialId.length > 0) {
                accountId = potentialId;
                break;
            }
        }
    }
    
    // Если не нашли, пробуем найти по другому селектору, который может появиться
    if (!accountId) {
        const accountIdElement = Array.from(row.querySelectorAll('p')).find(p => /^\d{5,}$/.test(p.textContent.trim()));
        if (accountIdElement) {
            accountId = accountIdElement.textContent.trim();
        }
    }

    // Если ID аккаунта так и не найден, выходим
    if (!accountId) {
        // Вставляем пустую ячейку, чтобы не ломать верстку
        const emptyCell = document.createElement('div');
        emptyCell.className = 'p-12 py-10 company-name-cell';
        row.children[0].insertAdjacentElement('afterend', emptyCell);
        return;
    }
    const newCell = document.createElement('div');
    newCell.className = 'p-12 py-10 company-name-cell';
    
    chrome.storage.local.get([accountId], (result) => {
      if (result[accountId]) {
        newCell.textContent = result[accountId];
      } else {
        const button = document.createElement('button');
        button.textContent = 'Указать';
        button.className = 'set-company-name-btn';
        button.dataset.accountId = accountId;
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const companyName = prompt(`Введите название компании для ID ${accountId}:`);
          if (companyName) {
            chrome.storage.local.set({ [accountId]: companyName }, () => {
              newCell.innerHTML = ''; // Очищаем кнопку
              newCell.textContent = companyName;
            });
          }
        });
        newCell.appendChild(button);
      }
    });

    row.children[0].insertAdjacentElement('afterend', newCell);
  });
}

// Используем MutationObserver для отслеживания изменений в DOM,
// так как контент может загружаться динамически.
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      addCompanyColumn();
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Первоначальный запуск
addCompanyColumn();
