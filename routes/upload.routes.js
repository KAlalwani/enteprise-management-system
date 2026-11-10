const router = require('express').Router()
const { UPLOAD_DIR } = require('../middleware/upload')

router.get('/:filename', (req, res, next) => {
  if (!/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(req.params.filename)) return next()
  res.set('X-Content-Type-Options', 'nosniff')
  res.sendFile(req.params.filename, { root: UPLOAD_DIR }, err => {
    if (err && !res.headersSent) next()
  })
})

module.exports = router