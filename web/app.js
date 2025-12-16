const API_BASE = '';

// Helper for UI updates
function $(id) { return document.getElementById(id); }
function setMessage(msg, type = 'info') {
  const el = $('message');
  el.textContent = msg;
  el.className = `message ${type}`;
}

async function api(method, path, body) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, options);
    
    // Handle non-JSON responses (e.g. 500 HTML error pages)
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || `Request failed with status ${res.status}`);
    }
    return json;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

async function load() {
  const search = $('search').value.trim();
  const tbody = $('items');
  
  setMessage('Loading...', 'info');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Loading...</td></tr>';

  try {
    const { data, meta } = await api('GET', `/api/items?search=${encodeURIComponent(search)}&page=1&pageSize=50`);
    
    tbody.innerHTML = '';
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No items found</td></tr>';
    } else {
      data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${item.id}</td>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.sku)}</td>
          <td>${item.quantity}</td>
          <td>
            <button class="action-btn delete-btn" data-id="${item.id}">Delete</button>
            <button class="action-btn edit-btn" data-id="${item.id}" data-item='${JSON.stringify(item)}'>Edit</button>
          </td>`;
        tbody.appendChild(tr);
      });
    }
    
    setMessage(`Loaded ${data.length} items (Total: ${meta.total})`, 'success');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red">Error loading items</td></tr>';
    setMessage(`Error: ${err.message}`, 'error');
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function create() {
  const name = $('name').value.trim();
  const sku = $('sku').value.trim();
  const quantity = Number($('quantity').value);

  if (!name || !sku) return setMessage('Name and SKU are required', 'error');
  if (quantity < 0) return setMessage('Quantity must be non-negative', 'error');

  setMessage('Creating...', 'info');
  try {
    const { data } = await api('POST', '/api/items', { name, sku, quantity });
    setMessage(`Created item: ${data.name}`, 'success');
    clearForm();
    await load();
  } catch (err) {
    setMessage(err.message, 'error');
  }
}

async function update() {
  const id = $('item-id').value.trim();
  const name = $('name').value.trim();
  const sku = $('sku').value.trim();
  const quantity = Number($('quantity').value);

  if (!id) return setMessage('Provide ID to update (select an item first)', 'error');

  setMessage('Updating...', 'info');
  try {
    const { data } = await api('PUT', `/api/items/${id}`, { name, sku, quantity });
    setMessage(`Updated item: ${data.name}`, 'success');
    clearForm();
    await load();
  } catch (err) {
    setMessage(err.message, 'error');
  }
}

function clearForm() {
  $('item-id').value = '';
  $('name').value = '';
  $('sku').value = '';
  $('quantity').value = '';
}

// Event Delegation for table actions
$('items').addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.getAttribute('data-id');
    if (!confirm('Are you sure?')) return;
    
    try {
      await api('DELETE', `/api/items/${id}`);
      setMessage('Deleted successfully', 'success');
      await load();
    } catch (err) {
      setMessage(err.message, 'error');
    }
  } else if (e.target.classList.contains('edit-btn')) {
    const item = JSON.parse(e.target.getAttribute('data-item'));
    $('item-id').value = item.id;
    $('name').value = item.name;
    $('sku').value = item.sku;
    $('quantity').value = item.quantity;
    setMessage(`Editing ${item.name}`, 'info');
  }
});

$('refresh').addEventListener('click', load);
$('create').addEventListener('click', create);
$('update').addEventListener('click', update);

// Initial load
load();
