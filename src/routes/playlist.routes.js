import Router from "express";

import { verifyJWT } from "./../middlewares/auth.middleware.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create-playlist").post(createPlaylist);
router.route("/get-user-playlists/:userId").get(getUserPlaylists);
router.route("/get-playlist/:playlistId").get(getPlaylistById);
router.route("/add-video/:playlistId/:videoId").post(addVideoToPlaylist);
router
  .route("/remove-video/:playlistId/:videoId")
  .delete(removeVideoFromPlaylist);
router.route("/delete-playlist/:playlistId").delete(deletePlaylist);
router.route("/update-playlist/:playlistId").patch(updatePlaylist);

export default router;
