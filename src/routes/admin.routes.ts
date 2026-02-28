import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { createBrotherController, getAllBrothersController } from "../controllers/brother.controller";
import {
  getAllContributionsController,
  approveContributionController,
  rejectContributionController,
  deleteContributionController,
} from "../controllers/admin.contribution.controller";
import { activateBrotherController, deactivateBrotherController, getBrotherByIdController } from "../controllers/user.controller";

const router = Router();

router.post(
  "/brother",
  authenticate,
  authorize("ADMIN"),
  createBrotherController
);

router.get(
  "/brothers",
  authenticate,
  authorize("ADMIN"),
  getAllBrothersController
);

router.get(
  "/brother/:id",
  authenticate,
  authorize("ADMIN"),
  getBrotherByIdController
);

router.get(
  "/brotherscontribution",
  authenticate,
  authorize("ADMIN"),
  getAllContributionsController
);

router.patch(
  "/brotherscontribution/:id/approve",
  authenticate,
  authorize("ADMIN"),
  approveContributionController
);

router.patch(
  "/brotherscontribution/:id/reject",
  authenticate,
  authorize("ADMIN"),
  rejectContributionController
);

router.delete(
  "/brotherscontribution/:id",
  authenticate,
  authorize("ADMIN"),
  deleteContributionController
);

router.patch(
  "/brother/:id/activate",
  authenticate,
  authorize("ADMIN"),
  activateBrotherController
);

router.patch(
  "/brother/:id/deactivate",
  authenticate,
  authorize("ADMIN"),
  deactivateBrotherController
);

export default router;