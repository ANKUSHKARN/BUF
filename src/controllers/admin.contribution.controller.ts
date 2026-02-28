import { Request, Response } from "express";
import {
  getAllContributions,
  approveContribution,
  rejectContribution,
  deleteContribution
} from "../services/admin.contribution.service";

/**
 * Get all contributions
 */
export const getAllContributionsController = async (
  req: Request,
  res: Response
) => {
  try {
    const contributions = await getAllContributions();
    res.json(contributions);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Approve
 */
export const approveContributionController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const result = await approveContribution(Array.isArray(id) ? id[0] : id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Reject
 */
export const rejectContributionController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const result = await rejectContribution(Array.isArray(id) ? id[0] : id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete Contribution
 */
export const deleteContributionController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const result = await deleteContribution(Array.isArray(id) ? id[0] : id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};