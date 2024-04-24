// updated to drive new node version for lambda functions

import { date, tz, todayUK } from './dates.mjs'

export const salesToday = (purchases = []) => {
  return purchases.reduce((total, purchase) => {
    const { amount, timestamp } = purchase
    const purchaseDate = date(timestamp).tz(tz)
    if (purchaseDate.isSame(todayUK, 'day')) total = total + amount / 100
    return total
  }, 0)
}

export const salesMonthToDate = (purchases = []) => {
  return purchases.reduce((total, purchase) => {
    const { amount, timestamp } = purchase
    const purchaseDate = date(timestamp).tz(tz)
    if (purchaseDate.isSame(todayUK, 'month')) total = total + amount / 100
    return total
  }, 0)
}

// ytd assumes all the sales are for the current 'financial' year
export const salesYearToDate = (purchases = []) => {
  return purchases.reduce((total, purchase) => {
    const { amount } = purchase
    total = total + amount / 100
    return total
  }, 0)
}
