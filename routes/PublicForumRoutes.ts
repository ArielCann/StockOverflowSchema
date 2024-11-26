import express from 'express';
import { ExpressValidator } from 'express-validator';


const router = express.Router();
router.get('/likedDislikedMessages')
router.get('/messages/:MessageID');
router.post('/messages');
router.get('messages/search')
router.get('/questions/:QuestionID');
router.get('/questions/:QuestionID/page');
router.post('/questions');
router.post('/responses');
router.get('/responses/:ResponseID/replies');
router.post('responses/:ResponseID/replies');
router.get('/comments/:CommentID');
router.patch('/dislike/:MessageID');
router.patch('/like/:MessageID');
router.patch('/unlike/:MessageID');
router.patch('/un_dislike/:MessageID');
//individual



export default router;