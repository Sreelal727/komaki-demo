import { useStore } from '../lib/store.jsx'
import { money } from '../data/db.js'
import { PageHeader, Stat, Icon, Money, SectionCard, Badge } from '../components/ui.jsx'

export default function ProfitSharing() {
  const { profitShare, hq, user } = useStore()

  const totalNet = profitShare.reduce((s, p) => s + p.netProfit, 0)
  const totalPartner = profitShare.reduce((s, p) => s + p.partnerShare, 0)
  const totalLestova = profitShare.reduce((s, p) => s + p.lestovaShare, 0)

  return (
    <div>
      <PageHeader title="3-Month Profit Sharing" subtitle="Quarterly automated split · Q2 FY2026 (Apr–Jun) · per partnership contract %"
        actions={<button className="btn-outline"><Icon name="receipt" className="w-4 h-4" /> Export statement</button>} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Stat icon="chart" label="Net profit (quarter)" value={<Money value={totalNet} />} tone="green" />
        <Stat icon="users" label="Partners' share" value={<Money value={totalPartner} />} tone="violet" />
        <Stat icon="building" label="Lestova's share" value={<Money value={totalLestova} />} tone="blue" />
      </div>

      {!hq && (
        <div className="card p-4 mb-6 flex items-center gap-3 text-sm text-ink-500">
          <Icon name="lock" className="w-4 h-4 text-ink-400" /> You see only your own outlet's statement. Other partners' figures are private.
        </div>
      )}

      <div className="space-y-4">
        {profitShare.map((p) => (
          <div key={p.outletId} className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <div className="text-lg font-extrabold text-ink-900">{p.outlet}</div>
                <div className="text-sm text-ink-400">Partner: {p.partner} · Contract share <Badge tone="blue">{p.sharePct}%</Badge></div>
              </div>
              <div className="text-right">
                <div className="text-xs text-ink-400">Net profit</div>
                <div className="text-2xl font-extrabold text-emerald-600"><Money value={p.netProfit} /></div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-5">
              <Waterfall label="Revenue" value={p.revenue} tone="text-ink-900" />
              <Waterfall label="− COGS" value={p.cogs} tone="text-rose-600" />
              <Waterfall label="− Operating expenses" value={p.opex} tone="text-rose-600" />
            </div>

            <div className="rounded-xl bg-ink-50 p-4 grid sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg bg-white border border-brand-100 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-ink-700">{p.partner}</div>
                  <div className="text-xs text-ink-400">Partner ({p.sharePct}%)</div>
                </div>
                <div className="text-xl font-extrabold text-brand-700"><Money value={p.partnerShare} /></div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white border border-ink-100 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-ink-700">Lestova HQ</div>
                  <div className="text-xs text-ink-400">Central ({100 - p.sharePct}%)</div>
                </div>
                <div className="text-xl font-extrabold text-ink-800"><Money value={p.lestovaShare} /></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Waterfall({ label, value, tone }) {
  return (
    <div className="rounded-lg border border-ink-100 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</div>
      <div className={`text-lg font-extrabold mt-1 ${tone}`}><Money value={value} /></div>
    </div>
  )
}
