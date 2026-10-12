import { describe, expect, it } from "vitest";
import { createAccountSchema, editAccountSchema, isValidCpf, loginSchema } from "@/lib/account-validation";
describe("CPF account validation", () => {
  it("rejects invalid CPF digits", () => { expect(isValidCpf("11111111111")).toBe(false); expect(isValidCpf("52998224724")).toBe(false); });
  it("normalizes a valid CPF", () => { expect(loginSchema.parse({ cpf: "529.982.247-25", password: "secret" }).cpf).toBe("52998224725"); });
  it("requires a full name and strong length", () => { expect(createAccountSchema.safeParse({ cpf: "52998224725", fullName: "Ana", password: "short" }).success).toBe(false); });
  it("permits unchanged passwords but not empty names", () => { const id = "12345678-1234-4234-8234-123456789012"; expect(editAccountSchema.safeParse({ id, fullName: "Ana Silva", password: "" }).success).toBe(true); expect(editAccountSchema.safeParse({ id, fullName: " ", password: "" }).success).toBe(false); });
});