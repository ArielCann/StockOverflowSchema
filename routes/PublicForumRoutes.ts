import express from 'express';
import { ExpressValidator } from 'express-validator';


const router = express.Router();
router.get('/question_responses');
router.post('/question');
router.post('/response');
router.post('/comment')
//individual



export default router;