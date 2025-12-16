import Joi from 'joi';
import itemService from '../services/itemService.js';
import { ok, fail } from '../utils/response.js';

const itemSchema = Joi.object({
  name: Joi.string().required().min(1),
  sku: Joi.string().required().min(1),
  quantity: Joi.number().integer().min(0).required()
});

export const getItems = (req, res) => {
  try {
    const search = (req.query.search || '').toString().trim();
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '10', 10), 1), 100);

    const result = itemService.getAll(search, page, pageSize);
    
    if (result.cached) {
      res.setHeader('X-Cache', 'HIT');
    } else {
      res.setHeader('X-Cache', 'MISS');
    }

    res.json(ok(result.items, { total: result.total, page: result.page, pageSize: result.pageSize }));
  } catch (err) {
    res.status(500).json(fail(err.message, 'INTERNAL_ERROR'));
  }
};

export const getItemById = (req, res) => {
  try {
    const item = itemService.getById(req.params.id);
    if (!item) return res.status(404).json(fail('Item not found', 'NOT_FOUND'));
    res.json(ok(item));
  } catch (err) {
    res.status(500).json(fail(err.message, 'INTERNAL_ERROR'));
  }
};

export const createItem = (req, res) => {
  try {
    const { error, value } = itemSchema.validate(req.body);
    if (error) return res.status(400).json(fail(error.details[0].message, 'VALIDATION_ERROR'));

    const item = itemService.create(value);
    res.status(201).json(ok(item));
  } catch (err) {
    res.status(500).json(fail(err.message, 'INTERNAL_ERROR'));
  }
};

export const updateItem = (req, res) => {
  try {
    const { error, value } = itemSchema.validate(req.body);
    if (error) return res.status(400).json(fail(error.details[0].message, 'VALIDATION_ERROR'));

    const updated = itemService.update(req.params.id, value);
    if (!updated) return res.status(404).json(fail('Item not found', 'NOT_FOUND'));

    res.json(ok(updated));
  } catch (err) {
    res.status(500).json(fail(err.message, 'INTERNAL_ERROR'));
  }
};

export const deleteItem = (req, res) => {
  try {
    const success = itemService.delete(req.params.id);
    if (!success) return res.status(404).json(fail('Item not found', 'NOT_FOUND'));
    res.json(ok({ id: req.params.id }));
  } catch (err) {
    res.status(500).json(fail(err.message, 'INTERNAL_ERROR'));
  }
};
