import { Request, Response } from "express";
import { getUserProfile, activateBrother, deactivateBrother, getBrotherById } from "../services/user.service";

export const getProfileController = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user.id;
    const profile = await getUserProfile(userId);
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getBrotherByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await getBrotherById(Array.isArray(id) ? id[0] : id);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Activate
 */
export const activateBrotherController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const result = await activateBrother(Array.isArray(id) ? id[0] : id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Deactivate
 */
export const deactivateBrotherController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const result = await deactivateBrother(Array.isArray(id) ? id[0] : id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

