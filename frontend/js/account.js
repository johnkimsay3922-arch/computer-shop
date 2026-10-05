const ORDERS_API =
    "https://computer-shop-backend-agmw.onrender.com/api/orders";


// =====================================================
// GET LOGGED-IN USER
// =====================================================

function getLoggedInUser() {

    return JSON.parse(
        localStorage.getItem("user")
    );

}


// =====================================================
// LOAD ACCOUNT INFORMATION
// =====================================================

function loadAccountInformation() {

    const user =
        getLoggedInUser();


    // User is not logged in

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    // Display name

    const accountName =
        document.getElementById(
            "account-name"
        );

    if (accountName) {

        accountName.textContent =
            user.name;

    }


    // Display email

    const accountEmail =
        document.getElementById(
            "account-email"
        );

    if (accountEmail) {

        accountEmail.textContent =
            user.email;

    }


    // Display role

    const accountRole =
        document.getElementById(
            "account-role"
        );

    if (accountRole) {

        accountRole.textContent =
            user.role || "CUSTOMER";

    }


    // Welcome message

    const welcomeMessage =
        document.getElementById(
            "welcome-message"
        );

    if (welcomeMessage) {

        welcomeMessage.textContent =
            `Welcome back, ${user.name}.`;

    }


    // Load orders

    loadOrders(user.id);

}


// =====================================================
// LOAD CUSTOMER ORDERS
// =====================================================

async function loadOrders(userId) {

    const ordersContainer =
        document.getElementById(
            "orders-container"
        );


    if (!ordersContainer) {
        return;
    }


    try {

        const response =
            await fetch(
                `${ORDERS_API}/user/${userId}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load orders"
            );

        }


        const orders =
            await response.json();


        displayOrders(orders);


    } catch (error) {

        console.error(
            "Order history error:",
            error
        );


        ordersContainer.innerHTML = `

            <div class="orders-error">

                <h3>
                    Unable to load orders
                </h3>

                <p>
                    Please make sure the
                    Computer Shop backend
                    is running.
                </p>

                <button
                    type="button"
                    onclick="loadOrders(${userId})"
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

    const ordersContainer =
        document.getElementById(
            "orders-container"
        );


    if (!ordersContainer) {
        return;
    }


    // No orders

    if (
        !orders ||
        orders.length === 0
    ) {

        ordersContainer.innerHTML = `

            <div class="no-orders">

                <div class="no-orders-icon">
                    🛒
                </div>

                <h3>
                    No orders yet
                </h3>

                <p>
                    You haven't placed an order yet.
                </p>

                <a
                    href="products.html"
                    class="account-shop-button"
                >
                    Start Shopping
                </a>

            </div>

        `;

        return;

    }


    ordersContainer.innerHTML = "";


    // Display every order

    orders.forEach(order => {

        const orderCard =
            document.createElement(
                "div"
            );


        orderCard.className =
            "order-card";


        const status =
            order.status || "PENDING";


        const statusClass =
            status
                .toLowerCase()
                .replace(
                    /\s+/g,
                    "-"
                );


        orderCard.innerHTML = `

            <div class="order-card-top">

                <div>

                    <p class="order-label">
                        ORDER
                    </p>

                    <h3>
                        #${order.id}
                    </h3>

                </div>


                <span
                    class="order-status ${statusClass}"
                >
                    ${status}
                </span>

            </div>


            <div class="order-card-bottom">

                <div>

                    <span>
                        Total Amount
                    </span>

                    <strong>
                        KSh ${Number(
                            order.totalAmount
                        ).toLocaleString()}
                    </strong>

                </div>


                <button
                    type="button"
                    class="delete-order-button"
                    onclick="deleteOrder(${order.id})"
                >
                    Delete
                </button>

            </div>

        `;


        ordersContainer.appendChild(
            orderCard
        );

    });

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


        alert(
            "Order deleted successfully."
        );


        // Reload orders

        const user =
            getLoggedInUser();


        if (user) {

            loadOrders(
                user.id
            );

        }


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
// CART COUNT
// =====================================================

function updateAccountCartCount() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (!cartCount) {
        return;
    }


    const cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];


    let totalItems = 0;


    cart.forEach(item => {

        totalItems +=
            item.quantity;

    });


    cartCount.textContent =
        totalItems;

}


// =====================================================
// PAGE START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAccountInformation();

        updateAccountCartCount();

    }
);
