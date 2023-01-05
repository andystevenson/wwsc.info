const join = {
  name: 'Prices',
  description:
    'Explore membership and visitor pricing options at West Warwicks',
  benefits: [
    { description: 'No court booking fees!<br>No light fees!' },
    {
      description:
        'Free induction session with coaching in the sport of your choice.',
    },
    {
      description:
        '1 free PT session, per month, for the 1st 6 months following a gym induction.',
    },
    {
      description:
        '15% discount on all drinks at the bar!<br>Food discounts through belocal solihull',
      links: [
        {
          href: 'https://www.be-local.uk',
          class: 'home-dine',
          img: 'https://images.ctfassets.net/ffrbyg3cfykl/49dxUFtEFQy6fNgoaXEZ7V/dd51f1b62f9d6165d36c9d76becf1605/be-local.png',
          alt: 'belocal solihull',
        },
      ],
    },
    {
      description: '20% discount on additional adult annual membership!',
    },
    {
      description:
        '£50 upgrade to adult membership buys access to all standard gym classes!',
    },
    {
      description: '50% discount on Room Hire for Events!',
    },
    {
      description: 'Free entry to annual ballot for Wimbledon Tickets!',
    },
  ],
  categories: [
    {
      name: 'membership',
      products: [
        {
          name: 'Family',
          description: 'All sports and gym with classes.',
          conditions: 'Up to 3 children under 18',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            { interval: 'year', price: 1000, nickname: 'family-annual-v2' },
            { interval: 'month', price: 100, nickname: 'family-monthly-v2' },
            {
              interval: 'year',
              price: 1000 * 0.8,
              type: 'blue-light',
              name: 'Blue Light',
              nickname: 'family-annual-blue-light-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 100 * 0.8,
              type: 'blue-light',
              name: 'Blue Light',
              nickname: 'family-monthly-blue-light-v2',
              discounted: true,
            },
          ],
        },
        {
          name: '+Classes',
          description: 'All sports and gym with classes.',
          images: ['https://westwarwicks.club/favicon.svg'],
          discounted: true,
          prices: [
            { interval: 'year', price: 600, nickname: 'classes-annual-v2' },
            { interval: 'month', price: 55, nickname: 'classes-monthly-v2' },
            {
              interval: 'year',
              price: 600 * 0.8,
              type: 'family',
              name: 'Family Member',
              nickname: 'classes-annual-family-member-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 55 * 0.8,
              type: 'family',
              name: 'Family Member',
              nickname: 'classes-monthly-family-member-v2',
              discounted: true,
            },

            {
              interval: 'year',
              price: 600 * 0.8,
              type: 'blue-light',
              name: 'Blue Light',
              nickname: 'classes-annual-blue-light-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 55 * 0.8,
              type: 'blue-light',
              name: 'Blue Light',
              nickname: 'classes-monthly-blue-light-v2',
              discounted: true,
            },

            {
              interval: 'year',
              price: 600 - ((600 / 12) * 3) / 2,
              type: 'offer',
              name: 'New You New Me',
              description: 'First 3 months half price, then £600 pa',
              phases: [{ change: 'classes-annual-v2' }],
              nickname: 'classes-annual-offer-new-year-new-me-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 55 / 2,
              type: 'offer',
              name: 'New You New Me',
              description: 'First 3 months half price, then £55 pm',
              phases: [{ iterations: 2 }, { change: 'classes-monthly-v2' }],
              nickname: 'classes-monthly-offer-new-year-new-me-v2',
              discounted: true,
            },
          ],
        },
        {
          name: 'Adult',
          description: 'All sports and gym.',
          images: ['https://westwarwicks.club/favicon.svg'],
          discounted: true,
          prices: [
            { interval: 'year', price: 550, nickname: 'adult-annual-v2' },
            { interval: 'month', price: 50, nickname: 'adult-monthly-v2' },
            {
              interval: 'year',
              price: 550 * 0.8,
              type: 'family',
              name: 'Family Member',
              nickname: 'adult-annual-family-member-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 50 * 0.8,
              type: 'family',
              name: 'Family Member',
              nickname: 'adult-monthly-family-member-v2',
              discounted: true,
            },

            {
              interval: 'year',
              price: 550 * 0.8,
              type: 'blue-light',
              name: 'Blue Light',
              nickname: 'adult-annual-blue-light-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 50 * 0.8,
              type: 'blue-light',
              name: 'Blue Light',
              nickname: 'adult-monthly-blue-light-v2',
              discounted: true,
            },

            {
              interval: 'year',
              price: 550 - ((550 / 12) * 3) / 2,
              type: 'offer',
              name: 'New You New Me',
              description: 'First 3 months half price, then £550 pa',
              phases: [{ change: 'adult-annual-v2' }],
              nickname: 'adult-annual-offer-new-year-new-me-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 50 / 2,
              type: 'offer',
              name: 'New You New Me',
              description: 'First 3 months half price, then £50 pm',
              phases: [{ iterations: 2 }, { change: 'adult-monthly-v2' }],
              nickname: 'adult-monthly-offer-new-year-new-me-v2',
              discounted: true,
            },
          ],
        },
        {
          name: 'Off-Peak',
          description: 'All sports and gym.',
          conditions: 'Mon-Fri 08:00-16:00',
          images: ['https://westwarwicks.club/favicon.svg'],
          discounted: true,
          prices: [
            { interval: 'year', price: 400, nickname: 'off-peak-annual-v2' },
            {
              interval: 'month',
              price: 37.5,
              nickname: 'off-peak-monthly-v2',
            },
            {
              interval: 'year',
              price: 400 * 0.8,
              type: 'family',
              name: 'Family Member',
              nickname: 'off-peak-annual-family-member-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 37.5 * 0.8,
              type: 'family',
              name: 'Family Member',
              nickname: 'off-peak-monthly-family-member-v2',
              discounted: true,
            },

            {
              interval: 'year',
              price: 400 * 0.8,
              type: 'blue-light',
              name: 'Blue Light',
              nickname: 'off-peak-annual-blue-light-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 37.5 * 0.8,
              type: 'blue-light',
              name: 'Blue Light',
              nickname: 'off-peak-monthly-blue-light-v2',
              discounted: true,
            },

            {
              interval: 'year',
              price: 400 - ((400 / 12) * 3) / 2,
              type: 'offer',
              name: 'New You New Me',
              description: 'First 3 months half price, then £400 pa',
              phases: [{ change: 'off-peak-annual-v2' }],
              nickname: 'off-peak-annual-offer-new-year-new-me-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 37.5 / 2,
              type: 'offer',
              name: 'New You New Me',
              description: 'First 3 months half price, then £37.50 pm',
              phases: [{ iterations: 2 }, { change: 'off-peak-monthly-v2' }],
              nickname: 'off-peak-monthly-offer-new-year-new-me-v2',
              discounted: true,
            },
          ],
        },
        {
          name: 'Over-65',
          description: 'All sports and gym with classes.',
          conditions: 'Aged 65+',
          images: ['https://westwarwicks.club/favicon.svg'],
          discounted: true,
          prices: [
            { interval: 'year', price: 400, nickname: 'over-65-annual-v2' },
            {
              interval: 'month',
              price: 37.5,
              nickname: 'over-65-monthly-v2',
            },
            {
              interval: 'year',
              price: 400 * 0.8,
              type: 'family',
              name: 'Family Member',
              nickname: 'over-65-annual-family-member-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 37.5 * 0.8,
              type: 'family',
              name: 'Family Member',
              nickname: 'over-65-monthly-family-member-v2',
              discounted: true,
            },
            {
              interval: 'year',
              price: 400 * 0.8,
              type: 'blue-light',
              name: 'Blue Light',
              nickname: 'over-65-annual-blue-light-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 37.5 * 0.8,
              type: 'blue-light',
              name: 'Blue Light',
              nickname: 'over-65-monthly-blue-light-v2',
              discounted: true,
            },
          ],
        },
        {
          name: 'Young Adult',
          description: 'All sports and gym with classes.',
          conditions: 'Aged 18-25',
          images: ['https://westwarwicks.club/favicon.svg'],
          discounted: true,
          prices: [
            { interval: 'year', price: 400, nickname: 'young-adult-annual-v2' },
            {
              interval: 'month',
              price: 37.5,
              nickname: 'young-adult-monthly-v2',
            },
            {
              interval: 'year',
              price: 400 * 0.8,
              type: 'family',
              name: 'Family Member',
              nickname: 'young-adult-annual-family-member-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 37.5 * 0.8,
              type: 'family',
              name: 'Family Member',
              nickname: 'young-adult-monthly-family-member-v2',
              discounted: true,
            },

            {
              interval: 'year',
              price: 400 * 0.8,
              type: 'blue-light',
              name: 'Blue Light',
              nickname: 'young-adult-annual-blue-light-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 37.5 * 0.8,
              type: 'blue-light',
              name: 'Blue Light',
              nickname: 'young-adult-monthly-blue-light-v2',
              discounted: true,
            },

            {
              interval: 'year',
              price: 250,
              type: 'student',
              name: 'Student',
              nickname: 'young-adult-annual-student-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 25,
              type: 'student',
              name: 'Student',
              nickname: 'young-adult-monthly-student-v2',
              discounted: true,
            },
          ],
        },
        {
          name: 'Teens',
          description: 'All sports and gym, kids & family classes.',
          conditions: 'Aged 12-17',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            { interval: 'year', price: 105, nickname: 'teens-annual-v2' },
          ],
        },
        {
          name: 'Junior',
          description: 'All sports and gym, kids & family classes.',
          conditions: 'Aged 7-11',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            { interval: 'year', price: 75, nickname: 'junior-annual-v2' },
          ],
        },
        {
          name: 'Social',
          description: 'Access to Bar + Restaurant at discount prices.',
          images: ['https://westwarwicks.club/favicon.svg'],
          discounted: true,
          prices: [
            { interval: 'year', price: 100, nickname: 'social-annual-v2' },
            {
              interval: 'year',
              price: 100 * 0.8,
              type: 'family',
              name: 'Family Member',
              nickname: 'social-annual-family-member-new-v2',
              discounted: true,
            },
            {
              interval: 'year',
              price: 100 * 0.8,
              type: 'blue-light',
              name: 'Blue Light',
              nickname: 'social-annual-blue-light-new-v2',
              discounted: true,
            },
          ],
        },
      ],
    },
    {
      name: 'classes',
      products: [
        {
          name: 'Member',
          description: 'Group Exercise Class',
          conditions: '12 for the price of 10!',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            {
              interval: 'once',
              price: 3,
              qty: 1,
              nickname: 'classes-member-1-v2',
            },
            {
              interval: 'once',
              price: 30,
              qty: 12,
              nickname: 'classes-member-12-v2',
            },
          ],
        },
        {
          name: 'Social Member',
          description: 'Group Exercise Class',
          conditions: '12 for the price of 10!',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            {
              interval: 'once',
              price: 5,
              qty: 1,
              nickname: 'classes-social-member-1-v2',
            },
            {
              interval: 'once',
              price: 50,
              qty: 12,
              nickname: 'classes-social-member-12-v2',
            },
          ],
        },
        {
          name: 'Visitor',
          description: 'Group Exercise Class',
          conditions: '12 for the price of 10!',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            {
              interval: 'once',
              price: 7,
              qty: 1,
              nickname: 'classes-visitor-1-v2',
            },
            {
              interval: 'once',
              price: 70,
              qty: 12,
              nickname: 'classes-visitor-12-v2',
            },
          ],
        },
      ],
    },
    {
      name: 'visitors',
      products: [
        {
          name: 'Guest',
          description: 'Rackets and gym access.',
          conditions: 'With a member',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            { interval: 'once', price: 5, nickname: 'visitors-guest-v2' },
          ],
        },
        {
          name: 'Session',
          description: 'Rackets and gym access.',
          conditions: 'A single booking',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            { interval: 'once', price: 10, nickname: 'visitors-session-v2' },
          ],
        },
        {
          name: 'Day',
          description: 'Rackets and gym access.',
          conditions: 'Up to 3 bookings',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            { interval: 'once', price: 15, nickname: 'visitors-day-v2' },
          ],
        },
        {
          name: 'Week',
          description: 'Rackets and gym access.',
          conditions: '7 days, 2 bookings per day',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            { interval: 'once', price: 20, nickname: 'visitors-week-v2' },
          ],
        },
        {
          name: '2 Weeks',
          description: 'Rackets and gym access.',
          conditions: '14 days, 2 bookings per day',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            { interval: 'once', price: 30, nickname: 'visitors-2-week-v2' },
          ],
        },
      ],
    },
    {
      name: 'test',
      products: [
        {
          name: 'Dummy',
          description: 'Dummy dummy dummy.',
          conditions: 'No conditions dummy',
          images: ['https://westwarwicks.club/favicon.svg'],
          discounted: true,
          prices: [
            { interval: 'year', price: 1, nickname: 'dummy-annual-v2' },
            { interval: 'month', price: 1, nickname: 'dummy-monthly-v2' },
            {
              interval: 'year',
              price: 1 * 0.8,
              nickname: 'dummy-annual-family-member-v2',
              discounted: true,
            },
            {
              interval: 'month',
              price: 1 * 0.8,
              nickname: 'dummy-monthly-family-member-v2',
              discounted: true,
            },
          ],
        },
        {
          name: 'DummyVisit',
          description: 'Dummy dummy dummy.',
          conditions: 'With a member',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            { interval: 'once', price: 1, nickname: 'visitors-dummy-v2' },
          ],
        },
      ],
    },
  ],
}

module.exports = join
