import { z } from "zod";

export function maskCpf(value: string) {
  return value.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
export function isValidCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const check = (size: number) => {
    const sum = [...digits.slice(0, size)].reduce((total, digit, index) => total + Number(digit) * (size + 1 - index), 0);
    return ((sum * 10) % 11) % 10 === Number(digits[size]);
  };
  return check(9) && check(10);
}
export const cpfSchema = z.string().max(14).transform(value => value.replace(/\D/g, "")).refine(isValidCpf, "Digite um CPF válido.");
export const nameSchema = z.string().trim().min(3, "Informe o nome completo.").max(150).refine(value => value.split(/\s+/).length >= 2, "Informe nome e sobrenome.");
export const passwordSchema = z.string().min(8, "A senha deve ter pelo menos 8 caracteres.").max(128);
export const loginSchema = z.object({ cpf: cpfSchema, password: z.string().min(1, "Informe a senha.").max(128) });
export const sexoSchema = z.enum(["", "M", "F"]);
export const createAccountSchema = z.object({ cpf: cpfSchema, fullName: nameSchema, password: passwordSchema, category: z.string().trim().max(20).default(""), uf: z.string().trim().max(2).default(""), validade: z.string().trim().max(20).default(""), emissao: z.string().trim().max(20).default(""), sexo: sexoSchema.default("") });
export const editAccountSchema = z.object({ id: z.string().uuid(), fullName: nameSchema, password: z.union([z.literal(""), passwordSchema]), category: z.string().trim().max(20).default(""), uf: z.string().trim().max(2).default(""), validade: z.string().trim().max(20).default(""), emissao: z.string().trim().max(20).default(""), sexo: sexoSchema.default("") });
export function accountEmail(cpf: string) { return `${cpf}@accounts.app.local`; }