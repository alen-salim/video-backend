import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "./../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // TODO: toggle subscription
  const { channelId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const existingSubscriber = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscriber) {
    await existingSubscriber.deleteOne();

    const updatedSubscriberCount = await Subscription.countDocuments({
      channel: channelId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { subscriberCount: updatedSubscriberCount },
          "Channel unsubscribed"
        )
      );
  } else {
    const newSubscriber = await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });

    const subscriberDetails = await Subscription.findById(newSubscriber._id)
      .populate("subscriber", "name email")
      .populate("channel", "name");

    const updatedSubscriberCount = await Subscription.countDocuments({
      channel: channelId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { subscriberDetails, subscriberCount: updatedSubscriberCount },
          "Channel subscribed"
        )
      );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const channelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "channelSubscribers",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        channelSubscribers: 1,
        totalSubscriberCount: { $size: "$subscribers" },
      },
    },
  ]);

  if (!channelSubscribers || !channelSubscribers.length) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { totalSubscriberCount: 0, subscribers: [] },
          "No subscribers found for the channel"
        )
      );
  }

  const { totalSubscriberCount, subscribers } = channelSubscribers[0];

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalSubscriberCount, subscribers },
        "Channel subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channels",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        channels: 1,
        totalSubscribedChannels: { $size: "$channels" },
      },
    },
  ]);

  if (!subscribedChannels || !subscribedChannels.length) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { totalSubscribedchannels: 0, subscribedChannels: [] },
          "User is not subscribed to any channel"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
