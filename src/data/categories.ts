import type { ICategory } from "@/ts/models/category.types";

export const categoriesData: ICategory[] = [
  {
    id: 1,
    name: { en: 'Hiking & Camping', ka: 'ლაშქრობა და კემპინგი' },
    slug: 'hiking-camping',
    children: [
      {
        id: 101,
        name: { en: 'Tents', ka: 'ქოხები' },
        slug: 'tents',
        children: [
          { id: 1001, name: { en: 'Backpacking Tents', ka: 'ტურისტული ქოხები' }, slug: 'backpacking-tents' },
          { id: 1002, name: { en: 'Camping Tents', ka: 'კემპინგის ქოხები' }, slug: 'camping-tents' },
          { id: 1003, name: { en: 'Family Tents', ka: 'ოჯახური ქოხები' }, slug: 'family-tents' },
          { id: 1004, name: { en: '4-Season Tents', ka: '4-სეზონიანი ქოხები' }, slug: '4-season-tents' }
        ]
      },
      {
        id: 102,
        name: { en: 'Sleeping Bags', ka: 'ძილის ტომარები' },
        slug: 'sleeping-bags',
        children: [
          { id: 1005, name: { en: 'Down Sleeping Bags', ka: 'ღრუბლოვანი ტომარები' }, slug: 'down-sleeping-bags' },
          { id: 1006, name: { en: 'Synthetic Sleeping Bags', ka: 'სინთეტიკური ტომარები' }, slug: 'synthetic-sleeping-bags' },
          { id: 1007, name: { en: 'Mummy Bags', ka: 'მუმია ტომარები' }, slug: 'mummy-bags' }
        ]
      },
      {
        id: 103,
        name: { en: 'Backpacks', ka: 'ზურგჩანთები' },
        slug: 'backpacks',
        children: [
          { id: 1008, name: { en: 'Daypacks', ka: 'დღიური ჩანთები' }, slug: 'daypacks' },
          { id: 1009, name: { en: 'Hiking Backpacks', ka: 'ლაშქრობის ჩანთები' }, slug: 'hiking-backpacks' },
          { id: 1010, name: { en: 'Travel Backpacks', ka: 'მოგზაურობის ჩანთები' }, slug: 'travel-backpacks' }
        ]
      },
      {
        id: 104,
        name: { en: 'Hiking Boots', ka: 'ლაშქრობის ფეხსაცმელი' },
        slug: 'hiking-boots',
        children: [
          { id: 1011, name: { en: 'Men\'s Hiking Boots', ka: 'კაცის ფეხსაცმელი' }, slug: 'mens-hiking-boots' },
          { id: 1012, name: { en: 'Women\'s Hiking Boots', ka: 'ქალის ფეხსაცმელი' }, slug: 'womens-hiking-boots' },
          { id: 1013, name: { en: 'Hiking Shoes', ka: 'ლაშქრობის ფეხსაცმელი' }, slug: 'hiking-shoes' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: { en: 'Climbing', ka: 'ალპინიზმი' },
    slug: 'climbing',
    children: [
      {
        id: 201,
        name: { en: 'Climbing Shoes', ka: 'ალპინისტური ფეხსაცმელი' },
        slug: 'climbing-shoes',
        children: [
          { id: 2001, name: { en: 'Beginner Shoes', ka: 'დამწყებთათვის' }, slug: 'beginner-shoes' },
          { id: 2002, name: { en: 'Intermediate Shoes', ka: 'გამოცდილი' }, slug: 'intermediate-shoes' },
          { id: 2003, name: { en: 'Advanced Shoes', ka: 'პროფესიონალი' }, slug: 'advanced-shoes' }
        ]
      },
      {
        id: 202,
        name: { en: 'Harnesses', ka: 'ამაღიზიანებლები' },
        slug: 'harnesses',
        children: [
          { id: 2004, name: { en: 'Sit Harnesses', ka: 'საჯდომი' }, slug: 'sit-harnesses' },
          { id: 2005, name: { en: 'Chest Harnesses', ka: 'მკერდის' }, slug: 'chest-harnesses' },
          { id: 2006, name: { en: 'Full Body Harnesses', ka: 'სრული სხეულის' }, slug: 'full-body-harnesses' }
        ]
      }
    ]
  },
  {
    id: 3,
    name: { en: 'Cycling', ka: 'ველოსპორტი' },
    slug: 'cycling',
    children: [
      {
        id: 301,
        name: { en: 'Mountain Bikes', ka: 'მთის ველოსიპედები' },
        slug: 'mountain-bikes',
        children: [
          { id: 3001, name: { en: 'Hardtail', ka: 'ჰარდტეილი' }, slug: 'hardtail' },
          { id: 3002, name: { en: 'Full Suspension', ka: 'სრული დამშვიდება' }, slug: 'full-suspension' },
          { id: 3003, name: { en: 'Electric MTB', ka: 'ელექტრო' }, slug: 'electric-mtb' }
        ]
      },
      {
        id: 302,
        name: { en: 'Road Bikes', ka: 'გზის ველოსიპედები' },
        slug: 'road-bikes',
        children: [
          { id: 3004, name: { en: 'Race Bikes', ka: 'საგზაო' }, slug: 'race-bikes' },
          { id: 3005, name: { en: 'Endurance Bikes', ka: 'ტურინგული' }, slug: 'endurance-bikes' },
          { id: 3006, name: { en: 'Aero Bikes', ka: 'აერო' }, slug: 'aero-bikes' }
        ]
      }
    ]
  },
  {
    id: 4,
    name: { en: 'Water Sports', ka: 'წყლის სპორტი' },
    slug: 'water-sports',
    children: [
      {
        id: 401,
        name: { en: 'Kayaks', ka: 'ბაირკები' },
        slug: 'kayaks',
        children: [
          { id: 4001, name: { en: 'Sit-on-Top Kayaks', ka: 'ღია' }, slug: 'sit-on-top' },
          { id: 4002, name: { en: 'Sit-Inside Kayaks', ka: 'დახურული' }, slug: 'sit-inside' },
          { id: 4003, name: { en: 'Touring Kayaks', ka: 'ტურისტული' }, slug: 'touring' }
        ]
      },
      {
        id: 402,
        name: { en: 'Stand Up Paddleboards', ka: 'სათხილამურო დაფები' },
        slug: 'sups',
        children: [
          { id: 4004, name: { en: 'All-Around SUPs', ka: 'უნივერსალური' }, slug: 'all-around' },
          { id: 4005, name: { en: 'Touring SUPs', ka: 'ტურისტული' }, slug: 'touring' },
          { id: 4006, name: { en: 'Yoga SUPs', ka: 'იოგა' }, slug: 'yoga' }
        ]
      }
    ]
  },
  {
    id: 5,
    name: { en: 'Ski & Snowboard', ka: 'თხილამურები და სნოუბორდი' },
    slug: 'ski-snowboard',
    children: [
      {
        id: 501,
        name: { en: 'Skis', ka: 'თხილამურები' },
        slug: 'skis',
        children: [
          { id: 5001, name: { en: 'All-Mountain Skis', ka: 'უნივერსალური' }, slug: 'all-mountain' },
          { id: 5002, name: { en: 'Powder Skis', ka: 'ფხვიერი თოვლისთვის' }, slug: 'powder' },
          { id: 5003, name: { en: 'Carving Skis', ka: 'კარვინგი' }, slug: 'carving' }
        ]
      },
      {
        id: 502,
        name: { en: 'Snowboards', ka: 'სნოუბორდები' },
        slug: 'snowboards',
        children: [
          { id: 5004, name: { en: 'All-Mountain Boards', ka: 'უნივერსალური' }, slug: 'all-mountain' },
          { id: 5005, name: { en: 'Freestyle Boards', ka: 'ფრისტაილი' }, slug: 'freestyle' },
          { id: 5006, name: { en: 'Freeride Boards', ka: 'ფრიერაიდი' }, slug: 'freeride' }
        ]
      },
      {
        id: 503,
        name: { en: 'Ski Boots', ka: 'თხილამურის ფეხსაცმელი' },
        slug: 'ski-boots',
        children: [
          { id: 5007, name: { en: 'Alpine Boots', ka: 'ალპინისტური' }, slug: 'alpine' },
          { id: 5008, name: { en: 'Touring Boots', ka: 'ტურისტული' }, slug: 'touring' },
          { id: 5009, name: { en: 'Freeride Boots', ka: 'ფრიერაიდი' }, slug: 'freeride' }
        ]
      }
    ]
  },
  {
    id: 6,
    name: { en: 'Running', ka: 'სირბილი' },
    slug: 'running',
    children: [
      {
        id: 601,
        name: { en: 'Running Shoes', ka: 'სირბილის ფეხსაცმელი' },
        slug: 'running-shoes',
        children: [
          { id: 6001, name: { en: 'Road Running', ka: 'ქუჩის' }, slug: 'road' },
          { id: 6002, name: { en: 'Trail Running', ka: 'სატრასო' }, slug: 'trail' },
          { id: 6003, name: { en: 'Racing', ka: 'საკონკურსო' }, slug: 'racing' }
        ]
      },
      {
        id: 602,
        name: { en: 'Running Apparel', ka: 'ტანსაცმელი' },
        slug: 'running-apparel',
        children: [
          { id: 6004, name: { en: 'T-Shirts', ka: 'მაისურები' }, slug: 'tshirts' },
          { id: 6005, name: { en: 'Shorts', ka: 'შორტები' }, slug: 'shorts' },
          { id: 6006, name: { en: 'Jackets', ka: 'ქურთუკები' }, slug: 'jackets' }
        ]
      }
    ]
  },
  {
    id: 7,
    name: { en: 'Fitness', ka: 'ფიტნესი' },
    slug: 'fitness',
    children: [
      {
        id: 701,
        name: { en: 'Home Gym', ka: 'სახლის ფიტნესი' },
        slug: 'home-gym',
        children: [
          { id: 7001, name: { en: 'Dumbbells', ka: 'გუმბათები' }, slug: 'dumbbells' },
          { id: 7002, name: { en: 'Resistance Bands', ka: 'წინააღმდეგობის ლენტები' }, slug: 'resistance-bands' },
          { id: 7003, name: { en: 'Yoga Mats', ka: 'იოგის ხალიჩები' }, slug: 'yoga-mats' }
        ]
      },
      {
        id: 702,
        name: { en: 'Cardio Equipment', ka: 'კარდიო აღჭურვილობა' },
        slug: 'cardio-equipment',
        children: [
          { id: 7004, name: { en: 'Treadmills', ka: 'სირბილის ბილიკები' }, slug: 'treadmills' },
          { id: 7005, name: { en: 'Exercise Bikes', ka: 'ველოტრენაჟორები' }, slug: 'exercise-bikes' },
          { id: 7006, name: { en: 'Ellipticals', ka: 'ელიფსოიდები' }, slug: 'ellipticals' }
        ]
      }
    ]
  },
  {
    id: 8,
    name: { en: 'Team Sports', ka: 'გუნდური სპორტი' },
    slug: 'team-sports',
    children: [
      {
        id: 801,
        name: { en: 'Soccer', ka: 'ფეხბურთი' },
        slug: 'soccer',
        children: [
          { id: 8001, name: { en: 'Soccer Cleats', ka: 'ბუცები' }, slug: 'cleats' },
          { id: 8002, name: { en: 'Soccer Balls', ka: 'ბურთები' }, slug: 'balls' },
          { id: 8003, name: { en: 'Shin Guards', ka: 'პერანჯიკები' }, slug: 'shin-guards' }
        ]
      },
      {
        id: 802,
        name: { en: 'Basketball', ka: 'კალათბურთი' },
        slug: 'basketball',
        children: [
          { id: 8004, name: { en: 'Basketballs', ka: 'ბურთები' }, slug: 'basketballs' },
          { id: 8005, name: { en: 'Basketball Shoes', ka: 'ფეხსაცმელი' }, slug: 'basketball-shoes' },
          { id: 8006, name: { en: 'Hoops', ka: 'კალათები' }, slug: 'hoops' }
        ]
      }
    ]
  },
  {
    id: 9,
    name: { en: 'Outdoor Clothing', ka: 'გარე ტანსაცმელი' },
    slug: 'outdoor-clothing',
    children: [
      {
        id: 901,
        name: { en: 'Jackets', ka: 'ქურთუკები' },
        slug: 'jackets',
        children: [
          { id: 9001, name: { en: 'Rain Jackets', ka: 'საწვიმარი' }, slug: 'rain' },
          { id: 9002, name: { en: 'Down Jackets', ka: 'ღრუბლოვანი' }, slug: 'down' },
          { id: 9003, name: { en: 'Softshell Jackets', ka: 'სოფტშელები' }, slug: 'softshell' }
        ]
      },
      {
        id: 902,
        name: { en: 'Pants', ka: 'შარვლები' },
        slug: 'pants',
        children: [
          { id: 9004, name: { en: 'Hiking Pants', ka: 'ლაშქრობის' }, slug: 'hiking' },
          { id: 9005, name: { en: 'Softshell Pants', ka: 'სოფტშელები' }, slug: 'softshell' },
          { id: 9006, name: { en: 'Rain Pants', ka: 'საწვიმარი' }, slug: 'rain' }
        ]
      }
    ]
  },
  {
    id: 10,
    name: { en: 'Accessories', ka: 'აქსესუარები' },
    slug: 'accessories',
    children: [
      {
        id: 1001,
        name: { en: 'Headwear', ka: 'ქუდები' },
        slug: 'headwear',
        children: [
          { id: 10001, name: { en: 'Hats', ka: 'ქუდები' }, slug: 'hats' },
          { id: 10002, name: { en: 'Beanies', ka: 'ქუდ-ჩაფხუტები' }, slug: 'beanies' },
          { id: 10003, name: { en: 'Caps', ka: 'ქუდები' }, slug: 'caps' }
        ]
      },
      {
        id: 1002,
        name: { en: 'Gloves', ka: 'ხელთათმანები' },
        slug: 'gloves',
        children: [
          { id: 10004, name: { en: 'Winter Gloves', ka: 'ზამთრის' }, slug: 'winter' },
          { id: 10005, name: { en: 'Fingerless Gloves', ka: 'უთითო' }, slug: 'fingerless' },
          { id: 10006, name: { en: 'Sport Gloves', ka: 'სპორტული' }, slug: 'sport' }
        ]
      }
    ]
  }
];

export default categoriesData;
