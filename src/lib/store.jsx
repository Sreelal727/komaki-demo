import { createContext, useContext, useMemo, useState } from 'react'
import {
  users, outlets, ROLES, vehicles, spares, accessories, compliments,
  sales, expenses, staff, profitShare,
} from '../data/db.js'

const StoreContext = createContext(null)
export const useStore = () => useContext(StoreContext)

// A user is "HQ-level" (sees every outlet) if Super Admin or Admin.
export const isHQ = (role) => role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN

export function StoreProvider({ children }) {
  const [userId, setUserId] = useState('u-owner')
  // For HQ users, which outlet is being viewed ('ALL' = consolidated).
  const [viewOutlet, setViewOutlet] = useState('ALL')

  const user = users.find((u) => u.id === userId)
  const hq = isHQ(user.role)

  // The outlet scope actually applied to data:
  //  - Outlet users are hard-locked to their own outlet (isolation).
  //  - HQ users choose: ALL (everything) or drill into one outlet.
  const scope = hq ? viewOutlet : user.outletId

  // switchUser resets the outlet view sensibly.
  const switchUser = (id) => {
    setUserId(id)
    const u = users.find((x) => x.id === id)
    setViewOutlet(isHQ(u.role) ? 'ALL' : u.outletId)
  }

  const inScope = (outletId) => scope === 'ALL' || outletId === scope

  // Scoped selectors — every page pulls data through these, so isolation is
  // enforced in exactly one place.
  const data = useMemo(() => {
    const f = (arr) => arr.filter((r) => inScope(r.outletId))
    return {
      vehicles: f(vehicles),
      spares: f(spares),
      accessories: f(accessories),
      compliments: f(compliments),
      sales: f(sales),
      expenses: f(expenses),
      staff: f(staff),
      profitShare: hq
        ? (scope === 'ALL' ? profitShare : profitShare.filter((p) => p.outletId === scope))
        : profitShare.filter((p) => p.outletId === user.outletId),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, scope])

  const visibleOutlets = hq
    ? outlets.filter((o) => !o.isHQ)
    : outlets.filter((o) => o.id === user.outletId)

  const value = {
    user, users, hq, scope, viewOutlet, setViewOutlet,
    switchUser, outlets, visibleOutlets, inScope, ...data,
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
