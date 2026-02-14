import type { ReactElement } from "react";
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

type EmailAttachment = {
  filename: string;
  content: Buffer;
};

export const sendEmail = async ({
  to,
  subject,
  react,
  attachments,
}: {
  to: string;
  subject: string;
  react: ReactElement;
  attachments?: EmailAttachment[];
}) => {
  console.log("🔍 Tentando enviar email para:", to);
  console.log("🔍 API Key configurada:", !!process.env.RESEND_API_KEY);
  console.log("🔍 Subject:", subject);

  try {
    const result = await resend.emails.send({
      from: "Sm Grow <no-reply@studiomontenegro.com.br>",
      to,
      subject,
      react,
      attachments,
    });

    console.log("✅ Email enviado com sucesso!", result);
    return result;
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    throw error;
  }
};
