import { useState, useMemo } from 'react'
import { useStore } from '../lib/store.jsx'
import { vehicles, spares, accessories, outlets, komakiModels } from '../data/db.js'
import { PageHeader, Icon, Badge } from '../components/ui.jsx'

// Read-only availability index across ALL outlets — deliberately crosses the
// isolation boundary, but exposes only quantities, never money or customers.
function buildIndex() {
  const idx = {}
  const add = (name, outletId, ok) => {
    const k = name.toLowerCase()
    idx[k] = idx[k] || { name, type: '', byOutlet: {} }
    idx[k].byOutlet[outletId] = (idx[k].byOutlet[outletId] || 0) + (ok ? 1 : 0)
  }
  vehicles.forEach((v) => { idx[`${v.model} · ${v.color}`.toLowerCase()] = idx[`${v.model} · ${v.color}`.toLowerCase()] || { name: `${v.model} · ${v.color}`, type: 'Vehicle', byOutlet: {} }; const e = idx[`${v.model} · ${v.color}`.toLowerCase()]; e.byOutlet[v.outletId] = (e.byOutlet[v.outletId] || 0) + (v.status === 'In Stock' ? 1 : 0) })
  const bulk = (arr, type) => arr.forEach((i) => { const key = i.name.toLowerCase(); idx[key] = idx[key] || { name: i.name, type, byOutlet: {} }; idx[key].byOutlet[i.outletId] = (idx[key].byOutlet[i.outletId] || 0) + i.qty })
  bulk(spares, 'Spare')
  bulk(accessories, 'Accessory')
  return Object.values(idx)
}

export default function Lookup() {
  const { user, hq } = useStore()
  const [q, setQ] = useState('')
  const index = useMemo(buildIndex, [])
  const myOutlet = hq ? null : user.outletId

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return index.filter((r) => r.name.toLowerCase().includes(s)).slice(0, 12)
  }, [q, index])

  return (
    <div>
      <PageHeader title="Cross-Outlet Stock Lookup"
        subtitle="Out of stock for a walk-in? Check availability in sister outlets — read-only, no financials or customer data." />

      <div className="card p-2 mb-6 max-w-2xl">
        <div className="relative">
          <Icon name="search" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Komaki XGT, Blue, Battery Pack, Helmet…"
            className="w-full pl-12 pr-4 py-3 text-base outline-none rounded-lg" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-ink-400 self-center">Try:</span>
        {['Komaki XGT KM · Blue', 'Battery Pack', 'Premium Helmet (ISI)', 'Komaki Venice · Cyan'].map((t) => (
          <button key={t} onClick={() => setQ(t)} className="chip bg-white border border-ink-200 text-ink-600 hover:bg-ink-50">{t}</button>
        ))}
      </div>

      {q && results.length === 0 && (
        <div className="card p-10 text-center text-ink-400">No matching item found across outlets.</div>
      )}

      <div className="space-y-3">
        {results.map((r) => {
          const total = Object.values(r.byOutlet).reduce((a, b) => a + b, 0)
          return (
            <div key={r.name} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 grid place-items-center">
                    <Icon name={r.type === 'Vehicle' ? 'scooter' : r.type === 'Spare' ? 'wrench' : 'tag'} />
                  </div>
                  <div>
                    <div className="font-bold text-ink-900">{r.name}</div>
                    <Badge tone="gray">{r.type}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-ink-900">{total}</div>
                  <div className="text-xs text-ink-400">units network-wide</div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {outlets.filter((o) => !o.isHQ).map((o) => {
                  const qty = r.byOutlet[o.id] || 0
                  const mine = o.id === myOutlet
                  return (
                    <div key={o.id} className={`rounded-lg border px-3 py-2 ${mine ? 'border-brand-300 bg-brand-50' : qty > 0 ? 'border-emerald-200 bg-emerald-50/50' : 'border-ink-100 bg-ink-50/40'}`}>
                      <div className="text-xs font-semibold text-ink-500 flex items-center gap-1">{o.short}{mine && <span className="text-brand-600">· you</span>}</div>
                      <div className={`text-lg font-extrabold ${qty > 0 ? 'text-emerald-700' : 'text-ink-300'}`}>{qty}<span className="text-xs font-medium text-ink-400"> units</span></div>
                    </div>
                  )
                })}
              </div>
              {!hq && (
                <div className="mt-3 pt-3 border-t border-ink-100 flex items-center gap-2 text-xs text-ink-400">
                  <Icon name="lock" className="w-3.5 h-3.5" /> Availability only — prices, margins and customer records of other outlets stay hidden.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
