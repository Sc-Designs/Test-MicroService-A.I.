import express from 'express';
const router = express.Router();
import {
  createTest,
  SearchTests,
  sendQuestionWithLimit,
  SendSetsData,
} from "../controllers/test.controller.js";
import {
  createQuestion,
  questionSend,
} from "../controllers/question.controller.js";
import isOrgLoggedIn from '../middleware/isOrgLoggedIn.js';
import tryCatch from '../utils/tryCatch.js';
import isUserLoggedIn from '../middleware/isUserLoggedIn.js';

router.get(
  "/send-test-questions",
  tryCatch(sendQuestionWithLimit)
);
router.get("/test/:testId", tryCatch(SendSetsData));
router.get("/question/:id", tryCatch(questionSend));
router.post("/questions-created", isOrgLoggedIn, tryCatch(createQuestion));
router.post("/set-created", isOrgLoggedIn, tryCatch(createTest));
router.get("/search", isOrgLoggedIn, tryCatch(SearchTests));

export default router;