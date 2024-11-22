import Router from "express";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "./../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/create-tweet", createTweet);
router.get("/get-user-tweets", getUserTweets);
router.patch("/update-tweet/:tweetId", updateTweet);
router.delete("/delete-tweet/:tweetId", deleteTweet);

export default router;
