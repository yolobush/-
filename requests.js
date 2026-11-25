const STORAGE_KEY = 'stroy_material_requests';

function loadRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDemoData();
  } catch (e) {
    return getDemoData();
  }
}

function saveRequests(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getDemoData() {
  return [
    {
      id: 'Z-001',
      createdAt: '2026-11-20T09:15:00',
      materialName: 'ЛДСП 16 мм Белый',
      quantity: 25,
      unit: 'м2',
      orderRef: 'З-2026-041',
      priority: 'high',
      comment: 'Для шкафов в гостиную',
      status: 'processing'
    },
    {
      id: 'Z-002',
      createdAt: '2026-11-21T14:30:00',
      materialName: 'Кромка ПВХ 2 мм',
      quantity: 100,
      unit: 'м',
      orderRef: 'З-2026-042',
      priority: 'normal',
      comment: '',
      status: 'new'
    },
    {
      id: 'Z-003',
      createdAt: '2026-11-18T11:00:00',
      materialName: 'Петли мебельные',
      quantity: 40,
      unit: 'шт',
      orderRef: 'З-2026-038',
      priority: 'urgent',
      comment: 'С доводчиком',
      status: 'waiting'
    }
  ];
}

function statusLabel(status) {
  const map = {
    new: 'Новая',
    processing: 'В обработке',
    waiting: 'Ожидает поставки',
    done: 'Завершена',
    rejected: 'Отклонена'
  };
  return map[status] || status;
}

function priorityLabel(p) {
  const map = { normal: 'Обычный', high: 'Высокий', urgent: 'Срочный' };
  return map[p] || p;
}

function renderTable() {
  const list = loadRequests();
  const tbody = document.getElementById('requests-body');
  if (!tbody) return;

  tbody.innerHTML = list.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${new Date(item.createdAt).toLocaleDateString('ru-RU')}</td>
      <td>${item.materialName}</td>
      <td>${item.quantity} ${item.unit}</td>
      <td><span class="status status-${item.status}">${statusLabel(item.status)}</span></td>
      <td>${priorityLabel(item.priority)}</td>
    </tr>
  `).join('');

  const stats = { new: 0, processing: 0, waiting: 0, done: 0 };
  list.forEach(i => {
    if (stats[i.status] !== undefined) stats[i.status]++;
  });
  document.getElementById('stat-new').textContent = stats.new;
  document.getElementById('stat-process').textContent = stats.processing;
  document.getElementById('stat-wait').textContent = stats.waiting;
  document.getElementById('stat-done').textContent = stats.done;
}

function showMessage(text, isError = false) {
  const box = document.getElementById('form-message');
  if (!box) return;
  box.textContent = text;
  box.className = 'form-message ' + (isError ? 'is-error' : 'is-success');
}

document.addEventListener('DOMContentLoaded', () => {
  renderTable();

  const form = document.getElementById('material-request-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.materialName.value.trim();
    const qty = parseInt(form.quantity.value, 10);
    const consent = form.consent.checked;

    if (!name) {
      showMessage('Укажите наименование материала.', true);
      return;
    }
    if (!qty || qty < 1) {
      showMessage('Укажите корректное количество.', true);
      return;
    }
    if (!consent) {
      showMessage('Подтвердите корректность данных.', true);
      return;
    }

    const list = loadRequests();
    const newReq = {
      id: 'Z-' + String(list.length + 1).padStart(3, '0'),
      createdAt: new Date().toISOString(),
      materialName: name,
      quantity: qty,
      unit: form.unit.value,
      orderRef: form.orderRef.value.trim() || '—',
      priority: form.priority.value,
      comment: form.comment.value.trim(),
      status: 'new'
    };

    list.unshift(newReq);
    saveRequests(list);
    renderTable();
    form.reset();
    showMessage('Заявка ' + newReq.id + ' успешно создана и сохранена локально. Для реальной работы требуется сервер.');
  });
});
