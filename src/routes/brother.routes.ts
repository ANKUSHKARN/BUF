import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import multer from "multer";
import { createContributionController, getContributionPreviewController, getDashboardSummaryController, getMyContributionHistoryController, getMyTotalContributionController,} from "../controllers/contribution.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

router.post(
  "/mycontribution",
  authenticate,
  authorize("ADMIN","BROTHER"),
  upload.array("proofs", 5),
  createContributionController
);

router.get(
  "/mycontribution/preview",
  authenticate,
  authorize("ADMIN","BROTHER"),
  getContributionPreviewController
);

router.get(
  "/mycontribution/history",
  authenticate,
  authorize("ADMIN","BROTHER"),
  getMyContributionHistoryController
);

router.get("/mycontribution/total",
  authenticate,
  getMyTotalContributionController
);

router.get(
  "/dashboard/summary",
  authenticate,
  getDashboardSummaryController
);

export default router;