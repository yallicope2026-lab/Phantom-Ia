import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }
  const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
  const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) {
    await react('❌')
    return conn.reply(m.chat, head + `\n⤷ ┇ 𝐔𝐏𝐋𝐎𝐀𝐃𝐄𝐑 ﹒ USO ：✿ 。\n\n➛ Responde a una *imagen, video, audio o documento* para subirlo. ❄️` + foot, m)
  }

  try {
    await react('⏳')
    let media = await q.download()
    if (!media || !media.length) throw new Error('No se pudo descargar el archivo')
    if (media.length > 200 * 1024 * 1024) throw new Error(`Archivo muy pesado (${formatBytes(media.length)}), máximo 200MB`)

    // Intenta Catbox (permanente) y si falla usa evogb (temporal)
    let link
    try { link = await catboxUpload(media) } catch { link = await myCloud(media) }

    let txt = head + `\n⤷ ┇ 𝐔𝐏𝐋𝐎𝐀𝐃𝐄𝐑 ﹒ COMPLETADO ：✿ 。\n\n.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` ❄️ —˙𖦹.꒷\n\n── *📊 DATOS* ╏ ❄️\n🔗 ➛ ${link}\n📦 ➛ ${formatBytes(media.length)}\n🖥️ ➛ catbox.moe (PERMANENTE)` + foot

    await react('❄️')
    await conn.reply(m.chat, txt, m)
  } catch (e) {
    await react('❌')
    await conn.reply(m.chat, head + `\n❌ Error al subir el archivo.\n\n➛ ${e.message || e}` + foot, m)
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

// CATBOX = PERMANENTE, NO SE BORRA
async function catboxUpload(content) {
  const fileType = await fileTypeFromBuffer(content)
  const ext = fileType ? fileType.ext : 'bin'
  const mime = fileType ? fileType.mime : 'application/octet-stream'
  const formData = new FormData()
  formData.append("reqtype", "fileupload")
  formData.append("fileToUpload", new Blob([content], { type: mime }), `${crypto.randomBytes(5).toString("hex")}.${ext}`)
  const res = await fetch("https://catbox.moe/user/api.php", { method: "POST", body: formData })
  if (!res.ok) throw new Error('Error en Catbox')
  const url = await res.text()
  if (!url.startsWith('https://')) throw new Error('Error en Catbox')
  return url
}

async function myCloud(content) {
  const fileType = await fileTypeFromBuffer(content)
  const ext = fileType ? fileType.ext : 'bin'
  const mime = fileType ? fileType.mime : 'application/octet-stream'
  const formData = new FormData()
  formData.append("file", new Blob([content], { type: mime }), `${crypto.randomBytes(5).toString("hex")}.${ext}`)
  const response = await fetch("https://evogb.win/api/upload", { method: "POST", body: formData })
  if (!response.ok) throw new Error('Error en el servidor')
  let j = await response.json()
  return j.url
}

handler.help = ['upp', 'tourl'];
handler.tags = ['tools'];
handler.command = ['upp', 'tourl'];
export default handler