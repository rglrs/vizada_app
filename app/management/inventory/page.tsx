import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, AlertTriangle } from "lucide-react"
import { CreateMaterialModal, AdjustStockModal, EditMaterialModal, DeleteMaterialModal } from "./inventory-modals"

export default async function InventoryPage() {
  const materials = await prisma.material.findMany({
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Inventaris</h1>
          <p className="text-muted-foreground">Kelola stok bahan baku produksi pencetakan Vizada.</p>
        </div>
        <CreateMaterialModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Stok Saat Ini
          </CardTitle>
          <CardDescription>Daftar seluruh bahan baku dan status persediaannya.</CardDescription>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              Belum ada data inventaris bahan baku.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Material</TableHead>
                    <TableHead>Stok Tersedia</TableHead>
                    <TableHead>Batas Minimum</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((item) => {
                    const isLowStock = item.stockQty <= item.minStock

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-semibold">{item.name}</TableCell>
                        <TableCell>
                          <span className="font-bold">{item.stockQty}</span> <span className="text-muted-foreground text-xs">{item.unit}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {item.minStock} {item.unit}
                        </TableCell>
                        <TableCell>
                          {isLowStock ? (
                            <span className="flex items-center gap-1.5 bg-red-100 text-red-800 px-2.5 py-1 rounded-md text-xs font-bold w-fit">
                              <AlertTriangle className="h-3.5 w-3.5" /> Stok Menipis
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-md text-xs font-bold w-fit">
                              Aman
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <AdjustStockModal materialId={item.id} materialName={item.name} unit={item.unit} />
                            <EditMaterialModal material={item} />
                            <DeleteMaterialModal materialId={item.id} materialName={item.name} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}