import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  const userId = req.user._id;

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video unliked successfully"));
  } else {
    const newLike = await Like.create({
      video: videoId,
      likedBy: userId,
    });

    const responseLike = await Like.findById(newLike._id).select(
      "-comment -tweet"
    );

    return res
      .status(200)
      .json(new ApiResponse(200, responseLike, "Video liked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  const userId = req.user._id;

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment unliked successfully"));
  } else {
    const newLike = await Like.create({
      comment: commentId,
      likedBy: userId,
    });

    const responseLike = await Like.findById(newLike._id).select(
      "-video -tweet"
    );

    return res
      .status(200)
      .json(new ApiResponse(200, responseLike, "Comment liked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  const userId = req.user._id;

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet unliked successfully"));
  } else {
    const newLike = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });

    const responseLike = await Like.findById(newLike._id).select(
      "-comment -tweet"
    );

    return res
      .status(200)
      .json(new ApiResponse(200, responseLike, "Tweet liked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id;

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $project: {
        videoDetails: { $arrayElemAt: ["$videoDetails", 0] },
      },
    },
  ]);

  if (!likedVideos.length) {
    throw new ApiError(400, "No liked videos found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
