// Type definition for Category
export interface ICategory {
  id: number;
  name: {
    en: string;
    ka: string;
  };
  slug: string;
  icon?: string;
  image?: string;
  parent: ICategory | number | null;
  children: ICategory[];
}

// Example of how to use this with your mock data
// import type { ICategory } from '@/types/category';
// const categories: ICategory[] = [...];

