import express  from "express";

import {
  createUserSessionHandler,
  getUserSessionsHandler,
  deleteSessionHandler,
  refreshAccessTokenHandler,
} from "../controller/session.controller.js";
import requireUser from "../middleware/requireUser.js";
import validateResource from "../middleware/validateResource.js";

import { createSessionSchema } from "../schema/session.schema.js";

const router = express.Router();

router.post(
    "/v1/api/sessions",
    validateResource(createSessionSchema),
    createUserSessionHandler
  );


  router.get("/v1/api/sessions", requireUser, getUserSessionsHandler);

  router.delete("/v1/api/sessions", requireUser, deleteSessionHandler);

  router.post("/v1/api/sessions/refresh", refreshAccessTokenHandler);

export default router;