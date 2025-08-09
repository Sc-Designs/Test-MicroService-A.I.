import express from 'express';
const router = express.Router();
import {
  createTest,
  SearchTests,
  sendQuestionWithLimit,
  SendSetsData,
  deleteTest,
  editTest,
} from "../controllers/test.controller.js";
import {
  createQuestion,
  questionSend,
} from "../controllers/question.controller.js";
import isOrgLoggedIn from '../middleware/isOrgLoggedIn.js';
import tryCatch from '../utils/tryCatch.js';

router.get(
  "/send-test-questions",
  tryCatch(sendQuestionWithLimit)
);
router.get("/set-update/:testId", tryCatch(SendSetsData));
router.get("/question/:id", tryCatch(questionSend));
router.post("/questions-created", isOrgLoggedIn, tryCatch(createQuestion));
router.post("/set-created", isOrgLoggedIn, tryCatch(createTest));
router.get("/search", isOrgLoggedIn, tryCatch(SearchTests));
router.delete("/delete", isOrgLoggedIn, tryCatch(deleteTest));
router.put("/edit", isOrgLoggedIn, tryCatch(editTest));


export default router;