import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const petsTable = pgTable("pets", {
  id: text("id").primaryKey(),
  claimed: boolean("claimed").notNull().default(false),
  name: text("name"),
  species: text("species"),
  breed: text("breed"),
  description: text("description"),
  ownerName: text("owner_name"),
  ownerPhone: text("owner_phone"),
  photoObjectPath: text("photo_object_path"),
  pinHash: text("pin_hash"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
});

export const insertPetSchema = createInsertSchema(petsTable).omit({
  createdAt: true,
});
export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof petsTable.$inferSelect;
