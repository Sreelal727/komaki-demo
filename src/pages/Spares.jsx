import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { outlets, spares as allSpares } from '../data/db.js'
import { PageHeader, Table, StatusBadge, Money, Icon, Stat, Drawer, Field, Badge } from '../components/ui.jsx'

export default function Spares() {
  const { spares, hq, scope } = useStore()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
  const showOutlet = hq && scope === 'ALL'
  const rows = spares.filter((s) => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.fitsModel.toLowerCase().includes(q.toLowerCase()))
  const lowCount = spares.filter((s) => s.status !== 'OK').length
  const value = spares.reduce((a, s) => a + s.price * s.qty, 0)

  return (
    <div>
      <PageHeader title="Spare Parts Inventory" subtitle="Replacement parts mapped to Komaki models · reorder alerts"
        actions={<button className="btn-primary"><Icon name="plus" className="w-4 h-4" /> Add part</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Stat icon="wrench" label="SKUs" value={spares.length} tone="blue" />
        <Stat icon="alert" label="Low / out of stock" value={lowCount} tone={lowCount ? 'amber' : 'green'} />
        <Stat icon="tag" label="Inventory value" value={<Money value={value} />} tone="violet" />
      </div>
      <div className="relative max-w-md mb-4">
        <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search parts or model fitment…" className="input pl-9" />
      </div>
      <Table
        columns={[showOutlet ? 'Outlet' : 'ID', 'Part', 'Fits model', 'Unit price', 'Qty', 'Reorder @', 'Status', '']}
        rows={rows}
        renderRow={(s) => (
          <tr key={s.id} className="hover:bg-ink-50 cursor-pointer" onClick={() => setSel(s)}>
            <td className="td font-semibold text-ink-800">{showOutlet ? outlets.find(o => o.id === s.outletId)?.short : s.id}</td>
            <td className="td font-medium text-ink-800">{s.name}</td>
            <td className="td">{s.fitsModel}</td>
            <td className="td"><Money value={s.price} /></td>
            <td className="td font-semibold">{s.qty}</td>
            <td className="td text-ink-400">{s.reorderLevel}</td>
            <td className="td"><StatusBadge status={s.status} /></td>
            <td className="td text-brand-600"><Icon name="chevron" className="w-4 h-4 -rotate-90" /></td>
          </tr>
        )}
      />

      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel?.name} subtitle={sel && `Spare part · ${sel.id}`}>
        {sel && <SpareDetail s={sel} />}
      </Drawer>
    </div>
  )
}

function SpareDetail({ s }) {
  const network = allSpares.filter((x) => x.name === s.name)
  const totalQty = network.reduce((a, x) => a + x.qty, 0)
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-600 grid place-items-center"><Icon name="wrench" className="w-7 h-7" /></div>
        <div><div className="text-lg font-extrabold text-ink-900">{s.name}</div><StatusBadge status={s.status} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="SKU ID" value={s.id} />
        <Field label="Outlet" value={outlets.find((o) => o.id === s.outletId)?.name} />
        <Field label="Fits model" value={s.fitsModel} />
        <Field label="Unit price" value={<Money value={s.price} />} />
        <Field label="In stock" value={s.qty} />
        <Field label="Reorder level" value={s.reorderLevel} />
        <Field label="Stock value" value={<Money value={s.price * s.qty} />} />
        <Field label="Status" value={<StatusBadge status={s.status} />} />
      </div>
      <div className="rounded-xl bg-ink-50 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Network availability</div>
        <div className="text-sm text-ink-700">{totalQty} units across {network.length} outlet(s).</div>
      </div>
      {s.status !== 'OK' && (
        <button className="btn-primary w-full"><Icon name="box" className="w-4 h-4" /> Raise purchase order</button>
      )}
    </div>
  )
}
