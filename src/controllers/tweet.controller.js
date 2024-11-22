import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { tweet } = req.body;
  const userId = req.user?._id;

  if (!tweet || !tweet.trim()) {
    throw new ApiError(400, "Tweet content cannot be empty");
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const newTweet = await Tweet.create({
    content: tweet.trim(),
    owner: mongoose.Types.ObjectId(userId),
  });

  if (!newTweet) {
    throw new ApiError(500, "Could not create new tweet");
  }

  const response = await Tweet.findById(newTweet._id).populate(
    "owner",
    "fullname username avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, response, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const userId = req.user?._id;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const userTweets = await Tweet.find({ owner: userId }).select("-owner");

  if (!userTweets.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "User has not created any tweets"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, userTweets, "Tweet created successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const userId = req.user?._id;
  const { tweet } = req.body;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }
  if (!tweet || typeof tweet !== "string" || tweet.trim() === "") {
    throw new ApiError(400, "Tweet content cannot be empty");
  }

  const existingTweet = await Tweet.findById(tweetId);

  if (!existingTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (existingTweet.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized to update this tweet");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: { content: tweet },
    },
    { new: true, runValidators: true }
  );

  if (!updatedTweet) {
    throw new ApiError(500, "Could not update tweet");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const deletedTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: userId,
  });

  if (!deletedTweet) {
    throw new ApiError(404, "Tweet not found or unauthorized to delete");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
