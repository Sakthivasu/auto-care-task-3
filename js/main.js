"use strict";

document.addEventListener("DOMContentLoaded", function () {
  initPreloader();
  initNavigation();
  initRevealAnimations();
  initCounters();
  initCart();
  initProductFilters();
  initBookingModal();
  initContactForm();
  initAuthForms();
  initGlobalSearch();
  initHeader();
});

/* =========================================
   1. PRELOADER
========================================= */
function initPreloader() {
  const loader = document.getElementById("preloader");

  if (!loader) return;

  runPreloader();
}

function runPreloader() {
  const loader = document.getElementById("preloader");

  if (!loader) return;

  const counter = document.getElementById("loader-number");
  const bar = document.getElementById("loader-bar");
  const progressBar = loader.querySelector('[role="progressbar"]');
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const duration = reducedMotion ? 150 : 1600;
  const start = performance.now();

  loader.classList.remove("finished");
  document.body.classList.add("loading");

  function update(now) {
    const progress = Math.min(
      100,
      Math.round(((now - start) / duration) * 100)
    );

    if (counter) counter.textContent = progress + "%";
    if (bar) bar.style.width = progress + "%";
    if (progressBar) progressBar.setAttribute("aria-valuenow", String(progress));

    if (progress < 100) {
      requestAnimationFrame(update);
    } else {
      setTimeout(function () {
        loader.classList.add("finished");
        document.body.classList.remove("loading");
      }, 180);
    }
  }

  requestAnimationFrame(update);
}

/* =========================================
   2. RESPONSIVE MOBILE NAVIGATION
========================================= */
function initNavigation() {
  const header = document.querySelector(".site-header");
  const navbar = document.querySelector(".navbar");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");

  if (!toggle && !nav && !navbar) return;

  if (!toggle || !nav || !navbar) {
    console.warn("Navigation elements were not found.");
    return;
  }

  toggle.type = "button";

  toggle.setAttribute("aria-controls", "primary-navigation");

  if (!nav.id) {
    nav.id = "primary-navigation";
  }

  function setMenu(open) {
    nav.classList.toggle("open", open);

    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation"
    );

    toggle.innerHTML = open
      ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  }

  /* Mobile menu button */
  toggle.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    const isOpen = nav.classList.contains("open");
    setMenu(!isOpen);
  });

  /* Close menu after choosing a page */
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  /* Close when tapping outside */
  document.addEventListener("click", function (event) {
    if (
      nav.classList.contains("open") &&
      !nav.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      setMenu(false);
    }
  });

  /* Close with Escape key */
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setMenu(false);
    }
  });

  /* Reset menu on desktop screen sizes */
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) {
      setMenu(false);
    }
  });

  /* Highlight current page */
  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

  nav.querySelectorAll("a").forEach(function (link) {
    const href = (link.getAttribute("href") || "").split("?")[0];

    if (href === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });

  /* Start with the menu closed */
  setMenu(false);

  /* Ensure the header remains above page content */
  if (header) {
    header.style.zIndex = "3000";
  }
}

/* =========================================
   3. HEADER SCROLL EFFECT
========================================= */
function initHeader() {
  const header = document.querySelector(".site-header");

  if (!header) return;

  function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 15);
  }

  updateHeader();

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });
}

/* =========================================
   4. SCROLL REVEAL ANIMATIONS
========================================= */
function initRevealAnimations() {
  const items = document.querySelectorAll(".reveal");

  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach(function (item) {
      item.classList.add("visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  items.forEach(function (item) {
    observer.observe(item);
  });
}

/* =========================================
   5. ANIMATED COUNTERS
========================================= */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");

  if (!counters.length) return;

  function animate(element) {
    const target = Number(element.dataset.count);

    if (!Number.isFinite(target)) return;

    const suffix = element.dataset.suffix || "";
    const start = performance.now();
    const duration = 1300;

    function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);

      element.textContent =
        Math.floor(target * eased).toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.5
    }
  );

  counters.forEach(function (counter) {
    observer.observe(counter);
  });
}

/* =========================================
   6. SHOPPING CART DATA
========================================= */
const CART_KEY = "stacklyAutoCareCart";

const PRODUCT_DATA = {
  "oil-filter": {
    name: "Premium Oil Filter",
    price: 599,
    category: "Engine",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=500&q=80"
  },

  "brake-pads": {
    name: "Ceramic Brake Pads",
    price: 1899,
    category: "Brakes",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=500&q=80"
  },

  "air-filter": {
    name: "Engine Air Filter",
    price: 799,
    category: "Engine",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=500&q=80"
  },

  "spark-plugs": {
    name: "Iridium Spark Plugs",
    price: 1299,
    category: "Engine",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=500&q=80"
  },

  "wiper-blades": {
    name: "All-Weather Wiper Blades",
    price: 499,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=500&q=80"
  },

  "engine-oil": {
    name: "Synthetic Engine Oil",
    price: 1599,
    category: "Engine",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=500&q=80"
  }
};

/* Read cart safely */
function readCart() {
  try {
    const value = JSON.parse(
      localStorage.getItem(CART_KEY) || "{}"
    );

    return value &&
      typeof value === "object" &&
      !Array.isArray(value)
      ? value
      : {};
  } catch (error) {
    return {};
  }
}

/* Save cart */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    showNotice(
      "Your browser could not save the cart.",
      "error"
    );
  }
}

/* Currency formatting */
function money(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

/* =========================================
   7. CART EVENTS
========================================= */
function initCart() {
  document.querySelectorAll(".cart-link").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      openCart();
    });
  });

  document.querySelectorAll(".add-cart").forEach(function (button) {
    button.addEventListener("click", function () {
      const id = button.dataset.product;

      if (!PRODUCT_DATA[id]) return;

      const cart = readCart();

      cart[id] = (Number(cart[id]) || 0) + 1;

      saveCart(cart);
      renderCart();

      const original = button.innerHTML;

      button.innerHTML =
        '<i class="fa-solid fa-check" aria-hidden="true"></i>';

      button.setAttribute("aria-label", "Added to cart");

      setTimeout(function () {
        button.innerHTML = original;
        button.setAttribute("aria-label", "Add to cart");
      }, 900);

      showNotice("Item added to your cart.", "success");
    });
  });

  document.querySelectorAll("[data-cart-close]").forEach(function (button) {
    button.addEventListener("click", closeCart);
  });

  const overlay = document.getElementById("cart-overlay");

  if (overlay) {
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeCart();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeCart();
      closeBookingModal();
    }
  });

  const checkout = document.getElementById("checkout-btn");

  if (checkout) {
    checkout.addEventListener("click", function () {
      const cart = readCart();

      const hasItems = Object.values(cart).some(function (quantity) {
        return Number(quantity) > 0;
      });

      if (!hasItems) {
        showNotice("Your cart is empty.", "error");
        return;
      }

      showNotice(
        "Your cart is ready. Connect a secure checkout backend to complete an order.",
        "success"
      );
    });
  }

  renderCart();
}

/* Cart item count */
function updateCartCount() {
  const cart = readCart();

  const count = Object.values(cart).reduce(function (sum, quantity) {
    return sum + Math.max(0, Number(quantity) || 0);
  }, 0);

  document.querySelectorAll(".cart-count").forEach(function (badge) {
    badge.textContent = count;
    badge.setAttribute(
      "aria-label",
      count + " items in cart"
    );
  });
}

/* Render cart items */
function renderCart() {
  updateCartCount();

  const container = document.getElementById("cart-items");
  const totalElement = document.getElementById("cart-total");

  if (!container || !totalElement) return;

  const cart = readCart();

  const entries = Object.entries(cart).filter(function ([id, quantity]) {
    return PRODUCT_DATA[id] && Number(quantity) > 0;
  });

  if (!entries.length) {
    container.innerHTML =
      '<p class="muted" style="padding:28px 0;text-align:center">Your cart is empty. Explore our genuine spare parts.</p>';

    totalElement.textContent = money(0);
    return;
  }

  let total = 0;

  container.replaceChildren();

  entries.forEach(function ([id, quantity]) {
    const product = PRODUCT_DATA[id];
    const qty = Math.floor(Number(quantity));

    total += product.price * qty;

    const item = document.createElement("div");
    item.className = "cart-item";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const name = document.createElement("strong");
    name.textContent = product.name;

    const price = document.createElement("span");
    price.textContent = money(product.price);

    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute(
      "aria-label",
      "Remove one " + product.name
    );
    minus.addEventListener("click", function () {
      changeQuantity(id, -1);
    });

    const amount = document.createElement("span");
    amount.textContent = qty;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute(
      "aria-label",
      "Add one " + product.name
    );
    plus.addEventListener("click", function () {
      changeQuantity(id, 1);
    });

    controls.append(minus, amount, plus);
    info.append(name, price, controls);
    item.append(image, info);
    container.append(item);
  });

  totalElement.textContent = money(total);
}

/* Change cart quantity */
function changeQuantity(id, delta) {
  const cart = readCart();

  cart[id] = (Number(cart[id]) || 0) + delta;

  if (cart[id] <= 0) {
    delete cart[id];
  }

  saveCart(cart);
  renderCart();
}

/* Open cart */
function openCart() {
  const overlay = document.getElementById("cart-overlay");

  if (!overlay) {
    location.href = "shop.html";
    return;
  }

  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  renderCart();
}

/* Close cart */
function closeCart() {
  const overlay = document.getElementById("cart-overlay");

  if (!overlay) return;

  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* =========================================
   8. PRODUCT FILTERS
========================================= */
function initProductFilters() {
  const buttons = document.querySelectorAll("[data-filter]");
  const products = document.querySelectorAll("[data-category]");

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      buttons.forEach(function (item) {
        item.classList.remove("active");
      });

      button.classList.add("active");

      const category = button.dataset.filter;

      products.forEach(function (product) {
        product.hidden =
          category !== "all" &&
          product.dataset.category !== category;
      });
    });
  });
}

/* =========================================
   9. SERVICE BOOKING MODAL
========================================= */
function initBookingModal() {
  const modal = document.getElementById("booking-modal");

  if (!modal) return;

  document.querySelectorAll("[data-book-service]").forEach(function (button) {
    button.addEventListener("click", function () {
      const serviceInput = modal.querySelector('[name="service"]');

      if (serviceInput && button.dataset.bookService) {
        serviceInput.value = button.dataset.bookService;
      }

      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  modal.querySelectorAll("[data-book-close]").forEach(function (button) {
    button.addEventListener("click", closeBookingModal);
  });

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeBookingModal();
    }
  });

  const form = modal.querySelector("form");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.reportValidity()) return;

      showNotice(
        "Your booking details are validated. Connect a backend to confirm your appointment.",
        "success"
      );

      form.reset();
      closeBookingModal();
    });
  }
}

/* Close booking modal */
function closeBookingModal() {
  const modal = document.getElementById("booking-modal");

  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* =========================================
   10. CONTACT FORM
========================================= */
function initContactForm() {
  const form = document.getElementById("contact-form");

  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const message = form.querySelector(".form-message");

    if (!form.reportValidity()) return;

    if (message) {
      message.className = "form-message show success";
      message.textContent =
        "Your details are valid. This demo does not send or store submissions; connect a backend to receive your enquiry.";
    }

    form.reset();
  });
}

/* =========================================
   11. LOGIN AND SIGNUP FORMS
========================================= */
function initAuthForms() {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!loginForm.reportValidity()) return;

      const email = loginForm.elements.email.value.trim();
      const customerName = email
        .split("@")[0]
        .replace(/[._+-]+/g, " ")
        .trim()
        .replace(/\b\w/g, function (letter) {
          return letter.toUpperCase();
        }) || "Customer";
      const message = loginForm.querySelector(".form-message");

      try {
        sessionStorage.setItem("stacklyDemoCustomer", customerName);
      } catch (error) {
        if (message) {
          message.className = "form-message show error";
          message.textContent =
            "Unable to start the demo session in this browser. Please enable session storage and try again.";
        }
        console.error("Unable to save the demo customer session.", error);
        return;
      }

      if (message) {
        message.className = "form-message show success";
        message.textContent = "Demo login complete. Opening your dashboard...";
      }

      const submitButton = loginForm.querySelector('[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      location.href = "dashboard.html";
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!signupForm.reportValidity()) return;

      const password = signupForm
        .querySelector('[name="password"]')
        .value;

      const confirm = signupForm
        .querySelector('[name="confirmPassword"]')
        .value;

      const message = signupForm.querySelector(".form-message");

      if (password.length < 8) {
        if (message) {
          message.className = "form-message show error";
          message.textContent =
            "Your password must contain at least 8 characters.";
        }
        return;
      }

      if (password !== confirm) {
        if (message) {
          message.className = "form-message show error";
          message.textContent =
            "Passwords do not match. Please try again.";
        }
        return;
      }

      location.href = "index.html";
    });
  }

  document.querySelectorAll("[data-google-demo]").forEach(function (button) {
    button.addEventListener("click", function () {
      showNotice(
        "Google sign-in requires Google OAuth configuration and a backend.",
        "error"
      );
    });
  });

  const forgot = document.querySelector("[data-forgot-password]");

  if (forgot) {
    forgot.addEventListener("click", function (event) {
      event.preventDefault();

      showNotice(
        "Password recovery requires a configured authentication service.",
        "error"
      );
    });
  }
}

/* =========================================
   12. GLOBAL SEARCH
========================================= */
function initGlobalSearch() {
  const search = document.getElementById("global-search");

  if (!search) return;

  search.addEventListener("keydown", function (event) {
    if (event.key !== "Enter") return;

    const query = search.value.trim().toLowerCase();

    if (!query) return;

    const cards = Array.from(
      document.querySelectorAll("[data-searchable]")
    );

    if (cards.length) {
      let visible = 0;

      cards.forEach(function (card) {
        const matches = card.textContent
          .toLowerCase()
          .includes(query);

        card.hidden = !matches;

        if (matches) visible++;
      });

      const result = document.getElementById("search-result");

      if (result) {
        result.textContent = visible
          ? visible +
            " matching result" +
            (visible === 1 ? "" : "s") +
            " found."
          : "No matching items found.";
      }

      document
        .querySelector("[data-search-results]")
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      location.href =
        "shop.html?q=" + encodeURIComponent(query);
    }
  });
}

/* =========================================
   13. NOTIFICATION MESSAGE
========================================= */
function showNotice(message, type = "success") {
  let notice = document.getElementById("site-notice");

  if (!notice) {
    notice = document.createElement("div");
    notice.id = "site-notice";
    notice.setAttribute("role", "status");

    notice.style.cssText = [
      "position:fixed",
      "bottom:22px",
      "left:50%",
      "transform:translateX(-50%)",
      "z-index:4000",
      "width:max-content",
      "max-width:calc(100% - 30px)",
      "padding:14px 19px",
      "border-radius:12px",
      "box-shadow:0 12px 40px #0002",
      "font-size:14px",
      "font-weight:600",
      "transition:opacity .2s"
    ].join(";");

    document.body.append(notice);
  }

  notice.textContent = message;

  notice.style.background =
    type === "error" ? "#fff0f0" : "#e7f9f0";

  notice.style.color =
    type === "error" ? "#a52626" : "#08764b";

  notice.style.opacity = "1";

  clearTimeout(notice.hideTimer);

  notice.hideTimer = setTimeout(function () {
    notice.style.opacity = "0";
  }, 3600);
}