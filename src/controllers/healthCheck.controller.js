import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  // Send a simple health check response with a 200 OK status
  return res.status(200).json(new ApiResponse(200, {}, "Server is running"));
});

export { healthcheck };
