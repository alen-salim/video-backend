import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const { userId } = req.user._id;

  if (!userId) {
    throw new ApiError(400, "Invalid data");
  }

  const channelStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: "$owner",
        totalVideos: { $sum: 1 },
        totalVideoViews: { $sum: "$views" },
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id", // Owner ID in the Video model (matches video field in Like model)
        foreignField: "video",
        as: "videolikes",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id", // Owner ID in the Video model
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        totalSubscribers: {
          $size: "$subscribers",
        },
        totalLikes: {
          $size: "$videolikes",
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalVideos: 1,
        totalVideoViews: 1,
        totalLikes: 1,
        totalSubscribers: 1,
      },
    },
  ]);

  if (!channelStats.length) {
    throw new ApiError(404, "Unable to fetch channel stats");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelStats[0],
        "Channel stats fetched successfully"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { userId } = req.user._id;

  if (!userId) {
    throw new ApiError(400, "Invalid data");
  }

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        title: 1,
        videoFile: 1,
        thumbnail: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!videos.length) {
    throw new ApiError(404, "No videos found for this channel");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
