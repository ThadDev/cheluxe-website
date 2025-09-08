let productsData = [];
let visibleCount = 8;
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ==================== 🛒 CART FUNCTIONS ==================== //
const cartCount = document.getElementById("cart-count");

// Update cart badge
function updateCartCount() {
  if (cartCount) {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
  }
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Add to cart
function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartCount();
}

// Remove item from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartCount();
  renderCartPage();
}

// Increase quantity
function increaseQuantity(index) {
  cart[index].quantity++;
  renderCartPage();
}

// Decrease quantity
function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    removeFromCart(index);
  }
  renderCartPage();
}

// ==================== 📦 PRODUCT LISTING ==================== //
function renderProducts() {
  const container = document.getElementById("product-list");
  if (!container) return;

  // clear container before re-rendering
  container.innerHTML = "";

  // show products from 0 up to visibleCount
  productsData.slice(0, visibleCount).forEach((product) => {
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
      e.stopPropagation();
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

function loadProducts() {
  fetch("assets/styles/products.json")
    .then((res) => res.json())
    .then((data) => {
      productsData = data.products;
      renderProducts();
    })
    .catch((err) => console.error("Error fetching products:", err));
}

// view more button logic
document.getElementById("view-more")?.addEventListener("click", () => {
  visibleCount += 4;
  renderProducts();
});

// ==================== 📦 PRODUCT DETAILS ==================== //
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
        <h2>${product.name}</h2>
        <p class="price">₦${product.price.toLocaleString()}</p>
        <p>${product.description || "No description available."}</p>
        <p class="rating">⭐ ${product.rating}</p>
        <button class="view more btn-fill" id="add-to-cart-btn">Add to Cart</button>
      `;

      document
        .getElementById("add-to-cart-btn")
        .addEventListener("click", () => addToCart(product));
    });

  updateCartCount();
}

// ==================== 🛒 CART PAGE ==================== //
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
      <div class="cart-img">
        <img src="optimized/mobile/${item.image}.webp">
        ₦${item.price.toLocaleString()} 
      </div><br/>
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
// ==================== 🔍 SEARCH & FILTER ==================== //
function loadProductsByQuery() {
  const container = document.getElementById("product-list");
  const heading = document.getElementById("products-heading");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const style = params.get("style");
  const search = params.get("search")?.toLowerCase();

  fetch("assets/styles/products.json")
    .then((res) => res.json())
    .then((data) => {
      let filtered = data.products;

      // 🔹 Style filter
      if (style) {
        filtered = filtered.filter((p) =>
          Array.isArray(p.style)
            ? p.style.some((s) => s.toLowerCase() === style.toLowerCase())
            : p.style.toLowerCase() === style.toLowerCase()
        );
        if (heading) heading.textContent = `${style}s`;
      }

      // 🔹 Search filter
      if (search) {
        filtered = filtered.filter((p) => {
          const normalize = (str) => str.toLowerCase();

          const nameMatch = normalize(p.name).includes(search);
          const styleMatch = Array.isArray(p.style)
            ? p.style.some(
                (s) =>
                  normalize(s).includes(search) || search.includes(normalize(s))
              )
            : normalize(p.style).includes(search) ||
              search.includes(normalize(p.style));
          const priceMatch = String(p.price).includes(search);

          return nameMatch || styleMatch || priceMatch;
        });
        if (heading) heading.textContent = `Search results for "${search}"`;
      }

      // 🔹 Render products
      container.innerHTML = "";
      if (filtered.length === 0) {
        container.innerHTML = "<p>No products found.</p>";
        return;
      }

      filtered.forEach((product) => {
        const formattedPrice = `₦ ${product.price.toLocaleString()}`;
        const div = document.createElement("div");
        div.classList.add("product-card");
        div.setAttribute("data-aos", "fade-up");

        div.innerHTML = `
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
          <p>${formattedPrice}</p>
          <button class="add-to-cart-btn">Add to Cart</button>
        `;

        // Add-to-cart button
        div.querySelector(".add-to-cart-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          addToCart(product);
        });

        // Navigate to product details when card is clicked
        div.addEventListener("click", (e) => {
          if (!e.target.classList.contains("add-to-cart-btn")) {
            window.location = `product.html?id=${product.id}`;
          }
        });

        container.appendChild(div);
      });
    });
}
// 🔍 Search icon → go to #search (smooth scroll + focus)
document.addEventListener("DOMContentLoaded", () => {
  const icon = document.getElementById("search-icon");

  function openSearch() {
    const section = document.getElementById("inv");
    const container = document.getElementById("searchContainer");
    const input = document.getElementById("searchInput");

    if (container) {
      container.style.display = "block";
    }

    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }

    setTimeout(() => {
      if (input) input.focus();
    }, 300);
  }

  if (icon) {
    icon.addEventListener("click", (e) => {
      e.preventDefault();

      const onHome =
        window.location.pathname.endsWith("index.html") ||
        window.location.pathname === "/" ||
        window.location.pathname.endsWith("/cheluxe-website/"); // adjust for GitHub Pages folder

      if (onHome) {
        openSearch();
      } else {
        window.location.href = "index.html#inv";
      }
    });
  }
  if (window.location.hash === "#inv") {
    openSearch();
  }

  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#inv") {
      openSearch();
    }
  });
});

// ==================== 🟢 ORDER (WhatsApp) ==================== //
function setupOrder() {
  const orderBtn = document.getElementById("order-btn");
  const orderForm = document.getElementById("order-form");

  if (orderBtn) {
    // Show form only if cart not empty
    orderBtn.style.display = cart.length > 0 ? "block" : "none";

    orderBtn.addEventListener("click", () => {
      orderForm.style.display =
        orderForm.style.display === "block" ? "none" : "block";
    });
  }

  const confirmBtn = document.getElementById("confirm-order");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      const name = document.getElementById("customer-name").value.trim();
      const phone = document.getElementById("customer-phone").value.trim();
      const location = document
        .getElementById("customer-location")
        .value.trim();

      if (!name || !phone || !location) {
        alert("Please fill in your name, phone number, and location.");
        return;
      }

      let message = `🛒 New Order\n\n`;
      cart.forEach((item) => {
        message += `${item.name} x${item.quantity} - ₦${(
          item.price * item.quantity
        ).toLocaleString()}\n`;
      });

      message += `\nTotal: ₦${cart
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toLocaleString()}`;

      message += `\n\n👤 Name: ${name}`;
      message += `\n📞 Phone: ${phone}`;
      message += `\n📍 Location: ${location}`;

      const retailerNumber = "2348166065517";
      const url = `https://wa.me/${retailerNumber}?text=${encodeURIComponent(
        message
      )}`;

      window.open(url, "_blank");

      // clear cart
      cart = [];
      localStorage.removeItem("cart");
      renderCartPage();
      updateCartCount();

      orderForm.style.display = "none";
      if (orderBtn) orderBtn.style.display = "none";
    });
  }
}

// ==================== 🚀 INITIALIZER ==================== //
document.addEventListener("DOMContentLoaded", () => {
  // Init products
  if (document.getElementById("product-list")) {
    if (
      window.location.search.includes("style") ||
      window.location.search.includes("search")
    ) {
      loadProductsByQuery();
    } else {
      loadProducts();
    }
  }

  // Init product details
  if (document.getElementById("product-details")) loadProductDetails();

  // Init cart
  if (document.getElementById("cart-items")) renderCartPage();

  // View more button
  const viewMoreBtn = document.getElementById("view-more");
  if (viewMoreBtn) {
    viewMoreBtn.addEventListener("click", () => {
      visibleCount = Math.min(visibleCount + 4, productsData.length);
      renderProducts();
    });
  }

  //Search toggle + redirect
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (searchBtn && searchInput) {
    const doSearch = () => {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `products.html?search=${encodeURIComponent(
          query
        )}`;
      }
    };
    searchBtn.addEventListener("click", doSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") doSearch();
    });
  }

  // Setup order form
  setupOrder();

  // Update cart count badge
  updateCartCount();
});
