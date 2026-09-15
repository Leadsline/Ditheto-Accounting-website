import { Router, type IRouter, type Request, type Response } from "express";
import { contactSubmissionsTable, db } from "@workspace/db";
import {
  CreateContactSubmissionBody,
  CreateContactSubmissionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/contact-submissions", async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateContactSubmissionBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn("Invalid contact submission");
    res.status(400).json({ error: "Please check the required contact details and try again." });
    return;
  }

  if (parsed.data.clientType === "business" && !parsed.data.companyName?.trim()) {
    res.status(400).json({ error: "Company name is required for business enquiries." });
    return;
  }

  const [submission] = await db.insert(contactSubmissionsTable).values({
    ...parsed.data,
    fullName: parsed.data.fullName.trim(),
    email: parsed.data.email.trim().toLowerCase(),
    phone: parsed.data.phone.trim(),
    companyName: parsed.data.clientType === "business" ? parsed.data.companyName?.trim() || null : null,
    companyRegistrationNumber: parsed.data.clientType === "business" ? parsed.data.companyRegistrationNumber?.trim() || null : null,
    vatNumber: parsed.data.clientType === "business" ? parsed.data.vatNumber?.trim() || null : null,
    message: parsed.data.message?.trim() || null,
  }).returning();

  res.status(201).json(CreateContactSubmissionResponse.parse(submission));
});

export default router;