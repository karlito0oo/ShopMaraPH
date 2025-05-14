import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import NewPage from './pages/NewPage'
import WomenPage from './pages/WomenPage'
import MenPage from './pages/MenPage'
import LoginPage from './pages/LoginPage'
import CartPage from './pages/CartPage'
import AllProductsPage from './pages/AllProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AdminPage from './pages/AdminPage'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/new" element={<NewPage />} />
            <Route path="/women" element={<WomenPage />} />
            <Route path="/men" element={<MenPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/products" element={<AllProductsPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}

export default App
