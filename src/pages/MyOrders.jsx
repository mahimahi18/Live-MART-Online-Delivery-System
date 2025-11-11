import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getMyOrders } from '../services/OrderService'; // Import your NEW order service
import app from '../firebase';
import './MyOrders.css'; // We'll create this CSS fconst auth = getAuth(app);


function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, fetch their orders
        console.log("Fetching orders for user:", user.uid);
        getMyOrders(user.uid)
          .then(data => {
            setOrders(data);
            setLoading(false);
          })
          .catch(error => {
            console.error("Error fetching orders:", error);
            setLoading(false);
          });
      } else {
        // No user is signed in.
        setLoading(false);
      }
    });


    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  if (loading) {
    return <h1>Loading your orders...</h1>;
  }


  if (orders.length === 0) {
    return <h1>You have no orders.</h1>;
  }


  return (
    <div className="my-orders-container">
      <h1>My Orders</h1>
      {orders.map(order => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <h3>Order ID: {order.id}</h3>
            <span>Status: <strong>{order.status}</strong></span>
          </div>
          <div className="order-body">
            <p>Total: <strong>${order.totalAmount.toFixed(2)}</strong></p>
            <p>Address: {order.deliveryAddress}</p>
            <ul>
              {order.products.map((product, index) => (
                <li key={index}>
                  {product.name} (x{product.quantity})
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}


export default MyOrders;