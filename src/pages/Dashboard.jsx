import { Link } from 'react-router-dom'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts'
import { useStore } from '../lib/store.jsx'
import { computeInsights } from '../lib/insights.js'
import { monthlyTrend, purchaseOrders, outlets, vehicles as allVehicles, sales as allSales } from '../data/db.js'
import { PageHeader, Stat, SectionCard, Table, StatusBadge, Money, Icon, Badge } from '../components/ui.jsx'
import { SaigaMark } from './Saiga.jsx'

const BRAND = ['#1f39db', '#597dff', '#8eabff', '#bccfff', '#3355f5', '#1a2db0', '#c4b5fd', '#a78bfa']
const tip = { contentStyle: { borderRadius: 12, border: '1px solid #eceef2', fontSize: 13 } }

export default function Dashboard() {
  const store = useStore()
  const { user, hq, scope, vehicles, sales, spares, accessories, compliments } = store

  const inStock = vehicles.filter((v) => v.status === 'In Stock')
  const sold = vehicles.filter((v) => v.status === 'Sold')
  const stockValue = inStock.reduce((s, v) => s + v.price, 0)
  const revenue = sales.reduce((s, r) => s + r.total, 0)
  const lowStock = [...spares, ...accessories].filter((i) => i.status !== 'OK').length
  const pendingPO = purchaseOrders.filter((p) => p.status === 'Draft' || p.status === 'Pending Approval').length
  const withAcc = sales.filter((s) => s.accAmt > 0).length
  const attach = sales.length ? Math.round((withAcc / sales.length) * 100) : 0
  const avgTicket = sales.length ? Math.round(revenue / sales.length) : 0

  const consolidated = hq && scope === 'ALL'
  const scopeLabel = consolidated ? 'All outlets' : outlets.find((o) => o.id === scope)?.name

  // segment mix (donut)
  const seg = ['High Speed', 'Low Speed'].map((s) => ({
    name: s, value: inStock.filter((v) => v.segment === s).length,
  })).filter((d) => d.value > 0)

  // sales by model (donut, top 5)
  const modelMap = {}
  sales.forEach((s) => { modelMap[s.model] = (modelMap[s.model] || 0) + 1 })
  const byModel = Object.entries(modelMap).map(([name, value]) => ({ name: name.replace('Komaki ', ''), value }))
    .sort((a, b) => b.value - a.value).slice(0, 6)

  // revenue by group (bar): outlets for HQ, models for a single outlet
  const revBar = consolidated
    ? outlets.filter((o) => !o.isHQ).map((o) => ({ name: o.short, value: allSales.filter((s) => s.outletId === o.id).reduce((a, r) => a + r.total, 0) }))
    : byModel.map((m) => ({ name: m.name, value: sales.filter((s) => s.model.includes(m.name)).reduce((a, r) => a + r.total, 0) }))

  // inventory value by category (horizontal bars)
  const invValue = [
    { name: 'Vehicles', value: stockValue },
    { name: 'Spares', value: spares.reduce((s, i) => s + i.price * i.qty, 0) },
    { name: 'Accessories', value: accessories.reduce((s, i) => s + i.price * i.qty, 0) },
    { name: 'Compliments', value: compliments.reduce((s, i) => s + i.cost * i.inStock, 0) },
  ]
  const invMax = Math.max(...invValue.map((i) => i.value), 1)

  const insights = computeInsights(store).slice(0, 3)

  return (
    <div>
      <PageHeader
        title={consolidated ? 'HQ Command Center' : `${scopeLabel} Dashboard`}
        subtitle={consolidated
          ? `Consolidated view across ${outlets.filter(o => !o.isHQ).length} partner outlets · live roll-up`
          : `${user.role} view · scoped to ${scopeLabel}`}
        actions={<Link to="/saiga" className="btn-primary"><Icon name="sparkle" className="w-4 h-4" /> Ask Saiga</Link>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon="scooter" label="Vehicles in stock" value={inStock.length} sub={`${sold.length} sold this period`} tone="blue" />
        <Stat icon="tag" label="Stock value" value={<Money value={stockValue} />} sub="unsold inventory" tone="violet" />
        <Stat icon="receipt" label="Revenue (period)" value={<Money value={revenue} />} trend="+11% vs last month" tone="green" />
        <Stat icon="alert" label="Low / out of stock" value={lowStock} sub={`${pendingPO} POs pending`} tone={lowStock > 0 ? 'amber' : 'green'} />
      </div>

      {/* Saiga highlights */}
      <div className="rounded-2xl mb-6 overflow-hidden text-white" style={{ background: 'linear-gradient(120deg,#4c1d95,#1f39db)' }}>
        <div className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SaigaMark className="w-10 h-10" />
            <div>
              <div className="font-extrabold tracking-tight flex items-center gap-2">Saiga Intelligence <span className="chip bg-white/15 text-white text-[10px]">AI</span></div>
              <div className="text-sm text-white/70">Top {insights.length} things to act on in this view</div>
            </div>
          </div>
          <Link to="/saiga" className="btn bg-white/15 text-white hover:bg-white/25">View all insights <Icon name="chevron" className="w-4 h-4 -rotate-90" /></Link>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-white/10">
          {insights.map((ins) => (
            <Link to={ins.actionTo || '/saiga'} key={ins.id} className="bg-[#241a54] hover:bg-[#2c2065] transition p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/60 font-bold mb-1.5">
                <Icon name={ins.icon} className="w-3.5 h-3.5" /> {ins.kind === 'alert' ? 'Act now' : ins.kind === 'opportunity' ? 'Opportunity' : ins.kind === 'trend' ? 'Trend' : 'Optimise'}
              </div>
              <div className="font-bold text-sm leading-snug">{ins.title}</div>
              {ins.impact && <div className="text-xs text-white/60 mt-1">{ins.impact}</div>}
            </Link>
          ))}
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon="tag" label="Accessory attach rate" value={attach + '%'} sub="of vehicle sales" tone={attach < 55 ? 'amber' : 'green'} />
        <Stat icon="receipt" label="Avg ticket size" value={<Money value={avgTicket} />} tone="blue" />
        <Stat icon="gift" label="Free gifts issued" value={compliments.reduce((s, c) => s + c.issued, 0)} tone="violet" />
        <Stat icon="swap" label="Units sold" value={sales.length} tone="blue" />
      </div>

      {/* Charts row A */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <SectionCard title="Sales & revenue trend" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyTrend} margin={{ left: -18, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1f39db" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#1f39db" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8590a8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8590a8' }} axisLine={false} tickLine={false} />
              <Tooltip {...tip} />
              <Area type="monotone" dataKey="units" stroke="#1f39db" strokeWidth={2.5} fill="url(#g1)" name="Units sold" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Inventory mix">
          <Donut data={seg} />
          <Legend data={seg} />
        </SectionCard>
      </div>

      {/* Charts row B */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <SectionCard title={consolidated ? 'Revenue by outlet' : 'Revenue by model'} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revBar} margin={{ left: -6, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8590a8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8590a8' }} axisLine={false} tickLine={false} tickFormatter={(v) => '₹' + (v / 100000).toFixed(0) + 'L'} />
              <Tooltip formatter={(v) => '₹' + Number(v).toLocaleString('en-IN')} {...tip} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {revBar.map((_, i) => <Cell key={i} fill={BRAND[i % BRAND.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Sales by model">
          <Donut data={byModel} />
          <Legend data={byModel} />
        </SectionCard>
      </div>

      {/* Inventory value by category */}
      <SectionCard title="Inventory value by category" className="mb-6">
        <div className="space-y-3">
          {invValue.map((i, idx) => (
            <div key={i.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-ink-700">{i.name}</span>
                <Money value={i.value} className="font-semibold text-ink-800" />
              </div>
              <div className="h-2.5 rounded-full bg-ink-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(i.value / invMax) * 100}%`, background: BRAND[idx] }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {consolidated ? <OutletLeaderboard /> : <OutletDetail />}
    </div>
  )
}

function Donut({ data }) {
  if (!data.length) return <div className="h-[220px] grid place-items-center text-sm text-ink-400">No data.</div>
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={85} paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={BRAND[i % BRAND.length]} />)}
        </Pie>
        <Tooltip {...tip} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function Legend({ data }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
      {data.map((d, i) => (
        <div key={d.name} className="flex items-center gap-1.5 text-xs text-ink-600">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: BRAND[i % BRAND.length] }} /> {d.name} ({d.value})
        </div>
      ))}
    </div>
  )
}

function OutletLeaderboard() {
  const rows = outlets.filter((o) => !o.isHQ).map((o) => {
    const v = allVehicles.filter((x) => x.outletId === o.id)
    const s = allSales.filter((x) => x.outletId === o.id)
    return {
      ...o,
      stock: v.filter((x) => x.status === 'In Stock').length,
      unitsSold: s.length,
      revenue: s.reduce((a, r) => a + r.total, 0),
    }
  }).sort((a, b) => b.revenue - a.revenue)

  return (
    <SectionCard title="Outlet performance" action={<Link to="/settings" className="text-sm font-semibold text-brand-600">Manage outlets →</Link>}>
      <Table
        columns={['Outlet', 'Partner', 'In stock', 'Units sold', 'Revenue', 'Share %']}
        rows={rows}
        renderRow={(o) => (
          <tr key={o.id} className="hover:bg-ink-50">
            <td className="td font-semibold text-ink-800">{o.name}<div className="text-xs font-normal text-ink-400">{o.city}</div></td>
            <td className="td">{o.partner}</td>
            <td className="td">{o.stock}</td>
            <td className="td">{o.unitsSold}</td>
            <td className="td font-semibold"><Money value={o.revenue} /></td>
            <td className="td"><Badge tone="blue">{o.share}%</Badge></td>
          </tr>
        )}
      />
    </SectionCard>
  )
}

function OutletDetail() {
  const { sales, spares, accessories } = useStore()
  const recent = [...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
  const low = [...spares, ...accessories].filter((i) => i.status !== 'OK').slice(0, 6)
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <SectionCard title="Recent sales" action={<Link to="/sales" className="text-sm font-semibold text-brand-600">All sales →</Link>}>
        <div className="divide-y divide-ink-100">
          {recent.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2.5">
              <div>
                <div className="text-sm font-semibold text-ink-800">{s.model} · {s.color}</div>
                <div className="text-xs text-ink-400">{s.customer} · {s.date} · {s.id}</div>
              </div>
              <Money value={s.total} className="font-semibold text-ink-800" />
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Needs reorder" action={<Link to="/purchase-orders" className="text-sm font-semibold text-brand-600">Raise PO →</Link>}>
        {low.length === 0 ? <p className="text-sm text-ink-400">All stock healthy.</p> : (
          <div className="divide-y divide-ink-100">
            {low.map((i) => (
              <div key={i.id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="text-sm font-semibold text-ink-800">{i.name}</div>
                  <div className="text-xs text-ink-400">{i.id} · qty {i.qty}</div>
                </div>
                <StatusBadge status={i.status} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
