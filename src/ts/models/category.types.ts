export interface ICategory {
  id: number
  name: {
    en: string
    ka: string
  }
  slug: string
  icon?: string
  image?: string
  parent: ICategory | number | null
  children: ICategory[]
}
