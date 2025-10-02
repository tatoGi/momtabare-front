export interface INavigationItem {
  id: number
  title: string
  path: string
  order: number
  active: boolean
  children?: INavigationItem[]
}