import { Readable } from "node:stream";
import { asc, eq } from "drizzle-orm";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  CreateTeamMemberBody,
  CreateTeamMemberResponse,
  DeleteTeamMemberParams,
  GetTeamMemberPhotoParams,
  ListTeamMembersResponse,
  UpdateTeamMemberBody,
  UpdateTeamMemberParams,
  UpdateTeamMemberResponse,
} from "@workspace/api-zod";
import { db, teamMembersTable, type TeamMemberRecord } from "@workspace/db";
import { requireFullAccess } from "../middlewares/adminAuth";
import { ObjectNotFoundError, ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const storage = new ObjectStorageService();

function toResponse(member: TeamMemberRecord) {
  return {
    id: member.id,
    name: member.name,
    title: member.title,
    bio: member.bio,
    email: member.email,
    phone: member.phone,
    level: member.level,
    accent: member.accent,
    parentId: member.parentId,
    sortOrder: member.sortOrder,
    imageUrl: member.imageObjectPath ? `/api/team-members/${member.id}/photo` : null,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}

async function seedTeamIfEmpty(): Promise<void> {
  const [existing] = await db.select({ id: teamMembersTable.id }).from(teamMembersTable).limit(1);
  if (existing) return;

  const [director] = await db.insert(teamMembersTable).values({
    name: "Tshegofatso Phalatsi",
    title: "CEO / Director",
    bio: "Tshegofatso leads Ditheto Accountants with a practical belief that every business owner deserves clear numbers, calm guidance, and a partner who follows through.",
    email: "tshego@dithetoaccountants.co.za",
    phone: "067 765 7387",
    level: "director",
    accent: "gold",
    parentId: null,
    sortOrder: 0,
  }).returning();

  const [seniorManager] = await db.insert(teamMembersTable).values({
    name: "Mmatsiana Makgoba",
    title: "Senior Manager: Branch Operations & Business Development",
    bio: "Mmatsiana oversees branch operations and business development, coordinating the team to deliver responsive and dependable client service.",
    email: "mmatsiana@dithetoaccountants.co.za",
    phone: "012 751 3200",
    level: "lead",
    accent: "teal",
    parentId: director.id,
    sortOrder: 0,
  }).returning();

  const branchManagers = await db.insert(teamMembersTable).values([
    {
      name: "Tryphosa Mokaba",
      title: "Branch Manager — Brooklyn Branch",
      bio: "Tryphosa manages the Brooklyn branch and supports the accounting team in delivering accurate, timely work for clients.",
      email: "tryphosa@dithetoaccountants.co.za",
      phone: null,
      level: "lead",
      accent: "navy",
      parentId: seniorManager.id,
      sortOrder: 0,
    },
    {
      name: "Motsei Malebe",
      title: "Branch Manager — Secunda Branch",
      bio: "Motsei manages the Secunda branch, coordinating client service and supporting the branch accounting team.",
      email: "motsie@dithetoaccountants.co.za",
      phone: null,
      level: "lead",
      accent: "teal",
      parentId: seniorManager.id,
      sortOrder: 1,
    },
  ]).returning();

  await db.insert(teamMembersTable).values([
    {
      name: "Gugulethu Makhanya",
      title: "Assistant Accountant",
      bio: "Gugulethu supports accurate accounting records, reconciliations, and day-to-day client compliance work.",
      email: "gugulethu@dithetoaccountants.co.za",
      phone: null,
      level: "team",
      accent: "teal",
      parentId: branchManagers[0].id,
      sortOrder: 0,
    },
    {
      name: "Siphiwe Khoza",
      title: "Assistant Accountant",
      bio: "Siphiwe keeps day-to-day accounting details in order so clients can focus on serving customers and growing their businesses.",
      email: "siphiwe@dithetoaccountants.co.za",
      phone: null,
      level: "team",
      accent: "gold",
      parentId: branchManagers[0].id,
      sortOrder: 1,
    },
    {
      name: "Reneilwe Nkadimeng",
      title: "Assistant Accountant",
      bio: "Reneilwe supports client accounting and compliance work with careful recordkeeping and responsive follow-through.",
      email: "reneilwe@dithetoaccountants.co.za",
      phone: null,
      level: "team",
      accent: "teal",
      parentId: branchManagers[0].id,
      sortOrder: 2,
    },
    {
      name: "Mbali Khoza",
      title: "Assistant Accountant",
      bio: "Mbali supports daily financial processing, maintains accurate records, and assists with compliant accounting administration.",
      email: "mbali@dithetoaccountants.co.za",
      phone: null,
      level: "team",
      accent: "teal",
      parentId: branchManagers[0].id,
      sortOrder: 3,
    },
    {
      name: "Rukudzo Chatendeuka",
      title: "Assistant Accountant",
      bio: "Rukudzo assists with bookkeeping, reconciliations, and the preparation of accurate client accounting records.",
      email: "rukudzo@dithetoaccountants.co.za",
      phone: null,
      level: "team",
      accent: "teal",
      parentId: branchManagers[0].id,
      sortOrder: 4,
    },
    {
      name: "Yanga Mzantsi",
      title: "Assistant Accountant",
      bio: "Yanga supports Secunda clients with accurate accounting administration and dependable day-to-day financial processing.",
      email: "yanga@dithetoaccountants.co.za",
      phone: null,
      level: "team",
      accent: "teal",
      parentId: branchManagers[1].id,
      sortOrder: 0,
    },
  ]);
}

router.get("/team-members", async (_req: Request, res: Response): Promise<void> => {
  await seedTeamIfEmpty();
  const members = await db.select().from(teamMembersTable)
    .orderBy(asc(teamMembersTable.sortOrder), asc(teamMembersTable.id));
  res.json(ListTeamMembersResponse.parse(members.map(toResponse)));
});

router.get("/team-members/:teamMemberId/photo", async (req: Request, res: Response): Promise<void> => {
  const params = GetTeamMemberPhotoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid employee ID" });
    return;
  }
  const [member] = await db.select({ imageObjectPath: teamMembersTable.imageObjectPath })
    .from(teamMembersTable)
    .where(eq(teamMembersTable.id, params.data.teamMemberId))
    .limit(1);
  if (!member?.imageObjectPath) {
    res.status(404).json({ error: "Profile photo not found" });
    return;
  }
  try {
    const file = await storage.getObjectEntityFile(member.imageObjectPath);
    const response = await storage.downloadObject(file, 3600);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body) {
      Readable.fromWeb(response.body as ReadableStream<Uint8Array>).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Profile photo not found" });
      return;
    }
    req.log.error({ err: error, teamMemberId: params.data.teamMemberId }, "Unable to serve team profile photo");
    res.status(500).json({ error: "Unable to serve profile photo" });
  }
});

router.post("/admin/team-members", requireFullAccess, async (req: Request, res: Response): Promise<void> => {
  const body = CreateTeamMemberBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid employee profile" });
    return;
  }
  const [member] = await db.insert(teamMembersTable).values(body.data).returning();
  res.status(201).json(CreateTeamMemberResponse.parse(toResponse(member)));
});

router.patch("/admin/team-members/:teamMemberId", requireFullAccess, async (req: Request, res: Response): Promise<void> => {
  const params = UpdateTeamMemberParams.safeParse(req.params);
  const body = UpdateTeamMemberBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid employee profile update" });
    return;
  }

  const [existing] = await db.select().from(teamMembersTable)
    .where(eq(teamMembersTable.id, params.data.teamMemberId)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Employee profile not found" });
    return;
  }

  const [member] = await db.update(teamMembersTable).set(body.data)
    .where(eq(teamMembersTable.id, params.data.teamMemberId)).returning();

  if (existing.imageObjectPath && body.data.imageObjectPath !== undefined && body.data.imageObjectPath !== existing.imageObjectPath) {
    try {
      const oldPhoto = await storage.getObjectEntityFile(existing.imageObjectPath);
       await storage.deleteObject(oldPhoto);
    } catch (error) {
      req.log.warn({ err: error, teamMemberId: existing.id }, "Employee updated but previous profile photo cleanup failed");
    }
  }

  res.json(UpdateTeamMemberResponse.parse(toResponse(member)));
});

router.delete("/admin/team-members/:teamMemberId", requireFullAccess, async (req: Request, res: Response): Promise<void> => {
  const params = DeleteTeamMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid employee ID" });
    return;
  }
  const [member] = await db.delete(teamMembersTable)
    .where(eq(teamMembersTable.id, params.data.teamMemberId)).returning();
  if (!member) {
    res.status(404).json({ error: "Employee profile not found" });
    return;
  }
  await db.update(teamMembersTable).set({ parentId: null })
    .where(eq(teamMembersTable.parentId, member.id));
  if (member.imageObjectPath) {
    try {
      const photo = await storage.getObjectEntityFile(member.imageObjectPath);
       await storage.deleteObject(photo);
    } catch (error) {
      req.log.warn({ err: error, teamMemberId: member.id }, "Employee deleted but profile photo cleanup failed");
    }
  }
  res.sendStatus(204);
});

export default router;