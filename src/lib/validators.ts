// Schémas de validation Zod partagés
import { z } from "zod";

// Validation du mot de passe : min 12 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
export const passwordSchema = z
  .string()
  .min(12, "Le mot de passe doit contenir au moins 12 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(
    /[^A-Za-z0-9]/,
    "Le mot de passe doit contenir au moins un caractère spécial"
  );

// Schéma d'inscription
export const registerSchema = z
  .object({
    email: z.string().email("Adresse email invalide"),
    password: passwordSchema,
    confirmPassword: z.string(),
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Schéma de connexion
export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Schéma de demande de réinitialisation de mot de passe
export const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

// Schéma de réinitialisation de mot de passe
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token requis"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Schéma de mise à jour du profil
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100)
    .optional()
    .nullable(),
});

// Schéma de création/édition de vidéo
export const videoSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
  description: z.string().optional().nullable(),
  status: z.enum(["PUBLIC", "PREMIUM", "DRAFT"]),
  source: z.enum(["YOUTUBE", "EXCLUSIVE"]),
  youtubeId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

// Schéma pour les commentaires
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Le commentaire ne peut pas être vide")
    .max(2000, "Le commentaire ne peut pas dépasser 2000 caractères"),
  videoId: z.string().cuid("ID vidéo invalide"),
});

// Schéma pour l'inscription à la newsletter
export const newsletterSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

// Schéma de pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});

// Schéma de recherche de vidéos
export const videoSearchSchema = paginationSchema.extend({
  q: z.string().optional(),
  tag: z.string().optional(),
  status: z.enum(["PUBLIC", "PREMIUM", "DRAFT"]).optional(),
  source: z.enum(["YOUTUBE", "EXCLUSIVE"]).optional(),
  sort: z.enum(["date", "views", "title"]).optional().default("date"),
});
