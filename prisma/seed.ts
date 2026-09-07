import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'
import bcrypt from 'bcryptjs'

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const defaultPassword = await bcrypt.hash('password123', 10)

  console.log('Memulai proses seeding data Vizada ERP...')

  console.log('1. Membuat Data Pengguna...')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mail.com' },
    update: {},
    create: { name: 'Admin Utama', email: 'admin@mail.com', passwordHash: defaultPassword, role: 'ADMIN', phone: '0811111111' },
  })

  const operator1 = await prisma.user.upsert({
    where: { email: 'operator@mail.com' },
    update: {},
    create: { name: 'Budi Operator', email: 'operator@mail.com', passwordHash: defaultPassword, role: 'OPERATOR', phone: '0822222222' },
  })

  const management = await prisma.user.upsert({
    where: { email: 'management@mail.com' },
    update: {},
    create: { name: 'Manager Produksi', email: 'management@mail.com', passwordHash: defaultPassword, role: 'MANAGEMENT', phone: '0844444444' },
  })

  const customer1 = await prisma.user.upsert({
    where: { email: 'customer@mail.com' },
    update: {},
    create: { name: 'Pelanggan Setia', email: 'customer@mail.com', passwordHash: defaultPassword, role: 'CUSTOMER', phone: '0855555555' },
  })

  console.log('2. Membuat Kategori & Supplier...')
  const catDigital = await prisma.category.create({ data: { name: 'Digital Printing A3+' } })
  const catOutdoor = await prisma.category.create({ data: { name: 'Large Format (Outdoor)' } })

  const supKertas = await prisma.supplier.create({ data: { name: 'PT Kertas Nasional', contact: '021-999888' } })
  const supTinta = await prisma.supplier.create({ data: { name: 'CV Tinta Makmur', contact: '081299997777' } })

  console.log('3. Membuat Material & Log Inventaris...')
  const matArtPaper = await prisma.material.create({ 
    data: { name: 'Art Paper 150gr (A3+)', stockQty: 8000, minStock: 1000, unit: 'Lembar', supplierId: supKertas.id } 
  })
  const matTinta = await prisma.material.create({ 
    data: { name: 'Toner CMYK', stockQty: 20, minStock: 5, unit: 'Cartridge', supplierId: supTinta.id } 
  })
  const matFlexi = await prisma.material.create({ 
    data: { name: 'Bahan Flexi 280gsm', stockQty: 50, minStock: 50, unit: 'Meter', supplierId: supKertas.id } 
  })

  await prisma.inventoryLog.createMany({
    data: [
      { materialId: matArtPaper.id, type: 'IN', qty: 8000, notes: 'Stok Awal' },
      { materialId: matTinta.id, type: 'IN', qty: 20, notes: 'Stok Awal' },
      { materialId: matFlexi.id, type: 'IN', qty: 50, notes: 'Stok Awal' }
    ]
  })

  console.log('4. Membuat Produk & BOM (Bill of Materials)...')
  const prodBrosur = await prisma.product.create({
    data: {
      categoryId: catDigital.id, 
      name: 'Cetak Brosur A4', 
      description: 'Cetak brosur full color kertas Art Paper 150gr, harga per 1 rim (500 lembar).', 
      basePrice: 150000, 
      unit: 'Rim',
      imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop',
      designs: {
        create: [
          { 
            title: 'Template Brosur Promosi Bisnis', 
            imageUrl: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&auto=format&fit=crop' 
          },
          { 
            title: 'Template Brosur Event & Seminar', 
            imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop' 
          }
        ]
      },
      materials: {
        create: [
          { materialId: matArtPaper.id, qtyNeeded: 250 },
          { materialId: matTinta.id, qtyNeeded: 0.05 }
        ]
      }
    }
  })

  const prodSpanduk = await prisma.product.create({
    data: {
      categoryId: catOutdoor.id, 
      name: 'Spanduk 280gr', 
      description: 'Spanduk banner outdoor bahan flexi standar 280gsm, tahan cuaca dan panas.', 
      basePrice: 15000, 
      unit: 'Meter',
      imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop',
      designs: {
        create: [
          { 
            title: 'Template Banner Grand Opening', 
            imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop' 
          },
          { 
            title: 'Template Spanduk Wisuda & Kelulusan', 
            imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop' 
          }
        ]
      },
      materials: {
        create: [
          { materialId: matFlexi.id, qtyNeeded: 1 },
          { materialId: matTinta.id, qtyNeeded: 0.02 }
        ]
      }
    }
  })

  console.log('5. Membuat Mesin & Jadwal Maintenance...')
  const machine1 = await prisma.machine.create({ data: { name: 'Konica Minolta (A3+)', status: 'AVAILABLE' } })
  const machine2 = await prisma.machine.create({ data: { name: 'Mesin Outdoor Flora', status: 'IN_USE' } })

  await prisma.maintenanceSchedule.create({
    data: {
      machineId: machine1.id,
      interval: 30,
      nextDue: new Date(new Date().setDate(new Date().getDate() + 15)),
      notes: 'Ganti drum unit bulanan'
    }
  })

  console.log('6. Membuat Kategori Keuangan & Transaksi Awal...')
  const catModal = await prisma.financialCategory.create({ data: { name: 'Modal Usaha', type: 'PEMASUKAN' } })
  const catBahan = await prisma.financialCategory.create({ data: { name: 'Belanja Bahan', type: 'PENGELUARAN' } })
  const catSales = await prisma.financialCategory.create({ data: { name: 'Penjualan', type: 'PEMASUKAN' } })

  await prisma.financialTransaction.createMany({
    data: [
      { categoryId: catModal.id, type: 'PEMASUKAN', amount: 50000000, description: 'Suntikan modal awal' },
      { categoryId: catBahan.id, type: 'PENGELUARAN', amount: 15000000, description: 'Beli stok kertas & tinta' }
    ]
  })

  console.log('7. Membuat Promosi & Voucher...')
  await prisma.promotion.create({
    data: {
      name: 'Diskon Akhir Tahun',
      type: 'DISKON_PERSEN',
      value: 10,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      active: true
    }
  })

  console.log('8. Simulasi Pesanan, Produksi, dan QC...')
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'VZ-20260506-1001',
      customerId: customer1.id,
      status: 'COMPLETED',
      totalAmount: 300000,
      deadline: new Date(new Date().setDate(new Date().getDate() + 2)),
      items: {
        create: {
          productId: prodBrosur.id,
          qty: 2,
          specifications: { 
            notes: "Warna cerah, cetak brosur promosi",
            designMode: "TEMPLATE",
            templateTitle: "Template Brosur Promosi Bisnis"
          },
          fileUrl: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&auto=format&fit=crop",
          subtotal: 300000
        }
      },
      payment: {
        create: {
          amount: 300000,
          method: 'BCA - 1234567890 (Vizada)',
          status: 'PAID',
          paidAt: new Date()
        }
      }
    },
    include: { items: true }
  })

  await prisma.financialTransaction.create({
    data: { categoryId: catSales.id, type: 'PEMASUKAN', amount: 300000, description: `Pembayaran Order ${order1.orderNumber}` }
  })

  const job1 = await prisma.productionJob.create({
    data: {
      orderItemId: order1.items[0].id,
      operatorId: operator1.id,
      machineId: machine1.id,
      status: 'DONE',
      startedAt: new Date(),
      completedAt: new Date()
    }
  })

  await prisma.qualityControl.create({
    data: {
      productionJobId: job1.id,
      inspectorId: operator1.id,
      status: 'PASSED',
      notes: '[QC: PASSED] Hasil potong rapi, warna sesuai.'
    }
  })

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'VZ-20260506-1002',
      customerId: customer1.id,
      status: 'IN_PRODUCTION',
      totalAmount: 75000,
      deadline: new Date(new Date().setDate(new Date().getDate() + 1)),
      items: {
        create: {
          productId: prodSpanduk.id,
          qty: 5,
          specifications: { 
            notes: "Kasih mata ayam tiap sudut",
            designMode: "CUSTOM"
          },
          fileUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop",
          subtotal: 75000
        }
      },
      payment: {
        create: {
          amount: 75000,
          method: 'BRI - 0987654321 (Vizada)',
          status: 'PAID',
          paidAt: new Date()
        }
      }
    },
    include: { items: true }
  })

  const job2 = await prisma.productionJob.create({
    data: {
      orderItemId: order2.items[0].id,
      status: 'PRINTING',
      machineId: machine2.id,
    }
  })

  await prisma.productionSchedule.create({
    data: {
      productionJobId: job2.id,
      machineId: machine2.id,
      scheduledDate: new Date(),
      priority: 'URGENT'
    }
  })

  console.log('====================================================')
  console.log('Seeding Selesai! Semua modul telah terisi data awal.')
  console.log('Gunakan email berikut untuk login (Password: password123):')
  console.log(`- Owner/Manager : ${management.email}`)
  console.log(`- Admin Kasir   : ${admin.email}`)
  console.log(`- Operator Mesin: ${operator1.email}`)
  console.log(`- Pelanggan     : ${customer1.email}`)
  console.log('====================================================')
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