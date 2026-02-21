import { RegisterForm } from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte Les Vidéos de Chris gratuitement.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
