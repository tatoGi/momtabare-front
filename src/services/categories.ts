import { ICategory } from "../ts/models/category.types.ts"

// Sample data for categories with multiple levels
const categoriesData: ICategory[] = [
  {
    id: 1,
    name: { en: 'Hiking & Camping', ka: 'ლაშქრობა და კემპინგი' },
    slug: 'hiking-camping',
    icon: 'hiking',
    image: '/images/categories/hiking.jpg',
    parent: null,
    children: [
      {
        id: 101,
        name: { en: 'Tents', ka: 'ქოხები' },
        slug: 'tents',
        icon: 'tent',
        image: '/images/categories/tents.jpg',
        parent: 1,
        children: [
          { 
            id: 1001, 
            name: { en: 'Backpacking Tents', ka: 'ტურისტული ქოხები' }, 
            slug: 'backpacking-tents',
            icon: 'backpack',
            image: '',
            parent: 101,
            children: []
          },
          { 
            id: 1002, 
            name: { en: 'Camping Tents', ka: 'კემპინგის ქოხები' }, 
            slug: 'camping-tents',
            icon: 'camping',
            image: '',
            parent: 101,
            children: []
          }
        ]
      },
      {
        id: 102,
        name: { en: 'Sleeping Bags', ka: 'ძილის ტომარები' },
        slug: 'sleeping-bags',
        parent: 1,
        children: [
          {
            id: 1003,
            name: { en: 'Down Sleeping Bags', ka: 'ღრუბლოვანი ტომარები' },
            slug: 'down-sleeping-bags',
            parent: 102,
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: { en: 'Climbing', ka: 'ალპინიზმი' },
    slug: 'climbing',
    parent: null,
    children: [
      {
        id: 201,
        name: { en: 'Climbing Shoes', ka: 'ფეხსაცმელი' },
        slug: 'climbing-shoes',
        parent: 2,
        children: []
      },
      {
        id: 202,
        name: { en: 'Harnesses', ka: 'ამაღიზიანებლები' },
        slug: 'harnesses',
        parent: 2,
        children: []
      }
    ]
  },
  {
    id: 2,
    name: { en: 'Climbing', ka: 'ალპინიზმი' },
    slug: 'climbing',
    icon: 'climbing',
    image: '/images/categories/climbing.jpg',
    parent: null,
    children: [
      {
        id: 201,
        name: { en: 'Climbing Shoes', ka: 'ალპინისტური ფეხსაცმელი' },
        slug: 'climbing-shoes',
        icon: 'climbing-shoes',
        image: '/images/categories/climbing-shoes.jpg',
        parent: 2,
        children: []
      },
      {
        id: 202,
        name: { en: 'Harnesses', ka: 'ამაღრეები' },
        slug: 'harnesses',
        icon: 'harness',
        image: '/images/categories/harnesses.jpg',
        parent: 2,
        children: []
      }
    ]
  },
  {
    id: 3,
    name: { en: 'Cycling', ka: 'ველოსპორტი' },
    slug: 'cycling',
    icon: 'cycling',
    image: '/images/categories/cycling.jpg',
    parent: null,
    children: [
      {
        id: 301,
        name: { en: 'Mountain Bikes', ka: 'მთის ველოსიპედები' },
        slug: 'mountain-bikes',
        icon: 'mountain-bike',
        image: '/images/categories/mountain-bikes.jpg',
        parent: 3,
        children: []
      },
      {
        id: 302,
        name: { en: 'Road Bikes', ka: 'გზის ველოსიპედები' },
        slug: 'road-bikes',
        icon: 'road-bike',
        image: '/images/categories/road-bikes.jpg',
        parent: 3,
        children: []
      }
    ]
  },
  {
    id: 4,
    name: { en: 'Water Sports', ka: 'წყლის სპორტი' },
    slug: 'water-sports',
    icon: 'water-sports',
    image: '/images/categories/watersports.jpg',
    parent: null,
    children: [
      {
        id: 401,
        name: { en: 'Kayaks', ka: 'ბაირკები' },
        slug: 'kayaks',
        icon: 'kayak',
        image: '/images/categories/kayaks.jpg',
        parent: 4,
        children: []
      },
      {
        id: 402,
        name: { en: 'SUP Boards', ka: 'სათხილამურო დაფები' },
        slug: 'sup-boards',
        icon: 'sup-board',
        image: '/images/categories/sup-boards.jpg',
        parent: 4,
        children: []
      }
    ]
  },
  {
    id: 5,
    name: { en: 'Winter Sports', ka: 'ზამთრის სპორტი' },
    slug: 'winter-sports',
    icon: 'snow',
    image: '/images/categories/winter.jpg',
    parent: null,
    children: [
      {
        id: 501,
        name: { en: 'Skiing', ka: 'თხილამურებით სრიალი' },
        slug: 'skiing',
        icon: 'skiing',
        image: '/images/categories/skiing.jpg',
        parent: 5,
        children: []
      },
      {
        id: 502,
        name: { en: 'Snowboarding', ka: 'თოვლის დაფა' },
        slug: 'snowboarding',
        icon: 'snowboard',
        image: '/images/categories/snowboarding.jpg',
        parent: 5,
        children: []
      }
    ]
  },
  {
    id: 6,
    name: { en: 'Fitness', ka: 'ფიტნესი' },
    slug: 'fitness',
    icon: 'fitness',
    image: '/images/categories/fitness.jpg',
    parent: null,
    children: [
      {
        id: 601,
        name: { en: 'Yoga', ka: 'იოგა' },
        slug: 'yoga',
        icon: 'yoga',
        image: '/images/categories/yoga.jpg',
        parent: 6,
        children: []
      },
      {
        id: 602,
        name: { en: 'Running', ka: 'სირბილი' },
        slug: 'running',
        icon: 'running',
        image: '/images/categories/running.jpg',
        parent: 6,
        children: []
      }
    ]
  },
  {
    id: 7,
    name: { en: 'Team Sports', ka: 'გუნდური სპორტი' },
    slug: 'team-sports',
    icon: 'team-sports',
    image: '/images/categories/team-sports.jpg',
    parent: null,
    children: [
      {
        id: 701,
        name: { en: 'Football', ka: 'ფეხბურთი' },
        slug: 'football',
        icon: 'football',
        image: '/images/categories/football.jpg',
        parent: 7,
        children: []
      },
      {
        id: 702,
        name: { en: 'Basketball', ka: 'კალათბურთი' },
        slug: 'basketball',
        icon: 'basketball',
        image: '/images/categories/basketball.jpg',
        parent: 7,
        children: []
      }
    ]
  },
  {
    id: 8,
    name: { en: 'Fishing', ka: 'თევზაობა' },
    slug: 'fishing',
    icon: 'fishing',
    image: '/images/categories/fishing.jpg',
    parent: null,
    children: [
      {
        id: 801,
        name: { en: 'Fishing Rods', ka: 'აქლემები' },
        slug: 'fishing-rods',
        icon: 'fishing-rod',
        image: '/images/categories/fishing-rods.jpg',
        parent: 8,
        children: []
      },
      {
        id: 802,
        name: { en: 'Tackle Boxes', ka: 'სათევზაო ყუთები' },
        slug: 'tackle-boxes',
        icon: 'tackle-box',
        image: '/images/categories/tackle-boxes.jpg',
        parent: 8,
        children: []
      }
    ]
  },
  {
    id: 9,
    name: { en: 'Outdoor Gear', ka: 'გარე აღჭურვილობა' },
    slug: 'outdoor-gear',
    icon: 'outdoor',
    image: '/images/categories/outdoor.jpg',
    parent: null,
    children: [
      {
        id: 901,
        name: { en: 'Backpacks', ka: 'ზურგჩანთები' },
        slug: 'backpacks',
        icon: 'backpack',
        image: '/images/categories/backpacks.jpg',
        parent: 9,
        children: []
      },
      {
        id: 902,
        name: { en: 'Sleeping Bags', ka: 'ძილის ტომარები' },
        slug: 'sleeping-bags',
        icon: 'sleeping-bag',
        image: '/images/categories/sleeping-bags.jpg',
        parent: 9,
        children: []
      }
    ]
  },
  {
    id: 10,
    name: { en: 'Adventure Tours', ka: 'სათავგადასავლო ტურები' },
    slug: 'adventure-tours',
    icon: 'adventure',
    image: '/images/categories/adventure.jpg',
    parent: null,
    children: [
      {
        id: 1001,
        name: { en: 'Hiking Tours', ka: 'ლაშქრობის ტურები' },
        slug: 'hiking-tours',
        icon: 'hiking',
        image: '/images/categories/hiking-tours.jpg',
        parent: 10,
        children: []
      },
      {
        id: 1002,
        name: { en: 'Cycling Tours', ka: 'ველოპროგულები' },
        slug: 'cycling-tours',
        icon: 'cycling',
        image: '/images/categories/cycling-tours.jpg',
        parent: 10,
        children: []
      }
    ]
  }
];

export async function getCategories(): Promise<ICategory[]> {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(categoriesData);
    }, 100);
  });
}

export async function getCategory(slug: string): Promise<ICategory | undefined> {
  // Helper function to find a category by slug in the tree
  const findCategory = (categories: ICategory[], targetSlug: string): ICategory | undefined => {
    for (const category of categories) {
      if (category.slug === targetSlug) return category;
      if (category.children?.length) {
        const found = findCategory(category.children, targetSlug);
        if (found) return found;
      }
    }
    return undefined;
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(findCategory(categoriesData, slug));
    }, 100);
  });
}
