import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactRequestBody = {
  name: string;
  email: string;
  msg: string;
};

type ContactResponse = { ok: true } | { ok: false; error: string };

export async function POST(request: Request) {
  const body = (await request.json()) as ContactRequestBody;
  const name = body.name?.trim();
  const email = body.email?.trim();
  const msg = body.msg?.trim();

  if (!name || !email || !msg || !EMAIL_RE.test(email)) {
    const response: ContactResponse = { ok: false, error: "Datos inválidos." };
    return Response.json(response, { status: 400 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: "Arcade Vault <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL as string,
      replyTo: email,
      subject: `Nuevo mensaje de ${name}`,
      text: msg,
    });

    if (error) {
      const response: ContactResponse = { ok: false, error: error.message };
      return Response.json(response, { status: 500 });
    }

    const response: ContactResponse = { ok: true };
    return Response.json(response);
  } catch {
    const response: ContactResponse = { ok: false, error: "No se pudo enviar el mensaje." };
    return Response.json(response, { status: 500 });
  }
}
