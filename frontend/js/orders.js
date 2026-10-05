const USERS_API =
    "http://computer-shop-backend-agmw.onrender.com/api/users";

const ORDERS_API =
    "http://computer-shop-backend-agmw.onrender.com/api/orders";


// =====================================================
// LOAD ORDERS
// =====================================================

async function loadOrders() {

    const ordersContainer =
        document.getElementById("orders-container");

    if (!ordersContainer) {
        return;
    }


    // Get logged-in user

    const user =
        JSON.parse(localStorage.getItem("user"));


    if (!user) {

        ordersContainer.innerHTML = `
            <div class="orders-empty">

                <h2>Please Login</h2>

                <p>
                    You need to login to view your orders.
                </p>

                <a href="login.html">
                    Login
                </a>

            </div>
        `;

        return;
    }


    try {

        const response =
            await fetch(
                `${ORDERS_API}/user/${user.id}`
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
            "Orders error:",
            error
        );


        ordersContainer.innerHTML = `
            <div class="orders-error">

                <h2>Unable to load orders</h2>

                <p>
                    Please make sure the backend
                    is running.
                </p>

            </div>
        `;

    }

}


// =====================================================
// DISPLAY ORDERS
// =====================================================

function displayOrders(orders) {

    const ordersContainer =
        document.getElementById("orders-container");


    if (!orders || orders.length === 0) {

        ordersContainer.innerHTML = `
            <div class="orders-empty">

                <h2>No Orders Yet</h2>

                <p>
                    You have not placed any orders yet.
                </p>

                <a href="products.html">
                    Start Shopping
                </a>

            </div>
        `;

        return;
    }


    ordersContainer.innerHTML = "";


    orders.forEach(order => {

        const orderCard =
            document.createElement("div");

        orderCard.className =
            "order-card";


        orderCard.innerHTML = `

            <div class="order-card-header">

                <div>

                    <h3>
                        Order #${order.id}
                    </h3>

                </div>


                <span class="order-status">
                    ${order.status}
                </span>

            </div>


            <div class="order-card-body">

                <p>
                    <strong>Order ID:</strong>
                    #${order.id}
                </p>

                <p>
                    <strong>Total:</strong>
                    KSh ${Number(
                        order.totalAmount
                    ).toLocaleString()}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${order.status}
                </p>

            </div>

        `;


        ordersContainer.appendChild(
            orderCard
        );

    });

}


// =====================================================
// CART COUNT
// =====================================================

function updateCartCount() {

    const cartCount =
        document.getElementById("cartCount");


    if (!cartCount) {
        return;
    }


    const cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];


    let totalItems = 0;


    cart.forEach(item => {

        totalItems += item.quantity;

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

        loadOrders();

        updateCartCount();

    }
);