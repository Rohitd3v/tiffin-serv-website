/**
 * Sends an OTP as a WhatsApp text through Meta when configured. Strips phone
 * punctuation and prefixes 10-digit numbers with India's country code (91).
 * Returns { ok: false, error } for HTTP failures or caught request errors.
 * Without Meta configuration, prints the OTP locally and returns { ok: true }
 * without sending a message. The message advertises a five-minute lifetime;
 * this helper does not store or expire the code.
 */

export async function sendWhatsAppOtp(
  phone: string,
  otpCode: string
): Promise<{ ok: boolean; error?: string }> {
  const provider = process.env.WHATSAPP_PROVIDER || "meta";
  const metaToken = process.env.META_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  // Clean phone number (strip spaces, symbols; ensure standard digits e.g. 919876543210)
  let cleanPhone = phone.replace(/[^0-9]/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = "91" + cleanPhone;
  }

  const messageText = `Mom's Kitchen 🍲: Your menu voting verification code is *${otpCode}*. It is valid for 5 minutes. Enter this code to cast your vote!`;

  if (provider === "meta" && metaToken && phoneNumberId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${metaToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "text",
          text: {
            preview_url: false,
            body: messageText,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn("Meta WhatsApp API error:", errorData);
        return { ok: false, error: "Failed to send WhatsApp message via Meta API" };
      }

      return { ok: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      console.warn("Error calling Meta Cloud API:", message);
      return { ok: false, error: message };
    }
  }

  // Development fallback: Log OTP to console
  console.log(`\n[DEV WHATSAPP OTP] To: ${cleanPhone} | Code: ${otpCode} | Message: ${messageText}\n`);
  return { ok: true };
}
