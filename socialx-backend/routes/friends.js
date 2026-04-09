const express = require("express");
const router = express.Router();
const {
  getFriendRequests,
  getFriends,
  getSuggestions,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} = require("../controllers/friendController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

router.get("/", getFriends);
router.get("/requests", getFriendRequests);
router.get("/suggestions", getSuggestions);
router.post("/request/:userId", sendFriendRequest);
router.put("/accept/:userId", acceptFriendRequest);
router.delete("/request/:userId", declineFriendRequest);
router.delete("/:userId", removeFriend);

module.exports = router;