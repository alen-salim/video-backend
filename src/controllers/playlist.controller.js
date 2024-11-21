import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "./../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "Invalid user data");
  }
  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new ApiError(400, "Invalid playlist name");
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim() === ""
  ) {
    throw new ApiError(400, "Invalid playlist description");
  }

  const existingPlaylist = await Playlist.findOne({ name });

  if (existingPlaylist) {
    throw new ApiError(409, "Playlist with same name already exists");
  }

  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: userId,
  });

  if (!newPlaylist) {
    throw new ApiError(500, "Could not create playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, newPlaylist, "Playlist created succesfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const userPlaylists = await Playlist.find({ owner: userId });

  if (!userPlaylists.length) {
    throw new ApiError(404, "Could not find playlists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylists, "User playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const userPlaylist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videosDetails",
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videos: {
          title: 1,
          thumbnail: 1,
          videoFile: 1,
        },
      },
    },
  ]);

  if (!userPlaylist.length) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylist[0], "Playlist fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const userPlaylist = await Playlist.findById(playlistId);

  if (!userPlaylist) {
    throw new ApiError(404, "Could not find playlist");
  }

  if (userPlaylist.videos.includes(videoId)) {
    throw new ApiError(409, "Video is already in the playlist");
  }
  userPlaylist.videos.push(videoId);
  await userPlaylist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userPlaylist,
        "Video added to the playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const userPlaylist = await Playlist.findById(playlistId);

  if (!userPlaylist) {
    throw new ApiError(404, "Could not find playlist");
  }

  if (!userPlaylist.videos.includes(videoId)) {
    throw new ApiError(404, "Video not found in the playlist");
  }

  userPlaylist.videos.pull(videoId);
  await userPlaylist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userPlaylist,
        "Video removed from the playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new ApiError(400, "Invalid playlist name");
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim() === ""
  ) {
    throw new ApiError(400, "Invalid playlist description");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name.trim(),
        description: description.trim(),
      },
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found or could not be updated");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
