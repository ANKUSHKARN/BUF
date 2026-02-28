import { Router } from "express";
import { getProfileController } from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.get("/profile",
    authenticate,
    getProfileController
);


export default router;