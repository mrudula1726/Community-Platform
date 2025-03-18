const express = require("express");
const router = express.Router();
const { addMember, removeMember } = require("../controllers/memberController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addMember);
router.delete("/:id", authMiddleware, removeMember);

module.exports = router;
