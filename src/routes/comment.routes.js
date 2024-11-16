import Router from "express";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "./../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId/comments").get(getVideoComments); // Get all comments for a video
router.route("/:videoId/comments").post(addComment); // Add a comment to a video
router.route("/comments/:commentId").put(updateComment); // Update a specific comment
router.route("/comments/:commentId").delete(deleteComment);

export default router;
