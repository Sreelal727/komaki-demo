import { Link } from 'react-router-dom'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts'
import { useStore } from '../lib/store.jsx'
import { monthlyTrend, purchaseOrders, outlets, vehicles as allVehicles, sales as allSales } from '../data/db.js'
import { PageHeader, Stat, SectionCard, Table, StatusBadge, Money, Icon, Badge } from '../components/ui.jsx'

const BRAND = ['#1f39db', '#597dff', '#8eabff', '#bccfff', '#3355f5', '#1a2db0']

export default function Dashboard() {
  const { user, hq, scope, vehicles, sales, spares, accessories } = useStore()

  const inStock = vehicles.filter((v) => v.status === 'In Stock')
  const sold = vehicles.filter((v) => v.status === 'Sold')
  const stockValue = inStock.reduce((s, v) => s + v.price, 0)
  const revenue = sales.reduce((s, r) => s + r.total, 0)
  const lowStock = [...spares, ...accessories].filter((i) => i.status !== 'OK').length
  const pendingPO = purchaseOrders.filter((p) => p.status === 'Draft' || p.status === 'Pending Approval').length

  const consolidated = hq && scope === 'ALL'
  const scopeLabel = consolidated ? 'All outlets' : outlets.find((o) => o.id === scope)?.name

  // segment mix
  const seg = ['High Speed', 'Low Speed'].map((s) => ({
    name: s, value: inStock.filter((v) => v.segment === s).length,
  })).filter((d) => d.value > 0)

  return (
    <div>
      <PageHeader
        title={consolidated ? 'HQ Command Center' : `${scopeLabel} Dashboard`}
        subtitle={consolidated
          ? `Consolidated view across ${outlets.filter(o => !o.isHQ).length} partner outlets · live roll-up`
          : `${user.role} view · scoped to ${scopeLabel}`}
        actions={<Link to="/reports" className="btn-outline"><Icon name="chart" className="w-4 h-4" /> Reports</Link>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon="scooter" label="Vehicles in stock" value={inStock.length} sub={`${sold.length} sold this period`} tone="blue" />
        <Stat icon="tag" label="Stock value" value={<Money value={stockValue} />} sub="unsold inventory" tone="violet" />
        <Stat icon="receipt" label="Revenue (period)" value={<Money value={revenue} />} trend="+11% vs last month" tone="green" />
        <Stat icon="alert" label="Low / out of stock" value={lowStock} sub={`${pendingPO} POs pending`} tone={lowStock > 0 ? 'amber' : 'green'} />
      </div>

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
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eceef2', fontSize: 13 }} />
              <Area type="monotone" dataKey="units" stroke="#1f39db" strokeWidth={2.5} fill="url(#g1)" name="Units sold" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Inventory mix">
          {seg.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={seg} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {seg.map((_, i) => <Cell key={i} fill={BRAND[i % BRAND.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eceef2', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-ink-400">No stock.</p>}
          <div className="flex justify-center gap-4 mt-2">
            {seg.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-ink-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: BRAND[i] }} /> {d.name} ({d.value})
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {consolidated ? <OutletLeaderboard /> : <OutletDetail />}
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
