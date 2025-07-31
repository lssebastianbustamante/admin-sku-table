export interface Register {
  AccountNameAndSkuDis: string
  Name: string
  AccountName: string
  ERPCode: string
  Sku: string
  Active: boolean
}

export interface ErpData {
    Name: string
    AccountName: string
    ERPCode: string
    Sku: string
    Active: boolean
}

export interface RegisterList {
  AccountNameAndSkuDis: string
  ErpData: ErpData[]
}

export interface AuthToken {
  token: string
  expireTime: Date
}