import { useState } from 'react'
import { outlets, users, komakiModels, money } from '../data/db.js'
import { PageHeader, Table, Badge, Icon, Money } from '../components/ui.jsx'

const TABS = ['Outlets & Partners', 'Users & Roles', 'Komaki Model Master']

export default function Settings() {
  const [tab, setTab] = useState(TABS[0])
  return (
    <div>
      <PageHeader title="Settings" subtitle="Central configuration — outlets, partnership contracts, users and product master" />
      <div className="flex gap-1 mb-6 border-b border-ink-100">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-400 hover:text-ink-600'}`}>{t}</button>
        ))}
      </div>

      {tab === TABS[0] && (
        <Table
          columns={['Outlet', 'City', 'Partner', 'Contract share', 'Partner since', '']}
          rows={outlets.filter((o) => !o.isHQ)}
          renderRow={(o) => (
            <tr key={o.id} className="hover:bg-ink-50">
              <td className="td font-semibold text-ink-800">{o.name}</td>
              <td className="td">{o.city}</td>
              <td className="td">{o.partner}</td>
              <td className="td"><Badge tone="blue">{o.share}%</Badge> <span className="text-ink-300 text-xs">/ Lestova {100 - o.share}%</span></td>
              <td className="td">{o.since}</td>
              <td className="td text-brand-600 font-semibold text-sm cursor-pointer">Edit</td>
            </tr>
          )}
        />
      )}

      {tab === TABS[1] && (
        <Table
          columns={['User', 'Role', 'Scope', 'Access']}
          rows={users}
          renderRow={(u) => (
            <tr key={u.id} className="hover:bg-ink-50">
              <td className="td">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 grid place-items-center text-xs font-bold">{u.avatar}</div>
                  <div><div className="font-semibold text-ink-800">{u.name}</div><div className="text-xs text-ink-400">{u.title}</div></div>
                </div>
              </td>
              <td className="td"><Badge tone={u.role.includes('Admin') ? 'violet' : u.role.includes('Franchise') ? 'blue' : 'gray'}>{u.role}</Badge></td>
              <td className="td">{u.outletId === 'HQ' ? 'All outlets' : outlets.find(o => o.id === u.outletId)?.short}</td>
              <td className="td text-sm text-ink-500">{u.outletId === 'HQ' ? 'Full / cross-outlet' : <span className="inline-flex items-center gap-1"><Icon name="lock" className="w-3.5 h-3.5" /> Outlet-isolated</span>}</td>
            </tr>
          )}
        />
      )}

      {tab === TABS[2] && (
        <Table
          columns={['Model', 'Segment', 'Ex-showroom', 'Range', 'Battery', 'Motor', 'Colours']}
          rows={komakiModels}
          renderRow={(m) => (
            <tr key={m.model} className="hover:bg-ink-50">
              <td className="td font-semibold text-ink-800">{m.model}</td>
              <td className="td"><Badge tone={m.segment === 'High Speed' ? 'blue' : 'gray'}>{m.segment}</Badge></td>
              <td className="td font-semibold"><Money value={m.price} /></td>
              <td className="td">{m.range} km</td>
              <td className="td text-sm">{m.battery}</td>
              <td className="td">{m.motor}</td>
              <td className="td text-sm text-ink-500">{m.colors.join(', ')}</td>
            </tr>
          )}
        />
      )}
    </div>
  )
}
