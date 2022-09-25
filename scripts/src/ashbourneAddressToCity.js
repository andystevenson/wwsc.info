const transform = (address) => {
  if (/solihull/i.test(address)) return 'Solihull'
  if (/birmingham/i.test(address)) return 'Birmingham'
  if (/coventry/i.test(address)) return 'Coventry'
  if (/knowle/i.test(address)) return 'Solihull'
  if (/lapworth/i.test(address)) return 'Solihull'
  if (/yardley/i.test(address)) return 'Birmingham'
  if (/malvern/i.test(address)) return 'Malvern'
  if (/moseley/i.test(address)) return 'Moseley'
  if (/olton/i.test(address)) return 'Solihull'
  if (/halesowen/i.test(address)) return 'Halesowen'
  if (/sutton/i.test(address)) return 'Sutton Coldfield'
  if (/redditch/i.test(address)) return 'Redditch'
  if (/hall green/i.test(address)) return 'Birmingham'
  if (/lapworth/i.test(address)) return 'Solihull'
  if (/stratform upon avon/i.test(address)) return 'Stratford-Upon-Avon'
  if (/henley in arden/i.test(address)) return 'Henley-in-Arden'
  if (/stourport on severn/i.test(address)) return 'Stourport-on-Severn'
  if (/stourport-on-severn/i.test(address)) return 'Stourport-on-Severn'
  if (/claverdon/i.test(address)) return 'Claverdon'

  return 'Solihull'
}

module.exports = transform
