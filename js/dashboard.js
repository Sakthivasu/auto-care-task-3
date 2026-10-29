document.addEventListener("DOMContentLoaded", () => {
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];

    const loader = $("#preloader");
    const loaderPercent = $("#loader-number");
    const loaderBar = $("#loader-bar");

    const demoName = sessionStorage.getItem("stacklyDemoCustomer");

    // Demo protection only. Real authentication must be checked on the server.
    if (!demoName) {
        window.location.replace("login.html");
        return;
    }

    const storeKey = "stacklyDashboardDemoData";

    const defaultData = {
        customer: {
            name: demoName,
            email: "",
            phone: "",
            address: ""
        },
        vehicle: {
            name: "Hyundai i20",
            number: "TN 01 AB 1234",
            year: "2023",
            fuel: "Petrol",
            transmission: "Manual"
        },
        booking: {
            type: "Periodic Maintenance",
            date: nextDemoDate(),
            time: "10:00 AM",
            location: "STACKLY Auto Care Centre",
            notes: "",
            status: "Pending confirmation"
        },
        orders: [
            {
                id: "STK-1001",
                part: "Engine Oil",
                quantity: 1,
                date: "2026-10-20",
                total: 899,
                status: "Delivered"
            },
            {
                id: "STK-1002",
                part: "Brake Pads",
                quantity: 1,
                date: "2026-10-24",
                total: 1499,
                status: "Processing"
            }
        ],
        history: [
            {
                title: "General Service",
                date: "2026-08-12",
                detail: "Oil check, fluid inspection and general vehicle check.",
                status: "Completed"
            },
            {
                title: "Brake Inspection",
                date: "2026-05-16",
                detail: "Brake pad and braking system inspection.",
                status: "Completed"
            },
            {
                title: "Battery Check",
                date: "2026-02-10",
                detail: "Battery health and charging system inspection.",
                status: "Completed"
            }
        ],
        settings: {
            emailNotifications: true,
            serviceReminders: true,
            compact: false
        }
    };

    function nextDemoDate() {
        const date = new Date();
        date.setDate(date.getDate() + 10);
        return date.toISOString().slice(0, 10);
    }

    function loadData() {
        try {
            const saved = JSON.parse(localStorage.getItem(storeKey));

            if (!saved) return defaultData;

            return {
                ...defaultData,
                ...saved,
                customer: { ...defaultData.customer, ...saved.customer },
                vehicle: { ...defaultData.vehicle, ...saved.vehicle },
                booking: { ...defaultData.booking, ...saved.booking },
                orders: Array.isArray(saved.orders) ? saved.orders : defaultData.orders,
                history: Array.isArray(saved.history) ? saved.history : defaultData.history,
                settings: { ...defaultData.settings, ...saved.settings }
            };
        } catch {
            return defaultData;
        }
    }

    let data = loadData();

    data.customer.name = data.customer.name || demoName;

    function saveData() {
        try {
            localStorage.setItem(storeKey, JSON.stringify(data));
        } catch {
            showToast("Unable to save in this browser.");
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function formatDate(value) {
        if (!value) return "Not selected";

        const date = new Date(`${value}T12:00:00`);

        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(value);
    }

    function showToast(message) {
        const toast = $("#dashboard-toast");
        toast.textContent = message;
        toast.classList.add("show");

        window.clearTimeout(showToast.timeout);

        showToast.timeout = window.setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }

    function setText(selector, value) {
        const element = $(selector);
        if (element) element.textContent = value ?? "";
    }

    function renderCustomer() {
        const name = data.customer.name || "Customer";
        const firstLetter = name.trim().charAt(0).toUpperCase() || "C";

        setText("#welcome-name", name);
        setText("#top-customer-name", name);
        setText("#top-avatar", firstLetter);
        setText("#profile-avatar", firstLetter);
        setText("#profile-display-name", name);

        $("#profile-name").value = name;
        $("#profile-email").value = data.customer.email || "";
        $("#profile-phone").value = data.customer.phone || "";
        $("#profile-address").value = data.customer.address || "";
    }

    function renderVehicle() {
        const vehicle = data.vehicle;

        setText("#vehicle-name", vehicle.name);
        setText("#vehicle-number", vehicle.number);
        setText("#vehicle-year", vehicle.year);
        setText("#vehicle-fuel", vehicle.fuel);
        setText("#vehicle-transmission", vehicle.transmission);

        setText("#vehicles-page-name", vehicle.name);
        setText("#vehicles-page-number", vehicle.number);
        setText("#vehicles-page-year", vehicle.year);
        setText("#vehicles-page-fuel", vehicle.fuel);
        setText("#vehicles-page-transmission", vehicle.transmission);

        $("#edit-vehicle-name").value = vehicle.name;
        $("#edit-vehicle-number").value = vehicle.number;
        $("#edit-vehicle-year").value = vehicle.year;
        $("#edit-vehicle-fuel").value = vehicle.fuel;
        $("#edit-vehicle-transmission").value = vehicle.transmission;

        const bookingVehicle = $("#booking-vehicle");
        bookingVehicle.innerHTML = "";

        const option = document.createElement("option");
        option.value = vehicle.name;
        option.textContent = `${vehicle.name} · ${vehicle.number}`;
        bookingVehicle.appendChild(option);
    }

    function renderBooking() {
        const booking = data.booking;
        const date = booking.date ? new Date(`${booking.date}T12:00:00`) : null;

        setText("#service-month", date
            ? date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
            : "--");

        setText("#service-day", date
            ? String(date.getDate()).padStart(2, "0")
            : "--");

        setText("#service-title", booking.type);
        setText("#service-vehicle", `${data.vehicle.name} · ${data.vehicle.number}`);
        setText("#service-time", booking.time);
        setText("#service-location", booking.location);

        const summary = $("#booking-summary");

        summary.innerHTML = `
            <strong>${escapeHTML(booking.type)}</strong><br>
            Vehicle: ${escapeHTML(data.vehicle.name)}<br>
            Date: ${escapeHTML(formatDate(booking.date))}<br>
            Time: ${escapeHTML(booking.time)}<br>
            Location: ${escapeHTML(booking.location)}<br>
            Status: <strong>${escapeHTML(booking.status)}</strong>
        `;

        $("#booking-service-type").value = [
            "General Service",
            "Oil Change",
            "Engine Diagnostics",
            "Brake Inspection",
            "Battery Check",
            "AC Service",
            "Wheel Alignment",
            "Other"
        ].includes(booking.type) ? booking.type : "";
    }

    function statusClass(status) {
        if (status === "Delivered" || status === "Completed") return "status-green";
        if (status === "Processing" || status === "In progress") return "status-blue";
        return "status-orange";
    }

    function renderOrders() {
        const body = $("#orders-table-body");
        body.innerHTML = "";

        data.orders.forEach((order) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td><strong>${escapeHTML(order.id)}</strong></td>
                <td>${escapeHTML(order.part)} × ${Number(order.quantity) || 1}</td>
                <td>${escapeHTML(formatDate(order.date))}</td>
                <td>${escapeHTML(formatCurrency(order.total))}</td>
                <td><span class="status-pill ${statusClass(order.status)}">${escapeHTML(order.status)}</span></td>
            `;

            body.appendChild(row);
        });

        if (!data.orders.length) {
            body.innerHTML = `<tr><td colspan="5">No orders yet. Visit Shop Parts to get started.</td></tr>`;
        }

        const recent = $("#recent-orders");
        recent.innerHTML = data.orders.slice(0, 3).map((order) => `
            <div class="recent-order-row">
                <div>
                    <strong>${escapeHTML(order.part)}</strong>
                    <small>${escapeHTML(order.id)} · ${escapeHTML(formatDate(order.date))}</small>
                </div>
                <span class="status-pill ${statusClass(order.status)}">${escapeHTML(order.status)}</span>
            </div>
        `).join("") || `<p class="muted-text">No recent orders.</p>`;

        setText("#order-count", data.orders.length);
    }

    function renderHistory() {
        const list = $("#service-history-list");

        list.innerHTML = data.history.map((item) => `
            <div class="history-item">
                <div class="history-symbol">✓</div>
                <div>
                    <h3>${escapeHTML(item.title)}</h3>
                    <p>${escapeHTML(formatDate(item.date))} · ${escapeHTML(item.status)}</p>
                    <p>${escapeHTML(item.detail)}</p>
                </div>
            </div>
        `).join("") || `<p class="muted-text">No service history yet.</p>`;

        setText("#completed-count", data.history.filter((item) => item.status === "Completed").length);
    }

    const products = [
        {
            id: "engine-oil",
            name: "Engine Oil",
            category: "Maintenance",
            price: 899,
            image: "img/mehmet-talha-onuk-pnsfHAAA-k4-unsplash.jpg"
        },
        {
            id: "brake-pads",
            name: "Brake Pads",
            category: "Brakes",
            price: 1499,
            image: "img/tim-mossholder-VurHDpO4VYI-unsplash.jpg"
        },
        {
            id: "battery",
            name: "Car Battery",
            category: "Electrical",
            price: 4299,
            image: "img/alex-butsko-ZLpZOaHDJlc-unsplash.jpg"
        },
        {
            id: "air-filter",
            name: "Air Filter",
            category: "Maintenance",
            price: 599,
            image: "img/kc-shum-hwZq2xkf3mM-unsplash.jpg"
        }
    ];

    function renderParts() {
        const grid = $("#parts-grid");
        const search = $("#part-search").value.trim().toLowerCase();
        const category = $("#part-category").value;

        const filtered = products.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(search);
            const matchesCategory = category === "all" || product.category === category;
            return matchesSearch && matchesCategory;
        });

        grid.innerHTML = filtered.map((product) => `
            <article class="part-card">
                <div class="part-image">
                    <img
                        src="${escapeHTML(product.image)}"
                        alt="${escapeHTML(product.name)}"
                        loading="lazy"
                    >
                </div>
                <div class="part-details">
                    <span class="part-category">${escapeHTML(product.category)}</span>
                    <h3>${escapeHTML(product.name)}</h3>
                    <strong class="part-price">${escapeHTML(formatCurrency(product.price))}</strong>
                    <button class="primary-button" data-add-part="${escapeHTML(product.id)}">Add to order</button>
                </div>
            </article>
        `).join("") || `<p class="muted-text">No matching products found.</p>`;

        $("#request-part").innerHTML = products.map((product) => `
            <option value="${escapeHTML(product.id)}">${escapeHTML(product.name)} — ${escapeHTML(formatCurrency(product.price))}</option>
        `).join("");
    }

    function renderStats() {
        setText("#vehicle-count", "1");

        const upcoming = data.booking.date && data.booking.status !== "Cancelled" ? 1 : 0;
        setText("#upcoming-count", upcoming);
    }

    function renderAll() {
        renderCustomer();
        renderVehicle();
        renderBooking();
        renderOrders();
        renderHistory();
        renderParts();
        renderStats();
    }

    function openSection(sectionName) {
        const section = $(`#section-${sectionName}`);
        if (!section) return;

        $$(".dashboard-section").forEach((item) => item.classList.remove("active"));
        section.classList.add("active");

        $$(".side-link").forEach((button) => {
            button.classList.toggle("active", button.dataset.section === sectionName);
        });

        const activeButton = $(`.side-link[data-section="${sectionName}"]`);
        setText("#topbar-heading", activeButton?.textContent.trim() || "Dashboard overview");

        $("#dashboard-sidebar").classList.remove("sidebar-open");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    $$(".side-link").forEach((button) => {
        button.addEventListener("click", () => openSection(button.dataset.section));
    });

    $$("[data-go]").forEach((button) => {
        button.addEventListener("click", () => openSection(button.dataset.go));
    });

    $("#sidebar-toggle").addEventListener("click", () => {
        $("#dashboard-sidebar").classList.toggle("sidebar-open");
    });

    $("#edit-vehicle-button").addEventListener("click", () => {
        const panel = $("#vehicle-edit-panel");
        panel.hidden = !panel.hidden;
    });

    $("#vehicle-form").addEventListener("submit", (event) => {
        event.preventDefault();

        data.vehicle = {
            name: $("#edit-vehicle-name").value.trim(),
            number: $("#edit-vehicle-number").value.trim(),
            year: $("#edit-vehicle-year").value,
            fuel: $("#edit-vehicle-fuel").value,
            transmission: $("#edit-vehicle-transmission").value
        };

        saveData();
        renderVehicle();
        renderBooking();
        showToast("Vehicle details saved.");
        $("#vehicle-edit-panel").hidden = true;
    });

    $("#booking-date").min = new Date().toISOString().slice(0, 10);
    $("#booking-date").value = data.booking.date;

    $("#booking-form").addEventListener("submit", (event) => {
        event.preventDefault();

        const dateValue = $("#booking-date").value;
        const selectedDate = new Date(`${dateValue}T12:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!dateValue || selectedDate < today) {
            $("#booking-message").textContent = "Choose today or a future date.";
            return;
        }

        data.booking = {
            type: $("#booking-service-type").value,
            date: dateValue,
            time: $("#booking-time").value,
            location: $("#booking-location").value,
            notes: $("#booking-notes").value.trim(),
            status: "Pending confirmation"
        };

        saveData();
        renderBooking();
        renderStats();

        $("#booking-message").textContent =
            "Demo booking request saved. The service centre has not been contacted.";
        showToast("Booking request saved in this browser.");
    });

    $("#part-search").addEventListener("input", renderParts);
    $("#part-category").addEventListener("change", renderParts);

    $("#parts-grid").addEventListener("click", (event) => {
        const button = event.target.closest("[data-add-part]");
        if (!button) return;

        const product = products.find((item) => item.id === button.dataset.addPart);
        if (!product) return;

        $("#request-part").value = product.id;
        openSection("orders");
        showToast(`${product.name} selected. Submit Request an Order to add it.`);
        $("#order-request-form").scrollIntoView({ behavior: "smooth", block: "center" });
    });

    $("#order-request-form").addEventListener("submit", (event) => {
        event.preventDefault();

        const product = products.find((item) => item.id === $("#request-part").value);
        const quantity = Number($("#request-quantity").value);

        if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
            $("#order-message").textContent = "Choose a part and valid quantity.";
            return;
        }

        const orderNumber = `STK-${Date.now().toString().slice(-6)}`;

        data.orders.unshift({
            id: orderNumber,
            part: product.name,
            quantity,
            date: new Date().toISOString().slice(0, 10),
            total: product.price * quantity,
            status: "Pending"
        });

        saveData();
        renderOrders();
        renderStats();

        $("#order-message").textContent =
            "Demo order added. No payment or real purchase has occurred.";

        $("#request-quantity").value = "1";
        showToast("Demo order created.");
    });

    $("#profile-form").addEventListener("submit", (event) => {
        event.preventDefault();

        data.customer = {
            name: $("#profile-name").value.trim(),
            email: $("#profile-email").value.trim(),
            phone: $("#profile-phone").value.trim(),
            address: $("#profile-address").value.trim()
        };

        if (!data.customer.name) {
            $("#profile-message").textContent = "Please enter your name.";
            return;
        }

        saveData();
        sessionStorage.setItem("stacklyDemoCustomer", data.customer.name);
        renderCustomer();

        $("#profile-message").textContent = "Profile saved in this browser.";
        showToast("Profile updated.");
    });

    function renderSettings() {
        $("#email-notifications").checked = data.settings.emailNotifications;
        $("#service-reminders").checked = data.settings.serviceReminders;
        $("#compact-dashboard").checked = data.settings.compact;
        document.body.classList.toggle("compact-mode", data.settings.compact);
    }

    $("#save-settings").addEventListener("click", () => {
        data.settings = {
            emailNotifications: $("#email-notifications").checked,
            serviceReminders: $("#service-reminders").checked,
            compact: $("#compact-dashboard").checked
        };

        saveData();
        renderSettings();
        $("#settings-message").textContent = "Preferences saved in this browser.";
        showToast("Settings saved.");
    });

    function logout() {
        sessionStorage.removeItem("stacklyDemoCustomer");
        window.location.replace("login.html");
    }

    $("#logout-button").addEventListener("click", logout);
    $("#settings-logout").addEventListener("click", logout);

    renderAll();
    renderSettings();

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    const loadingDuration = reducedMotion ? 150 : 1600;
    const loadingStartedAt = performance.now();

    document.body.classList.add("loading");

    function updateLoader(now) {
        const progress = Math.min(
            100,
            Math.round(((now - loadingStartedAt) / loadingDuration) * 100)
        );

        if (loaderPercent) loaderPercent.textContent = `${progress}%`;
        if (loaderBar) loaderBar.style.width = `${progress}%`;
        const progressBar = loader.querySelector('[role="progressbar"]');
        if (progressBar) {
            progressBar.setAttribute("aria-valuenow", String(progress));
        }
        if (progress < 100) {
            window.requestAnimationFrame(updateLoader);
        } else {
            window.setTimeout(() => {
                loader.classList.add("finished");
                document.body.classList.remove("loading");
            }, 180);
        }
    }

    window.requestAnimationFrame(updateLoader);
});