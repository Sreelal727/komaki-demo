// Reusable UI primitives + a small inline-SVG icon set (no external dep).

export function Icon({ name, className = 'w-5 h-5' }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" {...p} /><rect x="14" y="3" width="7" height="5" rx="1.5" {...p} /><rect x="14" y="12" width="7" height="9" rx="1.5" {...p} /><rect x="3" y="16" width="7" height="5" rx="1.5" {...p} /></>,
    scooter: <><circle cx="6" cy="18" r="2.5" {...p} /><circle cx="18" cy="18" r="2.5" {...p} /><path d="M8.5 18h7M18 15.5V8h-3M3 7h3l3 8" {...p} /><path d="M15 8l2.5-2" {...p} /></>,
    gear: <><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" {...p} /><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7.9V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-2.7-.9l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00-.9-2.7H3a2 2 0 110-4h.1a1.6 1.6 0 00.9-2.7l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" {...p} /></>,
    box: <><path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" {...p} /></>,
    wrench: <><path d="M14.7 6.3a4 4 0 00-5.2 5.2l-6 6a1.5 1.5 0 002.1 2.1l6-6a4 4 0 005.2-5.2l-2.4 2.4-2.1-2.1 2.4-2.4z" {...p} /></>,
    tag: <><path d="M20.6 13.4L12 22l-8-8 8.6-8.6a2 2 0 011.4-.6H20a2 2 0 012 2v5.6a2 2 0 01-.6 1.4z" {...p} /><circle cx="16.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" /></>,
    gift: <><rect x="3" y="8" width="18" height="4" rx="1" {...p} /><path d="M5 12v9h14v-9M12 8v13M12 8S10.5 3 8 4.5 9.5 8 12 8zM12 8s1.5-5 4-3.5S14.5 8 12 8z" {...p} /></>,
    search: <><circle cx="11" cy="11" r="7" {...p} /><path d="M21 21l-4-4" {...p} /></>,
    truck: <><rect x="1" y="6" width="13" height="10" rx="1" {...p} /><path d="M14 9h4l3 3v4h-7M5.5 20a2 2 0 100-4 2 2 0 000 4zM17.5 20a2 2 0 100-4 2 2 0 000 4z" {...p} /></>,
    swap: <><path d="M7 4L3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8" {...p} /></>,
    receipt: <><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z" {...p} /><path d="M9 7h6M9 11h6M9 15h4" {...p} /></>,
    wallet: <><rect x="3" y="6" width="18" height="14" rx="2" {...p} /><path d="M3 10h18M16 15h2" {...p} /></>,
    users: <><circle cx="9" cy="8" r="3.2" {...p} /><path d="M3 20a6 6 0 0112 0M16 5a3 3 0 010 6M21 20a6 6 0 00-4-5.6" {...p} /></>,
    chart: <><path d="M3 3v18h18" {...p} /><path d="M7 14l3-3 3 3 5-6" {...p} /></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="1.5" {...p} /><path d="M9 7h.01M12 7h.01M15 7h.01M9 11h.01M12 11h.01M15 11h.01M9 15h.01M15 15h.01M12 21v-4" {...p} /></>,
    bell: <><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" {...p} /></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" {...p} /></>,
    chevron: <><path d="M6 9l6 6 6-6" {...p} /></>,
    plus: <><path d="M12 5v14M5 12h14" {...p} /></>,
    check: <><path d="M20 6L9 17l-5-5" {...p} /></>,
    arrowUp: <><path d="M12 19V5M5 12l7-7 7 7" {...p} /></>,
    lock: <><rect x="4" y="11" width="16" height="10" rx="2" {...p} /><path d="M8 11V7a4 4 0 018 0v4" {...p} /></>,
    alert: <><path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.7 3.9a2 2 0 00-3.4 0z" {...p} /></>,
    battery: <><rect x="2" y="8" width="16" height="9" rx="2" {...p} /><path d="M20 11v3" {...p} /><rect x="4" y="10" width="8" height="5" rx="0.5" fill="currentColor" stroke="none" /></>,
    sparkle: <><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" {...p} /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" {...p} /></>,
    send: <><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" {...p} /></>,
    bulb: <><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0012 2z" {...p} /></>,
  }
  return <svg viewBox="0 0 24 24" className={className} aria-hidden>{paths[name] || null}</svg>
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

const toneMap = {
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-rose-50 text-rose-700',
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-brand-50 text-brand-700',
  gray: 'bg-ink-100 text-ink-600',
  violet: 'bg-violet-50 text-violet-700',
}
export function Badge({ children, tone = 'gray' }) {
  return <span className={`chip ${toneMap[tone]}`}>{children}</span>
}

export function StatusBadge({ status }) {
  const map = {
    'In Stock': 'green', 'Sold': 'gray', 'In Transit': 'blue', 'OK': 'green',
    'Low': 'amber', 'Out of Stock': 'red', 'Approved': 'green', 'Received': 'green',
    'Completed': 'green', 'Draft': 'gray', 'Pending': 'amber', 'Pending Approval': 'amber',
    'Present': 'green', 'On Leave': 'amber', 'Absent': 'red',
  }
  return <Badge tone={map[status] || 'gray'}>{status}</Badge>
}

export function Stat({ icon, label, value, sub, tone = 'blue', trend }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className="text-2xl font-extrabold text-ink-900 mt-1.5">{value}</p>
          {sub && <p className="text-xs text-ink-400 mt-1">{sub}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${toneMap[tone]}`}><Icon name={icon} /></div>
      </div>
      {trend != null && (
        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <Icon name="arrowUp" className="w-3.5 h-3.5" /> {trend}
        </div>
      )}
    </div>
  )
}

export function Table({ columns, rows, renderRow, empty = 'No records.' }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-ink-50/60">
            <tr>{columns.map((c) => <th key={c} className="th">{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td className="td text-ink-400" colSpan={columns.length}>{empty}</td></tr>
            ) : rows.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Money({ value, className = '' }) {
  return <span className={`tabular-nums ${className}`}>₹{Number(value || 0).toLocaleString('en-IN')}</span>
}

export function SectionCard({ title, action, children, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink-800">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
