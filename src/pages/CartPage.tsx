import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice,
    clearCart
  } = useCart();

  const subtotal = getTotalPrice();
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-white shadow rounded p-8">
          <p className="text-xl mb-6">Your cart is empty</p>
          <Link 
            to="/products" 
            className="inline-block border border-black px-8 py-3 hover:bg-black hover:text-white transition-colors no-underline text-black"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Cart Items */}
            <div className="bg-white shadow rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <tr key={`${item.product.id}-${item.size}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                            <div className="text-sm text-gray-500">Size: {item.size.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₱{item.product.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button 
                            className="w-8 h-8 flex items-center justify-center rounded-l border-2 border-gray-300 bg-white text-black hover:border-gray-500 font-medium" 
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center border-t-2 border-b-2 border-gray-300 bg-white">
                            {item.quantity}
                          </span>
                          <button 
                            className="w-8 h-8 flex items-center justify-center rounded-r border-2 border-gray-300 bg-white text-black hover:border-gray-500 font-medium"
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₱{(item.product.price * item.quantity).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-red-600 hover:text-red-800 font-medium"
                          onClick={() => removeFromCart(item.product.id, item.size)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 flex justify-between border-t border-gray-200">
                <Link 
                  to="/products" 
                  className="text-sm font-medium text-gray-700 hover:text-black"
                >
                  Continue Shopping
                </Link>
                <button 
                  onClick={clearCart}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white shadow rounded p-6">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">₱{shipping.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="font-medium text-lg">Total</span>
                <span className="font-medium text-lg">₱{total.toFixed(2)}</span>
              </div>
              <button
                className="w-full bg-black text-white py-3 px-4 font-medium rounded hover:bg-gray-800 transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage 