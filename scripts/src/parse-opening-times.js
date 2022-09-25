const XLSX = require('xlsx')

const parse = (filename) => {
  const workbook = XLSX.readFile(filename)
  const worksheet = workbook.Sheets['opening-times']

  worksheet.cell = (name) => worksheet[name].w.toLowerCase()
  const openingTimes = (sheet) => {
    if (sheet.cell('A1') !== 'opening times')
      throw Error('not an opening times spreadsheet')
    console.log('a spreadsheet')
    return {
      element: 'section',
      class: 'opening-times',
      children: [],
    }
  }

  worksheet.column = (column, offset) => {
    let value = column.replace(/\d/g, '')
    if (offset) value = String.fromCharCode(value.charCodeAt(0) + offset)
    return Object.entries(worksheet).filter(([cell]) => cell.startsWith(value))
  }

  worksheet.row = (row) => {
    const value = parseInt(row)
    return Object.entries(worksheet).filter(([cell]) => {
      const match = cell.match(/\d+/)
      return match && parseInt(match[0]) === value
    })
  }

  worksheet.days = () => {
    let children = worksheet
      .column('A')
      .map(([cell, value]) => value.w)
      .slice(1)
    children[0] = 'filler'
    children = children.map((day) => {
      return { element: 'p', class: 'day-long', value: day.toLowerCase() }
    })

    return {
      element: 'section',
      class: 'days',
      children,
    }
  }

  worksheet.shortDays = (section) => {
    const result = { ...section }
    result.class = 'short-days'
    result.children = result.children.map((day) => {
      const result = { ...day }
      result.class = 'day-short'
      result.value = day.value.slice(0, 3)
      return result
    })

    return result
  }

  worksheet.findSection = (section) => {
    const [cell] = worksheet
      .row(1)
      .find(([cell, value]) => value.w.toLowerCase() === section.toLowerCase())
    return cell
  }

  worksheet.openTimes = (section) => {
    const result = worksheet.findSection(section)
    const children = worksheet
      .column(result)
      .map(([cell, value]) => value.w.toLowerCase())
      .slice(1)
      .map((value) => {
        return { element: 'p', value }
      })
    // log({ result, children });
    return { element: 'section', class: 'open-times', children }
  }

  worksheet.closeTimes = (section) => {
    const result = worksheet.findSection(section)
    const children = worksheet
      .column(result, 1)
      .map(([cell, value]) => value.w.toLowerCase())
      .map((value) => {
        return { element: 'p', value }
      })
    // log({ result, children });
    return { element: 'section', class: 'close-times', children }
  }

  worksheet.sectionTimes = () => {
    const result = worksheet
      .row(1)
      .map(([cell, value]) => value.w)
      .slice(1)
      .map((section) => {
        const lowerSection = section.toLowerCase()
        return {
          element: 'section',
          class: 'section-times',
          id: `${lowerSection}`,
          children: [
            {
              element: 'h2',
              children: [
                {
                  element: 'a',
                  href: `/${lowerSection}`,
                  value: `${lowerSection}`,
                },
              ],
            },
            worksheet.daysSection,
            worksheet.shortDaysSection,
            worksheet.openTimes(section),
            worksheet.closeTimes(section),
          ],
        }
      })
    return result
  }

  worksheet.openingTimes = () => {
    return {
      element: 'section',
      class: 'opening-times',
      children: worksheet.sectionTimesSection,
    }
  }

  worksheet.daysSection = worksheet.days()
  worksheet.shortDaysSection = worksheet.shortDays(worksheet.daysSection)
  worksheet.sectionTimesSection = worksheet.sectionTimes()
  worksheet.openingTimesSection = worksheet.openingTimes()

  return worksheet.openingTimesSection
}

module.exports = parse
