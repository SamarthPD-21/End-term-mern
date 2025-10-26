import express from 'express';
import { submitContact } from '../controllers/contact.controller.js';

const router = express.Router();

// POST /api/contact - public submit
router.post('/', express.json(), submitContact);

export default router;
