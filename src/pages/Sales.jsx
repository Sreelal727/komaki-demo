import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { outlets, komakiModels, accessories as allAcc, compliments as allComp, money } from '../data/db.js'
import { PageHeader, Table, Money, Icon, Stat, Badge, SectionCard } from '../components/ui.jsx'

export default function Sales() {
  const { sales, hq, scope, user } = useStore()
  const [rows, setRows] = useState(sales)
  const [billing, setBilling] = useState(false)
  const [closure, setClosure] = useState(false)
  const showOutlet = hq && scope === 'ALL'

  const list = [...rows].sort((a, b) => b.date.localeCompare(a.date))
  const revenue = list.reduce((s, r) => s + r.total, 0)
  const today = list.filter((r) => r.date === '2026-07-25')

  return (
    <div>
      <PageHeader title="Sales & Billing" subtitle="Vehicle + accessories + free-gift bundled into one invoice"
        actions={<>
          <button className="btn-outline" onClick={() => setClosure(true)}><Icon name="receipt" className="w-4 h-4" /> Daily closure</button>
          <button className="btn-primary" onClick={() => setBilling(true)}><Icon name="plus" className="w-4 h-4" /> New sale</button>
        </>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon="receipt" label="Invoices" value={list.length} tone="blue" />
        <Stat icon="scooter" label="Units sold" value={list.length} tone="green" />
        <Stat icon="wallet" label="Revenue" value={<Money value={revenue} />} tone="violet" />
        <Stat icon="tag" label="Avg ticket" value={<Money value={Math.round(revenue / (list.length || 1))} />} tone="amber" />
      </div>

      <Table
        columns={['Invoice', showOutlet ? 'Outlet' : 'Date', 'Customer', 'Model', 'Vehicle', 'Add-ons', 'Free gift', 'Total']}
        rows={list.slice(0, 30)}
        renderRow={(s) => (
          <tr key={s.id} className="hover:bg-ink-50">
            <td className="td font-semibold text-ink-800">{s.id}</td>
            <td className="td">{showOutlet ? outlets.find(o => o.id === s.outletId)?.short : s.date}</td>
            <td className="td">{s.customer}</td>
            <td className="td">{s.model} · {s.color}</td>
            <td className="td"><Money value={s.vehicleAmt} /></td>
            <td className="td">{s.accAmt ? <Money value={s.accAmt} /> : <span className="text-ink-300">—</span>}</td>
            <td className="td"><Badge tone="violet">{s.compliment}</Badge></td>
            <td className="td font-semibold"><Money value={s.total} /></td>
          </tr>
        )}
      />

      {billing && <NewSale onClose={() => setBilling(false)} outletId={hq ? (scope === 'ALL' ? 'CLT' : scope) : user.outletId}
        onSave={(sale) => { setRows([sale, ...rows]); setBilling(false) }} />}
      {closure && <DailyClosure onClose={() => setClosure(false)} sales={today.length ? today : list.slice(0, 4)} />}
    </div>
  )
}

function NewSale({ onClose, onSave, outletId }) {
  const [modelName, setModelName] = useState(komakiModels[0].model)
  const model = komakiModels.find((m) => m.model === modelName)
  const [color, setColor] = useState(model.colors[0])
  const [customer, setCustomer] = useState('')
  const [accIds, setAccIds] = useState([])
  const [comp, setComp] = useState('Riding Jacket')

  const accOpts = allAcc.filter((a) => a.outletId === outletId).slice(0, 6)
  const accAmt = accOpts.filter((a) => accIds.includes(a.id)).reduce((s, a) => s + a.price, 0)
  const total = model.price + accAmt

  const save = () => onSave({
    id: 'INV-' + Math.floor(6000 + model.price % 999),
    outletId, date: '2026-07-25', customer: customer || 'Walk-in Customer',
    model: modelName, color, vehicleAmt: model.price, accAmt,
    compliment: comp, total, staff: 'You',
  })

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 inset-y-0 w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto">
        <div className="h-16 flex items-center justify-between px-6 border-b border-ink-100">
          <h3 className="font-bold text-ink-900">New Sale · {outlets.find(o => o.id === outletId)?.short}</h3>
          <button className="btn-ghost -mr-2" onClick={onClose}><Icon name="logout" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className="label">Customer name</label><input className="input" placeholder="Walk-in customer" value={customer} onChange={(e) => setCustomer(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Model</label>
              <select className="input" value={modelName} onChange={(e) => { setModelName(e.target.value); setColor(komakiModels.find(m => m.model === e.target.value).colors[0]) }}>
                {komakiModels.map((m) => <option key={m.model}>{m.model}</option>)}
              </select>
            </div>
            <div><label className="label">Colour</label>
              <select className="input" value={color} onChange={(e) => setColor(e.target.value)}>
                {model.colors.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Accessories</label>
            <div className="space-y-1.5">
              {accOpts.map((a) => (
                <label key={a.id} className="flex items-center gap-2.5 rounded-lg border border-ink-200 px-3 py-2 cursor-pointer hover:bg-ink-50">
                  <input type="checkbox" checked={accIds.includes(a.id)} onChange={(e) => setAccIds(e.target.checked ? [...accIds, a.id] : accIds.filter(x => x !== a.id))} />
                  <span className="text-sm flex-1">{a.name}</span>
                  <Money value={a.price} className="text-sm font-semibold" />
                </label>
              ))}
            </div>
          </div>

          <div><label className="label">Complimentary gift</label>
            <select className="input" value={comp} onChange={(e) => setComp(e.target.value)}>
              {['Riding Jacket', 'Premium Keychain', 'First-Aid Box', 'Branded Raincoat', 'Phone Mount'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="rounded-xl border border-ink-100 divide-y divide-ink-100">
            <Row k={`${modelName} · ${color}`} v={model.price} />
            <Row k="Accessories" v={accAmt} />
            <Row k="Free gift" v={0} note={comp} />
            <div className="flex items-center justify-between px-4 py-3 bg-ink-50 rounded-b-xl">
              <span className="font-bold text-ink-800">Invoice total</span>
              <span className="text-xl font-extrabold text-ink-900">{money(total)}</span>
            </div>
          </div>
          <button className="btn-primary w-full" onClick={save}><Icon name="receipt" className="w-4 h-4" /> Generate invoice</button>
        </div>
      </div>
    </>
  )
}

function Row({ k, v, note }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-ink-600">{k}{note && <span className="text-ink-400"> · {note}</span>}</span>
      <span className="font-semibold">{v ? money(v) : 'Free'}</span>
    </div>
  )
}

function DailyClosure({ onClose, sales }) {
  const total = sales.reduce((s, r) => s + r.total, 0)
  const acc = sales.reduce((s, r) => s + r.accAmt, 0)
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 inset-y-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto">
        <div className="h-16 flex items-center justify-between px-6 border-b border-ink-100">
          <h3 className="font-bold text-ink-900">Daily Closure · 25 Jul 2026</h3>
          <button className="btn-ghost -mr-2" onClick={onClose}><Icon name="logout" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Mini label="Vehicles" value={sales.length} />
            <Mini label="Accessories" value={money(acc)} />
            <Mini label="Total" value={money(total)} />
          </div>
          <SectionCard title="Today's bills">
            <div className="divide-y divide-ink-100">
              {sales.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2">
                  <div className="text-sm"><span className="font-semibold">{s.model}</span> · {s.customer}</div>
                  <Money value={s.total} className="text-sm font-semibold" />
                </div>
              ))}
            </div>
          </SectionCard>
          <div className="flex items-center gap-2 text-xs text-ink-400"><Icon name="check" className="w-4 h-4 text-emerald-500" /> On closure, this bundle is pushed to HQ management instantly.</div>
          <button className="btn-primary w-full" onClick={onClose}><Icon name="check" className="w-4 h-4" /> Close day & send to HQ</button>
        </div>
      </div>
    </>
  )
}

function Mini({ label, value }) {
  return <div className="rounded-xl bg-ink-50 p-3 text-center"><div className="text-lg font-extrabold text-ink-900">{value}</div><div className="text-xs text-ink-400">{label}</div></div>
}
