import express from 'express';
import { ExpressValidator } from 'express-validator';
const AuthController = require('../controllers/AuthControllers');
const isUserMiddleware = require('../middleware/IsUser');
import {
    getLikedDislikedMessages,
    getMessage,
    getResponseComments, patchClearLike, patchDislikeMessage, patchLikeMessage, postComment,
    postQuestion,
    postResponse, getQuestionSearch, getQuestionPage
} from '../controllers/PublicForumControllers'

const router = express.Router();
router.get('/likedDislikedMessages',getLikedDislikedMessages)
router.get('/messages/:MessageID',getMessage);
router.get('/questions/search',getQuestionSearch);
router.get('/questions/:QuestionID/page',getQuestionPage);
router.post('/questions',postQuestion);
router.post('/:QuestionID/responses',postResponse);
router.get('/responses/:ResponseID/comments',getResponseComments);
router.post('responses/:ResponseID/comments',postComment);
router.patch('/dislike/:MessageID',patchDislikeMessage);
router.patch('/like/:MessageID',patchLikeMessage);
router.patch('/clearLike/:MessageID',patchClearLike);
//individual



export default router;