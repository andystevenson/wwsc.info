import find from '../../../.cache/sumup/sumup-check-find.json'
import customers from '../../../.cache/sumup/sumup-customers-updated.json'
import observer from './utilities/observer.mjs'

Chart.register(ChartDataLabels)
Chart.defaults.set('plugins.datalabels', {
  anchor: 'end',
  align: 'start',
  color: '#FFF',
  font: {
    weight: 'bold',
    size: 14,
  },
})

const defaultAgeGroups = [
  [Number.MIN_SAFE_INTEGER, 6],
  [7, 11],
  [12, 17],
  [18, 25],
  [26, 64],
  [65, Number.MAX_SAFE_INTEGER],
]

const ageGroups = () => {
  const ages = defaultAgeGroups

  const result = ages.map(([from, to]) =>
    Object.values(find).reduce((count, member) => {
      const isMember = member[0]
      const age = member[member.length - 1]
      if (isMember && age >= from && age <= to) count = count + 1
      return count
    }, 0),
  )

  return result
}

const ageGroupData = {
  labels: defaultAgeGroups.map(
    ([from, to]) => `${from < 0 ? 0 : from}-${to > 100 ? '' : to}`,
  ),
  datasets: [
    {
      label: 'age groups',
      backgroundColor: [
        'rgba(255, 99, 132)',
        'rgba(54, 162, 235)',
        'rgba(255, 206, 86)',
        'rgba(75, 192, 192)',
        'rgba(153, 102, 255)',
        'rgba(255, 159, 64)',
      ],
      data: ageGroups(),
    },
  ],
}

const configAgeGroups = {
  type: 'pie',
  data: ageGroupData,
  options: {
    plugins: {
      title: {
        display: true,
        position: 'top',
        text: 'age groups',
        color: '#FFF',
        font: {
          weight: 'bold',
          size: 24,
        },
      },
      legend: {
        display: true,
        position: 'left',
        labels: {
          color: 'rgb(255, 255,255)',
        },
      },
    },
  },
}

const genderCount = (gender) => {
  return customers.reduce(
    (count, member) =>
      member.customer_group === 'MEMBERS' && member.gender === gender
        ? (count = count + 1)
        : count,
    0,
  )
}

const genders = () => [
  genderCount('male'),
  genderCount('female'),
  genderCount('unknown'),
]

const genderData = {
  labels: ['male', 'female', 'unknown'],
  datasets: [
    {
      label: 'gender',
      backgroundColor: [
        'rgba(54, 162, 235)',
        'rgba(255, 99, 132)',
        'rgba(255, 159, 64)',
      ],
      data: genders(),
    },
  ],
}
const configGender = {
  type: 'pie',
  data: genderData,
  options: {
    plugins: {
      title: {
        display: true,
        position: 'top',
        text: 'gender',
        color: '#FFF',
        font: {
          weight: 'bold',
          size: 24,
        },
      },
      legend: {
        display: true,
        position: 'left',
        labels: {
          color: 'rgb(255, 255,255)',
        },
      },
    },
  },
}

new Chart(document.getElementById('gender-chart'), configGender)
new Chart(document.getElementById('ages-chart'), configAgeGroups)

// tie in the dynamic sections

const hof = (api) =>
  async function () {
    let timer = null

    console.log('hof....')

    async function process() {
      if (timer) clearInterval(timer)
      const url = `${location.origin}/api/${api}`

      const today = document.getElementById(`${api}:today`)
      const mtd = document.getElementById(`${api}:mtd`)
      const ytd = document.getElementById(`${api}:ytd`)

      const update = async () => {
        console.log(`${api}...`)
        try {
          const response = await fetch(url)
          const json = await response.json()

          today.textContent = json.today
          mtd.textContent = json.mtd
          ytd.textContent = json.ytd
        } catch (error) {
          console.error(`${api} failed [${error.message}]`)
          throw error
        }
      }
      // update to bootstrap and then every 60seconds

      await update()
      timer = setInterval(update, 1000 * 60)
    }

    removeEventListener('load', process)
    addEventListener('load', process)
  }

const resources = ['stripe', 'zettle', 'sumup', 'ashbourne']
let running = resources
  .map((fn) => hof(fn))
  .map(async (fn) => {
    await fn()
  })

observer(resources)
