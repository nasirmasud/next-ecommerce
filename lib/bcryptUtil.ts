export async function comparePasswords(plainText: string, hashed: string) {
  const { compareSync } = await import("bcrypt-ts-edge");
  return compareSync(plainText, hashed);
}
