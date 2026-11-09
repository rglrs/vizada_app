/**
 * WhatsApp Integration Service via Open-WA (wa-automate)
 * Menggunakan Open-WA REST API service (default: http://localhost:8085)
 */

export function formatToWhatsAppId(phone: string): string {
  if (!phone) return ""
  
  // Hapus karakter non-digit kecuali jika sudah berakhiran @c.us
  if (phone.includes("@c.us")) return phone.trim()

  let clean = phone.replace(/[^0-9]/g, "")

  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1)
  } else if (clean.startsWith("8")) {
    clean = "62" + clean
  } else if (!clean.startsWith("62") && clean.length > 5) {
    clean = "62" + clean
  }

  return `${clean}@c.us`
}

export interface SendWhatsAppOptions {
  phone: string
  message: string
}

export async function sendWhatsAppMessage({ phone, message }: SendWhatsAppOptions) {
  const baseUrl = process.env.OPEN_WA_URL || "http://localhost:8085"
  const apiKey = process.env.OPEN_WA_API_KEY

  if (!phone || phone.trim() === "") {
    return { success: false, error: "Nomor WhatsApp tujuan kosong" }
  }

  const chatId = formatToWhatsAppId(phone)

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    }

    if (apiKey) {
      headers["api_key"] = apiKey
    }

    // Endpoint Open-WA v5.x menggunakan /api/messages/sendText
    const endpointV5 = `${baseUrl}/api/messages/sendText`
    const endpointLegacy = `${baseUrl}/sendText`

    const payload = {
      to: chatId,
      content: message,
      args: {
        to: chatId,
        content: message
      }
    }

    let response = await fetch(endpointV5, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000)
    })

    // Jika 404 pada endpoint v5, fallback ke endpoint legacy
    if (response.status === 404) {
      response = await fetch(endpointLegacy, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000)
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.warn(`[Open-WA] Gagal mengirim pesan ke ${chatId} (HTTP ${response.status}):`, errorText)
      return { success: false, error: errorText }
    }

    const data = await response.json().catch(() => ({}))
    console.log(`[Open-WA] Pesan sukses dikirim ke ${chatId}`)
    return { success: true, data }
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error)
    // Non-blocking: catat log peringatan, jangan lempar error agar transaksi DB tidak terganggu
    console.warn(`[Open-WA] Service Open-WA belum aktif atau tidak dapat dihubungi (${baseUrl}):`, errMessage)
    return { success: false, error: errMessage }
  }
}

