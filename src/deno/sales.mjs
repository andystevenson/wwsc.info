import { date } from './dates.mjs'

export const salesToday = (purchases = []) => {
  const today = date()
  return purchases.reduce((total, purchase) => {
    const { amount, timestamp } = purchase
    const purchaseDate = date(timestamp)
    if (purchaseDate.isSame(today, 'day')) total = total + amount / 100
    return total
  }, 0)
}

export const salesMonthToDate = (purchases = []) => {
  const today = date()
  return purchases.reduce((total, purchase) => {
    const { amount, timestamp } = purchase
    const purchaseDate = date(timestamp)
    if (purchaseDate.isSame(today, 'month')) total = total + amount / 100
    return total
  }, 0)
}

// ytd assumes all the sales are for the current 'financial' year
export const salesYearToDate = (purchases = []) => {
  const today = date()
  return purchases.reduce((total, purchase) => {
    const { amount } = purchase
    total = total + amount / 100
    return total
  }, 0)
}
