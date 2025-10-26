// src/utils/transformPackages.ts
export interface DtoolsPackage {
  Id: string
  Name: string
  Description: string | null
}

export interface DtoolsItem {
  PackageId: string
  Manufacturer: string | null
  Model: string | null
  Description: string | null
  Quantity: number | null
  UnitCost: number | null
  UnitPrice: number | null
}

export interface DtoolsData {
  Packages?: DtoolsPackage[]
  Items?: DtoolsItem[]
}

export function transformPackages(data: DtoolsData): any[] {
  // Simple transformation for now - customize as needed
  return (data.Packages || []).map(pkg => ({
    ...pkg,
    ItemCount: (data.Items || []).filter(item => item.PackageId === pkg.Id).length
  }))
}