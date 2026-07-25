import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store.jsx'
import { computeInsights, headline, askSaiga } from '../lib/insights.js'
import { Icon } from '../components/ui.jsx'

const KIND = {
  alert:      { label: 'Act now',      dot: 'bg-rose-500',    chip: 'bg-rose-50 text-rose-700',       ring: 'border-l-rose-400' },
  opportunity:{ label: 'Opportunity',  dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700', ring: 'border-l-emerald-400' },
  recommend:  { label: 'Optimise',     dot: 'bg-brand-500',   chip: 'bg-brand-50 text-brand-700',     ring: 'border-l-brand-400' },
  trend:      { label: 'Trend',        dot: 'bg-violet-500',  chip: 'bg-violet-50 text-violet-700',   ring: 'border-l-violet-400' },
}

const SUGGESTED = [
  'What stock is aging?',
  'What should I reorder?',
  "What's my best-seller?",
  'Which outlet has the weakest margin?',
  'How is my accessory attach rate?',
]

export function SaigaMark({ className = 'w-9 h-9' }) {
  return (
    <div className={`${className} rounded-xl grid place-items-center text-white shadow-sm`}
      style={{ background: 'linear-gradient(135deg,#6d28d9,#2563eb)' }}>
      <Icon name="sparkle" className="w-5 h-5" />
    </div>
  )
}

export default function Saiga() {
  const store = useStore()
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [thread, setThread] = useState([])

  const insights = useMemo(() => computeInsights(store), [store])
  const head = useMemo(() => headline(store, insights), [store, insights])
  const shown = filter === 'all' ? insights : insights.filter((i) => i.kind === filter)

  const ask = (text) => {
    const question = (text ?? q).trim()
    if (!question) return
    const answer = askSaiga(question, store, insights)
    setThread((t) => [...t, { q: question, a: answer }])
    setQ('')
  }

  const counts = {
    alert: insights.filter((i) => i.kind === 'alert').length,
    opportunity: insights.filter((i) => i.kind === 'opportunity').length,
    recommend: insights.filter((i) => i.kind === 'recommend').length,
    trend: insights.filter((i) => i.kind === 'trend').length,
  }

  return (
    <div>
      {/* Hero */}
      <div className="rounded-2xl p-6 lg:p-7 mb-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(120deg,#4c1d95 0%,#1e3a8a 55%,#1f39db 100%)' }}>
        <div className="absolute -right-8 -top-10 opacity-20"><Icon name="sparkle" className="w-48 h-48" /></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <SaigaMark className="w-11 h-11" />
            <div>
              <div className="text-xl font-extrabold tracking-tight flex items-center gap-2">Saiga Intelligence
                <span className="chip bg-white/15 text-white text-[10px]">AI ENGINE</span></div>
              <div className="text-sm text-white/70">Business insights & decision advisor</div>
            </div>
          </div>
          <p className="text-[15px] leading-relaxed text-white/90 max-w-3xl">{head}</p>
          <div className="flex flex-wrap gap-4 mt-5">
            <Metric n={counts.alert} label="Need attention" />
            <Metric n={counts.opportunity} label="Opportunities" />
            <Metric n={counts.recommend} label="Optimisations" />
            <Metric n={insights.length} label="Total insights" />
          </div>
        </div>
      </div>

      {/* Ask Saiga */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-ink-700">
          <Icon name="bulb" className="w-4 h-4 text-violet-500" /> Ask Saiga
        </div>
        {thread.length > 0 && (
          <div className="space-y-3 mb-4">
            {thread.map((m, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-end"><div className="bg-brand-600 text-white rounded-2xl rounded-br-sm px-4 py-2 text-sm max-w-[80%]">{m.q}</div></div>
                <div className="flex gap-2.5 items-start">
                  <SaigaMark className="w-7 h-7 shrink-0" />
                  <div className="bg-ink-50 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-ink-700 max-w-[85%]">{m.a}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="relative">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask()}
            placeholder="Ask about stock, reorders, margins, best-sellers…" className="input pr-12" />
          <button onClick={() => ask()} className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-primary p-2 rounded-lg"><Icon name="send" className="w-4 h-4" /></button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {SUGGESTED.map((s) => (
            <button key={s} onClick={() => ask(s)} className="chip bg-white border border-ink-200 text-ink-600 hover:bg-ink-50">{s}</button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm font-semibold text-ink-500 mr-1">Insights</span>
        {['all', 'alert', 'opportunity', 'recommend', 'trend'].map((k) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`chip capitalize ${filter === k ? 'bg-ink-900 text-white' : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50'}`}>
            {k === 'all' ? 'All' : KIND[k].label}
          </button>
        ))}
      </div>

      {/* Insight cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {shown.map((ins) => {
          const k = KIND[ins.kind]
          return (
            <div key={ins.id} className={`card p-5 border-l-4 ${k.ring}`}>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-ink-50 p-2 text-ink-500"><Icon name={ins.icon} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`chip ${k.chip}`}><span className={`w-1.5 h-1.5 rounded-full ${k.dot}`} /> {k.label}</span>
                    {ins.impact && <span className="text-xs font-bold text-ink-800">{ins.impact}</span>}
                  </div>
                  <h3 className="font-bold text-ink-900">{ins.title}</h3>
                  <p className="text-sm text-ink-500 mt-1 leading-relaxed">{ins.detail}</p>
                  {ins.action && (
                    <Link to={ins.actionTo} className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700">
                      {ins.action} <Icon name="chevron" className="w-4 h-4 -rotate-90" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-ink-400 mt-6 flex items-center gap-1.5">
        <Icon name="sparkle" className="w-3.5 h-3.5" /> Saiga analyses live ERP data within your access scope. Recommendations are advisory — you stay in control.
      </p>
    </div>
  )
}

function Metric({ n, label }) {
  return (
    <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur">
      <div className="text-2xl font-extrabold leading-none">{n}</div>
      <div className="text-[11px] text-white/70 mt-1">{label}</div>
    </div>
  )
}
