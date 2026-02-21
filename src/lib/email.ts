// Service d'email via Resend
import { Resend } from "resend";

// Initialisé lazily pour éviter les erreurs à la compilation sans clé API
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@lesvideosdechris.fr";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Email de vérification de l'adresse email à l'inscription
export async function sendVerificationEmail(params: {
  to: string;
  token: string;
  name?: string | null;
}): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${params.token}`;
  const displayName = params.name || "Cher utilisateur";

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: "Vérifiez votre adresse email — Les Vidéos de Chris",
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"><title>Vérification email</title></head>
      <body style="font-family: Inter, Arial, sans-serif; background: #0a0a0f; color: #f1f5f9; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #12121a; border-radius: 12px; padding: 40px; border: 1px solid #1e293b;">
          <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 24px;">Les Vidéos de Chris</h1>
          <h2 style="font-size: 20px; margin-bottom: 16px;">Confirmez votre adresse email</h2>
          <p style="color: #94a3b8; margin-bottom: 24px;">Bonjour ${displayName},</p>
          <p style="color: #94a3b8; margin-bottom: 32px;">
            Merci de vous être inscrit(e) sur Les Vidéos de Chris.
            Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.
          </p>
          <a href="${verifyUrl}" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin-bottom: 32px;">
            Confirmer mon email
          </a>
          <p style="color: #64748b; font-size: 14px;">
            Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.
          </p>
          <hr style="border-color: #1e293b; margin: 24px 0;">
          <p style="color: #475569; font-size: 12px;">
            Si le bouton ne fonctionne pas, copiez ce lien : ${verifyUrl}
          </p>
        </div>
      </body>
      </html>
    `,
  });
}

// Email de réinitialisation de mot de passe
export async function sendPasswordResetEmail(params: {
  to: string;
  token: string;
  name?: string | null;
}): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${params.token}`;
  const displayName = params.name || "Cher utilisateur";

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: "Réinitialisez votre mot de passe — Les Vidéos de Chris",
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"><title>Réinitialisation mot de passe</title></head>
      <body style="font-family: Inter, Arial, sans-serif; background: #0a0a0f; color: #f1f5f9; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #12121a; border-radius: 12px; padding: 40px; border: 1px solid #1e293b;">
          <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 24px;">Les Vidéos de Chris</h1>
          <h2 style="font-size: 20px; margin-bottom: 16px;">Réinitialisation de mot de passe</h2>
          <p style="color: #94a3b8; margin-bottom: 24px;">Bonjour ${displayName},</p>
          <p style="color: #94a3b8; margin-bottom: 32px;">
            Vous avez demandé la réinitialisation de votre mot de passe.
            Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin-bottom: 32px;">
            Réinitialiser mon mot de passe
          </a>
          <p style="color: #64748b; font-size: 14px;">
            Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
        </div>
      </body>
      </html>
    `,
  });
}

// Email de confirmation de suppression de compte
export async function sendAccountDeletionEmail(params: {
  to: string;
  name?: string | null;
}): Promise<void> {
  const displayName = params.name || "Cher utilisateur";

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: "Demande de suppression de compte — Les Vidéos de Chris",
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"><title>Suppression de compte</title></head>
      <body style="font-family: Inter, Arial, sans-serif; background: #0a0a0f; color: #f1f5f9; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #12121a; border-radius: 12px; padding: 40px; border: 1px solid #1e293b;">
          <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 24px;">Les Vidéos de Chris</h1>
          <h2 style="font-size: 20px; margin-bottom: 16px; color: #ef4444;">Suppression de votre compte</h2>
          <p style="color: #94a3b8; margin-bottom: 24px;">Bonjour ${displayName},</p>
          <p style="color: #94a3b8; margin-bottom: 24px;">
            Nous avons bien pris en compte votre demande de suppression de compte.
          </p>
          <p style="color: #94a3b8; margin-bottom: 32px;">
            Votre compte et toutes vos données seront définitivement supprimés dans <strong style="color: #f1f5f9;">30 jours</strong>.
            Si vous changez d'avis, contactez-nous avant cette date.
          </p>
          <p style="color: #64748b; font-size: 14px;">
            Pour toute question : contact@lesvideosdechris.fr
          </p>
        </div>
      </body>
      </html>
    `,
  });
}

// Notification admin (compte verrouillé par brute force)
export async function sendAdminSecurityAlert(params: {
  email: string;
  ip: string;
  attempts: number;
}): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: "[SÉCURITÉ] Compte verrouillé après tentatives multiples",
    html: `
      <p>Un compte a été verrouillé après ${params.attempts} tentatives échouées.</p>
      <ul>
        <li>Email : ${params.email}</li>
        <li>IP : ${params.ip}</li>
        <li>Heure : ${new Date().toLocaleString("fr-FR")}</li>
      </ul>
    `,
  });
}
