export interface DtoolsItem {
  PackageId: string
  Manufacturer: string | null
  Model: string | null
  Description: string | null
  Quantity: number | null
  UnitCost: number | null
  UnitPrice: number | null
}

export interface DtoolsPackage {
  Id: string
  Name: string
  Description: string | null
}

export interface DtoolsData {
  Packages?: DtoolsPackage[]
  Items?: DtoolsItem[]
}

export interface AddOnPackage {
  PackageId: string
  PackageName: string
  Description: string | null
  Items: Array<{
    Manufacturer: string | null
    Model: string | null
    Description: string | null
    Quantity: number | null
    UnitCost: number | null
    UnitPrice: number | null
  }>
}

export function extractAddOns(data: DtoolsData): AddOnPackage[] {
  const addonPackages = (data.Packages || []).filter((pkg: DtoolsPackage) =>
    pkg.Name.toLowerCase().includes('add-on')
  )

  return addonPackages.map((pkg: DtoolsPackage) => {
    const items = (data.Items || []).filter((item: DtoolsItem) => item.PackageId === pkg.Id)
    
    return {
      PackageId: pkg.Id,
      PackageName: pkg.Name,
      Description: pkg.Description || null,
      Items: items.map((item: DtoolsItem) => ({
        Manufacturer: item.Manufacturer || null,
        Model: item.Model || null,
        Description: item.Description || null,
        Quantity: item.Quantity ?? null,
        UnitCost: item.UnitCost ?? null,
        UnitPrice: item.UnitPrice ?? null
      }))
    }
  })
}