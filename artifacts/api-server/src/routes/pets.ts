import { Router, type IRouter, type Request, type Response } from "express";
import { and, eq } from "drizzle-orm";
import { db, petsTable } from "@workspace/db";
import {
  CreatePetTagResponse,
  GetPetTagParams,
  GetPetTagResponse,
  ClaimPetTagParams,
  ClaimPetTagBody,
  ClaimPetTagResponse,
  UpdatePetTagParams,
  UpdatePetTagBody,
  UpdatePetTagResponse,
  VerifyPetPinParams,
  VerifyPetPinBody,
  VerifyPetPinResponse,
} from "@workspace/api-zod";
import { generateTagId } from "../lib/tagId";
import { hashPin, verifyPin } from "../lib/pin";
import {
  checkPinLockout,
  clearPinAttempts,
  recordFailedPinAttempt,
} from "../lib/pinRateLimit";

const router: IRouter = Router();

type PetRow = typeof petsTable.$inferSelect;

function toPublicPet(pet: PetRow) {
  return {
    id: pet.id,
    claimed: pet.claimed,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    description: pet.description,
    ownerName: pet.ownerName,
    ownerPhone: pet.ownerPhone,
    photoObjectPath: pet.photoObjectPath,
    createdAt: pet.createdAt,
    claimedAt: pet.claimedAt,
  };
}

router.post("/pets", async (req: Request, res: Response): Promise<void> => {
  // Retry on the rare id collision instead of trusting a single random draw.
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = generateTagId();
    try {
      const [pet] = await db
        .insert(petsTable)
        .values({ id, claimed: false })
        .returning();
      res.status(201).json(CreatePetTagResponse.parse(toPublicPet(pet)));
      return;
    } catch (error) {
      const isUniqueViolation =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "23505";
      if (!isUniqueViolation) {
        throw error;
      }
      req.log.warn({ id }, "Tag id collision, retrying");
    }
  }
  req.log.error("Failed to generate a unique tag id after 5 attempts");
  res.status(500).json({ error: "Failed to create tag" });
});

router.get(
  "/pets/:tagId",
  async (req: Request, res: Response): Promise<void> => {
    const params = GetPetTagParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [pet] = await db
      .select()
      .from(petsTable)
      .where(eq(petsTable.id, params.data.tagId));

    if (!pet) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    res.json(GetPetTagResponse.parse(toPublicPet(pet)));
  },
);

router.post(
  "/pets/:tagId/claim",
  async (req: Request, res: Response): Promise<void> => {
    const params = ClaimPetTagParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = ClaimPetTagBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { pin, ...rest } = parsed.data;

    // Atomic claim: the update itself is gated on claimed=false, so two
    // concurrent claim attempts on the same tag can't both succeed.
    const [pet] = await db
      .update(petsTable)
      .set({
        ...rest,
        claimed: true,
        pinHash: hashPin(pin),
        claimedAt: new Date(),
      })
      .where(
        and(eq(petsTable.id, params.data.tagId), eq(petsTable.claimed, false)),
      )
      .returning();

    if (pet) {
      res.json(ClaimPetTagResponse.parse(toPublicPet(pet)));
      return;
    }

    const [existing] = await db
      .select()
      .from(petsTable)
      .where(eq(petsTable.id, params.data.tagId));

    if (!existing) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    res.status(409).json({ error: "This tag has already been claimed" });
  },
);

router.post(
  "/pets/:tagId/verify-pin",
  async (req: Request, res: Response): Promise<void> => {
    const params = VerifyPetPinParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = VerifyPetPinBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const ip = req.ip ?? "unknown";
    const lockoutMs = checkPinLockout(params.data.tagId, ip);
    if (lockoutMs !== null) {
      res.status(429).json({
        error: `Too many attempts. Try again in ${Math.ceil(lockoutMs / 1000)}s.`,
      });
      return;
    }

    const [pet] = await db
      .select()
      .from(petsTable)
      .where(eq(petsTable.id, params.data.tagId));

    if (!pet) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    const valid = Boolean(pet.pinHash) && verifyPin(parsed.data.pin, pet.pinHash!);
    if (valid) {
      clearPinAttempts(params.data.tagId, ip);
    } else {
      recordFailedPinAttempt(params.data.tagId, ip);
    }
    res.json(VerifyPetPinResponse.parse({ valid }));
  },
);

router.patch(
  "/pets/:tagId",
  async (req: Request, res: Response): Promise<void> => {
    const params = UpdatePetTagParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = UpdatePetTagBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const ip = req.ip ?? "unknown";
    const lockoutMs = checkPinLockout(params.data.tagId, ip);
    if (lockoutMs !== null) {
      res.status(429).json({
        error: `Too many attempts. Try again in ${Math.ceil(lockoutMs / 1000)}s.`,
      });
      return;
    }

    const [existing] = await db
      .select()
      .from(petsTable)
      .where(eq(petsTable.id, params.data.tagId));

    if (!existing || !existing.claimed || !existing.pinHash) {
      res.status(404).json({ error: "Tag not found or not yet claimed" });
      return;
    }

    const { pin, ...updates } = parsed.data;

    if (!verifyPin(pin, existing.pinHash)) {
      recordFailedPinAttempt(params.data.tagId, ip);
      res.status(403).json({ error: "Incorrect PIN" });
      return;
    }
    clearPinAttempts(params.data.tagId, ip);

    const [pet] = await db
      .update(petsTable)
      .set(updates)
      .where(eq(petsTable.id, params.data.tagId))
      .returning();

    res.json(UpdatePetTagResponse.parse(toPublicPet(pet)));
  },
);

export default router;
