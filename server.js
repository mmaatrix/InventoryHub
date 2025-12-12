import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import compression from 'compression'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'] }))
app.use(express.json())
app.use(morgan('dev'))
app.use(compression())
app.use(express.static('web'))

// In-memory data store
const items = new Map()

// Utility: standardized JSON envelope
function ok(data, meta = undefined) {
  return { success: true, data, error: null, meta }
}
function fail(message, code = 'BAD_REQUEST', details = undefined) {
  return { success: false, data: null, error: { message, code, details }, meta: null }
}

// Validation helpers
function validateItemPayload(payload) {
  if (!payload || typeof payload !== 'object') return 'Invalid JSON body'
  const { name, sku, quantity } = payload
  if (!name || typeof name !== 'string') return 'Field "name" is required and must be a string'
  if (!sku || typeof sku !== 'string') return 'Field "sku" is required and must be a string'
  if (quantity == null || typeof quantity !== 'number' || quantity < 0) return 'Field "quantity" must be a non-negative number'
  return null
}

// Performance: simple caching for list endpoint
let cache = { key: null, payload: null, ts: 0 }
const CACHE_TTL_MS = 3000

// Routes
app.get('/api/items', (req, res) => {
  const search = (req.query.search || '').toString().trim().toLowerCase()
  const page = Math.max(parseInt(req.query.page || '1', 10), 1)
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '10', 10), 1), 100)

  const cacheKey = `${search}|${page}|${pageSize}`
  const now = Date.now()
  if (cache.key === cacheKey && cache.payload && now - cache.ts < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT')
    return res.json(cache.payload)
  }

  const all = Array.from(items.values())
  const filtered = search
    ? all.filter(i => i.name.toLowerCase().includes(search) || i.sku.toLowerCase().includes(search))
    : all

  const total = filtered.length
  const start = (page - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const payload = ok(paged, { total, page, pageSize })
  cache = { key: cacheKey, payload, ts: now }
  res.setHeader('X-Cache', 'MISS')
  return res.json(payload)
})

app.get('/api/items/:id', (req, res) => {
  const id = req.params.id
  const item = items.get(id)
  if (!item) return res.status(404).json(fail('Item not found', 'NOT_FOUND'))
  return res.json(ok(item))
})

app.post('/api/items', (req, res) => {
  const err = validateItemPayload(req.body)
  if (err) return res.status(400).json(fail(err))
  const { name, sku, quantity } = req.body
  const id = uuidv4()
  const createdAt = new Date().toISOString()
  const item = { id, name, sku, quantity, createdAt }
  items.set(id, item)
  cache = { key: null, payload: null, ts: 0 }
  return res.status(201).json(ok(item))
})

app.put('/api/items/:id', (req, res) => {
  const id = req.params.id
  if (!items.has(id)) return res.status(404).json(fail('Item not found', 'NOT_FOUND'))
  const err = validateItemPayload(req.body)
  if (err) return res.status(400).json(fail(err))
  const { name, sku, quantity } = req.body
  const updatedAt = new Date().toISOString()
  const updated = { ...items.get(id), name, sku, quantity, updatedAt }
  items.set(id, updated)
  cache = { key: null, payload: null, ts: 0 }
  return res.json(ok(updated))
})

app.delete('/api/items/:id', (req, res) => {
  const id = req.params.id
  if (!items.has(id)) return res.status(404).json(fail('Item not found', 'NOT_FOUND'))
  items.delete(id)
  cache = { key: null, payload: null, ts: 0 }
  return res.json(ok({ id }))
})

// Health
app.get('/health', (req, res) => res.json(ok({ status: 'healthy' })))

// Fallback to index for root
app.get('/', (req, res) => {
  res.sendFile(new URL('./web/index.html', import.meta.url))
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`InventoryHub API listening on http://localhost:${PORT}`)
  })
}

export default app
