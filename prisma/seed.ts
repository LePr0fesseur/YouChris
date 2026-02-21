// Script de seed de la base de données
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Démarrage du seed...");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL est requis dans les variables d'environnement");
  }

  // Génération d'un mot de passe admin initial
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || generatePassword();
  const passwordHash = await bcrypt.hash(initialPassword, 12);

  // Création du compte admin
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: "Chris",
      role: "ADMIN",
      emailVerified: true,
    },
  });

  console.log(`✅ Admin créé : ${admin.email}`);
  if (!process.env.ADMIN_INITIAL_PASSWORD) {
    console.log(`🔑 Mot de passe initial : ${initialPassword}`);
    console.log("⚠️  Changez ce mot de passe immédiatement après la première connexion !");
  }

  // Création de quelques tags de base
  const defaultTags = [
    { name: "Cybersécurité", slug: "cybersecurite" },
    { name: "Hardware", slug: "hardware" },
    { name: "Tutoriel", slug: "tutoriel" },
    { name: "Gaming", slug: "gaming" },
    { name: "Linux", slug: "linux" },
    { name: "CTF", slug: "ctf" },
    { name: "Réseau", slug: "reseau" },
    { name: "Programmation", slug: "programmation" },
  ];

  for (const tag of defaultTags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  console.log(`✅ ${defaultTags.length} tags créés`);

  // Synchronisation YouTube si la clé API est disponible
  if (process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_CHANNEL_ID) {
    console.log("🎬 Synchronisation YouTube...");
    try {
      const { syncYouTubeVideos } = await import("../src/lib/youtube");
      const report = await syncYouTubeVideos();
      console.log(`✅ YouTube sync : ${report.created} créées, ${report.updated} mises à jour`);
    } catch (error) {
      console.error("⚠️  Erreur sync YouTube (non bloquante):", error);
    }
  } else {
    console.log("ℹ️  Clés YouTube manquantes, sync ignorée");
  }

  console.log("✅ Seed terminé !");
}

// Générateur de mot de passe sécurisé
function generatePassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*()_+";
  const all = upper + lower + digits + special;

  let password = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  for (let i = 4; i < 16; i++) {
    password.push(all[Math.floor(Math.random() * all.length)]);
  }

  // Mélange du tableau
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
