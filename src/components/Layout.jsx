import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useStore, isHQ } from '../lib/store.jsx'
import { ROLES } from '../data/db.js'
import { Icon } from './ui.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', roles: 'all' },
  { to: '/saiga', label: 'Saiga Intelligence', icon: 'sparkle', roles: 'all', accent: true },
  { section: 'Inventory' },
  { to: '/vehicles', label: 'Vehicles', icon: 'scooter', roles: 'all' },
  { to: '/spares', label: 'Spare Parts', icon: 'wrench', roles: 'all' },
  { to: '/accessories', label: 'Accessories', icon: 'tag', roles: 'all' },
  { to: '/compliments', label: 'Compliments', icon: 'gift', roles: 'all' },
  { to: '/lookup', label: 'Cross-Outlet Lookup', icon: 'search', roles: 'all' },
  { section: 'Procurement' },
  { to: '/vendors', label: 'Vendors', icon: 'building', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FRANCHISE] },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: 'box', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FRANCHISE] },
  { to: '/transfers', label: 'Stock Transfers', icon: 'swap', roles: 'all' },
  { section: 'Operations' },
  { to: '/sales', label: 'Sales & Billing', icon: 'receipt', roles: 'all' },
  { to: '/expenses', label: 'Daily Expenses', icon: 'wallet', roles: 'all' },
  { to: '/people', label: 'People & Attendance', icon: 'users', roles: 'all' },
  { section: 'Insights' },
  { to: '/reports', label: 'Reports', icon: 'chart', roles: 'all' },
  { to: '/profit-sharing', label: 'Profit Sharing', icon: 'chart', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FRANCHISE] },
  { to: '/settings', label: 'Settings', icon: 'gear', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
]

function allowed(item, role) {
  if (item.roles === 'all') return true
  return item.roles.includes(role)
}

function Sidebar({ open, onClose }) {
  const { user } = useStore()
  return (
    <>
      <div className={`fixed inset-0 bg-black/30 z-20 lg:hidden ${open ? '' : 'hidden'}`} onClick={onClose} />
      <aside className={`fixed z-30 lg:static inset-y-0 left-0 w-64 bg-ink-950 text-ink-100 flex flex-col transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-brand-500 grid place-items-center font-extrabold text-white">L</div>
          <div className="leading-tight">
            <div className="font-extrabold tracking-tight">Lestova ERP</div>
            <div className="text-[11px] text-ink-400">Komaki EV · Multi-Outlet</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map((item, i) => {
            if (item.section) return <div key={i} className="px-3 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">{item.section}</div>
            if (!allowed(item, user.role)) return null
            return (
              <NavLink key={item.to} to={item.to} onClick={onClose} end={item.to === '/'}
                className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-600 text-white' : item.accent ? 'text-violet-200 bg-violet-500/10 hover:bg-violet-500/20' : 'text-ink-300 hover:bg-white/5 hover:text-white'}`}>
                <Icon name={item.icon} className="w-[18px] h-[18px]" />
                {item.label}
                {item.accent && <span className="ml-auto chip bg-violet-500/25 text-violet-100 text-[9px] px-1.5 py-0.5">AI</span>}
              </NavLink>
            )
          })}
        </nav>
        <div className="p-3 border-t border-white/10 text-[11px] text-ink-500">
          Demo build · mock data
        </div>
      </aside>
    </>
  )
}

function RoleSwitcher() {
  const { user, users, switchUser } = useStore()
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 hover:bg-ink-50">
        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 grid place-items-center text-xs font-bold">{user.avatar}</div>
        <div className="text-left leading-tight hidden sm:block">
          <div className="text-sm font-semibold text-ink-800">{user.name}</div>
          <div className="text-[11px] text-ink-500">{user.role}</div>
        </div>
        <Icon name="chevron" className="w-4 h-4 text-ink-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 card p-2 z-20">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-400">Demo · switch role to see access change</div>
            {users.map((u) => (
              <button key={u.id} onClick={() => { switchUser(u.id); setOpen(false) }}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-ink-50 ${u.id === user.id ? 'bg-brand-50' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-ink-100 text-ink-600 grid place-items-center text-xs font-bold">{u.avatar}</div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-ink-800">{u.name}</div>
                  <div className="text-[11px] text-ink-500">{u.role} · {u.title}</div>
                </div>
                {u.id === user.id && <Icon name="check" className="w-4 h-4 text-brand-600 ml-auto" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function OutletSwitcher() {
  const { hq, user, outlets, viewOutlet, setViewOutlet } = useStore()
  if (!hq) {
    const o = outlets.find((x) => x.id === user.outletId)
    return (
      <div className="flex items-center gap-2 rounded-lg bg-ink-100 px-3 py-1.5 text-sm">
        <Icon name="lock" className="w-4 h-4 text-ink-400" />
        <span className="font-semibold text-ink-700">{o?.short}</span>
        <span className="text-ink-400 hidden md:inline">· locked to your outlet</span>
      </div>
    )
  }
  const sales = outlets.filter((o) => !o.isHQ)
  return (
    <select value={viewOutlet} onChange={(e) => setViewOutlet(e.target.value)}
      className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-semibold text-ink-700 outline-none focus:border-brand-400">
      <option value="ALL">All Outlets (Consolidated)</option>
      {sales.map((o) => <option key={o.id} value={o.id}>{o.short}</option>)}
    </select>
  )
}

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 shrink-0 bg-white border-b border-ink-100 flex items-center gap-3 px-4 lg:px-6">
          <button className="lg:hidden btn-ghost -ml-2" onClick={() => setOpen(true)}>
            <Icon name="dashboard" />
          </button>
          <OutletSwitcher />
          <div className="ml-auto flex items-center gap-3">
            <button className="relative btn-ghost">
              <Icon name="bell" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>
            <RoleSwitcher />
          </div>
        </header>
        <main key={loc.pathname} className="flex-1 overflow-y-auto p-4 lg:p-8 bg-ink-50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
