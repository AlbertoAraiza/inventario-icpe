import { Routes, Route } from "react-router-dom";
import NavBar from "./components/navbar/NavBar";
import Hero from "./components/hero/Hero";
import Auth from "./components/auth/Auth";
import PropertyList from "./components/properties/PropertyList";
import PropertyDetail from "./components/properties/PropertyDetail";
import Seeder from "./components/properties/Seeder";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminDashboard from "./components/admin/AdminDashboard";
import fondo from "./assets/background.png";

function App() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[var(--primary)] text-[var(--secondary)]">
      {/* Background with overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url(${fondo})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom',
          backgroundSize: 'cover',
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[var(--primary)] via-transparent to-[var(--primary)] opacity-80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/productos" element={<PropertyList />} />
            <Route path="/detalles/:id" element={<PropertyDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole="realtor">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/seeder" element={<Seeder />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
