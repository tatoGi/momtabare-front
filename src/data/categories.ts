import type { ICategory } from '@/types/category';


// Helper function to create a category with required properties
const createCategory = (id: number, name: { en: string; ka: string }, slug: string, parent: ICategory | number | null = null, children: ICategory[] = []): ICategory => ({
  id,
  name,
  slug,
  parent,
  children,
});

export const categoriesData: ICategory[] = [
  createCategory(1, { en: 'Hiking & Camping', ka: 'ლაშქრობა და კემპინგი' }, 'hiking-camping', null, [
    createCategory(101, { en: 'Tents', ka: 'ქოხები' }, 'tents', 1, [
      createCategory(1001, { en: 'Backpacking Tents', ka: 'ტურისტული ქოხები' }, 'backpacking-tents', 101, []),
      createCategory(1002, { en: 'Camping Tents', ka: 'კემპინგის ქოხები' }, 'camping-tents', 101, []),
      createCategory(1003, { en: 'Family Tents', ka: 'ოჯახური ქოხები' }, 'family-tents', 101, []),
      createCategory(1004, { en: '4-Season Tents', ka: '4-სეზონიანი ქოხები' }, '4-season-tents', 101, [])
    ]),
    createCategory(102, { en: 'Sleeping Bags', ka: 'ძილის ტომარები' }, 'sleeping-bags', 1, [
      createCategory(1005, { en: 'Down Sleeping Bags', ka: 'ღრუბლოვანი ტომარები' }, 'down-sleeping-bags', 102, []),
      createCategory(1006, { en: 'Synthetic Sleeping Bags', ka: 'სინთეტიკური ტომარები' }, 'synthetic-sleeping-bags', 102, []),
      createCategory(1007, { en: 'Mummy Bags', ka: 'მუმია ტომარები' }, 'mummy-bags', 102, [])
    ]),
      createCategory(103, { en: 'Backpacks', ka: 'ზურგჩანთები' }, 'backpacks', 1, [
        createCategory(1008, { en: 'Daypacks', ka: 'დღიური ჩანთები' }, 'daypacks', 103, []),
        createCategory(1009, { en: 'Hiking Backpacks', ka: 'ლაშქრობის ჩანთები' }, 'hiking-backpacks', 103, []),
        createCategory(1010, { en: 'Travel Backpacks', ka: 'მოგზაურობის ჩანთები' }, 'travel-backpacks', 103, [])
      ]),
      createCategory(104, { en: 'Hiking Boots', ka: 'ლაშქრობის ფეხსაცმელი' }, 'hiking-boots', 1, [
        createCategory(1011, { en: 'Men\'s Hiking Boots', ka: 'კაცის ფეხსაცმელი' }, 'mens-hiking-boots', 104, []),
        createCategory(1012, { en: 'Women\'s Hiking Boots', ka: 'ქალის ფეხსაცმელი' }, 'womens-hiking-boots', 104, []),
        createCategory(1013, { en: 'Hiking Shoes', ka: 'ლაშქრობის ფეხსაცმელი' }, 'hiking-shoes', 104, [])
      ])
    ]
  ),
  createCategory(2, { en: 'Climbing', ka: 'ალპინიზმი' }, 'climbing', null, [
    createCategory(201, { en: 'Climbing Shoes', ka: 'ალპინისტური ფეხსაცმელი' }, 'climbing-shoes', 2, [
      createCategory(2001, { en: 'Beginner Shoes', ka: 'დამწყებთათვის' }, 'beginner-shoes', 201, []),
      createCategory(2002, { en: 'Intermediate Shoes', ka: 'გამოცდილი' }, 'intermediate-shoes', 201, []),
      createCategory(2003, { en: 'Advanced Shoes', ka: 'პროფესიონალი' }, 'advanced-shoes', 201, [])
    ]),
    createCategory(202, { en: 'Harnesses', ka: 'ამაღიზიანებლები' }, 'harnesses', 2, [
      createCategory(2004, { en: 'Sit Harnesses', ka: 'საჯდომი' }, 'sit-harnesses', 202, []),
      createCategory(2005, { en: 'Chest Harnesses', ka: 'მკერდის' }, 'chest-harnesses', 202, []),
      createCategory(2006, { en: 'Full Body Harnesses', ka: 'სრული სხეულის' }, 'full-body-harnesses', 202, [])
    ])
  ]),
  createCategory(3, { en: 'Cycling', ka: 'ველოსპორტი' }, 'cycling', null, [
    createCategory(301, { en: 'Mountain Bikes', ka: 'მთის ველოსიპედები' }, 'mountain-bikes', 3, [
      createCategory(3001, { en: 'Hardtail', ka: 'ჰარდტეილი' }, 'hardtail', 301, []),
      createCategory(3002, { en: 'Full Suspension', ka: 'სრული დამშვიდება' }, 'full-suspension', 301, []),
      createCategory(3003, { en: 'Electric MTB', ka: 'ელექტრო' }, 'electric-mtb', 301, [])
    ]),
    createCategory(302, { en: 'Road Bikes', ka: 'გზის ველოსიპედები' }, 'road-bikes', 3, [
      createCategory(3004, { en: 'Race Bikes', ka: 'საგზაო' }, 'race-bikes', 302, []),
      createCategory(3005, { en: 'Endurance Bikes', ka: 'ტურინგული' }, 'endurance-bikes', 302, []),
      createCategory(3006, { en: 'Aero Bikes', ka: 'აერო' }, 'aero-bikes', 302, [])
    ])
  ]),
  createCategory(4, { en: 'Water Sports', ka: 'წყლის სპორტი' }, 'water-sports', null, [
    createCategory(401, { en: 'Kayaks', ka: 'ბაირკები' }, 'kayaks', 4, [
      createCategory(4001, { en: 'Sit-on-Top Kayaks', ka: 'ღია' }, 'sit-on-top', 401, []),
      createCategory(4002, { en: 'Sit-Inside Kayaks', ka: 'დახურული' }, 'sit-inside', 401, []),
      createCategory(4003, { en: 'Touring Kayaks', ka: 'ტურისტული' }, 'touring', 401, [])
    ]),
    createCategory(402, { en: 'Stand Up Paddleboards', ka: 'სათხილამურო დაფები' }, 'sups', 4, [
      createCategory(4004, { en: 'All-Around SUPs', ka: 'უნივერსალური' }, 'all-around', 402, []),
      createCategory(4005, { en: 'Touring SUPs', ka: 'ტურისტული' }, 'touring', 402, []),
      createCategory(4006, { en: 'Yoga SUPs', ka: 'იოგა' }, 'yoga', 402, [])
    ])
  ]),
  createCategory(7, { en: 'Fitness', ka: 'ფიტნესი' }, 'fitness', null, [
    createCategory(701, { en: 'Home Gym', ka: 'სახლის ფიტნესი' }, 'home-gym', 7, [
      createCategory(7001, { en: 'Dumbbells', ka: 'გუმბათები' }, 'dumbbells', 701, []),
      createCategory(7002, { en: 'Resistance Bands', ka: 'წინააღმდეგობის ლენტები' }, 'resistance-bands', 701, []),
      createCategory(7003, { en: 'Yoga Mats', ka: 'იოგის ხალიჩები' }, 'yoga-mats', 701, [])
    ]),
    createCategory(702, { en: 'Cardio Equipment', ka: 'კარდიო აღჭურვილობა' }, 'cardio-equipment', 7, [
      createCategory(7004, { en: 'Treadmills', ka: 'სირბილის ბილიკები' }, 'treadmills', 702, []),
      createCategory(7005, { en: 'Exercise Bikes', ka: 'ველოტრენაჟორები' }, 'exercise-bikes', 702, []),
      createCategory(7006, { en: 'Ellipticals', ka: 'ელიფსოიდები' }, 'ellipticals', 702, [])
    ])
  ]),
  createCategory(8, { en: 'Team Sports', ka: 'გუნდური სპორტი' }, 'team-sports', null, [
    createCategory(801, { en: 'Soccer', ka: 'ფეხბურთი' }, 'soccer', 8, [
      createCategory(8001, { en: 'Soccer Cleats', ka: 'ბუცები' }, 'cleats', 801, []),
      createCategory(8002, { en: 'Soccer Balls', ka: 'ბურთები' }, 'balls', 801, []),
      createCategory(8003, { en: 'Shin Guards', ka: 'პერანჯიკები' }, 'shin-guards', 801, [])
    ]),
    createCategory(802, { en: 'Basketball', ka: 'კალათბურთი' }, 'basketball', 8, [
      createCategory(8004, { en: 'Basketballs', ka: 'ბურთები' }, 'basketballs', 802, []),
      createCategory(8005, { en: 'Basketball Shoes', ka: 'ფეხსაცმელი' }, 'basketball-shoes', 802, []),
      createCategory(8006, { en: 'Hoops', ka: 'კალათები' }, 'hoops', 802, [])
    ])
  ]),
  createCategory(9, { en: 'Outdoor Clothing', ka: 'გარე ტანსაცმელი' }, 'outdoor-clothing', null, [
    createCategory(901, { en: 'Jackets', ka: 'ქურთუკები' }, 'jackets', 9, [
      createCategory(9001, { en: 'Rain Jackets', ka: 'წვიმის ქურთუკები' }, 'rain-jackets', 901, []),
      createCategory(9002, { en: 'Softshell Jackets', ka: 'სოფტშელის ქურთუკები' }, 'softshell-jackets', 901, []),
      createCategory(9003, { en: 'Insulated Jackets', ka: 'თბილი ქურთუკები' }, 'insulated-jackets', 901, [])
    ]),
    createCategory(902, { en: 'Pants', ka: 'შარვლები' }, 'pants', 9, [
      createCategory(9004, { en: 'Hiking Pants', ka: 'ლაშქრობის შარვლები' }, 'hiking-pants', 902, []),
      createCategory(9005, { en: 'Convertible Pants', ka: 'ტრანსფორმერი შარვლები' }, 'convertible-pants', 902, []),
      createCategory(9006, { en: 'Softshell Pants', ka: 'სოფტშელის შარვლები' }, 'softshell-pants', 902, [])
    ])
  ]),
  createCategory(10, { en: 'Accessories', ka: 'აქსესუარები' }, 'accessories', null, [
    createCategory(1001, { en: 'Headwear', ka: 'ქუდები' }, 'headwear', 10, [
      createCategory(10001, { en: 'Hats', ka: 'ქუდები' }, 'hats', 1001, []),
      createCategory(10002, { en: 'Beanies', ka: 'ქუდ-ჩაფხუტები' }, 'beanies', 1001, []),
      createCategory(10003, { en: 'Caps', ka: 'ქუდები' }, 'caps', 1001, [])
    ]),
    createCategory(1002, { en: 'Gloves', ka: 'ხელთათმანები' }, 'gloves', 10, [
      createCategory(10004, { en: 'Winter Gloves', ka: 'ზამთრის' }, 'winter-gloves', 1002, []),
      createCategory(10005, { en: 'Fingerless Gloves', ka: 'უთითო' }, 'fingerless-gloves', 1002, []),
      createCategory(10006, { en: 'Sport Gloves', ka: 'სპორტული' }, 'sport-gloves', 1002, [])
    ])
  ])
];

export default categoriesData;
