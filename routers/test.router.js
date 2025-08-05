import express from 'express';
const router = express.Router();
import { createTest, SearchTests } from "../controllers/test.controller.js";
import { createQuestion } from "../controllers/question.controller.js";
import isOrgLoggedIn from '../middleware/isOrgLoggedIn.js';
import tryCatch from '../utils/tryCatch.js';

router.post("/questions-created", isOrgLoggedIn, tryCatch(createQuestion));
router.post("/set-created", isOrgLoggedIn, tryCatch(createTest));
router.get("/search", isOrgLoggedIn, tryCatch(SearchTests));

export default router;