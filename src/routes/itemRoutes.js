import express from 'express';
import * as itemController from '../controllers/itemController.js';

const router = express.Router();

router.get('/', itemController.getItems);
router.post('/', itemController.createItem);
router.get('/:id', itemController.getItemById);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

export default router;
