const ORDERS_API = "http://localhost:8081/api/orders";

let allOrders = [];


// =====================================================
// CHECK ADMIN LOGIN
// =====================================================

function checkAdminAccess() {

    const adminUser =
        JSON.parse(localStorage.getItem("adminUser"));

    if (!adminUser) {
        window.location.href = "login.html";
        return null;
    }

    if (
        !adminUser.role ||
        adminUser.role.toUpperCase() !== "ADMIN"
    ) {
        localStorage.removeItem("adminUser");
        window.location.href = "login.html";
        return null;
    }

    return adminUser;
}


// =====================================================
// LOAD ORDERS
// =====================================================

async function loadOrders() {

    const container =
        document.getElementById("admin-orders-container");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(ORDERS_API);

        if (!response.ok) {
            throw new Error("Unable to load orders");
        }

        allOrders = await response.json();

        displayOrders(allOrders);

        updateOrderStatistics(allOrders);

    } catch (error) {

        console.error(
            "Load orders error:",
            error
        );

        container.innerHTML = `
            <div class="admin-orders-error">

                <h3>
                    Unable to load orders
                </h3>

                <p>
                    Please make sure the Computer Shop
                    backend is running.
                </p>

                <button
                    type="button"
                    class="admin-primary-button"
                    onclick="loadOrders()"
                >
                    Try Again
                </button>

            </div>
        `;
    }
}


// =====================================================
// DISPLAY ORDERS
// =====================================================

function displayOrders(orders) {

    const container =
        document.getElementById(
            "admin-orders-container"
        );

    if (!container) {
        return;
    }


    if (!orders || orders.length === 0) {

        container.innerHTML = `
            <div class="admin-orders-empty">

                <div class="admin-empty-icon">
                    🛒
                </div>

                <h3>
                    No Orders Found
                </h3>

                <p>
                    There are currently no orders
                    matching your search.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML = "";


    orders.forEach(order => {

        const status =
            order.status || "PENDING";

        const statusClass =
            status
                .toLowerCase()
                .replace(/\s+/g, "-");


        const card =
            document.createElement("div");

        card.className =
            "admin-order-card";


        card.innerHTML = `

            <div class="admin-order-header">

                <div>

                    <span class="admin-order-label">
                        ORDER
                    </span>

                    <h3>
                        #${order.id}
                    </h3>

                </div>

                <span
                    class="admin-order-status ${statusClass}"
                >
                    ${status}
                </span>

            </div>


            <div class="admin-order-details">

                <div class="admin-order-detail">

                    <span>
                        Customer ID
                    </span>

                    <strong>
                        #${order.userId}
                    </strong>

                </div>


                <div class="admin-order-detail">

                    <span>
                        Total Amount
                    </span>

                    <strong>
                        KSh ${Number(
                            order.totalAmount
                        ).toLocaleString()}
                    </strong>

                </div>


                <div class="admin-order-detail">

                    <span>
                        Current Status
                    </span>

                    <strong>
                        ${status}
                    </strong>

                </div>

            </div>


            <div class="admin-order-actions">

                <div class="admin-status-control">

                    <label for="status-${order.id}">
                        Change Status
                    </label>

                    <select
                        id="status-${order.id}"
                        onchange="updateOrderStatus(
                            ${order.id},
                            this.value
                        )"
                    >

                        <option
                            value="PENDING"
                            ${status === "PENDING"
                                ? "selected"
                                : ""}
                        >
                            Pending
                        </option>


                        <option
                            value="PROCESSING"
                            ${status === "PROCESSING"
                                ? "selected"
                                : ""}
                        >
                            Processing
                        </option>


                        <option
                            value="SHIPPED"
                            ${status === "SHIPPED"
                                ? "selected"
                                : ""}
                        >
                            Shipped
                        </option>


                        <option
                            value="DELIVERED"
                            ${status === "DELIVERED"
                                ? "selected"
                                : ""}
                        >
                            Delivered
                        </option>


                        <option
                            value="COMPLETED"
                            ${status === "COMPLETED"
                                ? "selected"
                                : ""}
                        >
                            Completed
                        </option>


                        <option
                            value="CANCELLED"
                            ${status === "CANCELLED"
                                ? "selected"
                                : ""}
                        >
                            Cancelled
                        </option>

                    </select>

                </div>


                <button
                    type="button"
                    class="admin-delete-button"
                    onclick="deleteOrder(${order.id})"
                >
                    Delete Order
                </button>

            </div>

        `;


        container.appendChild(card);

    });
}


// =====================================================
// ORDER STATISTICS
// =====================================================

function updateOrderStatistics(orders) {

    const totalOrders =
        document.getElementById(
            "total-orders"
        );

    const pendingOrders =
        document.getElementById(
            "pending-orders"
        );

    const processingOrders =
        document.getElementById(
            "processing-orders"
        );

    const deliveredOrders =
        document.getElementById(
            "delivered-orders"
        );


    if (totalOrders) {

        totalOrders.textContent =
            orders.length;

    }


    if (pendingOrders) {

        pendingOrders.textContent =
            orders.filter(
                order =>
                    order.status === "PENDING"
            ).length;

    }


    if (processingOrders) {

        processingOrders.textContent =
            orders.filter(
                order =>
                    order.status === "PROCESSING"
            ).length;

    }


    if (deliveredOrders) {

        deliveredOrders.textContent =
            orders.filter(
                order =>
                    order.status === "DELIVERED"
            ).length;

    }
}


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

async function updateOrderStatus(
    orderId,
    newStatus
) {

    try {

        const response =
            await fetch(
                `${ORDERS_API}/${orderId}/status?status=${encodeURIComponent(
                    newStatus
                )}`,
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to update order status"
            );

        }


        const updatedOrder =
            await response.json();


        const order =
            allOrders.find(
                item =>
                    item.id === orderId
            );


        if (order) {

            order.status =
                updatedOrder.status;

        }


        updateOrderStatistics(
            allOrders
        );


        displayOrders(
            getFilteredOrders()
        );


        alert(
            `Order #${orderId} status updated to ${newStatus}.`
        );


    } catch (error) {

        console.error(
            "Update status error:",
            error
        );


        alert(
            "Unable to update order status. Please try again."
        );


        displayOrders(
            getFilteredOrders()
        );
    }
}


// =====================================================
// DELETE ORDER
// =====================================================

async function deleteOrder(orderId) {

    const confirmed =
        confirm(
            `Are you sure you want to delete order #${orderId}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${ORDERS_API}/${orderId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to delete order"
            );

        }


        allOrders =
            allOrders.filter(
                order =>
                    order.id !== orderId
            );


        displayOrders(
            getFilteredOrders()
        );


        updateOrderStatistics(
            allOrders
        );


        alert(
            `Order #${orderId} deleted successfully.`
        );


    } catch (error) {

        console.error(
            "Delete order error:",
            error
        );


        alert(
            "Unable to delete order. Please try again."
        );
    }
}


// =====================================================
// SEARCH + FILTER
// =====================================================

function getFilteredOrders() {

    const searchInput =
        document.getElementById(
            "admin-order-search"
        );

    const statusFilter =
        document.getElementById(
            "admin-order-status-filter"
        );


    const searchText =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "ALL";


    return allOrders.filter(order => {

        const matchesSearch =

            !searchText

            ||

            String(order.id)
                .toLowerCase()
                .includes(searchText)

            ||

            String(order.userId)
                .toLowerCase()
                .includes(searchText);


        const matchesStatus =

            selectedStatus === "ALL"

            ||

            order.status === selectedStatus;


        return (
            matchesSearch &&
            matchesStatus
        );

    });
}


// =====================================================
// FILTER ORDERS
// =====================================================

function filterOrders() {

    const filteredOrders =
        getFilteredOrders();

    displayOrders(
        filteredOrders
    );
}


// =====================================================
// ADMIN LOGOUT
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

        // Check admin before loading page
        if (!checkAdminAccess()) {
            return;
        }


        // Load orders
        loadOrders();


        // Search
        const searchInput =
            document.getElementById(
                "admin-order-search"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                filterOrders
            );

        }


        // Status filter
        const statusFilter =
            document.getElementById(
                "admin-order-status-filter"
            );


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                filterOrders
            );

        }


        // Logout
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