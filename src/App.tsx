import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import NewPage from "./pages/NewPage";
import SalePage from "./pages/SalePage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import UserOrdersPage from "./pages/UserOrdersPage";
import AllProductsPage from "./pages/AllProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AdminPage from "./pages/admin/AdminPage";
import AddProductPage from "./pages/admin/AddProductPage";
import EditProductPage from "./pages/admin/EditProductPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AnnouncementFormPage from "./pages/admin/AnnouncementFormPage";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { SettingsProvider } from "./context/SettingsContext";
import { GuestProfileProvider } from "./context/GuestProfileContext";
import { ProfileProvider } from "./context/ProfileContext";
import { AdminRoute } from "./components/admin/AdminRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Layout wrapper component to handle padding for fixed navbar
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="min-h-screen pt-16 md:pt-20">{children}</div>;
};

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <SettingsProvider>
            <GuestProfileProvider>
              <ProfileProvider>
                <div className="app">
                  <Navbar />
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/new" element={<NewPage />} />
                      <Route path="/sale" element={<SalePage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route
                        path="/my-orders"
                        element={
                          <ProtectedRoute>
                            <UserOrdersPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/products" element={<AllProductsPage />} />
                      <Route
                        path="/product/:id"
                        element={<ProductDetailPage />}
                      />

                      {/* Admin routes */}
                      <Route
                        path="/admin"
                        element={
                          <AdminRoute>
                            <AdminPage />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/admin/:tab"
                        element={
                          <AdminRoute>
                            <AdminPage />
                          </AdminRoute>
                        }
                      />

                      {/* Product management routes */}
                      <Route
                        path="/admin/products/add"
                        element={
                          <AdminRoute>
                            <AddProductPage />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/admin/products/edit/:productId"
                        element={
                          <AdminRoute>
                            <EditProductPage />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/admin-orders"
                        element={
                          <AdminRoute>
                            <AdminOrdersPage />
                          </AdminRoute>
                        }
                      />

                      {/* Announcement management routes */}
                      <Route
                        path="/admin/announcements/new"
                        element={
                          <AdminRoute>
                            <AnnouncementFormPage />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/admin/announcements/edit/:id"
                        element={
                          <AdminRoute>
                            <AnnouncementFormPage />
                          </AdminRoute>
                        }
                      />
                    </Routes>
                  </MainLayout>
                  <Footer />
                </div>
              </ProfileProvider>
            </GuestProfileProvider>
          </SettingsProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
