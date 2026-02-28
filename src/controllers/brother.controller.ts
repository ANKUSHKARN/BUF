import { Request, Response } from "express";
import { createBrother, getAllBrothers } from "../services/brother.service";

//create brother
export const createBrotherController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, password, mobile, employmentStatus, monthlyContribution } = req.body;

    const brother = await createBrother({ name, email, password, mobile, employmentStatus, monthlyContribution });

    res.status(201).json(brother);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

//get all brothers
export const getAllBrothersController = async (
  req: any,
  res: any
) => {
  try {
    const brothers = await getAllBrothers();

    res.status(200).json(brothers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};