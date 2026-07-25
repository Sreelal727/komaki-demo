// ---------------------------------------------------------------------------
// Saiga Intelligence — a lightweight rules engine that reads the live ERP data
// and produces grounded business advice. Every insight is computed from the
// same figures the dashboards show, so recommendations always match reality.
// ---------------------------------------------------------------------------
import { vehicles as allVehicles, outlets, monthlyTrend, komakiModels } from '../data/db.js'

const TODAY = new Date('2026-07-25')
const daysSince = (iso) => Math.round((TODAY - new Date(iso)) / 86400000)
export const inr = (n) => '₹' + Number(Math.round(n || 0)).toLocaleString('en-IN')
const short = (id) => outlets.find((o) => o.id === id)?.short || id

// kinds: 'alert' (act now) | 'opportunity' (upside) | 'recommend' (optimise) | 'trend'
export function computeInsights(store) {
  const { vehicles, sales, spares, accessories, expenses, profitShare, compliments, hq, scope } = store
  const out = []
  const push = (o) => out.push({ impact: null, action: null, actionTo: null, ...o })
  const consolidated = hq && scope === 'ALL'

  // 1) Aging / dead stock ----------------------------------------------------
  const aging = vehicles.filter((v) => v.status === 'In Stock' && daysSince(v.addedOn) >= 55)
  if (aging.length) {
    const val = aging.reduce((s, v) => s + v.price, 0)
    push({
      id: 'aging', kind: 'alert', icon: 'alert', score: 90 + Math.min(aging.length, 9),
      title: `${aging.length} vehicles aging 55+ days`,
      detail: `${inr(val)} of capital is locked in slow-moving units. Consider a festive discount, a marketing push, or transferring to an outlet with live demand.`,
      impact: `${inr(val)} locked`, action: 'View vehicles', actionTo: '/vehicles',
    })
  }

  // 2) Rebalancing / transfer opportunity (cross-outlet) ---------------------
  // A model+colour that is out of stock at one outlet but sitting at another.
  const targets = consolidated ? outlets.filter((o) => !o.isHQ).map((o) => o.id)
    : [scope].filter((s) => s && s !== 'ALL')
  let bestMove = null
  for (const t of targets) {
    const demandModels = new Set(vehicles.filter((v) => v.outletId === t).map((v) => `${v.model}|${v.color}`))
    // for each model sold at t but now 0 in stock at t, is it available elsewhere?
    for (const key of demandModels) {
      const [model, color] = key.split('|')
      const here = allVehicles.filter((v) => v.outletId === t && v.model === model && v.color === color && v.status === 'In Stock').length
      if (here > 0) continue
      const elsewhere = allVehicles.filter((v) => v.outletId !== t && v.model === model && v.color === color && v.status === 'In Stock')
      if (elsewhere.length) {
        const from = elsewhere[0].outletId
        if (!bestMove || elsewhere.length > bestMove.qty) bestMove = { model, color, to: t, from, qty: elsewhere.length }
      }
    }
  }
  if (bestMove) {
    push({
      id: 'rebalance', kind: 'opportunity', icon: 'swap', score: 78,
      title: `Rebalance ${bestMove.model} · ${bestMove.color}`,
      detail: `${short(bestMove.to)} is out of stock on this variant while ${short(bestMove.from)} holds ${bestMove.qty}. Move a unit to avoid losing a walk-in sale.`,
      impact: 'Prevent lost sale', action: 'Create transfer', actionTo: '/transfers',
    })
  }

  // 3) Reorder pressure ------------------------------------------------------
  const low = [...spares, ...accessories].filter((i) => i.status !== 'OK')
  if (low.length) {
    const outCount = low.filter((i) => i.status === 'Out of Stock').length
    push({
      id: 'reorder', kind: 'alert', icon: 'box', score: 82 + outCount,
      title: `${low.length} SKUs need reordering`,
      detail: `${outCount} already at zero stock. Raise purchase orders now — service and accessory sales stall without parts on the shelf.`,
      impact: `${outCount} out of stock`, action: 'Raise PO', actionTo: '/purchase-orders',
    })
  }

  // 4) Accessory attach rate (upsell) ---------------------------------------
  if (sales.length) {
    const withAcc = sales.filter((s) => s.accAmt > 0).length
    const rate = Math.round((withAcc / sales.length) * 100)
    if (rate < 55) {
      const gap = Math.round((0.65 - withAcc / sales.length) * sales.length)
      push({
        id: 'attach', kind: 'opportunity', icon: 'tag', score: 70,
        title: `Accessory attach rate is ${rate}%`,
        detail: `Only ${withAcc} of ${sales.length} sales carried accessories. Bundling helmets, covers and chargers at the point of sale could add roughly ${gap} more attached sales — pure margin.`,
        impact: `Target 65% attach`, action: 'Open billing', actionTo: '/sales',
      })
    }
  }

  // 5) Top seller ------------------------------------------------------------
  if (sales.length) {
    const byModel = {}
    sales.forEach((s) => { byModel[s.model] = (byModel[s.model] || 0) + 1 })
    const top = Object.entries(byModel).sort((a, b) => b[1] - a[1])[0]
    if (top) {
      const stock = vehicles.filter((v) => v.model === top[0] && v.status === 'In Stock').length
      push({
        id: 'bestseller', kind: 'recommend', icon: 'scooter', score: 60,
        title: `${top[0]} is your best-seller`,
        detail: `${top[1]} units moved this period, with ${stock} in stock now. Keep this variant deep — it is carrying your volume.`,
        impact: `${top[1]} units sold`, action: 'View inventory', actionTo: '/vehicles',
      })
    }
  }

  // 6) Margin watch (from profit share) -------------------------------------
  if (profitShare.length) {
    const withMargin = profitShare.map((p) => ({ ...p, margin: p.netProfit / p.revenue }))
    const worst = [...withMargin].sort((a, b) => a.margin - b.margin)[0]
    const avg = withMargin.reduce((s, p) => s + p.margin, 0) / withMargin.length
    if (consolidated && worst && worst.margin < avg - 0.02) {
      push({
        id: 'margin', kind: 'recommend', icon: 'chart', score: 66,
        title: `${short(worst.outletId)} margin below network`,
        detail: `${short(worst.outletId)} nets ${(worst.margin * 100).toFixed(1)}% vs a network average of ${(avg * 100).toFixed(1)}%. Review its discounting and petty-cash outflow.`,
        impact: `${(worst.margin * 100).toFixed(1)}% net margin`, action: 'Open reports', actionTo: '/reports',
      })
    }
  }

  // 7) Revenue momentum ------------------------------------------------------
  const t = monthlyTrend
  if (t.length >= 2) {
    const a = t[t.length - 2].units, b = t[t.length - 1].units
    const pct = Math.round(((b - a) / a) * 100)
    push({
      id: 'momentum', kind: 'trend', icon: 'arrowUp', score: 40,
      title: `Sales ${pct >= 0 ? 'up' : 'down'} ${Math.abs(pct)}% month-on-month`,
      detail: `${b} units in the latest month versus ${a} the month before. ${pct >= 0 ? 'Momentum is positive — make sure fast movers stay in stock.' : 'Momentum softened — check demand and follow up on open leads.'}`,
      impact: `${pct >= 0 ? '+' : ''}${pct}% MoM`, action: 'Open reports', actionTo: '/reports',
    })
  }

  // 8) Free-gift cost ratio --------------------------------------------------
  if (compliments.length && sales.length) {
    const giftCost = compliments.reduce((s, c) => s + c.issued * c.cost, 0)
    const rev = sales.reduce((s, r) => s + r.total, 0)
    const ratio = (giftCost / rev) * 100
    if (ratio > 0.6) {
      push({
        id: 'gifts', kind: 'recommend', icon: 'gift', score: 45,
        title: `Free-gift spend at ${ratio.toFixed(1)}% of revenue`,
        detail: `${inr(giftCost)} handed out in complimentary items. Track give-aways per sale to keep promo cost in line — cap high-cost gifts to high-value vehicles.`,
        impact: inr(giftCost), action: 'View compliments', actionTo: '/compliments',
      })
    }
  }

  return out.sort((a, b) => b.score - a.score)
}

// Natural-language headline for the top of the Saiga panel.
export function headline(store, insights) {
  const { sales, hq, scope } = store
  const rev = sales.reduce((s, r) => s + r.total, 0)
  const where = hq && scope === 'ALL' ? 'across all outlets' : `at ${short(scope || store.user.outletId)}`
  const alerts = insights.filter((i) => i.kind === 'alert').length
  const opps = insights.filter((i) => i.kind === 'opportunity').length
  return `This period generated ${inr(rev)} in sales ${where}. I found ${alerts} item${alerts === 1 ? '' : 's'} needing attention and ${opps} growth opportunit${opps === 1 ? 'y' : 'ies'}. Prioritise the alerts below.`
}

// A tiny "Ask Saiga" — maps intent keywords to a computed answer.
export function askSaiga(q, store, insights) {
  const s = q.toLowerCase()
  const { sales, vehicles, spares, accessories, profitShare } = store
  if (/aging|dead|slow|old stock/.test(s)) {
    const a = vehicles.filter((v) => v.status === 'In Stock' && daysSince(v.addedOn) >= 55)
    return `There ${a.length === 1 ? 'is' : 'are'} ${a.length} vehicle(s) in stock for 55+ days, worth ${inr(a.reduce((x, v) => x + v.price, 0))}. I'd discount or transfer them before they age further.`
  }
  if (/reorder|low stock|out of stock|parts/.test(s)) {
    const l = [...spares, ...accessories].filter((i) => i.status !== 'OK')
    return `${l.length} SKUs are low or out of stock. Top of the list: ${l.slice(0, 3).map((i) => i.name).join(', ')}. Raise POs from the Purchase Orders screen.`
  }
  if (/best.?sell|top model|popular/.test(s)) {
    const by = {}; sales.forEach((x) => { by[x.model] = (by[x.model] || 0) + 1 })
    const top = Object.entries(by).sort((a, b) => b[1] - a[1])[0]
    return top ? `Your best-seller is ${top[0]} with ${top[1]} units this period. Keep it well stocked.` : `No sales in scope yet.`
  }
  if (/margin|profit|which outlet/.test(s)) {
    const m = profitShare.map((p) => ({ o: p.outlet, m: p.netProfit / p.revenue })).sort((a, b) => b.m - a.m)
    if (!m.length) return `No profit data in scope.`
    return `Best margin: ${m[0].o} at ${(m[0].m * 100).toFixed(1)}%. Weakest: ${m[m.length - 1].o} at ${(m[m.length - 1].m * 100).toFixed(1)}%. Focus support on the weakest.`
  }
  if (/accessor|attach|upsell/.test(s)) {
    const w = sales.filter((x) => x.accAmt > 0).length
    const r = sales.length ? Math.round((w / sales.length) * 100) : 0
    return `Accessory attach rate is ${r}%. Anything under 55% is money left on the table — bundle at billing.`
  }
  // default: summarise the top insight
  const top = insights[0]
  return top ? `Top priority right now: ${top.title}. ${top.detail}` : `Everything looks healthy in this scope.`
}
