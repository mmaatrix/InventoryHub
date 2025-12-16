import { v4 as uuidv4 } from 'uuid';
import NodeCache from 'node-cache';
import db from '../data/db.js';

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
const CACHE_KEY_LIST = 'items_list';

export class ItemService {
  constructor() {
    // Load initial data into memory or just read from DB on demand
    // For performance, we can keep in memory and sync to DB
    this.items = new Map();
    this.loadFromDb();
  }

  loadFromDb() {
    const data = db.read();
    this.items.clear();
    data.forEach(item => this.items.set(item.id, item));
  }

  saveToDb() {
    const data = Array.from(this.items.values());
    db.write(data);
  }

  getAll(search, page = 1, pageSize = 10) {
    const cacheKey = `list_${search || ''}_${page}_${pageSize}`;
    const cached = cache.get(cacheKey);
    if (cached) return { ...cached, cached: true };

    const all = Array.from(this.items.values());
    const filtered = search
      ? all.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()))
      : all;

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    const result = { items: paged, total, page, pageSize };
    cache.set(cacheKey, result);
    return result;
  }

  getById(id) {
    return this.items.get(id);
  }

  create(data) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const item = { id, ...data, createdAt: now, updatedAt: now };
    this.items.set(id, item);
    this.saveToDb();
    cache.flushAll(); // Invalidate cache
    return item;
  }

  update(id, data) {
    if (!this.items.has(id)) return null;
    const existing = this.items.get(id);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    this.items.set(id, updated);
    this.saveToDb();
    cache.flushAll();
    return updated;
  }

  delete(id) {
    if (!this.items.has(id)) return false;
    this.items.delete(id);
    this.saveToDb();
    cache.flushAll();
    return true;
  }
}

export default new ItemService();
