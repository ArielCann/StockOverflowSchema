import express from 'express';
import { ExpressValidator } from 'express-validator';
import {
    getLikedDislikedMessages,
    getMessage,
    patchClearLike, patchDislikeMessage, patchLikeMessage,
    postQuestion,
    postReply, getQuestionSearch, getQuestionPage
} from '../controllers/PublicForumControllers'

const router = express.Router();
router.get('/likedDislikedMessages',getLikedDislikedMessages)
router.get('/messages/:MessageID',getMessage);
router.get('/questions/search',getQuestionSearch);
router.get('/questions/:QuestionID/page',getQuestionPage);
router.post('/questions',postQuestion);
router.post('/messages/:MessageID',postReply);
router.patch('/dislike/:MessageID',patchDislikeMessage);
router.patch('/like/:MessageID',patchLikeMessage);
router.patch('/clearLike/:MessageID',patchClearLike);
//individual



export default router;