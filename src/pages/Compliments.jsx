import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { outlets } from '../data/db.js'
import { PageHeader, Table, Money, Icon, Stat, Badge, Drawer, Field } from '../components/ui.jsx'

export default function Compliments() {
  const { compliments, hq, scope } = useStore()
  const [sel, setSel] = useState(null)
  const showOutlet = hq && scope === 'ALL'
  const issued = compliments.reduce((s, c) => s + c.issued, 0)
  const cost = compliments.reduce((s, c) => s + c.issued * c.cost, 0)

  return (
    <div>
      <PageHeader title="Compliment / Free-Gift Stock" subtitle="Promotional freebies given with new vehicle sales — track give-aways & cost"
        actions={<button className="btn-primary"><Icon name="plus" className="w-4 h-4" /> Add gift item</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Stat icon="gift" label="Gift SKUs" value={compliments.length} tone="blue" />
        <Stat icon="check" label="Total issued" value={issued} tone="green" />
        <Stat icon="wallet" label="Give-away cost" value={<Money value={cost} />} tone="amber" />
      </div>
      <Table
        columns={[showOutlet ? 'Outlet' : 'ID', 'Free gift', 'Unit cost', 'Issued', 'In stock', 'Give-away value', '']}
        rows={compliments}
        renderRow={(c) => (
          <tr key={c.id} className="hover:bg-ink-50 cursor-pointer" onClick={() => setSel(c)}>
            <td className="td font-semibold text-ink-800">{showOutlet ? outlets.find(o => o.id === c.outletId)?.short : c.id}</td>
            <td className="td font-medium text-ink-800"><span className="inline-flex items-center gap-2"><Icon name="gift" className="w-4 h-4 text-brand-500" />{c.name}</span></td>
            <td className="td"><Money value={c.cost} /></td>
            <td className="td"><Badge tone="violet">{c.issued}</Badge></td>
            <td className="td font-semibold">{c.inStock}</td>
            <td className="td"><Money value={c.issued * c.cost} /></td>
            <td className="td text-brand-600"><Icon name="chevron" className="w-4 h-4 -rotate-90" /></td>
          </tr>
        )}
      />

      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel?.name} subtitle={sel && `Free gift · ${sel.id}`}>
        {sel && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-violet-50 text-violet-600 grid place-items-center"><Icon name="gift" className="w-7 h-7" /></div>
              <div><div className="text-lg font-extrabold text-ink-900">{sel.name}</div><Badge tone="violet">{sel.issued} issued</Badge></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Item ID" value={sel.id} />
              <Field label="Outlet" value={outlets.find((o) => o.id === sel.outletId)?.name} />
              <Field label="Unit cost" value={<Money value={sel.cost} />} />
              <Field label="In stock" value={sel.inStock} />
              <Field label="Total issued" value={sel.issued} />
              <Field label="Give-away cost" value={<Money value={sel.issued * sel.cost} />} />
            </div>
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 flex items-start gap-2">
              <Icon name="alert" className="w-4 h-4 mt-0.5 shrink-0" />
              Every gift is logged against the sale that triggered it, so owners see exactly how many freebies staff give out.
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
