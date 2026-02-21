// Tests unitaires — schémas de validation Zod
import { describe, it, expect } from "vitest";
import {
  passwordSchema,
  registerSchema,
  loginSchema,
  commentSchema,
} from "@/lib/validators";

describe("passwordSchema", () => {
  it("accepte un mot de passe valide", () => {
    expect(passwordSchema.safeParse("MonMotDePasse123!").success).toBe(true);
  });

  it("rejette un mot de passe trop court", () => {
    const result = passwordSchema.safeParse("Court1!");
    expect(result.success).toBe(false);
  });

  it("rejette un mot de passe sans majuscule", () => {
    const result = passwordSchema.safeParse("monmotdepasse123!");
    expect(result.success).toBe(false);
  });

  it("rejette un mot de passe sans chiffre", () => {
    const result = passwordSchema.safeParse("MonMotDePasse!!!");
    expect(result.success).toBe(false);
  });

  it("rejette un mot de passe sans caractère spécial", () => {
    const result = passwordSchema.safeParse("MonMotDePasse123");
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validData = {
    email: "test@exemple.fr",
    password: "MonPassword123!",
    confirmPassword: "MonPassword123!",
    name: "Chris",
  };

  it("accepte des données valides", () => {
    expect(registerSchema.safeParse(validData).success).toBe(true);
  });

  it("rejette un email invalide", () => {
    const result = registerSchema.safeParse({ ...validData, email: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejette si les mots de passe ne correspondent pas", () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: "AutreMotDePasse456@",
    });
    expect(result.success).toBe(false);
  });

  it("accepte sans nom (optionnel)", () => {
    const { name, ...withoutName } = validData;
    expect(registerSchema.safeParse(withoutName).success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("accepte des identifiants valides", () => {
    const result = loginSchema.safeParse({
      email: "test@exemple.fr",
      password: "n'importe quoi",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un email invalide", () => {
    const result = loginSchema.safeParse({
      email: "invalid",
      password: "password",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un mot de passe vide", () => {
    const result = loginSchema.safeParse({
      email: "test@exemple.fr",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("commentSchema", () => {
  it("accepte un commentaire valide", () => {
    const result = commentSchema.safeParse({
      content: "Super vidéo !",
      videoId: "clwxyz123456789012345",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un commentaire vide", () => {
    const result = commentSchema.safeParse({
      content: "",
      videoId: "clwxyz123456789012345",
    });
    expect(result.success).toBe(false);
  });
});
