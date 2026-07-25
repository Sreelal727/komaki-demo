import { useStore } from '../lib/store.jsx'
import { outlets } from '../data/db.js'
import { PageHeader, Table, Money, Icon, Stat, Badge } from '../components/ui.jsx'

export default function Compliments() {
  const { compliments, hq, scope } = useStore()
  const showOutlet = hq && scope === 'ALL'
  const issued = compliments.reduce((s, c) => s + c.issued, 0)
  const cost = compliments.reduce((s, c) => s + c.issued * c.cost, 0)

  return (
    <div>
      <PageHeader title="Compliment / Free-Gift Stock" subtitle="Promotional freebies given with new vehicle sales — track give-aways & cost"
        actions={<button className="btn-primary"><Icon name="plus" className="w-4 h-4" /> Add gift item</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Stat icon="gift" label="Gift SKUs" value={compliments.length} tone="blue" />
        <Stat icon="check" label="Total issued" value={issued} tone="green" />
        <Stat icon="wallet" label="Give-away cost" value={<Money value={cost} />} tone="amber" />
      </div>
      <Table
        columns={[showOutlet ? 'Outlet' : 'ID', 'Free gift', 'Unit cost', 'Issued', 'In stock', 'Give-away value']}
        rows={compliments}
        renderRow={(c) => (
          <tr key={c.id} className="hover:bg-ink-50">
            <td className="td font-semibold text-ink-800">{showOutlet ? outlets.find(o => o.id === c.outletId)?.short : c.id}</td>
            <td className="td font-medium text-ink-800"><span className="inline-flex items-center gap-2"><Icon name="gift" className="w-4 h-4 text-brand-500" />{c.name}</span></td>
            <td className="td"><Money value={c.cost} /></td>
            <td className="td"><Badge tone="violet">{c.issued}</Badge></td>
            <td className="td font-semibold">{c.inStock}</td>
            <td className="td"><Money value={c.issued * c.cost} /></td>
          </tr>
        )}
      />
    </div>
  )
}
