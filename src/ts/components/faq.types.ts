export interface IFAQItem {
    value: string
    title: string
    icon: string
    content: string
}

export interface IFAQCards {
    icon: string
    title: string
    name: EFAQCategory
    description: string
}

export interface IFAQ {
    value: string
    question: string
    answer: string
}

export enum EFAQCategory {
    CLIENT = "CLIENT",
    RETAILER = "RETAILER",
    ADMIN = "ADMIN"
}
