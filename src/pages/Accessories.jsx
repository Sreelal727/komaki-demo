import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { outlets } from '../data/db.js'
import { PageHeader, Table, StatusBadge, Money, Icon, Stat } from '../components/ui.jsx'

export default function Accessories() {
  const { accessories, hq, scope } = useStore()
  const [q, setQ] = useState('')
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
        columns={[showOutlet ? 'Outlet' : 'ID', 'Accessory', 'Unit price', 'Qty', 'Reorder @', 'Status']}
        rows={rows}
        renderRow={(a) => (
          <tr key={a.id} className="hover:bg-ink-50">
            <td className="td font-semibold text-ink-800">{showOutlet ? outlets.find(o => o.id === a.outletId)?.short : a.id}</td>
            <td className="td font-medium text-ink-800">{a.name}</td>
            <td className="td"><Money value={a.price} /></td>
            <td className="td font-semibold">{a.qty}</td>
            <td className="td text-ink-400">{a.reorderLevel}</td>
            <td className="td"><StatusBadge status={a.status} /></td>
          </tr>
        )}
      />
    </div>
  )
}
