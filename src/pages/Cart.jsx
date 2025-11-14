import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/OrderService';
import app from '../firebase';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const auth = getAuth(app);

function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMode, setPaymentMode] = useState("Online");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to place an order.");
      navigate('/login');
      return;
    }
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    if (!deliveryAddress) {
      alert("Please enter a delivery address.");
      return;
    }

    setLoading(true);

    const cartForBackend = cart.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }));

    const orderDetails = {
      cart: cartForBackend,
      deliveryAddress,
      paymentMode,
    };

    try {
      console.log("Placing order...", orderDetails);
      const result = await placeOrder(orderDetails);
      console.log("Order placed successfully!", result.data.orderId);
      alert(`Order successful! Your Order ID is: ${result.data.orderId}`);
      clearCart();
      navigate('/my-orders');
    } catch (error) {
      console.error("Error placing order:", error);
      alert(`Error placing order: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.length === 0 ? (
            <>
              {/* Placeholder Item (like Week 5) */}
              <div className="cart-item">
                <img src="https://via.placeholder.com/100" alt="Product" />
                <div className="item-details">
                  <h3>Placeholder Product</h3>
                  <p>Price: $10.00</p>
                  <p>Quantity: 1</p>
                </div>
                <button className="remove-btn">Remove</button>
              </div>
              <p>Your cart is empty.</p>
            </>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.imageURL || 'https://via.placeholder.com/100'} alt={item.name} />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>Price: ${item.price}</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="remove-btn">Remove</button>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <h2>Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>$0.00</span>
          </div>

          {/* Checkout Form (only if cart not empty) */}
          {cart.length > 0 && (
            <div className="checkout-form">
              <label>Delivery Address</label>
              <input
                type="text"
                placeholder="123 Main St..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
              <label>Payment Mode</label>
              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                <option value="Online">Online</option>
                <option value="Offline">Cash on Delivery</option>
              </select>
            </div>
          )}

          <div className="summary-row total">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          <button
            className="checkout-btn"
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || loading}
          >
            {loading ? "Placing Order..." : cart.length === 0 ? "Proceed to Checkout" : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
