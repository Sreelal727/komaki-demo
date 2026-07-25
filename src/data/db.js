// ---------------------------------------------------------------------------
// Lestova ERP — mock database (deterministic seed so the demo never shifts)
// ---------------------------------------------------------------------------

// Tiny seeded PRNG (mulberry32) — stable data across reloads for a clean demo.
function makeRng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = makeRng(42)
const pick = (arr) => arr[Math.floor(rng() * arr.length)]
const int = (min, max) => Math.floor(rng() * (max - min + 1)) + min

export const CURRENCY = '₹'
export const money = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

// --- Outlets (each is a partnership Lestova co-owns with a local partner) ----
export const outlets = [
  { id: 'HQ',  name: 'Lestova HQ',       city: 'Kozhikode',   short: 'HQ',   isHQ: true,  partner: 'Lestova Vehicles India Pvt Ltd', share: 100, since: '2021' },
  { id: 'CLT', name: 'Calicut Flagship', city: 'Kozhikode',   short: 'Calicut',  partner: 'Rahul Menon',       share: 45, since: '2021' },
  { id: 'KOC', name: 'Kochi Marine Dr.', city: 'Ernakulam',   short: 'Kochi',    partner: 'Anitha Nair',       share: 50, since: '2022' },
  { id: 'TCR', name: 'Thrissur Round',    city: 'Thrissur',    short: 'Thrissur', partner: 'Faisal Rahman',     share: 40, since: '2022' },
  { id: 'KNR', name: 'Kannur City',       city: 'Kannur',      short: 'Kannur',   partner: 'Deepa Krishnan',    share: 48, since: '2023' },
  { id: 'TVM', name: 'Trivandrum Central',city: 'Thiruvananthapuram', short: 'Trivandrum', partner: 'Sabu Thomas', share: 42, since: '2023' },
]
export const salesOutlets = outlets.filter((o) => !o.isHQ)

// --- Users / roles -----------------------------------------------------------
export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  FRANCHISE: 'Franchise Owner',
  EMPLOYEE: 'Employee',
}
export const users = [
  { id: 'u-owner', name: 'Vishnu Prasad', role: ROLES.SUPER_ADMIN, outletId: 'HQ',  title: 'Managing Director, Lestova', avatar: 'VP' },
  { id: 'u-admin', name: 'Meera Suresh',  role: ROLES.ADMIN,       outletId: 'HQ',  title: 'Operations Manager (HQ)',   avatar: 'MS' },
  { id: 'u-clt',   name: 'Rahul Menon',   role: ROLES.FRANCHISE,   outletId: 'CLT', title: 'Partner — Calicut',         avatar: 'RM' },
  { id: 'u-koc',   name: 'Anitha Nair',   role: ROLES.FRANCHISE,   outletId: 'KOC', title: 'Partner — Kochi',           avatar: 'AN' },
  { id: 'u-emp',   name: 'Sneha Pillai',  role: ROLES.EMPLOYEE,    outletId: 'CLT', title: 'Sales Executive — Calicut', avatar: 'SP' },
]

// --- Komaki model master -----------------------------------------------------
export const komakiModels = [
  { model: 'Komaki XGT KM',  segment: 'High Speed', price: 154000, range: 120, battery: '48V / 74Ah Li-ion', motor: '2500W', topSpeed: 90, colors: ['Matte Black', 'Blue', 'Red', 'White'] },
  { model: 'Komaki Ranger',  segment: 'High Speed', price: 168000, range: 200, battery: '72V / 40Ah Li-ion', motor: '4000W', topSpeed: 100, colors: ['Grey', 'Black', 'Green'] },
  { model: 'Komaki SE',      segment: 'High Speed', price: 111000, range: 110, battery: '60V / 40Ah Li-ion', motor: '2000W', topSpeed: 80, colors: ['White', 'Silver', 'Red'] },
  { model: 'Komaki Venice',  segment: 'Low Speed',  price: 89000,  range: 100, battery: '60V / 30Ah Li-ion', motor: '1200W', topSpeed: 65, colors: ['Cyan', 'Pink', 'White', 'Black'] },
  { model: 'Komaki Flora',   segment: 'Low Speed',  price: 79000,  range: 90,  battery: '60V / 30Ah Li-ion', motor: '1000W', topSpeed: 60, colors: ['Beige', 'Rose', 'Grey'] },
  { model: 'Komaki DT 3000', segment: 'High Speed', price: 137000, range: 230, battery: '72V / 45Ah Li-ion', motor: '3000W', topSpeed: 95, colors: ['Black', 'Blue', 'Orange'] },
  { model: 'Komaki X-One',   segment: 'Low Speed',  price: 92000,  range: 80,  battery: '48V / 28Ah Li-ion', motor: '1000W', topSpeed: 60, colors: ['Red', 'White', 'Grey'] },
  { model: 'Komaki M-5',     segment: 'Low Speed',  price: 68000,  range: 75,  battery: '48V / 24Ah Li-ion', motor: '800W',  topSpeed: 45, colors: ['White', 'Blue'] },
]

// --- Vehicles inventory (unit-level: chassis + motor numbers) ----------------
let vseq = 1000
export const vehicles = []
for (const o of salesOutlets) {
  const count = int(9, 16)
  for (let i = 0; i < count; i++) {
    const m = pick(komakiModels)
    const color = pick(m.colors)
    vseq++
    const sold = rng() < 0.28
    const inTransit = !sold && rng() < 0.12
    vehicles.push({
      id: 'VH' + vseq,
      outletId: o.id,
      model: m.model,
      segment: m.segment,
      color,
      chassis: 'MD2' + String.fromCharCode(65 + int(0, 25)) + int(10, 99) + 'KM' + (vseq * 7),
      motorNo: 'KMKM-' + m.motor.replace('W', '') + '-' + (vseq * 3),
      price: m.price,
      status: sold ? 'Sold' : inTransit ? 'In Transit' : 'In Stock',
      addedOn: `2026-0${int(4, 7)}-${String(int(1, 28)).padStart(2, '0')}`,
    })
  }
}

// --- Spare parts (mapped to a model) ----------------------------------------
const spareTypes = [
  ['Battery Pack', 24000], ['Motor Controller', 6800], ['BLDC Motor', 12500],
  ['Front Wheel Assembly', 3200], ['Rear Wheel Assembly', 3600], ['Brake Disc', 1400],
  ['Throttle Assembly', 900], ['Charger 5A', 3500], ['Wiring Harness', 2100], ['DC-DC Converter', 2400],
]
let sseq = 0
export const spares = []
for (const o of salesOutlets) {
  for (const [name, price] of spareTypes) {
    if (rng() < 0.25) continue
    sseq++
    const qty = int(0, 14)
    spares.push({
      id: 'SP' + (2000 + sseq), outletId: o.id, name,
      fitsModel: pick(komakiModels).model, price,
      qty, reorderLevel: 4, status: qty === 0 ? 'Out of Stock' : qty <= 4 ? 'Low' : 'OK',
    })
  }
}

// --- Accessories -------------------------------------------------------------
const accTypes = [
  ['Premium Helmet (ISI)', 1800], ['Vehicle Body Cover', 650], ['Fast Charger', 4200],
  ['Side Mirror Set', 550], ['Mobile Holder', 400], ['Seat Cushion', 900],
  ['Leg Guard', 1100], ['Alloy Wheel Cap', 750],
]
let aseq = 0
export const accessories = []
for (const o of salesOutlets) {
  for (const [name, price] of accTypes) {
    if (rng() < 0.2) continue
    aseq++
    const qty = int(0, 30)
    accessories.push({
      id: 'AC' + (3000 + aseq), outletId: o.id, name, price,
      qty, reorderLevel: 6, status: qty === 0 ? 'Out of Stock' : qty <= 6 ? 'Low' : 'OK',
    })
  }
}

// --- Compliment / free-gift stock -------------------------------------------
const compTypes = [
  ['Riding Jacket', 1200], ['Premium Keychain', 150], ['First-Aid Box', 300],
  ['Branded Raincoat', 500], ['Phone Mount', 350],
]
let cseq = 0
export const compliments = []
for (const o of salesOutlets) {
  for (const [name, cost] of compTypes) {
    cseq++
    compliments.push({
      id: 'CM' + (4000 + cseq), outletId: o.id, name, cost,
      issued: int(2, 20), inStock: int(5, 40),
    })
  }
}

// --- Vendors -----------------------------------------------------------------
export const vendors = [
  { id: 'VN01', name: 'Komaki Electric Division (OEM)', type: 'Vehicles (OEM)', contact: 'Sanjay Gupta', phone: '+91 98200 11223', city: 'Ahmedabad', rating: 4.8, leadDays: 14, terms: 'Net 30', onTime: 96 },
  { id: 'VN02', name: 'Amaron Quanta Batteries',       type: 'Batteries',      contact: 'Priya Iyer',   phone: '+91 90030 44556', city: 'Chennai',   rating: 4.5, leadDays: 7,  terms: 'Net 15', onTime: 91 },
  { id: 'VN03', name: 'Vega Auto Accessories',         type: 'Accessories',    contact: 'Imran Khan',   phone: '+91 99400 77889', city: 'Coimbatore',rating: 4.2, leadDays: 5,  terms: 'Advance', onTime: 88 },
  { id: 'VN04', name: 'Studds Helmets Ltd',            type: 'Accessories',    contact: 'Neha Bansal',  phone: '+91 98110 22334', city: 'Faridabad', rating: 4.6, leadDays: 6,  terms: 'Net 15', onTime: 94 },
  { id: 'VN05', name: 'Kerala EV Spares Hub',          type: 'Spare Parts',    contact: 'Joseph Kurian',phone: '+91 94470 55667', city: 'Ernakulam', rating: 4.0, leadDays: 3,  terms: 'Net 7',  onTime: 82 },
]

// --- Purchase orders ---------------------------------------------------------
export const purchaseOrders = [
  { id: 'PO-2607', vendorId: 'VN01', outletId: 'HQ',  date: '2026-07-18', status: 'Approved',  eta: '2026-08-01', total: 1848000,
    lines: [{ item: 'Komaki Ranger', qty: 6, rate: 168000 }, { item: 'Komaki DT 3000', qty: 6, rate: 137000 }] },
  { id: 'PO-2606', vendorId: 'VN02', outletId: 'HQ',  date: '2026-07-15', status: 'In Transit', eta: '2026-07-26', total: 288000,
    lines: [{ item: 'Battery Pack (72V/40Ah)', qty: 12, rate: 24000 }] },
  { id: 'PO-2605', vendorId: 'VN04', outletId: 'CLT', date: '2026-07-12', status: 'Received',   eta: '2026-07-19', total: 90000,
    lines: [{ item: 'Premium Helmet (ISI)', qty: 50, rate: 1800 }] },
  { id: 'PO-2604', vendorId: 'VN03', outletId: 'KOC', date: '2026-07-20', status: 'Draft',      eta: '2026-07-30', total: 63000,
    lines: [{ item: 'Fast Charger', qty: 15, rate: 4200 }] },
  { id: 'PO-2603', vendorId: 'VN05', outletId: 'TCR', date: '2026-07-21', status: 'Pending Approval', eta: '2026-07-28', total: 34000,
    lines: [{ item: 'Motor Controller', qty: 5, rate: 6800 }] },
]

// --- Stock transfers between outlets -----------------------------------------
export const transfers = [
  { id: 'TR-318', from: 'KOC', to: 'CLT', item: 'Komaki XGT KM — Blue', qty: 1, status: 'Approved',  date: '2026-07-22', requestedBy: 'Rahul Menon' },
  { id: 'TR-317', from: 'HQ',  to: 'TVM', item: 'Komaki Venice — Cyan', qty: 2, status: 'In Transit', date: '2026-07-20', requestedBy: 'Sabu Thomas' },
  { id: 'TR-316', from: 'TCR', to: 'KNR', item: 'Battery Pack', qty: 3, status: 'Pending', date: '2026-07-23', requestedBy: 'Deepa Krishnan' },
  { id: 'TR-315', from: 'CLT', to: 'KOC', item: 'Premium Helmet (ISI)', qty: 10, status: 'Completed', date: '2026-07-14', requestedBy: 'Anitha Nair' },
]

// --- Sales (last ~90 days, unit level) ---------------------------------------
const buyers = ['Arun K', 'Lakshmi R', 'Mohammed A', 'Reshma S', 'Tony J', 'Gopika M', 'Sameer P', 'Divya N', 'Hari K', 'Zara F', 'Nikhil V', 'Ayesha B']
let saleSeq = 5000
export const sales = []
for (const o of salesOutlets) {
  const n = int(10, 20)
  for (let i = 0; i < n; i++) {
    const m = pick(komakiModels)
    const accCount = int(0, 3)
    const accTotal = accCount * int(400, 4200)
    saleSeq++
    const month = int(4, 7)
    sales.push({
      id: 'INV-' + saleSeq,
      outletId: o.id,
      date: `2026-${String(month).padStart(2, '0')}-${String(int(1, 28)).padStart(2, '0')}`,
      customer: pick(buyers),
      model: m.model,
      color: pick(m.colors),
      vehicleAmt: m.price,
      accAmt: accTotal,
      compliment: pick(compTypes)[0],
      total: m.price + accTotal,
      staff: pick(['Sneha Pillai', 'Rohit Das', 'Manju S', 'Kevin T']),
    })
  }
}

// --- Daily expenses ----------------------------------------------------------
const expTypes = ['Staff Tea/Snacks', 'Cleaning Materials', 'Office Stationery', 'Courier', 'Electricity Top-up', 'Water Can', 'Showroom Maintenance', 'Fuel (delivery)']
let eseq = 0
export const expenses = []
for (const o of salesOutlets) {
  const n = int(6, 12)
  for (let i = 0; i < n; i++) {
    eseq++
    expenses.push({
      id: 'EXP-' + (7000 + eseq), outletId: o.id,
      date: `2026-07-${String(int(1, 25)).padStart(2, '0')}`,
      category: pick(expTypes), amount: int(80, 1500),
      by: pick(['Sneha Pillai', 'Rohit Das', 'Manju S']),
    })
  }
}

// --- Staff + attendance ------------------------------------------------------
export const staff = [
  { id: 'ST01', name: 'Sneha Pillai', outletId: 'CLT', role: 'Sales Executive', status: 'Present', in: '09:02', out: '—', duty: 'Showroom floor + walk-ins' },
  { id: 'ST02', name: 'Rohit Das',    outletId: 'CLT', role: 'Delivery & PDI',   status: 'Present', in: '09:10', out: '—', duty: 'Vehicle PDI & registration' },
  { id: 'ST03', name: 'Manju S',      outletId: 'CLT', role: 'Accounts',         status: 'Present', in: '08:55', out: '—', duty: 'Billing & daily closure' },
  { id: 'ST04', name: 'Kevin T',      outletId: 'CLT', role: 'Service Tech',     status: 'On Leave',in: '—',     out: '—', duty: '—' },
  { id: 'ST05', name: 'Fathima R',    outletId: 'KOC', role: 'Sales Executive', status: 'Present', in: '09:20', out: '—', duty: 'Test rides' },
  { id: 'ST06', name: 'Arjun P',      outletId: 'KOC', role: 'Service Tech',     status: 'Present', in: '09:00', out: '—', duty: 'Battery diagnostics' },
]

// --- Quarterly profit-sharing (per outlet contract %) ------------------------
export const profitShare = salesOutlets.map((o) => {
  const revenue = int(48, 96) * 100000
  const cogs = Math.round(revenue * (0.72 + rng() * 0.06))
  const opex = int(3, 7) * 100000
  const netProfit = revenue - cogs - opex
  const partnerShare = Math.round((netProfit * o.share) / 100)
  return {
    outletId: o.id, outlet: o.name, partner: o.partner, sharePct: o.share,
    revenue, cogs, opex, netProfit,
    partnerShare, lestovaShare: netProfit - partnerShare,
  }
})

// --- Derived monthly trend for charts ---------------------------------------
export const monthlyTrend = [
  { month: 'Feb', units: 38, revenue: 4.2 },
  { month: 'Mar', units: 44, revenue: 5.1 },
  { month: 'Apr', units: 51, revenue: 6.0 },
  { month: 'May', units: 47, revenue: 5.4 },
  { month: 'Jun', units: 58, revenue: 6.9 },
  { month: 'Jul', units: 63, revenue: 7.6 },
]
