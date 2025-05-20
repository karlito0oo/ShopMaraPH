import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import NewPage from './pages/NewPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CartPage from './pages/CartPage'
import AllProductsPage from './pages/AllProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AdminPage from './pages/admin/AdminPage'
import EditProductPage from './pages/admin/EditProductPage'
import AddProductPage from './pages/admin/AddProductPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import UserOrdersPage from './pages/UserOrdersPage'
import AboutPage from './pages/AboutPage'
import { CartProvider } from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProfileProvider } from './context/ProfileContext'

// Protected route component for authentication
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin route component for authorization
const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <CartProvider>
          <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/new" element={<NewPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                } />
                <Route path="/my-orders" element={
                  <ProtectedRoute>
                    <UserOrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="/products" element={<AllProductsPage />} />
                <Route path="/product/:productId" element={<ProductDetailPage />} />
                
                {/* Admin routes with tab parameter */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                } />
                <Route path="/admin/:tab" element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                } />
                
                {/* Product management routes */}
                <Route path="/add-product" element={
                  <AdminRoute>
                    <AddProductPage />
                  </AdminRoute>
                } />
                <Route path="/edit-product/:productId" element={
                  <AdminRoute>
                    <EditProductPage />
                  </AdminRoute>
                } />
                <Route path="/admin-orders" element={
                  <AdminRoute>
                    <AdminOrdersPage />
                  </AdminRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </ProfileProvider>
    </AuthProvider>
  )
}

export default App
