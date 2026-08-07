const express = require("express");
const router = express.Router();

const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

// Create Project
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = new Project({
      title,
      description,
      user: req.user.userId,
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully.",
      project,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Get All Projects
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      user: req.user.userId,
    });

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
// Update Project
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    project.title = title;
    project.description = description;

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
// Delete Project
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
module.exports = router;