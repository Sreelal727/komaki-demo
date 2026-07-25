import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Saiga from './pages/Saiga.jsx'
import Vehicles from './pages/Vehicles.jsx'
import Spares from './pages/Spares.jsx'
import Accessories from './pages/Accessories.jsx'
import Compliments from './pages/Compliments.jsx'
import Lookup from './pages/Lookup.jsx'
import Vendors from './pages/Vendors.jsx'
import PurchaseOrders from './pages/PurchaseOrders.jsx'
import Transfers from './pages/Transfers.jsx'
import Sales from './pages/Sales.jsx'
import Expenses from './pages/Expenses.jsx'
import People from './pages/People.jsx'
import Reports from './pages/Reports.jsx'
import ProfitSharing from './pages/ProfitSharing.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/saiga" element={<Saiga />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/spares" element={<Spares />} />
        <Route path="/accessories" element={<Accessories />} />
        <Route path="/compliments" element={<Compliments />} />
        <Route path="/lookup" element={<Lookup />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/people" element={<People />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profit-sharing" element={<ProfitSharing />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}
