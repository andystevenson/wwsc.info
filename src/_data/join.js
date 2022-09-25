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
          name: 'Dummy',
          description: 'Dummy dummy dummy.',
          conditions: 'No conditions dummy',
          images: ['https://westwarwicks.club/favicon.svg'],
          discounted: true,
          prices: [
            { interval: 'year', price: 1, nickname: 'dummy-annual' },
            { interval: 'month', price: 1, nickname: 'dummy-monthly' },
            {
              interval: 'year',
              price: 1 * 0.8,
              nickname: 'dummy-annual-family-member',
              discounted: true,
            },
            {
              interval: 'month',
              price: 1 * 0.8,
              nickname: 'dummy-monthly-family-member',
              discounted: true,
            },
          ],
        },
        {
          name: 'Family',
          description: 'All sports and gym with classes.',
          conditions: 'Up to 3 children under 18',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            { interval: 'year', price: 1000, nickname: 'family-annual' },
            { interval: 'month', price: 100, nickname: 'family-monthly' },
          ],
        },
        {
          name: '+Classes',
          description: 'All sports and gym with classes.',
          images: ['https://westwarwicks.club/favicon.svg'],
          discounted: true,
          prices: [
            { interval: 'year', price: 600, nickname: 'classes-annual' },
            { interval: 'month', price: 55, nickname: 'classes-monthly' },
            {
              interval: 'year',
              price: 600 * 0.8,
              nickname: 'classes-annual-family-member',
              discounted: true,
            },
            {
              interval: 'month',
              price: 55 * 0.8,
              nickname: 'classes-monthly-family-member',
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
            { interval: 'year', price: 550, nickname: 'adult-annual' },
            { interval: 'month', price: 50, nickname: 'adult-monthly' },
            {
              interval: 'year',
              price: 550 * 0.8,
              nickname: 'adult-annual-family-member',
              discounted: true,
            },
            {
              interval: 'month',
              price: 50 * 0.8,
              nickname: 'adult-monthly-family-member',
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
            { interval: 'year', price: 400, nickname: 'off-peak-annual' },
            {
              interval: 'month',
              price: 37.5,
              nickname: 'off-peak-monthly',
            },
            {
              interval: 'year',
              price: 400 * 0.8,
              nickname: 'off-peak-annual-family-member-new',
              discounted: true,
            },
            {
              interval: 'month',
              price: 37.5 * 0.8,
              nickname: 'off-peak-monthly-family-member',
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
            { interval: 'year', price: 400, nickname: 'over-65-annual' },
            {
              interval: 'month',
              price: 37.5,
              nickname: 'over-65-monthly',
            },
            {
              interval: 'year',
              price: 400 * 0.8,
              nickname: 'over-65-annual-family-member',
              discounted: true,
            },
            {
              interval: 'month',
              price: 37.5 * 0.8,
              nickname: 'over-65-monthly-family-member',
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
            { interval: 'year', price: 400, nickname: 'young-adult-annual' },
            {
              interval: 'month',
              price: 37.5,
              nickname: 'young-adult-monthly',
            },
            {
              interval: 'year',
              price: 400 * 0.8,
              nickname: 'young-adult-annual-family-member',
              discounted: true,
            },
            {
              interval: 'month',
              price: 37.5 * 0.8,
              nickname: 'young-adult-monthly-family-member',
              discounted: true,
            },
          ],
        },
        {
          name: 'Teens',
          description: 'All sports and gym, kids & family classes.',
          conditions: 'Aged 12-17',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [{ interval: 'year', price: 105, nickname: 'teens-annual' }],
        },
        {
          name: 'Junior',
          description: 'All sports and gym.',
          conditions: 'Aged 7-11',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [{ interval: 'year', price: 75, nickname: 'junior-annual' }],
        },
        {
          name: 'Social',
          description: 'Access to Bar + Restaurant at discount prices.',
          images: ['https://westwarwicks.club/favicon.svg'],
          discounted: true,
          prices: [
            { interval: 'year', price: 100, nickname: 'social-annual' },
            {
              interval: 'year',
              price: 100 * 0.8,
              nickname: 'social-annual-family-member',
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
              nickname: 'classes-member-1',
            },
            {
              interval: 'once',
              price: 30,
              qty: 12,
              nickname: 'classes-member-12',
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
              nickname: 'classes-social-member-1',
            },
            {
              interval: 'once',
              price: 50,
              qty: 12,
              nickname: 'classes-social-member-12',
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
              nickname: 'classes-visitor-1',
            },
            {
              interval: 'once',
              price: 70,
              qty: 12,
              nickname: 'classes-visitor-12',
            },
          ],
        },
      ],
    },
    {
      name: 'visitors',
      products: [
        {
          name: 'DummyVisit',
          description: 'Dummy dummy dummy.',
          conditions: 'With a member',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [{ interval: 'once', price: 1, nickname: 'visitors-dummy' }],
        },
        {
          name: 'Guest',
          description: 'Rackets and gym access.',
          conditions: 'With a member',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [{ interval: 'once', price: 5, nickname: 'visitors-guest' }],
        },
        {
          name: 'Session',
          description: 'Rackets and gym access.',
          conditions: 'A single booking',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            { interval: 'once', price: 10, nickname: 'visitors-session' },
          ],
        },
        {
          name: 'Day',
          description: 'Rackets and gym access.',
          conditions: 'Up to 3 bookings',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [{ interval: 'once', price: 15, nickname: 'visitors-day' }],
        },
        {
          name: 'Week',
          description: 'Rackets and gym access.',
          conditions: '7 days, 2 bookings per day',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [{ interval: 'once', price: 20, nickname: 'visitors-week' }],
        },
        {
          name: '2 Weeks',
          description: 'Rackets and gym access.',
          conditions: '14 days, 2 bookings per day',
          images: ['https://westwarwicks.club/favicon.svg'],
          prices: [
            { interval: 'once', price: 30, nickname: 'visitors-2-week' },
          ],
        },
      ],
    },
  ],
}

module.exports = join
