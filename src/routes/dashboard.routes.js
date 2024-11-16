import Router from "express";

import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyJWT);

router.route("/channel-stats").get(getChannelStats);
router.route("all-videos").get(getChannelVideos);

export default router;
