import express from 'express';
import { ExpressValidator } from 'express-validator';
import {
    getMessage,
    patchClearLike, patchDislikeMessage, patchLikeMessage,
    postQuestion,
    postReply, getQuestionSearch, getQuestionPage, getRecentQuestions
} from '../controllers/PublicForumControllers'
import {checkAuth, checkIfAccountExists, getAccountInfo} from "../controllers/Middleware/UserMiddleware";
import {checkProfanity} from "../controllers/Middleware/PublicForumMiddleware";

const router = express.Router();
router.get('/messages/:MessageID',getAccountInfo, getMessage);
router.get('/questions/search/:text/:sortBy', getAccountInfo, getQuestionSearch);
router.get('/questions/recent',getAccountInfo, getRecentQuestions);
router.get('/questions/:QuestionID/page',getAccountInfo, getQuestionPage);
router.post('/questions',getAccountInfo, checkAuth, checkProfanity,postQuestion);
router.post('/messages/:MessageID',getAccountInfo, checkAuth,checkProfanity, postReply);
router.patch('/dislike/:MessageID',getAccountInfo, checkAuth, patchDislikeMessage);
router.patch('/like/:MessageID',getAccountInfo, checkAuth, patchLikeMessage);
router.patch('/clearLike/:MessageID',getAccountInfo, checkAuth, patchClearLike);
//individual



export default router;