import Router from "express";
import { verifyJWT } from "./../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "./../controller/subscription.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/subscribe/:channelId").post(toggleSubscription);
router
  .route("/get-channel-subscribers/:channelId")
  .post(getUserChannelSubscribers);
router
  .route("/get-subscribed-channels/:subscriberId")
  .post(getSubscribedChannels);

export default router;
