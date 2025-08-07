import { Question } from "../models/question.model.js";
import { Test } from "../models/test.model.js";
export const createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (error) {
    console.error("❌ Error creating question:", error);
    res.status(400).json({ message: error.message });
  }
};

export const questionSend = async (req, res) => {
    try {
      const { id } = req.params;
      const allResult = await Test.findById(id)
      .populate({
        path: "questions",
        model: "Question",
      });
      if (!allResult) {
        return res.status(404).json({ message: "Test not found" });
      }
      res.json(allResult);
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: "Server error", error: error.message });
    }
}