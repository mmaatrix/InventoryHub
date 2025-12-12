import request from 'supertest'
process.env.NODE_ENV = 'test'
const { default: app } = await import('../server.js')

async function run() {
  const health = await request(app).get('/health')
  console.log('Health:', health.body.success === true)

  const created = await request(app).post('/api/items').send({ name: 'Keyboard', sku: 'KB-001', quantity: 10 })
  console.log('Create status:', created.status)
  const id = created.body.data.id

  const fetched = await request(app).get(`/api/items/${id}`)
  console.log('Fetch:', fetched.body.data.name === 'Keyboard')

  const updated = await request(app).put(`/api/items/${id}`).send({ name: 'Keyboard Pro', sku: 'KB-001', quantity: 12 })
  console.log('Update:', updated.body.data.quantity === 12)

  const list = await request(app).get('/api/items?page=1&pageSize=10')
  console.log('List count:', list.body.meta.total >= 1)

  const removed = await request(app).delete(`/api/items/${id}`)
  console.log('Deleted status:', removed.status)

  const notFound = await request(app).get(`/api/items/${id}`)
  console.log('Not found status:', notFound.status)
}

run().catch(err => { console.error(err); process.exit(1) })
