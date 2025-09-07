// fetch("assets/styles/products.json")
//   .then((res) => res.json())
//   .then((data) => {
//     const container = document.getElementById("product-list");
//     container.innerHTML = "";

//     data.products.slice(0, 6).forEach((product) => {
//       const formattedPrice = `₦ ${product.price.toLocaleString()}`;

//       const item = document.createElement("div");
//       item.className = "product-card";

//       item.innerHTML = `
//         <img
//           src="optimized/mobile/${product.image}.webp"
//           srcset="
//             optimized/mobile/${product.image}.webp 400w,
//             optimized/tablet/${product.image}.webp 768w,
//             optimized/desktop/${product.image}.webp 1200w
//           "
//           sizes="(max-width: 768px) 100vw, 50vw"
//           alt="${product.name}"
//           loading="lazy"
//           decoding="async"
//           width="300"
//           height="300"
//         >
//         <h3>${product.name}</h3>
//         <p class="price">${formattedPrice}</p>
//         <p class="rating">⭐ ${product.rating}</p>
//         <button>Add to Cart</button>
//       `;

//       container.appendChild(item);
//     });
//   })
//   .catch((err) => console.error("Error fetching products:", err));

// //2
// let productsData = []; // store all products
// let visibleCount = 4; // how many products shown initially

// fetch("assets/styles/products.json")
//   .then((res) => res.json())
//   .then((data) => {
//     productsData = data.products;
//     renderProducts();
//   })
//   .catch((err) => console.error("Error fetching products:", err));

// function renderProducts() {
//   const container = document.getElementById("product-list");

//   // only render the next set, don’t reset container
//   productsData.slice(visibleCount - 4, visibleCount).forEach((product) => {
//     const formattedPrice = `₦ ${product.price.toLocaleString()}`;
//     const item = document.createElement("div");
//     item.setAttribute("data-aos", "fade-up");
//     item.className = "product-card";

//     item.innerHTML = `
//       <img
//         src="optimized/mobile/${product.image}.webp"
//         srcset="
//           optimized/mobile/${product.image}.webp 400w,
//           optimized/tablet/${product.image}.webp 768w,
//           optimized/desktop/${product.image}.webp 1200w
//         "
//         sizes="(max-width: 768px) 100vw, 50vw"
//         alt="${product.name}"
//         loading="lazy"
//         decoding="async"
//         width="300"
//         height="300"
//       >
//       <h3>${product.name}</h3>
//       <p class="price">${formattedPrice}</p>
//       <p class="rating">⭐ ${product.rating}</p>
//       <button>Add to Cart</button>
//     `;

//     container.appendChild(item);
//   });

//   // hide button if no more products
//   if (visibleCount >= productsData.length) {
//     document.getElementById("view-more").style.display = "none";
//   }
// }

// document.getElementById("view-more").addEventListener("click", () => {
//   visibleCount += 4;
//   renderProducts();
// });
// document.addEventListener("DOMContentLoaded", () => {
//   const icon = document.getElementById("search-icon");
//   const container = document.getElementById("searchContainer");

//   icon.addEventListener("click", () => {
//     container.style.display =
//       container.style.display === "none" ? "block" : "none";
//   });
// });

//3
let productsData = [];
let visibleCount = 4;
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartCount = document.getElementById("cart-count");

// 🛒 Update cart badge
function updateCartCount() {
  if (cartCount) {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
  }
  localStorage.setItem("cart", JSON.stringify(cart));
}

// 🛒 Add to cart
function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartCount();
}

// 🛒 Remove item
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartCount();
  renderCartPage();
}

// 📦 Render product listing (index.html)
function renderProducts() {
  const container = document.getElementById("product-list");

  productsData.slice(visibleCount - 4, visibleCount).forEach((product) => {
    const formattedPrice = `₦ ${product.price.toLocaleString()}`;
    const item = document.createElement("div");
    item.setAttribute("data-aos", "fade-up");
    item.className = "product-card";

    item.innerHTML = `
      <img 
        src="optimized/mobile/${product.image}.webp"
        srcset="
          optimized/mobile/${product.image}.webp 400w,
          optimized/tablet/${product.image}.webp 768w,
          optimized/desktop/${product.image}.webp 1200w
        "
        sizes="(max-width: 768px) 100vw, 50vw"
        alt="${product.name}"
        loading="lazy"
        decoding="async"
        width="300"
        height="300"
      >
      <h3>${product.name}</h3>
      <p class="price">${formattedPrice}</p>
      <p class="rating">⭐ ${product.rating}</p>
      <button class="add-to-cart-btn">Add to Cart</button>
    `;

    // click on card → go to product.html
    item.addEventListener("click", (e) => {
      if (!e.target.classList.contains("add-to-cart-btn")) {
        window.location = `product.html?id=${product.id}`;
      }
    });

    // add to cart button
    item.querySelector(".add-to-cart-btn").addEventListener("click", (e) => {
      e.stopPropagation(); // prevent redirect when clicking button
      addToCart(product);
    });

    container.appendChild(item);
  });

  // hide "view more" if no more products
  if (visibleCount >= productsData.length) {
    const btn = document.getElementById("view-more");
    if (btn) btn.style.display = "none";
  }
}

// 📦 Load all products (used on index.html)
function loadProducts() {
  fetch("assets/styles/products.json")
    .then((res) => res.json())
    .then((data) => {
      productsData = data.products;
      renderProducts();
    })
    .catch((err) => console.error("Error fetching products:", err));
}

// 📦 Load product details (product.html)
function loadProductDetails() {
  const detailsDiv = document.getElementById("product-details");
  if (!detailsDiv) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  fetch("assets/styles/products.json")
    .then((res) => res.json())
    .then((data) => {
      const product = data.products.find((p) => p.id == productId);

      if (!product) {
        detailsDiv.innerHTML = "<p>Product not found.</p>";
        return;
      }

      detailsDiv.innerHTML = `
        <img 
          src="optimized/desktop/${product.image}.webp" 
          alt="${product.name}" 
          width="400">
        <h2 >${product.name}</h2>
        <p class"price">₦${product.price.toLocaleString()}</p>
        <p>${product.description || "No description available."}</p>
        <p class="rating">⭐ ${product.rating}</p>
        <button class="view more btn-fill" id="add-to-cart-btn">Add to Cart</button>
      `;

      document
        .getElementById("add-to-cart-btn")
        .addEventListener("click", () => {
          addToCart(product);
        });
    });

  updateCartCount();
}

// 🛒 Render cart page (cart.html)
function renderCartPage() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    const li = document.createElement("li");
    li.innerHTML = `
    <divclass="cart-img">
  <img src="optimized/mobile/${item.image}.webp">
   ₦${item.price.toLocaleString()} 
   </div> <br/>
  <span class="item-name">${item.name}</span> 
    <div class="cart-btn">
  <button class="qty-btn" onclick="decreaseQuantity(${index})">−</button>
  <span class="quantity">${item.quantity}</span>
  <button class="qty-btn" onclick="increaseQuantity(${index})">+</button>
  <button onclick="removeFromCart(${index})">
    <span class="iconify" data-icon="mdi:trash"></span>
  </button>
  </div>
`;

    cartItems.appendChild(li);
  });

  cartTotal.textContent = total.toLocaleString();
  updateCartCount();
}

// ➕ Increase quantity
function increaseQuantity(index) {
  cart[index].quantity++;
  renderCartPage();
}

// ➖ Decrease quantity
function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    removeFromCart(index); // remove if it hits 0
  }
  renderCartPage();
}

// 📦 View more button (index.html)
const viewMoreBtn = document.getElementById("view-more");
if (viewMoreBtn) {
  viewMoreBtn.addEventListener("click", () => {
    visibleCount += 6;
    renderProducts();
  });
}

// 🔍 Search toggle
document.addEventListener("DOMContentLoaded", () => {
  const icon = document.getElementById("search-icon");
  const container = document.getElementById("searchContainer");

  if (icon && container) {
    icon.addEventListener("click", () => {
      container.style.display =
        container.style.display === "none" ? "block" : "none";
    });
  }
});

// ✅ Initialize correct page
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("product-list")) loadProducts();
  if (document.getElementById("product-details")) loadProductDetails();
  if (document.getElementById("cart-items")) renderCartPage();
  updateCartCount();
});

//param
// // 📦 Load products by style (products.html?style=Sneakers)
function loadProductsByStyle() {
  //   const heading = document.getElementById("products-heading");
  //   const container = document.getElementById("product-list");
  //   if (!heading || !container) return;

  //   const params = new URLSearchParams(window.location.search);
  //   const style = params.get("style");

  //   fetch("assets/styles/products.json")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       const filtered = data.products.filter(
  //         (p) => p.style.toLowerCase() === style.toLowerCase()
  //       );

  //       heading.textContent = style ? `Browse by: ${style}` : "All Products";

  //       container.innerHTML = "";

  //       if (filtered.length === 0) {
  //         container.innerHTML = `<p>No ${style} found</p>`;
  //         return;
  //       }

  //       filtered.forEach((product) => {
  //         const formattedPrice = `₦ ${product.price.toLocaleString()}`;
  //         const div = document.createElement("div");
  //         div.classList.add("product-card");

  //         div.innerHTML = `
  //           <img src="optimized/mobile/${product.image}.webp" alt="${product.name}" width="200">
  //           <h3>${product.name}</h3>
  //           <p>${formattedPrice}</p>
  //           <button class="add-to-cart-btn">Add to Cart</button>
  //         `;

  //         // click → go to product details
  //         div.addEventListener("click", (e) => {
  //           if (!e.target.classList.contains("add-to-cart-btn")) {
  //             window.location = `product.html?id=${product.id}`;
  //           }
  //         });

  //         // add to cart
  //         div.querySelector(".add-to-cart-btn").addEventListener("click", (e) => {
  //           e.stopPropagation();
  //           addToCart(product);
  //         });

  //         container.appendChild(div);
  //       });
  //     });
  // }

  const heading = document.getElementById("products-heading");
  const container = document.getElementById("product-list");
  if (!heading || !container) return;

  const params = new URLSearchParams(window.location.search);
  const style = params.get("style");

  fetch("assets/styles/products.json")
    .then((res) => res.json())
    .then((data) => {
      const filtered = data.products.filter(
        (p) => p.style.toLowerCase() === style.toLowerCase()
      );

      heading.textContent = style ? `${style}` : "All Products";

      container.innerHTML = "";

      if (filtered.length === 0) {
        container.innerHTML = `<p>No ${style} found</p>`;
        return;
      }

      filtered.forEach((product) => {
        const formattedPrice = `₦ ${product.price.toLocaleString()}`;
        const div = document.createElement("div");
        div.classList.add("product-card");

        div.innerHTML = `
          <img src="optimized/mobile/${product.image}.webp" alt="${product.name}" width="200">
          <h3>${product.name}</h3>
          <p>${formattedPrice}</p>
          <button class="add-to-cart-btn">Add to Cart</button>
        `;

        // click → go to product details
        div.addEventListener("click", (e) => {
          if (!e.target.classList.contains("add-to-cart-btn")) {
            window.location = `product.html?id=${product.id}`;
          }
        });

        // add to cart
        div.querySelector(".add-to-cart-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          addToCart(product);
        });

        container.appendChild(div);
      });
    });
}
