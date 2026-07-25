import { useState } from 'react'
import { purchaseOrders, vendors, outlets, komakiModels, money } from '../data/db.js'
import { useStore } from '../lib/store.jsx'
import { PageHeader, Table, StatusBadge, Icon, Stat, Badge, Drawer, Field } from '../components/ui.jsx'

export default function PurchaseOrders() {
  const { hq, scope } = useStore()
  const [creating, setCreating] = useState(false)
  const [sel, setSel] = useState(null)
  const [pos, setPos] = useState(purchaseOrders)

  const rows = hq ? pos.filter((p) => scope === 'ALL' || p.outletId === scope) : pos.filter((p) => p.outletId === scope)

  const open = rows.filter((p) => p.status !== 'Received').length
  const value = rows.reduce((s, p) => s + p.total, 0)

  return (
    <div>
      <PageHeader title="Purchase Orders" subtitle="Procurement pipeline — draft → approval → dispatch → goods receipt"
        actions={<button className="btn-primary" onClick={() => setCreating(true)}><Icon name="plus" className="w-4 h-4" /> New PO</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Stat icon="box" label="Open orders" value={open} tone="amber" />
        <Stat icon="truck" label="In transit" value={rows.filter(p => p.status === 'In Transit').length} tone="blue" />
        <Stat icon="wallet" label="Committed spend" value={money(value)} tone="violet" />
      </div>

      <Table
        columns={['PO #', 'Vendor', 'Destination', 'Date', 'ETA', 'Items', 'Value', 'Status', '']}
        rows={rows}
        renderRow={(p) => {
          const vendor = vendors.find((v) => v.id === p.vendorId)
          const dest = outlets.find((o) => o.id === p.outletId)
          return (
            <tr key={p.id} className="hover:bg-ink-50 cursor-pointer" onClick={() => setSel(p)}>
              <td className="td font-semibold text-ink-800">{p.id}</td>
              <td className="td">{vendor?.name}</td>
              <td className="td">{dest?.short}</td>
              <td className="td">{p.date}</td>
              <td className="td">{p.eta}</td>
              <td className="td text-ink-500">{p.lines.map(l => `${l.item} ×${l.qty}`).join(', ')}</td>
              <td className="td font-semibold">{money(p.total)}</td>
              <td className="td"><StatusBadge status={p.status} /></td>
              <td className="td text-brand-600"><Icon name="chevron" className="w-4 h-4 -rotate-90" /></td>
            </tr>
          )
        }}
      />

      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel && `Purchase Order ${sel.id}`} subtitle={sel && vendors.find(v => v.id === sel.vendorId)?.name}>
        {sel && <PODetail p={sel} />}
      </Drawer>

      {creating && <NewPO onClose={() => setCreating(false)} onSave={(po) => { setPos([po, ...pos]); setCreating(false) }} scope={hq ? (scope === 'ALL' ? 'HQ' : scope) : scope} />}
    </div>
  )
}

function PODetail({ p }) {
  const vendor = vendors.find((v) => v.id === p.vendorId)
  const steps = ['Draft', 'Pending Approval', 'Approved', 'In Transit', 'Received']
  const stepIdx = steps.indexOf(p.status)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <StatusBadge status={p.status} />
        <span className="text-2xl font-extrabold text-ink-900">{money(p.total)}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Vendor" value={vendor?.name} />
        <Field label="Destination" value={outlets.find((o) => o.id === p.outletId)?.name} />
        <Field label="Order date" value={p.date} />
        <Field label="Expected" value={p.eta} />
        <Field label="Payment terms" value={vendor?.terms} />
        <Field label="Lead time" value={vendor ? vendor.leadDays + ' days' : '—'} />
      </div>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-400 mb-2">Line items</div>
        <div className="rounded-xl border border-ink-100 divide-y divide-ink-100">
          {p.lines.map((l, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-ink-700">{l.item} <span className="text-ink-400">× {l.qty}</span></span>
              <span className="font-semibold">{money(l.qty * l.rate)}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-400 mb-2">Progress</div>
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= stepIdx ? 'bg-brand-500' : 'bg-ink-100'}`} />
              <div className={`text-[10px] mt-1 ${i <= stepIdx ? 'text-brand-600 font-semibold' : 'text-ink-300'}`}>{s}</div>
            </div>
          ))}
        </div>
      </div>
      {(p.status === 'Draft' || p.status === 'Pending Approval') && (
        <button className="btn-primary w-full"><Icon name="check" className="w-4 h-4" /> Approve & dispatch</button>
      )}
    </div>
  )
}

function NewPO({ onClose, onSave, scope }) {
  const [vendorId, setVendorId] = useState(vendors[0].id)
  const [item, setItem] = useState(komakiModels[0].model)
  const [qty, setQty] = useState(5)
  const [rate, setRate] = useState(komakiModels[0].price)

  const save = () => {
    onSave({
      id: 'PO-' + (2608 + Math.floor(qty)), vendorId, outletId: scope,
      date: '2026-07-25', status: 'Pending Approval', eta: '2026-08-05',
      total: qty * rate, lines: [{ item, qty: Number(qty), rate: Number(rate) }],
    })
  }
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 inset-y-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto">
        <div className="h-16 flex items-center justify-between px-6 border-b border-ink-100">
          <h3 className="font-bold text-ink-900">New Purchase Order</h3>
          <button className="btn-ghost -mr-2" onClick={onClose}><Icon name="logout" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label">Vendor</label>
            <select className="input" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Item</label>
            <input className="input" value={item} onChange={(e) => setItem(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Quantity</label><input type="number" className="input" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
            <div><label className="label">Unit rate (₹)</label><input type="number" className="input" value={rate} onChange={(e) => setRate(e.target.value)} /></div>
          </div>
          <div className="rounded-lg bg-ink-50 p-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-500">Order total</span>
            <span className="text-xl font-extrabold text-ink-900">{money(qty * rate)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-400"><Icon name="check" className="w-4 h-4 text-emerald-500" /> Routes to HQ Admin for approval before dispatch.</div>
          <button className="btn-primary w-full" onClick={save}><Icon name="check" className="w-4 h-4" /> Submit for approval</button>
        </div>
      </div>
    </>
  )
}
