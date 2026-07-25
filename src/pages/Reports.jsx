import { useState, useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'
import { useStore } from '../lib/store.jsx'
import { outlets, komakiModels, money } from '../data/db.js'
import { PageHeader, Stat, SectionCard, Icon, Money, Table } from '../components/ui.jsx'

const BRAND = ['#1f39db', '#597dff', '#8eabff', '#3355f5', '#1a2db0', '#bccfff']

export default function Reports() {
  const { sales, expenses, hq, scope } = useStore()
  const [from, setFrom] = useState('2026-06-01')
  const [to, setTo] = useState('2026-07-25')

  const fSales = useMemo(() => sales.filter((s) => s.date >= from && s.date <= to), [sales, from, to])
  const fExp = useMemo(() => expenses.filter((e) => e.date >= from && e.date <= to), [expenses, from, to])

  const revenue = fSales.reduce((s, r) => s + r.total, 0)
  const accRevenue = fSales.reduce((s, r) => s + r.accAmt, 0)
  const expTotal = fExp.reduce((s, e) => s + e.amount, 0)

  const consolidated = hq && scope === 'ALL'
  const byGroup = useMemo(() => {
    if (consolidated) {
      return outlets.filter((o) => !o.isHQ).map((o) => ({
        name: o.short, value: fSales.filter((s) => s.outletId === o.id).reduce((a, r) => a + r.total, 0),
      }))
    }
    return komakiModels.map((m) => ({
      name: m.model.replace('Komaki ', ''), value: fSales.filter((s) => s.model === m.model).reduce((a, r) => a + r.total, 0),
    })).filter((d) => d.value > 0)
  }, [fSales, consolidated])

  return (
    <div>
      <PageHeader title="Reports" subtitle="Date-to-date custom analysis · access level determines visibility scope"
        actions={<button className="btn-outline"><Icon name="receipt" className="w-4 h-4" /> Export PDF</button>} />

      <div className="card p-4 mb-6 flex flex-wrap items-end gap-4">
        <div><label className="label">From</label><input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="label">To</label><input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div className="flex gap-2">
          {[['Jun 1–15', '2026-06-01', '2026-06-15'], ['This month', '2026-07-01', '2026-07-25'], ['Q2', '2026-04-01', '2026-06-30']].map(([l, f, t]) => (
            <button key={l} className="chip bg-white border border-ink-200 text-ink-600 hover:bg-ink-50" onClick={() => { setFrom(f); setTo(t) }}>{l}</button>
          ))}
        </div>
        <div className="ml-auto text-sm text-ink-400 self-center">{fSales.length} sales · {fExp.length} expense entries</div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon="receipt" label="Gross revenue" value={<Money value={revenue} />} tone="green" />
        <Stat icon="tag" label="Accessory revenue" value={<Money value={accRevenue} />} tone="violet" />
        <Stat icon="wallet" label="Expenses" value={<Money value={expTotal} />} tone="amber" />
        <Stat icon="chart" label="Units sold" value={fSales.length} tone="blue" />
      </div>

      <SectionCard title={consolidated ? 'Revenue by outlet' : 'Revenue by model'} className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={byGroup} margin={{ left: -10, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8590a8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#8590a8' }} axisLine={false} tickLine={false} tickFormatter={(v) => '₹' + (v / 100000).toFixed(0) + 'L'} />
            <Tooltip formatter={(v) => money(v)} contentStyle={{ borderRadius: 12, border: '1px solid #eceef2', fontSize: 13 }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {byGroup.map((_, i) => <Cell key={i} fill={BRAND[i % BRAND.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      <Table
        columns={['Metric', 'Value']}
        rows={[
          ['Vehicles sold', fSales.length],
          ['Accessory attach revenue', money(accRevenue)],
          ['Petty-cash expenses', money(expTotal)],
          ['Net (rev − expenses)', money(revenue - expTotal)],
        ]}
        renderRow={(r) => (
          <tr key={r[0]} className="hover:bg-ink-50">
            <td className="td font-medium text-ink-700">{r[0]}</td>
            <td className="td font-semibold text-ink-900">{r[1]}</td>
          </tr>
        )}
      />
    </div>
  )
}
