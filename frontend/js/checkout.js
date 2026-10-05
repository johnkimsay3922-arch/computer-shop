const PRODUCTS_API =
    "http://computer-shop-backend-agmw.onrender.com/api/products";

const CHECKOUT_API =
    "http://computer-shop-backend-agmw.onrender.com/api/checkout";


// =====================================================
// GET CART
// =====================================================

function getCart() {

    return JSON.parse(
        localStorage.getItem("cart")
    ) || [];

}


// =====================================================
// LOAD CHECKOUT
// =====================================================

async function loadCheckout() {

    const checkoutProducts =
        document.getElementById(
            "checkout-products"
        );


    if (!checkoutProducts) {
        return;
    }


    const cart =
        getCart();


    // Check if cart is empty

    if (cart.length === 0) {

        checkoutProducts.innerHTML = `

            <div class="checkout-empty">

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Please add products before checkout.
                </p>

                <a
                    href="products.html"
                    class="shop-now-button"
                >
                    Continue Shopping
                </a>

            </div>

        `;


        const checkoutButton =
            document.querySelector(
                ".place-order-button"
            );


        if (checkoutButton) {

            checkoutButton.disabled = true;

        }


        return;

    }


    try {

        // Get products from backend

        const response =
            await fetch(PRODUCTS_API);


        if (!response.ok) {

            throw new Error(
                "Unable to load products"
            );

        }


        const products =
            await response.json();


        displayCheckoutProducts(
            cart,
            products
        );


    } catch (error) {

        console.error(
            "Checkout error:",
            error
        );


        checkoutProducts.innerHTML = `

            <div class="checkout-error">

                <h3>
                    Unable to load order
                </h3>

                <p>
                    Please make sure the backend is running.
                </p>

            </div>

        `;

    }

}


// =====================================================
// DISPLAY CHECKOUT PRODUCTS
// =====================================================

function displayCheckoutProducts(
    cart,
    products
) {

    const checkoutProducts =
        document.getElementById(
            "checkout-products"
        );


    const checkoutTotal =
        document.getElementById(
            "checkout-total"
        );


    checkoutProducts.innerHTML = "";


    let total =
        0;


    cart.forEach(cartItem => {

        const product =
            products.find(
                product =>
                    product.id === cartItem.id
            );


        if (!product) {
            return;
        }


        const itemTotal =
            product.price *
            cartItem.quantity;


        total +=
            itemTotal;


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "checkout-product";


        item.innerHTML = `

            <div class="checkout-product-image">

<img
    src="${product.image
        ? "http://computer-shop-backend-agmw.onrender.com/uploads/" + product.image
        : "https://via.placeholder.com/100x80?text=Product"
    }"
    alt="${product.name}"
    onerror="this.src='https://via.placeholder.com/100x80?text=Product'"
>
            </div>


            <div class="checkout-product-info">

                <h3>
                    ${product.name}
                </h3>

                <p>
                    Quantity: ${cartItem.quantity}
                </p>

                <strong>
                    KSh ${Number(itemTotal).toLocaleString()}
                </strong>

            </div>

        `;


        checkoutProducts.appendChild(
            item
        );

    });


    checkoutTotal.textContent =
        `KSh ${Number(total).toLocaleString()}`;

}


// =====================================================
// PLACE ORDER
// =====================================================

async function placeOrder(event) {

    event.preventDefault();


    const form =
        document.getElementById(
            "checkout-form"
        );


    const name =
        document.getElementById(
            "customer-name"
        ).value.trim();


    const email =
        document.getElementById(
            "customer-email"
        ).value.trim();


    const phone =
        document.getElementById(
            "customer-phone"
        ).value.trim();


    const address =
        document.getElementById(
            "customer-address"
        ).value.trim();


    // Validate form

    if (
        !name ||
        !email ||
        !phone ||
        !address
    ) {

        alert(
            "Please fill in all customer information."
        );

        return;

    }


    // Get logged-in user

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );


    if (!user) {

        alert(
            "Please login before placing your order."
        );


        window.location.href =
            "login.html";


        return;

    }


    // Get cart

    const cart =
        getCart();


    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    // Prepare checkout request

    const checkoutData = {

        userId: user.id,

        items: cart.map(item => ({

            productId: item.id,

            quantity: item.quantity

        }))

    };


    try {

        const submitButton =
            form.querySelector(
                ".place-order-button"
            );


        submitButton.disabled =
            true;


        submitButton.textContent =
            "Processing Order...";


        // Send order to Java backend

        const response =
            await fetch(
                CHECKOUT_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            checkoutData
                        )
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Checkout failed"
            );

        }


        const order =
            await response.json();


        // Clear cart

        localStorage.removeItem(
            "cart"
        );


        // Update cart count

        updateCartCount();


        // Show success

        showOrderSuccess(
            order
        );


    } catch (error) {

        console.error(
            "Order error:",
            error
        );


        alert(
            "Unable to place order. Please try again."
        );


        const submitButton =
            form.querySelector(
                ".place-order-button"
            );


        submitButton.disabled =
            false;


        submitButton.textContent =
            "Place Order";

    }

}


// =====================================================
// ORDER SUCCESS
// =====================================================

function showOrderSuccess(
    order
) {

    const checkoutPage =
        document.querySelector(
            ".checkout-page"
        );


    if (!checkoutPage) {
        return;
    }


    checkoutPage.innerHTML = `

        <div class="order-success">

            <div class="success-icon">
                ✓
            </div>


            <h1>
                Order Placed Successfully!
            </h1>


            <p>
                Thank you for your purchase.
            </p>


            <div class="order-number">

                Order Number:
                <strong>
                    #${order.id}
                </strong>

            </div>


            <div class="success-actions">

                <a
                    href="products.html"
                    class="shop-now-button"
                >
                    Continue Shopping
                </a>


                <a
                    href="index.html"
                    class="continue-home"
                >
                    Back to Home
                </a>

            </div>

        </div>

    `;

}


// =====================================================
// UPDATE CART COUNT
// =====================================================

function updateCartCount() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (!cartCount) {
        return;
    }


    const cart =
        getCart();


    let totalItems =
        0;


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

        loadCheckout();

        updateCartCount();


        const checkoutForm =
            document.getElementById(
                "checkout-form"
            );


        if (checkoutForm) {

            checkoutForm.addEventListener(
                "submit",
                placeOrder
            );

        }

    }
);
