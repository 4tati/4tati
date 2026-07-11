import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(pin, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPin(pin: string, storedHash: string): boolean {
  const [salt, derivedHex] = storedHash.split(":");
  if (!salt || !derivedHex) {
    return false;
  }
  const derived = scryptSync(pin, salt, KEY_LENGTH);
  const stored = Buffer.from(derivedHex, "hex");
  if (derived.length !== stored.length) {
    return false;
  }
  return timingSafeEqual(derived, stored);
}
