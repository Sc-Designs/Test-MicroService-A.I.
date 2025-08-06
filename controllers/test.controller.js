import mongoose from 'mongoose';
import { Test } from '../models/test.model.js';

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
    });

    res.status(201).json(newTest);
  } catch (error) {
    console.error("❌ Error creating test:", error);
    res.status(400).json({ message: error.message });
  }
};

const SearchTests = async (req, res) => {
  const { query = "", page = 1 } = req.query;
  const limit = 10;
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

export { sendQuestionWithLimit, createTest, SearchTests };