let cart = [];

// Load products for user dashboard
window.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("product-list");
  if (productList) {
    fetch("/user/products")
      .then(res => res.json())
      .then(products => {
        products.forEach(product => {
          const div = document.createElement("div");
          div.classList.add("product-card");
          div.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p><strong>₹${product.price}</strong></p>
            <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
          `;
          productList.appendChild(div);
        });
      })
      .catch(err => {
        console.error("Error loading products:", err);
      });
  }

  // Load admin orders if available
  const orderList = document.getElementById("order-list");
  if (orderList) {
    fetch("/admin/orders")
      .then(res => res.json())
      .then(orders => {
        orders.forEach(order => {
          const div = document.createElement("div");
          div.classList.add("order-card");
          div.innerHTML = `
            <p><strong>Order #${order.id}</strong></p>
            <p>Customer: ${order.customer}</p>
            <p>Product: ${order.product}</p>
            <p>Qty: ${order.quantity}</p>
            <p>Status: ${order.status}</p>
            <p>Price: ₹${order.total_price}</p>
            <p>Date: ${new Date(order.order_date).toLocaleString()}</p>
          `;
          orderList.appendChild(div);
        });
      })
      .catch(err => {
        console.error("Error loading orders:", err);
      });
  }
});

// Add item to cart
function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  renderCart();
}

// Render cart items in user dashboard
function renderCart() {
  const cartContainer = document.getElementById("cart");
  if (!cartContainer) return;
  cartContainer.innerHTML = "";

  cart.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<strong>${item.name}</strong> x${item.quantity} = ₹${item.price * item.quantity}`;
    cartContainer.appendChild(div);
  });
}

// Place order request
function placeOrder() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  fetch("/user/place-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ cart })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Order placed!");
      cart = [];
      renderCart();
    })
    .catch(err => {
      alert("Failed to place order.");
      console.error(err);
    });
}
// Clear cart
function clearCart() {
  cart = [];
  renderCart();
  alert("Cart cleared!");
} 

// Admin order management
function updateOrderStatus(orderId, status) {
  fetch(`/admin/update-order/${orderId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Order status updated!");
      location.reload(); // Reload to reflect changes
    })
    .catch(err => {
      alert("Failed to update order status.");
      console.error(err);
    });
} 