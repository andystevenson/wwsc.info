import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import { readFileSync, writeFileSync } from 'node:fs'

const CSVoptions = {
  columns: true,
  skipEmptyLines: true,
  skipRecordsWithError: true,
}

const SalesItemsFile = 'sales-items.csv'
const SalesPaymentsFile = 'sales-payments.csv'
const SalesItemsJSON = 'sales-items.json'
const SalesPaymentsJSON = 'sales-payments.json'

const Sales = {
  items: parse(readFileSync(SalesItemsFile), CSVoptions),
  payments: parse(readFileSync(SalesPaymentsFile), CSVoptions),
}

// merge items with payments

for (const item of Sales.items) {
  const id = item['Sale ID']
  const payment = Sales.payments.find((payment) => payment['Sale ID'] === id)

  const date = item['Sale Date']
  const time = item['Sale Time']
  const status = item['Order Status']
  const register = item.Register
  const staff = item.Staff
  const product = item['Product ID']
  const name = item['Product Name']
  const category = item.Category
  const type = item['Item Type']
  const quantity = +item.Quantity
  const unitPrice = +item['Unit Price']
  const lineDiscount = +item['Line Discount']
  const cLineDiscount =
    lineDiscount &&
    (category.startsWith('ALCOHOL') || category.startsWith('DRINK'))
      ? quantity * unitPrice * 0.15
      : 0
  const saleDiscount = +item['Sale Discount']
  const itemTotal = +item.TOTAL
  const cItemTotal = quantity * unitPrice - cLineDiscount
  const vatRate = +item['VAT Rate']
  const net = +item.Net
  const cNet = (cItemTotal * 1) / (1 + vatRate / 100)
  const vat = +item.VAT
  const cVat = cItemTotal - cNet
  const total = +item.Total
  const cTotal = cNet + cVat

  const newItem = {
    id,
    date,
    time,
    status,
    register,
    staff,
    product,
    name,
    category,
    type,
    quantity,
    lineDiscount,
    cLineDiscount,
    saleDiscount,
    itemTotal,
    cItemTotal,
    vatRate,
    net,
    cNet,
    vat,
    cVat,
    total,
    cTotal,
  }

  // console.log({ item, newItem })
  payment.items ??= []
  payment.items.push(newItem)
}

const Payments = Sales.payments

for (const payment of Payments) {
  let itemsTotal = 0
  payment.total = +payment['Payment Amount']
  for (const item of payment.items) {
    itemsTotal += item.cTotal
  }
  payment.cTotal = +itemsTotal.toFixed(4)
  payment.cTotalDiff = +(payment.total - payment.cTotal).toFixed(4)
}
console.log('%o', { Payments })

let total = 0
let cTotal = 0
let cTotalDiff = 0
for (const payment of Payments) {
  total += payment.total
  cTotal += payment.cTotal
  cTotalDiff += payment.cTotalDiff
}

// save the results to a csv file
for (const payment of Payments) {
  delete payment.items
}

writeFileSync('transaction-analysis.csv', stringify(Payments, { header: true }))

console.log({ total, cTotal, cTotalDiff })
