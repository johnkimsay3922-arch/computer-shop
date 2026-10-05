const ADMIN_DASHBOARD_API =
    "http://computer-shop-backend-agmw.onrender.com/api/admin/dashboard";
const ORDERS_API =
    "http://computer-shop-backend-agmw.onrender.com/api/orders";


// =====================================================
// CHECK ADMIN LOGIN
// =====================================================

function getAdminUser() {

    return JSON.parse(
        localStorage.getItem("adminUser")
    );

}


function checkAdminLogin() {

    const admin =
        getAdminUser();


    if (!admin) {

        window.location.href =
            "login.html";

        return null;

    }


    if (
        !admin.role ||
        admin.role.toUpperCase() !== "ADMIN"
    ) {

        localStorage.removeItem(
            "adminUser"
        );

        window.location.href =
            "login.html";

        return null;

    }


    return admin;

}


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    const admin =
        checkAdminLogin();


    if (!admin) {
        return;
    }


    // Welcome message

    const welcome =
        document.getElementById(
            "admin-welcome"
        );


    if (welcome) {

        welcome.textContent =
            `Welcome back, ${admin.name}.`;

    }


    try {

        const response =
            await fetch(
                ADMIN_DASHBOARD_API
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load dashboard"
            );

        }


        const dashboard =
            await response.json();


        console.log(
            "Dashboard data:",
            dashboard
        );


        // =================================================
        // DISPLAY STATISTICS
        // =================================================

        const totalProducts =
            document.getElementById(
                "total-products"
            );


        if (totalProducts) {

            totalProducts.textContent =
                dashboard.totalProducts;

        }


        const totalUsers =
            document.getElementById(
                "total-users"
            );


        if (totalUsers) {

            totalUsers.textContent =
                dashboard.totalUsers;

        }


        const totalOrders =
            document.getElementById(
                "total-orders"
            );



        if (totalOrders) {

            totalOrders.textContent =
                dashboard.totalOrders;

        }
        const pendingOrders =
            document.getElementById(
                "pending-orders"
            );

        if (pendingOrders) {
            pendingOrders.textContent =
                dashboard.pendingOrders;
        }


        const shippedOrders =
            document.getElementById(
                "shipped-orders"
            );

        if (shippedOrders) {
            shippedOrders.textContent =
                dashboard.shippedOrders;
        }


        const deliveredOrders =
            document.getElementById(
                "delivered-orders"
            );

        if (deliveredOrders) {
            deliveredOrders.textContent =
                dashboard.deliveredOrders;
        }


        const totalSales =
            document.getElementById(
                "total-sales"
            );


        if (totalSales) {

            totalSales.textContent =
                `KSh ${Number(
                    dashboard.totalSales
                ).toLocaleString()}`;

        }


        // API status

        const apiStatus =
            document.getElementById(
                "api-status"
            );


        if (apiStatus) {

            apiStatus.textContent =
                "Online";

            apiStatus.className =
                "status-online";

        }


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        const apiStatus =
            document.getElementById(
                "api-status"
            );


        if (apiStatus) {

            apiStatus.textContent =
                "Offline";

            apiStatus.className =
                "status-offline";

        }


        alert(
            "Unable to load dashboard data. Please make sure the backend is running."
        );

    }

}
// =====================================================
// LOAD RECENT ORDERS
// =====================================================

async function loadRecentOrders() {

    const container =
        document.getElementById("recent-orders");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(ORDERS_API);

        if (!response.ok) {
            throw new Error("Unable to load orders");
        }

        const orders =
            await response.json();

        // Get the latest 5 orders
        const recentOrders =
            orders
                .sort((a, b) => b.id - a.id)
                .slice(0, 5);


        if (recentOrders.length === 0) {

            container.innerHTML = `
                <div class="recent-orders-empty">
                    <p>No orders have been placed yet.</p>
                </div>
            `;

            return;
        }


        container.innerHTML = recentOrders.map(order => {

            const status =
                order.status || "PENDING";

            return `
                <div class="recent-order-card">

                    <div class="recent-order-info">

                        <strong>
                            Order #${order.id}
                        </strong>

                        <span>
                            Customer #${order.userId}
                        </span>

                    </div>


                    <div class="recent-order-amount">

                        KSh ${Number(
                            order.totalAmount
                        ).toLocaleString()}

                    </div>


                    <div class="recent-order-status">

                        <span class="
                            recent-status
                            ${status.toLowerCase()}
                        ">
                            ${status}
                        </span>

                    </div>

                </div>
            `;

        }).join("");


    } catch (error) {

        console.error(
            "Recent orders error:",
            error
        );

        container.innerHTML = `
            <div class="recent-orders-error">
                Unable to load recent orders.
            </div>
        `;

    }
}

// =====================================================
// LOGOUT
// =====================================================

function logoutAdmin() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {
        return;
    }


    localStorage.removeItem(
        "adminUser"
    );


    window.location.href =
        "login.html";

}


// =====================================================
// PAGE START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDashboard();
        loadRecentOrders();


        const logoutButton =
            document.getElementById(
                "admin-logout"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    logoutAdmin();

                }
            );

        }

    }
);
