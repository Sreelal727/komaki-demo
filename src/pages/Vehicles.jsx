import { useState, useMemo } from 'react'
import { useStore } from '../lib/store.jsx'
import { outlets, komakiModels } from '../data/db.js'
import { PageHeader, Table, StatusBadge, Money, Icon, Badge, Stat } from '../components/ui.jsx'

export default function Vehicles() {
  const { vehicles, hq, scope } = useStore()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const [model, setModel] = useState('All')
  const [detail, setDetail] = useState(null)
  const showOutlet = hq && scope === 'ALL'

  const rows = useMemo(() => vehicles.filter((v) => {
    if (status !== 'All' && v.status !== status) return false
    if (model !== 'All' && v.model !== model) return false
    const s = q.toLowerCase()
    return !s || v.chassis.toLowerCase().includes(s) || v.model.toLowerCase().includes(s) || v.color.toLowerCase().includes(s) || v.motorNo.toLowerCase().includes(s)
  }), [vehicles, q, status, model])

  const inStock = vehicles.filter((v) => v.status === 'In Stock').length
  const value = vehicles.filter((v) => v.status === 'In Stock').reduce((s, v) => s + v.price, 0)

  return (
    <div>
      <PageHeader title="Vehicles Inventory" subtitle="Unit-level tracking by variant, colour, chassis & motor number"
        actions={<button className="btn-primary"><Icon name="plus" className="w-4 h-4" /> Add vehicle</button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon="scooter" label="Total units" value={vehicles.length} tone="blue" />
        <Stat icon="check" label="In stock" value={inStock} tone="green" />
        <Stat icon="truck" label="In transit" value={vehicles.filter(v => v.status === 'In Transit').length} tone="blue" />
        <Stat icon="tag" label="Stock value" value={<Money value={value} />} tone="violet" />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chassis, motor no, model, colour…" className="input pl-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input max-w-[170px]">
          {['All', 'In Stock', 'In Transit', 'Sold'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={model} onChange={(e) => setModel(e.target.value)} className="input max-w-[190px]">
          <option>All</option>
          {komakiModels.map((m) => <option key={m.model}>{m.model}</option>)}
        </select>
      </div>

      <Table
        columns={[showOutlet ? 'Outlet' : 'ID', 'Model', 'Colour', 'Chassis / Frame No.', 'Motor No.', 'Price', 'Status', '']}
        rows={rows}
        empty="No vehicles match."
        renderRow={(v) => (
          <tr key={v.id} className="hover:bg-ink-50 cursor-pointer" onClick={() => setDetail(v)}>
            <td className="td font-semibold text-ink-800">{showOutlet ? outlets.find(o => o.id === v.outletId)?.short : v.id}</td>
            <td className="td">{v.model} <Badge tone={v.segment === 'High Speed' ? 'blue' : 'gray'}>{v.segment === 'High Speed' ? 'HS' : 'LS'}</Badge></td>
            <td className="td">{v.color}</td>
            <td className="td font-mono text-xs">{v.chassis}</td>
            <td className="td font-mono text-xs">{v.motorNo}</td>
            <td className="td font-semibold"><Money value={v.price} /></td>
            <td className="td"><StatusBadge status={v.status} /></td>
            <td className="td text-brand-600"><Icon name="chevron" className="w-4 h-4 -rotate-90" /></td>
          </tr>
        )}
      />

      {detail && <VehicleDrawer v={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

function VehicleDrawer({ v, onClose }) {
  const m = komakiModels.find((x) => x.model === v.model) || {}
  const outlet = outlets.find((o) => o.id === v.outletId)
  const field = (k, val, mono) => (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{k}</div>
      <div className={`text-sm text-ink-800 mt-0.5 ${mono ? 'font-mono' : 'font-medium'}`}>{val}</div>
    </div>
  )
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 inset-y-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto">
        <div className="h-16 flex items-center justify-between px-6 border-b border-ink-100">
          <h3 className="font-bold text-ink-900">{v.model}</h3>
          <button className="btn-ghost -mr-2" onClick={onClose}><Icon name="logout" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-600 grid place-items-center"><Icon name="scooter" className="w-8 h-8" /></div>
            <div>
              <div className="text-lg font-extrabold text-ink-900">{v.model} · {v.color}</div>
              <StatusBadge status={v.status} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('Vehicle ID', v.id)}
            {field('Outlet', outlet?.name)}
            {field('Chassis / Frame No.', v.chassis, true)}
            {field('Motor No.', v.motorNo, true)}
            {field('Segment', v.segment)}
            {field('Ex-showroom price', <Money value={v.price} />)}
            {field('Added on', v.addedOn)}
            {field('Battery', m.battery)}
            {field('Motor', m.motor)}
            {field('Range (claimed)', m.range + ' km')}
            {field('Top speed', m.topSpeed + ' km/h')}
          </div>
          <div className="flex gap-2 pt-2">
            <button className="btn-primary flex-1"><Icon name="receipt" className="w-4 h-4" /> Bill this unit</button>
            <button className="btn-outline"><Icon name="swap" className="w-4 h-4" /> Transfer</button>
          </div>
        </div>
      </div>
    </>
  )
}
