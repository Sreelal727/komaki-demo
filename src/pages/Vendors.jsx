import { useState } from 'react'
import { vendors, purchaseOrders, money } from '../data/db.js'
import { PageHeader, Table, Badge, Icon, Stat, SectionCard } from '../components/ui.jsx'

function Stars({ n }) {
  return <span className="text-amber-500 text-sm">{'★'.repeat(Math.round(n))}<span className="text-ink-200">{'★'.repeat(5 - Math.round(n))}</span> <span className="text-ink-500 text-xs">{n}</span></span>
}

export default function Vendors() {
  const [sel, setSel] = useState(null)
  return (
    <div>
      <PageHeader title="Vendor Management" subtitle="Suppliers, lead times, availability & procurement performance"
        actions={<button className="btn-primary"><Icon name="plus" className="w-4 h-4" /> Add vendor</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon="building" label="Active vendors" value={vendors.length} tone="blue" />
        <Stat icon="truck" label="Avg lead time" value={Math.round(vendors.reduce((s, v) => s + v.leadDays, 0) / vendors.length) + ' days'} tone="violet" />
        <Stat icon="check" label="Avg on-time" value={Math.round(vendors.reduce((s, v) => s + v.onTime, 0) / vendors.length) + '%'} tone="green" />
        <Stat icon="box" label="Open POs" value={purchaseOrders.filter(p => p.status !== 'Received').length} tone="amber" />
      </div>

      <Table
        columns={['Vendor', 'Category', 'City', 'Contact', 'Lead time', 'Terms', 'On-time', 'Rating', '']}
        rows={vendors}
        renderRow={(v) => (
          <tr key={v.id} className="hover:bg-ink-50 cursor-pointer" onClick={() => setSel(v)}>
            <td className="td font-semibold text-ink-800">{v.name}</td>
            <td className="td"><Badge tone="blue">{v.type}</Badge></td>
            <td className="td">{v.city}</td>
            <td className="td">{v.contact}</td>
            <td className="td">{v.leadDays} days</td>
            <td className="td">{v.terms}</td>
            <td className="td font-semibold text-emerald-600">{v.onTime}%</td>
            <td className="td"><Stars n={v.rating} /></td>
            <td className="td text-brand-600"><Icon name="chevron" className="w-4 h-4 -rotate-90" /></td>
          </tr>
        )}
      />

      {sel && <VendorDrawer v={sel} onClose={() => setSel(null)} />}
    </div>
  )
}

function VendorDrawer({ v, onClose }) {
  const pos = purchaseOrders.filter((p) => p.vendorId === v.id)
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 inset-y-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto">
        <div className="h-16 flex items-center justify-between px-6 border-b border-ink-100">
          <h3 className="font-bold text-ink-900">Vendor</h3>
          <button className="btn-ghost -mr-2" onClick={onClose}><Icon name="logout" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <div className="text-lg font-extrabold text-ink-900">{v.name}</div>
            <Badge tone="blue">{v.type}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><div className="text-[11px] uppercase text-ink-400 font-semibold">Contact</div>{v.contact}</div>
            <div><div className="text-[11px] uppercase text-ink-400 font-semibold">Phone</div>{v.phone}</div>
            <div><div className="text-[11px] uppercase text-ink-400 font-semibold">City</div>{v.city}</div>
            <div><div className="text-[11px] uppercase text-ink-400 font-semibold">Terms</div>{v.terms}</div>
            <div><div className="text-[11px] uppercase text-ink-400 font-semibold">Lead time</div>{v.leadDays} days</div>
            <div><div className="text-[11px] uppercase text-ink-400 font-semibold">On-time delivery</div><span className="text-emerald-600 font-semibold">{v.onTime}%</span></div>
          </div>
          <SectionCard title="Recent purchase orders">
            {pos.length === 0 ? <p className="text-sm text-ink-400">No POs yet.</p> : (
              <div className="divide-y divide-ink-100">
                {pos.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2.5">
                    <div><div className="text-sm font-semibold">{p.id}</div><div className="text-xs text-ink-400">{p.date}</div></div>
                    <div className="text-right"><div className="text-sm font-semibold">{money(p.total)}</div><Badge tone="gray">{p.status}</Badge></div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
          <button className="btn-primary w-full"><Icon name="box" className="w-4 h-4" /> Raise purchase order</button>
        </div>
      </div>
    </>
  )
}
