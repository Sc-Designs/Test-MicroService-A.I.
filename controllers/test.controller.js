import mongoose from 'mongoose';
import { Test } from '../models/test.model.js';
import { Question } from "../models/question.model.js";
import deleteSetsFromOrg from '../services/deleteSetsFromOrg.service.js';


const sendQuestionWithLimit = async (req, res) => {
  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const query = req.query.query?.trim() || "";

  let filter = {};
  if (query) {
    filter = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    };
  }
  
  let results = await Test.find(filter)
    .skip(start)
    .limit(limit + 1)
    .sort({ createdAt: -1 });

  const hasMore = results.length > limit;
  if (hasMore) results.pop();
  console.log(`Sending questions from ${start} to ${start + limit}, hasMore: ${hasMore}, query: ${query}, answers: ${results}`);
  res.json({
    questions: results,
    hasMore,
    nextStart: hasMore ? start + limit : null,
  });
};

const createTest = async (req, res) => {
  try {
    const { title, level, category, questions } = req.body;

    const newTest = await Test.create({
      title,
      level,
      category,
      questions,
      createdBy: req.org?._id || null,
      owner: req.org?.name || "Company",
    });

    res.status(201).json({id: newTest._id});
  } catch (error) {
    console.error("❌ Error creating test:", error);
    res.status(400).json({ message: error.message });
  }
};

const SearchTests = async (req, res) => {
  const { query = "", page = 1 } = req.query;
  const limit = 15;
  const skip = (page - 1) * limit;
  if (!req.org) {
    return res.status(403).json({ message: "Organization not found" });
  }
  const conditions = [{ title: { $regex: query, $options: "i" } }];

  if (mongoose.Types.ObjectId.isValid(query)) {
    conditions.push({ _id: new mongoose.Types.ObjectId(query) });
  }
  try {
    const tests = await Test.find({
      createdBy: req.org?._id,
      $or: conditions,
    })
      .select("_id title createdAt")
      .lean()
      .skip(skip)
      .limit(limit + 1);

    const hasMore = tests.length > limit;

    if (hasMore) tests.pop();

    res.json({ tests, hasMore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const SendSetsData = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId).populate("questions").lean();
    if (!test) return res.status(404).json({ message: "Test not found" });

    res.status(200).json({ name: test.title,category: test.category, level: test.level, questions: test.questions });
  } catch (err) {
    console.error("Failed to fetch test:", err);
    res.status(500).json({ message: "Server error" });
  }
}

const deleteTest = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        message: "Set ID is required",
      });
    }

    const set = await Test.findById(id);
    if (!set) {
      return res.status(404).json({
        message: "Set not found",
      });
    }

    // Delete related data if exists
    if (Array.isArray(set.questions) && set.questions.length > 0) {
      await Question.deleteMany({ _id: { $in: set.questions } });
    }

    await Test.findByIdAndDelete(id);

    let orgDeleteWarning = null;
    try {
      await deleteSetsFromOrg(set.createdBy, [id], req.org?.token);
    } catch (orgErr) {
      console.error("⚠ Failed to delete from Org service:", orgErr);
      orgDeleteWarning = "Failed to remove set from organization";
    }

    return res.status(200).json({
      message: "Set and related questions deleted successfully",
      setId: id, // sending deleted ID to frontend
      warning: orgDeleteWarning,
    });
  } catch (error) {
    console.error("❌ Error deleting set:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid Set ID format",
      });
    }

    return res.status(500).json({
      message: "Server error while deleting set",
    });
  }
};

const editTest = async (req, res) => {
  try {
    const { id, title, level, category, updatedQuestions } = req.body;
    console.log("Editing Sets:", updatedQuestions);
    if (!id) return res.status(400).json({ message: "Test ID is required" });
    if (!Array.isArray(updatedQuestions) || updatedQuestions.length !== 10) {
      return res
        .status(400)
        .json({ message: "Each test must have exactly 10 questions" });
    }
    const test = await Test.findById(id);
    if (!test) return res.status(404).json({ message: "Test not found" });
    let finalQuestionIds = [];
    for (let q of updatedQuestions) {
      if (q._id) {

        const updated = await Question.findByIdAndUpdate(
          q._id,
          {
            questionText: q.questionText,
            type: q.type,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
          },
          { new: true }
        );
        if (!updated) {
          return res
            .status(404)
            .json({ message: `Question not found: ${q._id}` });
        }
        finalQuestionIds.push(updated._id);
      } else {
        const newQ = await Question.create({
          questionText: q.questionText,
          type: q.type,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
        });

        finalQuestionIds.push(newQ._id);
      }
    }

    test.title = title || test.title;
    test.level = level || test.level;
    test.category = category || test.category;
    test.questions = finalQuestionIds;

    await test.save();

    res.status(200).json({ message: "Test updated successfully", test });
  } catch (error) {
    console.error("❌ Error editing test:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export {
  sendQuestionWithLimit,
  createTest,
  SearchTests,
  SendSetsData,
  deleteTest,
  editTest,
};