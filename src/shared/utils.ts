import crypto from "crypto";

/**
 * Generates a random alphanumeric password of a given length.
 * Defaults to 6 characters as requested by the user.
 */
export function generateRandomPassword(length: number = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded confusing chars like O, 0, I, 1
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return password;
}
