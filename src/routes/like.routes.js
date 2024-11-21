import Router from "express";

import { verifyJWT } from "./../middlewares/auth.middleware.js";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
} from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId/toggle-video-like").post(toggleVideoLike);
router.route("/:commentId/toggle-comment-like").post(toggleCommentLike);
router.route("/:tweetId/toggle-tweet-like").post(toggleTweetLike);
router.route("/liked-videos").get(getLikedVideos);

export default router;
