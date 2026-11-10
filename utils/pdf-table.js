function drawTable(doc, columns, rows) {
  const startX = doc.page.margins.left
  const rowH = 20
  const bottom = () => doc.page.height - doc.page.margins.bottom
  const totalWidth = columns.reduce((sum, c) => sum + c.width, 0)

  const cell = (text, c, x, y) =>
    doc.text(String(text ?? ''), x, y, {
      width: c.width - 6, height: 14, ellipsis: true, align: c.align || 'left'
    })

  const header = () => {
    const y = doc.y
    let x = startX
    doc.font('Helvetica-Bold').fontSize(10)
    columns.forEach(c => { cell(c.label, c, x, y); x += c.width })
    doc.moveTo(startX, y + 15).lineTo(startX + totalWidth, y + 15).stroke()
    doc.y = y + rowH
    doc.font('Helvetica')
  }

  header()
  rows.forEach(row => {
    if (doc.y + rowH > bottom()) { doc.addPage(); header() }
    const y = doc.y
    let x = startX
    columns.forEach(c => { cell(row[c.key], c, x, y); x += c.width })
    doc.y = y + rowH
  })
  doc.x = startX
}

module.exports = { drawTable }