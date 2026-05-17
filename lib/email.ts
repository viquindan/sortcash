import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(
  to: string,
  token: string,
  lang: "es" | "en" = "es"
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sortcash.org";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  const subject =
    lang === "es"
      ? "Restablecer tu contraseña — Sort Cash"
      : "Reset your password — Sort Cash";

  const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;border:1px solid #E1E7EF;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#0F172A;padding:28px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:-0.5px;">
                Sort<span style="color:#60A5FA;">Cash</span>
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:44px 40px 32px;">
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#0F172A;line-height:1.2;">
                ${lang === "es" ? "Restablecer contraseña" : "Reset your password"}
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#64748B;line-height:1.6;">
                ${
                  lang === "es"
                    ? "Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña."
                    : "We received a request to reset the password for your account. Click the button below to create a new password."
                }
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#1B3F8B;border-radius:10px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:10px;">
                      ${lang === "es" ? "Restablecer contraseña" : "Reset password"}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry note -->
              <p style="margin:0 0 24px;font-size:13px;color:#94A3B8;line-height:1.5;">
                ${
                  lang === "es"
                    ? "⏱ Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, puedes ignorar este correo."
                    : "⏱ This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email."
                }
              </p>

              <!-- Fallback URL -->
              <div style="background:#F8FAFC;border-radius:8px;padding:16px;border:1px solid #E1E7EF;">
                <p style="margin:0 0 6px;font-size:12px;color:#94A3B8;">
                  ${lang === "es" ? "O copia este enlace en tu navegador:" : "Or copy this link to your browser:"}
                </p>
                <p style="margin:0;font-size:12px;color:#1B3F8B;word-break:break-all;">${resetUrl}</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #E1E7EF;">
              <p style="margin:0;font-size:12px;color:#94A3B8;text-align:center;line-height:1.6;">
                © 2025 Sort Cash · <a href="${appUrl}/terms" style="color:#1B3F8B;text-decoration:none;">
                  ${lang === "es" ? "Términos y Condiciones" : "Terms & Conditions"}
                </a>
                <br />info@sortcash.org
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Sort Cash" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
