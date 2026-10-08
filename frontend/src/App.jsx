import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Catalogs from './pages/Catalogs'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/admin/Login'
import AdminLayout from './pages/admin/AdminLayout'
import AdminSections from './pages/admin/AdminSections'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCarousel from './pages/admin/AdminCarousel'

export default function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800">
      {!isAdmin && <Navbar />}

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogos" element={<Catalogs />} />
          <Route path="/catalogos/:slug" element={<Catalogs />} />
          <Route path="/catalogos/:slug/:id" element={<ProductDetail />} />

          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="secciones" replace />} />
            <Route path="secciones" element={<AdminSections />} />
            <Route path="productos" element={<AdminProducts />} />
            <Route path="carrusel" element={<AdminCarousel />} />
          </Route>
        </Routes>
      </div>

      {!isAdmin && <Footer />}
    </div>
  )
}