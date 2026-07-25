import { useStore } from '../lib/store.jsx'
import { outlets } from '../data/db.js'
import { PageHeader, Table, StatusBadge, Icon, Stat, Badge } from '../components/ui.jsx'

export default function People() {
  const { staff, hq, scope } = useStore()
  const showOutlet = hq && scope === 'ALL'
  const present = staff.filter((s) => s.status === 'Present').length

  return (
    <div>
      <PageHeader title="People & Attendance" subtitle="Clock-in / out, daily duty assignment — staff locked to their outlet"
        actions={<button className="btn-primary"><Icon name="plus" className="w-4 h-4" /> Add staff</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon="users" label="Headcount" value={staff.length} tone="blue" />
        <Stat icon="check" label="Present today" value={present} tone="green" />
        <Stat icon="alert" label="On leave" value={staff.filter(s => s.status === 'On Leave').length} tone="amber" />
        <Stat icon="dashboard" label="Duties assigned" value={staff.filter(s => s.duty !== '—').length} tone="violet" />
      </div>

      <Table
        columns={['Staff', showOutlet ? 'Outlet' : 'Role', 'Clock-in', 'Clock-out', "Today's duty", 'Status']}
        rows={staff}
        empty="No staff in this outlet."
        renderRow={(s) => (
          <tr key={s.id} className="hover:bg-ink-50">
            <td className="td">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 grid place-items-center text-xs font-bold">{s.name.split(' ').map(w => w[0]).join('')}</div>
                <div><div className="font-semibold text-ink-800">{s.name}</div><div className="text-xs text-ink-400">{s.role}</div></div>
              </div>
            </td>
            <td className="td">{showOutlet ? outlets.find(o => o.id === s.outletId)?.short : s.role}</td>
            <td className="td font-mono text-sm">{s.in}</td>
            <td className="td font-mono text-sm">{s.out}</td>
            <td className="td text-ink-600">{s.duty}</td>
            <td className="td"><StatusBadge status={s.status} /></td>
          </tr>
        )}
      />

      <div className="mt-4 card p-4 flex items-center gap-3 text-sm text-ink-500">
        <Icon name="lock" className="w-4 h-4 text-ink-400" />
        Employees registered under one outlet cannot view billing, accounts or attendance of any other outlet.
      </div>
    </div>
  )
}
