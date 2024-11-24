import express from 'express';
import { ExpressValidator } from 'express-validator';


const router = express.Router();
router.get('/messages/:MessageID');
router.post('/messages');
router.get('messages/search')
router.get('/questions/:QuestionID');
router.get('/questions/:QuestionID/replies');
router.post('/questions');
router.post('/responses');
router.get('/responses/:ResponseID/replies');
router.post('responses/:ResponseID/replies');
router.get('/comments/:CommentID');
//individual



export default router;