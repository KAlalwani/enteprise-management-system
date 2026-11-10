const multer = require('multer')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// extension comes from the mimetype, never from the user's filename
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) =>
      cb(null, crypto.randomBytes(16).toString('hex') + EXT[file.mimetype])
  }),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (EXT[file.mimetype]) return cb(null, true)
    const err = new Error('Only JPG, PNG or WebP images are allowed.')
    err.status = 400
    cb(err)
  }
})

async function removeFile(name) {
  if (!name || !/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(name)) return
  await fs.promises.unlink(path.join(UPLOAD_DIR, name)).catch(() => {})
}

module.exports = { upload, removeFile, UPLOAD_DIR }