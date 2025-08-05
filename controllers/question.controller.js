import { Question } from "../models/question.model.js";

export const createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (error) {
    console.error("❌ Error creating question:", error);
    res.status(400).json({ message: error.message });
  }
};
