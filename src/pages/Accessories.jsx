import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { outlets, accessories as allAcc } from '../data/db.js'
import { PageHeader, Table, StatusBadge, Money, Icon, Stat, Drawer, Field } from '../components/ui.jsx'

export default function Accessories() {
  const { accessories, hq, scope } = useStore()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
  const showOutlet = hq && scope === 'ALL'
  const rows = accessories.filter((a) => !q || a.name.toLowerCase().includes(q.toLowerCase()))
  const lowCount = accessories.filter((a) => a.status !== 'OK').length
  const value = accessories.reduce((s, a) => s + a.price * a.qty, 0)

  return (
    <div>
      <PageHeader title="Accessories Inventory" subtitle="Add-on retail items — helmets, chargers, mirrors, covers, bodies"
        actions={<button className="btn-primary"><Icon name="plus" className="w-4 h-4" /> Add accessory</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Stat icon="tag" label="SKUs" value={accessories.length} tone="blue" />
        <Stat icon="alert" label="Low / out of stock" value={lowCount} tone={lowCount ? 'amber' : 'green'} />
        <Stat icon="wallet" label="Inventory value" value={<Money value={value} />} tone="violet" />
      </div>
      <div className="relative max-w-md mb-4">
        <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search accessories…" className="input pl-9" />
      </div>
      <Table
        columns={[showOutlet ? 'Outlet' : 'ID', 'Accessory', 'Unit price', 'Qty', 'Reorder @', 'Status', '']}
        rows={rows}
        renderRow={(a) => (
          <tr key={a.id} className="hover:bg-ink-50 cursor-pointer" onClick={() => setSel(a)}>
            <td className="td font-semibold text-ink-800">{showOutlet ? outlets.find(o => o.id === a.outletId)?.short : a.id}</td>
            <td className="td font-medium text-ink-800">{a.name}</td>
            <td className="td"><Money value={a.price} /></td>
            <td className="td font-semibold">{a.qty}</td>
            <td className="td text-ink-400">{a.reorderLevel}</td>
            <td className="td"><StatusBadge status={a.status} /></td>
            <td className="td text-brand-600"><Icon name="chevron" className="w-4 h-4 -rotate-90" /></td>
          </tr>
        )}
      />

      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel?.name} subtitle={sel && `Accessory · ${sel.id}`}>
        {sel && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-600 grid place-items-center"><Icon name="tag" className="w-7 h-7" /></div>
              <div><div className="text-lg font-extrabold text-ink-900">{sel.name}</div><StatusBadge status={sel.status} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SKU ID" value={sel.id} />
              <Field label="Outlet" value={outlets.find((o) => o.id === sel.outletId)?.name} />
              <Field label="Unit price" value={<Money value={sel.price} />} />
              <Field label="In stock" value={sel.qty} />
              <Field label="Reorder level" value={sel.reorderLevel} />
              <Field label="Stock value" value={<Money value={sel.price * sel.qty} />} />
            </div>
            <div className="rounded-xl bg-ink-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Network availability</div>
              <div className="text-sm text-ink-700">{allAcc.filter((x) => x.name === sel.name).reduce((a, x) => a + x.qty, 0)} units across the network.</div>
            </div>
            {sel.status !== 'OK' && <button className="btn-primary w-full"><Icon name="box" className="w-4 h-4" /> Raise purchase order</button>}
          </div>
        )}
      </Drawer>
    </div>
  )
}
