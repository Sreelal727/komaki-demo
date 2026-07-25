import { useState } from 'react'
import { transfers as seed, outlets } from '../data/db.js'
import { useStore } from '../lib/store.jsx'
import { PageHeader, Table, StatusBadge, Icon, Stat, Drawer, Field, Badge } from '../components/ui.jsx'

export default function Transfers() {
  const { hq, scope, user } = useStore()
  const [rows, setRows] = useState(seed)
  const [sel, setSel] = useState(null)

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
          <tr key={t.id} className="hover:bg-ink-50 cursor-pointer" onClick={() => setSel(t)}>
            <td className="td font-semibold text-ink-800">{t.id}</td>
            <td className="td font-medium">{short(t.from)}</td>
            <td className="td text-ink-300"><Icon name="swap" className="w-4 h-4" /></td>
            <td className="td font-medium">{short(t.to)}</td>
            <td className="td">{t.item}</td>
            <td className="td font-semibold">{t.qty}</td>
            <td className="td">{t.requestedBy}</td>
            <td className="td">{t.date}</td>
            <td className="td"><StatusBadge status={t.status} /></td>
            <td className="td" onClick={(e) => e.stopPropagation()}>
              {t.status === 'Pending' && (hq) && (
                <button className="btn-primary py-1 px-2.5 text-xs" onClick={() => approve(t.id)}><Icon name="check" className="w-3.5 h-3.5" /> Approve</button>
              )}
            </td>
          </tr>
        )}
      />

      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel && `Transfer ${sel.id}`} subtitle={sel && `${short(sel.from)} → ${short(sel.to)}`}>
        {sel && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="text-center"><div className="text-xs text-ink-400">From</div><div className="font-bold text-ink-800">{short(sel.from)}</div></div>
              <Icon name="swap" className="w-6 h-6 text-brand-500" />
              <div className="text-center"><div className="text-xs text-ink-400">To</div><div className="font-bold text-ink-800">{short(sel.to)}</div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Item" value={sel.item} />
              <Field label="Quantity" value={sel.qty} />
              <Field label="Requested by" value={sel.requestedBy} />
              <Field label="Date" value={sel.date} />
              <Field label="Status" value={<StatusBadge status={sel.status} />} />
            </div>
            {sel.status === 'Pending' && hq && (
              <button className="btn-primary w-full" onClick={() => { approve(sel.id); setSel({ ...sel, status: 'Approved' }) }}><Icon name="check" className="w-4 h-4" /> Approve transfer</button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
