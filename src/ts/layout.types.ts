export interface INavItem {
  title: string
  route: string
}

export interface IFooterSection {
  title: string
  pages: string[]
}

export interface IFooterItems {
  aboutUs: IFooterSection
  customer: IFooterSection
  termsAndConditions: IFooterSection
  contact: IFooterSection
}
