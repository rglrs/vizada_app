import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma'
import bcrypt from 'bcryptjs'

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const defaultPassword = await bcrypt.hash('password123', 10)

  console.log('🔄 Memulai proses seeding data Vizada...')

  console.log('👥 Membuat data pengguna...')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vizada.com' },
    update: {},
    create: { name: 'Admin Utama', email: 'admin@vizada.com', passwordHash: defaultPassword, role: 'ADMIN', phone: '0811111111' },
  })
  const operator1 = await prisma.user.upsert({
    where: { email: 'operator@vizada.com' },
    update: {},
    create: { name: 'Budi Operator', email: 'operator@vizada.com', passwordHash: defaultPassword, role: 'OPERATOR', phone: '0822222222' },
  })
  const operator2 = await prisma.user.upsert({
    where: { email: 'operator2@vizada.com' },
    update: {},
    create: { name: 'Siti Operator', email: 'operator2@vizada.com', passwordHash: defaultPassword, role: 'OPERATOR', phone: '0833333333' },
  })
  const management = await prisma.user.upsert({
    where: { email: 'management@vizada.com' },
    update: {},
    create: { name: 'Manager Produksi', email: 'management@vizada.com', passwordHash: defaultPassword, role: 'MANAGEMENT', phone: '0844444444' },
  })
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer@vizada.com' },
    update: {},
    create: { name: 'Pelanggan Setia', email: 'customer@vizada.com', passwordHash: defaultPassword, role: 'CUSTOMER', phone: '0855555555' },
  })
  const customer2 = await prisma.user.upsert({
    where: { email: 'joko@gmail.com' },
    update: {},
    create: { name: 'Joko Anwar', email: 'joko@gmail.com', passwordHash: defaultPassword, role: 'CUSTOMER', phone: '0866666666' },
  })

  console.log('📂 Membuat kategori produk...')
  const catDigital = await prisma.category.create({ data: { name: 'Digital Printing A3+' } })
  const catOutdoor = await prisma.category.create({ data: { name: 'Large Format (Outdoor)' } })
  const catIndoor = await prisma.category.create({ data: { name: 'Large Format (Indoor)' } })
  const catMerch = await prisma.category.create({ data: { name: 'Merchandise & Souvenir' } })
  await prisma.category.create({ data: { name: 'Offset Printing' } })

  console.log('🏭 Membuat data supplier...')
  const supKertas = await prisma.supplier.create({ data: { name: 'PT Kertas Nasional', contact: '021-999888 (Pak Yanto)' } })
  const supTinta = await prisma.supplier.create({ data: { name: 'CV Tinta Makmur', contact: '081299997777 (Ibu Desi)' } })
  const supMerch = await prisma.supplier.create({ data: { name: 'Grosir Souvenir JKT', contact: '021-555444' } })
  const supBahanBesar = await prisma.supplier.create({ data: { name: 'Mega Flexiindo', contact: '085566667777' } })

  console.log('📦 Membuat data bahan baku (Material)...')
  const matArtCarton260 = await prisma.material.create({ data: { name: 'Art Carton 260gr (A3+)', stockQty: 5000, minStock: 500, unit: 'Lembar', supplierId: supKertas.id } })
  const matArtPaper150 = await prisma.material.create({ data: { name: 'Art Paper 150gr (A3+)', stockQty: 8000, minStock: 1000, unit: 'Lembar', supplierId: supKertas.id } })
  const matStikerVinyl = await prisma.material.create({ data: { name: 'Stiker Vinyl A3+', stockQty: 3000, minStock: 300, unit: 'Lembar', supplierId: supKertas.id } })
  
  const matTintaToner = await prisma.material.create({ data: { name: 'Toner CMYK', stockQty: 20, minStock: 5, unit: 'Cartridge', supplierId: supTinta.id } })
  const matTintaSolvent = await prisma.material.create({ data: { name: 'Tinta Solvent (Outdoor)', stockQty: 50, minStock: 10, unit: 'Liter', supplierId: supTinta.id } })
  const matTintaEco = await prisma.material.create({ data: { name: 'Tinta Eco-Solvent (Indoor)', stockQty: 30, minStock: 5, unit: 'Liter', supplierId: supTinta.id } })
  const matTintaSublim = await prisma.material.create({ data: { name: 'Tinta Sublim', stockQty: 15, minStock: 3, unit: 'Liter', supplierId: supTinta.id } })

  const matFlexi280 = await prisma.material.create({ data: { name: 'Bahan Flexi 280gsm', stockQty: 500, minStock: 50, unit: 'Meter', supplierId: supBahanBesar.id } })
  await prisma.material.create({ data: { name: 'Bahan Flexi Korea 440gsm', stockQty: 300, minStock: 50, unit: 'Meter', supplierId: supBahanBesar.id } })
  const matAlbatros = await prisma.material.create({ data: { name: 'Kertas Albatros', stockQty: 200, minStock: 20, unit: 'Meter', supplierId: supBahanBesar.id } })

  const matMugPolos = await prisma.material.create({ data: { name: 'Mug Putih Polos', stockQty: 500, minStock: 100, unit: 'Pcs', supplierId: supMerch.id } })
  const matPinBahan = await prisma.material.create({ data: { name: 'Bahan Pin 58mm', stockQty: 2000, minStock: 500, unit: 'Set', supplierId: supMerch.id } })

  console.log('🛍️ Membuat data produk dan resep BOM...')
  
  await prisma.product.create({
    data: {
      categoryId: catDigital.id, name: 'Cetak Brosur A4 (1 Sisi)', description: 'Brosur full color bahan Art Paper 150gr. Harga per 1 rim (500 lbr).', basePrice: 150000, unit: 'Rim',
      materials: {
        create: [
          { materialId: matArtPaper150.id, qtyNeeded: 250 },
          { materialId: matTintaToner.id, qtyNeeded: 0.05 }
        ]
      }
    }
  })

  await prisma.product.create({
    data: {
      categoryId: catDigital.id, name: 'Cetak Kartu Nama (1 Box)', description: 'Bahan Art Carton 260gr, isi 100 pcs/box.', basePrice: 25000, unit: 'Box',
      materials: {
        create: [
          { materialId: matArtCarton260.id, qtyNeeded: 5 },
          { materialId: matTintaToner.id, qtyNeeded: 0.01 }
        ]
      }
    }
  })

  await prisma.product.create({
    data: {
      categoryId: catDigital.id, name: 'Cetak Stiker Vinyl A3+ (Kiss Cut)', description: 'Stiker anti air, sudah termasuk potong bentuk.', basePrice: 12000, unit: 'Lembar A3+',
      materials: {
        create: [
          { materialId: matStikerVinyl.id, qtyNeeded: 1 },
          { materialId: matTintaToner.id, qtyNeeded: 0.02 }
        ]
      }
    }
  })

  await prisma.product.create({
    data: {
      categoryId: catOutdoor.id, name: 'Cetak Spanduk / Banner 280gr', description: 'Bahan Flexi China 280gr. Harga per meter persegi.', basePrice: 15000, unit: 'Meter Persegi',
      materials: {
        create: [
          { materialId: matFlexi280.id, qtyNeeded: 1 }, 
          { materialId: matTintaSolvent.id, qtyNeeded: 0.05 }
        ]
      }
    }
  })

  await prisma.product.create({
    data: {
      categoryId: catIndoor.id, name: 'X-Banner Albatros (60x160cm)', description: 'Cetak hi-res indoor, sudah termasuk tiang X-Banner.', basePrice: 85000, unit: 'Set',
      materials: {
        create: [
          { materialId: matAlbatros.id, qtyNeeded: 1.6 },
          { materialId: matTintaEco.id, qtyNeeded: 0.08 }
        ]
      }
    }
  })

  await prisma.product.create({
    data: {
      categoryId: catMerch.id, name: 'Cetak Mug Custom', description: 'Mug keramik putih standar dengan cetak full color.', basePrice: 20000, unit: 'Pcs',
      materials: {
        create: [
          { materialId: matMugPolos.id, qtyNeeded: 1 },
          { materialId: matTintaSublim.id, qtyNeeded: 0.01 }
        ]
      }
    }
  })

  await prisma.product.create({
    data: {
      categoryId: catMerch.id, name: 'Pin Gantungan Kunci 58mm', description: 'Pin custom lapis laminasi glossy/doff.', basePrice: 3500, unit: 'Pcs',
      materials: {
        create: [
          { materialId: matPinBahan.id, qtyNeeded: 1 },
          { materialId: matArtPaper150.id, qtyNeeded: 0.05 },
          { materialId: matTintaToner.id, qtyNeeded: 0.001 }
        ]
      }
    }
  })

  console.log('⚙️ Membuat data mesin cetak...')
  await prisma.machine.createMany({
    data: [
      { name: 'Konica Minolta AccurioPress (A3+)', status: 'AVAILABLE' },
      { name: 'Fuji Xerox Versant (A3+)', status: 'IN_USE' },
      { name: 'Mesin Outdoor Flora Polaris 3.2m', status: 'AVAILABLE' },
      { name: 'Mesin Indoor Roland VersaEXPRESS', status: 'AVAILABLE' },
      { name: 'Mesin Laser Cutting Bodor', status: 'MAINTENANCE' },
      { name: 'Mesin Press Mug Double', status: 'AVAILABLE' },
      { name: 'Mesin Plong Pin Custom', status: 'AVAILABLE' }
    ]
  })

  console.log('✅ Semua data berhasil di-seed!')
  console.log('----------------------------------------------------')
  console.log('Akun yang bisa digunakan (Password: password123):')
  console.log(`👑 ADMIN      : ${admin.email}`)
  console.log(`👨‍🔧 OPERATOR 1 : ${operator1.email}`)
  console.log(`👩‍🔧 OPERATOR 2 : ${operator2.email}`)
  console.log(`👔 MANAGEMENT : ${management.email}`)
  console.log(`🛒 CUSTOMER 1 : ${customer1.email}`)
  console.log(`🛒 CUSTOMER 2 : ${customer2.email}`)
  console.log('----------------------------------------------------')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })