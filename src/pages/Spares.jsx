import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { outlets } from '../data/db.js'
import { PageHeader, Table, StatusBadge, Money, Icon, Stat } from '../components/ui.jsx'

export default function Spares() {
  const { spares, hq, scope } = useStore()
  const [q, setQ] = useState('')
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
        columns={[showOutlet ? 'Outlet' : 'ID', 'Part', 'Fits model', 'Unit price', 'Qty', 'Reorder @', 'Status']}
        rows={rows}
        renderRow={(s) => (
          <tr key={s.id} className="hover:bg-ink-50">
            <td className="td font-semibold text-ink-800">{showOutlet ? outlets.find(o => o.id === s.outletId)?.short : s.id}</td>
            <td className="td font-medium text-ink-800">{s.name}</td>
            <td className="td">{s.fitsModel}</td>
            <td className="td"><Money value={s.price} /></td>
            <td className="td font-semibold">{s.qty}</td>
            <td className="td text-ink-400">{s.reorderLevel}</td>
            <td className="td"><StatusBadge status={s.status} /></td>
          </tr>
        )}
      />
    </div>
  )
}
