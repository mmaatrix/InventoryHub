const API_BASE = ''

async function api(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return json
}

function $(id) { return document.getElementById(id) }
function setMessage(msg) { $('message').textContent = msg }

async function load() {
  const search = $('search').value
  try {
    const { data, meta } = await api('GET', `/api/items?search=${encodeURIComponent(search)}&page=1&pageSize=50`)
    const tbody = $('items')
    tbody.innerHTML = ''
    data.forEach(item => {
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.sku}</td>
        <td>${item.quantity}</td>
        <td>
          <button class="delete-btn" data-id="${item.id}">Delete</button>
        </td>`
      tbody.appendChild(tr)
    })
    tbody.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id')
      try { await api('DELETE', `/api/items/${id}`); setMessage('Deleted successfully'); await load() } catch (err) { setMessage(err.message) }
    }))
    setMessage(`Loaded ${data.length}/${meta.total}`)
  } catch (err) {
    setMessage(err.message)
  }
}

async function create() {
  const name = $('name').value.trim()
  const sku = $('sku').value.trim()
  const quantity = Number($('quantity').value)
  try { const { data } = await api('POST', '/api/items', { name, sku, quantity }); setMessage(`Created ${data.id}`); await load() } catch (err) { setMessage(err.message) }
}

async function update() {
  const id = $('item-id').value.trim()
  const name = $('name').value.trim()
  const sku = $('sku').value.trim()
  const quantity = Number($('quantity').value)
  if (!id) return setMessage('Provide ID to update')
  try { const { data } = await api('PUT', `/api/items/${id}`, { name, sku, quantity }); setMessage(`Updated ${data.id}`); await load() } catch (err) { setMessage(err.message) }
}

$('refresh').addEventListener('click', load)
$('create').addEventListener('click', create)
$('update').addEventListener('click', update)

load()
