const express = require("express");
const { createCommunity, getAllCommunities, getAllMembers, getOwnedCommunities, getJoinedCommunities} = require("../controllers/communityController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createCommunity);
router.get("/", getAllCommunities);
router.get("/:id/members", getAllMembers);
router.get("/me/owner", authMiddleware, getOwnedCommunities);
router.get("/me/member", authMiddleware, getJoinedCommunities);


module.exports = router;
