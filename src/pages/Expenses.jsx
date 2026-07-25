import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { outlets, money } from '../data/db.js'
import { PageHeader, Table, Money, Icon, Stat, Badge, Drawer, Field } from '../components/ui.jsx'

export default function Expenses() {
  const { expenses, hq, scope } = useStore()
  const [rows, setRows] = useState(expenses)
  const [adding, setAdding] = useState(false)
  const [sel, setSel] = useState(null)
  const showOutlet = hq && scope === 'ALL'

  const list = [...rows].sort((a, b) => b.date.localeCompare(a.date))
  const total = list.reduce((s, e) => s + e.amount, 0)

  return (
    <div>
      <PageHeader title="Daily Expenses" subtitle="Petty-cash register — replaces loose paper slips on the showroom floor"
        actions={<button className="btn-primary" onClick={() => setAdding(true)}><Icon name="plus" className="w-4 h-4" /> Log expense</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Stat icon="wallet" label="Entries" value={list.length} tone="blue" />
        <Stat icon="tag" label="Total outflow" value={money(total)} tone="amber" />
        <Stat icon="chart" label="Avg / entry" value={money(Math.round(total / (list.length || 1)))} tone="violet" />
      </div>

      {adding && (
        <div className="card p-4 mb-4 flex flex-wrap items-end gap-3">
          <div><label className="label">Category</label><input id="ec" className="input" placeholder="Staff Tea/Snacks" defaultValue="Staff Tea/Snacks" /></div>
          <div><label className="label">Amount (₹)</label><input id="ea" type="number" className="input w-32" defaultValue={120} /></div>
          <button className="btn-primary" onClick={() => {
            const c = document.getElementById('ec').value, a = Number(document.getElementById('ea').value)
            setRows([{ id: 'EXP-' + (7100 + list.length), outletId: scope === 'ALL' ? 'CLT' : scope, date: '2026-07-25', category: c, amount: a, by: 'You' }, ...rows])
            setAdding(false)
          }}><Icon name="check" className="w-4 h-4" /> Save</button>
          <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
        </div>
      )}

      <Table
        columns={['ID', showOutlet ? 'Outlet' : 'Date', 'Category', 'Logged by', 'Amount', '']}
        rows={list.slice(0, 30)}
        renderRow={(e) => (
          <tr key={e.id} className="hover:bg-ink-50 cursor-pointer" onClick={() => setSel(e)}>
            <td className="td font-semibold text-ink-800">{e.id}</td>
            <td className="td">{showOutlet ? outlets.find(o => o.id === e.outletId)?.short : e.date}</td>
            <td className="td"><Badge tone="gray">{e.category}</Badge></td>
            <td className="td">{e.by}</td>
            <td className="td font-semibold"><Money value={e.amount} /></td>
            <td className="td text-brand-600"><Icon name="chevron" className="w-4 h-4 -rotate-90" /></td>
          </tr>
        )}
      />

      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel && `Expense ${sel.id}`} subtitle={sel?.category}>
        {sel && (
          <div className="space-y-6">
            <div className="rounded-xl bg-ink-50 p-5 text-center">
              <div className="text-3xl font-extrabold text-ink-900"><Money value={sel.amount} /></div>
              <div className="text-sm text-ink-400 mt-1">{sel.category}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Entry ID" value={sel.id} />
              <Field label="Outlet" value={outlets.find((o) => o.id === sel.outletId)?.name} />
              <Field label="Date" value={sel.date} />
              <Field label="Logged by" value={sel.by} />
            </div>
            <div className="rounded-xl bg-ink-50 p-4 text-sm text-ink-500 flex items-start gap-2">
              <Icon name="wallet" className="w-4 h-4 mt-0.5 shrink-0 text-ink-400" />
              Petty-cash entries roll into the outlet's daily closure and the date-range expense reports.
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
