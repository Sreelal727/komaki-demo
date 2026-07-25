import { useState } from 'react'
import { transfers as seed, outlets } from '../data/db.js'
import { useStore } from '../lib/store.jsx'
import { PageHeader, Table, StatusBadge, Icon, Stat } from '../components/ui.jsx'

export default function Transfers() {
  const { hq, scope, user } = useStore()
  const [rows, setRows] = useState(seed)

  const visible = rows.filter((t) => {
    if (hq && scope === 'ALL') return true
    const s = hq ? scope : user.outletId
    return t.from === s || t.to === s
  })

  const approve = (id) => setRows(rows.map((t) => t.id === id ? { ...t, status: 'Approved' } : t))
  const short = (id) => outlets.find((o) => o.id === id)?.short

  return (
    <div>
      <PageHeader title="Stock Transfers" subtitle="Move units between outlets — request, approve, dispatch, receive"
        actions={<button className="btn-primary"><Icon name="plus" className="w-4 h-4" /> Request transfer</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Stat icon="swap" label="Total transfers" value={visible.length} tone="blue" />
        <Stat icon="alert" label="Pending approval" value={visible.filter(t => t.status === 'Pending').length} tone="amber" />
        <Stat icon="truck" label="In transit" value={visible.filter(t => t.status === 'In Transit').length} tone="violet" />
      </div>

      <Table
        columns={['Transfer #', 'From', '', 'To', 'Item', 'Qty', 'Requested by', 'Date', 'Status', '']}
        rows={visible}
        renderRow={(t) => (
          <tr key={t.id} className="hover:bg-ink-50">
            <td className="td font-semibold text-ink-800">{t.id}</td>
            <td className="td font-medium">{short(t.from)}</td>
            <td className="td text-ink-300"><Icon name="swap" className="w-4 h-4" /></td>
            <td className="td font-medium">{short(t.to)}</td>
            <td className="td">{t.item}</td>
            <td className="td font-semibold">{t.qty}</td>
            <td className="td">{t.requestedBy}</td>
            <td className="td">{t.date}</td>
            <td className="td"><StatusBadge status={t.status} /></td>
            <td className="td">
              {t.status === 'Pending' && (hq) && (
                <button className="btn-primary py-1 px-2.5 text-xs" onClick={() => approve(t.id)}><Icon name="check" className="w-3.5 h-3.5" /> Approve</button>
              )}
            </td>
          </tr>
        )}
      />
    </div>
  )
}
