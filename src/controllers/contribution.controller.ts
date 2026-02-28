import { Request, Response } from "express";
import {
  createContribution,
  getMyContributionHistory,
  getMyContributionPreview,
  getMyTotalContribution,
  getDashboardSummary
} from "../services/contribution.service";

/**
 * Create Contribution Controller
 * Accepts multiple proof images (max 5)
 */
export const createContributionController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "At least one proof image is required",
      });
    }

    const result = await createContribution(
      user.id,
      files
    );

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to create contribution",
    });
  }
};

/**
 * Preview Contribution Controller
 */
export const getContributionPreviewController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const result = await getMyContributionPreview(
      user.id
    );

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      message:
        error.message || "Failed to fetch contribution preview",
    });
  }
};

/**
 * Get My Contribution History Controller
 */
export const getMyContributionHistoryController =
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      if (!user || !user.id) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const { page, limit, status } = req.query;

      const history =
        await getMyContributionHistory(
          user.id,
          page ? Number(page) : 1,
          limit ? Number(limit) : 10,
          status as string
        );

      return res.json(history);
    } catch (error: any) {
      return res.status(500).json({
        message:
          error.message ||
          "Failed to fetch contribution history",
      });
    }
  };

/*Get Total Contribution for logged-in user */

export const getMyTotalContributionController = async (req: any, res: Response) => {
  try {
    const userId = req.user.id; // signed-in user

    const result = await getMyTotalContribution(userId);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/** controller for total corpus contribution */

export const getDashboardSummaryController = async (
  req: any,
  res: Response
) => {
  try {
    const result = await getDashboardSummary();

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to fetch summary",
    });
  }
};