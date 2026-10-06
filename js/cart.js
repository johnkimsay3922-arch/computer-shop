const PRODUCTS_API =
    "https://computer-shop-backend-agmw.onrender.com/api/products";


// =====================================================
// LOAD CART
// =====================================================

function getCart() {

    return JSON.parse(
        localStorage.getItem("cart")
    ) || [];

}


// =====================================================
// SAVE CART
// =====================================================

function saveCart(cart) {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}


// =====================================================
// LOAD PRODUCTS AND DISPLAY CART
// =====================================================

async function loadCart() {

    const cartContainer =
        document.getElementById("cart-container");

    if (!cartContainer) {
        return;
    }


    const cart = getCart();


    // Empty cart

    if (cart.length === 0) {

        showEmptyCart();

        updateCartSummary([]);

        return;

    }


    try {

        const response =
            await fetch(PRODUCTS_API);


        if (!response.ok) {

            throw new Error(
                "Unable to load products"
            );

        }


        const products =
            await response.json();


        displayCart(cart, products);


    } catch (error) {

        console.error(
            "Cart error:",
            error
        );


        cartContainer.innerHTML = `

            <div class="cart-error">

                <h3>
                    Unable to load cart
                </h3>

                <p>
                    Please make sure the Computer Shop
                    backend is running.
                </p>

            </div>

        `;

    }

}


// =====================================================
// DISPLAY CART
// =====================================================

function displayCart(cart, products) {

    const cartContainer =
        document.getElementById(
            "cart-container"
        );


    if (!cartContainer) {
        return;
    }


    cartContainer.innerHTML = "";


    let cartProducts = [];


    cart.forEach(cartItem => {

        const product =
            products.find(
                product =>
                    product.id === cartItem.id
            );


        if (product) {

            cartProducts.push({

                product: product,

                quantity: cartItem.quantity

            });

        }

    });


    // Cart contains no valid products

    if (cartProducts.length === 0) {

        showEmptyCart();

        updateCartSummary([]);

        return;

    }


    // Create each cart item

    cartProducts.forEach(item => {

        const product =
            item.product;

        const quantity =
            item.quantity;


        const itemTotal =
            product.price * quantity;


        const cartItem =
            document.createElement("div");


        cartItem.className =
            "cart-item";


        cartItem.innerHTML = `

            <!-- PRODUCT IMAGE -->

         <div class="cart-product-image">

    <img
        src="${product.image
                ? 'https://computer-shop-backend-agmw.onrender.com/uploads/' + product.image
                : 'https://via.placeholder.com/150x120?text=Product'
            }"
        alt="${product.name}"
        onerror="this.src='https://via.placeholder.com/150x120?text=Product'"
    >

</div>


            <!-- PRODUCT DETAILS -->

            <div class="cart-product-details">

                <p class="cart-product-category">
                    ${product.category || "Other"}
                </p>


                <h3>
                    ${product.name}
                </h3>


                <p class="cart-product-price">
                    KSh ${Number(product.price).toLocaleString()}
                </p>


                <p class="cart-stock">
                    ${product.stock} in stock
                </p>

            </div>


            <!-- QUANTITY -->

            <div class="cart-quantity">

                <button
                    type="button"
                    onclick="decreaseCartQuantity(${product.id})"
                >
                    −
                </button>


                <span>
                    ${quantity}
                </span>


                <button
                    type="button"
                    onclick="increaseCartQuantity(${product.id}, ${product.stock})"
                >
                    +
                </button>

            </div>


            <!-- TOTAL -->

            <div class="cart-item-total">

                <strong>
                    KSh ${Number(itemTotal).toLocaleString()}
                </strong>

            </div>


            <!-- REMOVE -->

            <button
                type="button"
                class="remove-cart-item"
                onclick="removeFromCart(${product.id})"
            >
                Remove
            </button>

        `;


        cartContainer.appendChild(
            cartItem
        );

    });


    updateCartSummary(
        cartProducts
    );

}


// =====================================================
// INCREASE CART QUANTITY
// =====================================================

function increaseCartQuantity(
    productId,
    stock
) {

    let cart =
        getCart();


    const cartItem =
        cart.find(
            item =>
                item.id === productId
        );


    if (!cartItem) {
        return;
    }


    // Don't exceed stock

    if (cartItem.quantity >= stock) {

        alert(
            "You cannot add more than the available stock."
        );

        return;

    }


    cartItem.quantity++;


    saveCart(cart);


    loadCart();


    updateCartCount();

}


// =====================================================
// DECREASE CART QUANTITY
// =====================================================

function decreaseCartQuantity(
    productId
) {

    let cart =
        getCart();


    const cartItem =
        cart.find(
            item =>
                item.id === productId
        );


    if (!cartItem) {
        return;
    }


    // Minimum quantity is 1

    if (cartItem.quantity > 1) {

        cartItem.quantity--;

    } else {

        return;

    }


    saveCart(cart);


    loadCart();


    updateCartCount();

}


// =====================================================
// REMOVE PRODUCT FROM CART
// =====================================================

function removeFromCart(
    productId
) {

    let cart =
        getCart();


    cart =
        cart.filter(
            item =>
                item.id !== productId
        );


    saveCart(cart);


    loadCart();


    updateCartCount();

}


// =====================================================
// EMPTY CART DISPLAY
// =====================================================

function showEmptyCart() {

    const cartContainer =
        document.getElementById(
            "cart-container"
        );


    if (!cartContainer) {
        return;
    }


    cartContainer.innerHTML = `

        <div class="empty-cart">

            <div class="empty-cart-icon">
                🛒
            </div>


            <h3>
                Your cart is empty
            </h3>


            <p>
                You haven't added any products yet.
            </p>


            <a
                href="products.html"
                class="shop-now-button"
            >
                Start Shopping
            </a>

        </div>

    `;

}


// =====================================================
// UPDATE CART SUMMARY
// =====================================================

function updateCartSummary(
    cartProducts
) {

    let totalItems = 0;

    let subtotal = 0;


    cartProducts.forEach(item => {

        totalItems +=
            item.quantity;


        subtotal +=
            item.product.price *
            item.quantity;

    });


    // Number of items

    const cartItemCount =
        document.getElementById(
            "cartItemCount"
        );


    if (cartItemCount) {

        cartItemCount.textContent =
            `${totalItems} item${totalItems === 1 ? "" : "s"}`;

    }


    // Summary items

    const summaryItems =
        document.getElementById(
            "summaryItems"
        );


    if (summaryItems) {

        summaryItems.textContent =
            totalItems;

    }


    // Subtotal

    const cartSubtotal =
        document.getElementById(
            "cartSubtotal"
        );


    if (cartSubtotal) {

        cartSubtotal.textContent =
            `KSh ${Number(subtotal).toLocaleString()}`;

    }


    // Total

    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    if (cartTotal) {

        cartTotal.textContent =
            `KSh ${Number(subtotal).toLocaleString()}`;

    }

}


// =====================================================
// UPDATE HEADER CART COUNT
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


    let totalItems = 0;


    cart.forEach(item => {

        totalItems +=
            item.quantity;

    });


    cartCount.textContent =
        totalItems;

}


// =====================================================
// CHECKOUT BUTTON
// =====================================================

function setupCheckoutButton() {

    const checkoutButton =
        document.getElementById(
            "checkoutButton"
        );


    if (!checkoutButton) {
        return;
    }


    checkoutButton.addEventListener(
        "click",
        () => {

            const cart =
                getCart();


            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            // For now we will create
            // the checkout page next.

            window.location.href =
                "checkout.html";

        }
    );

}


// =====================================================
// PAGE START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCart();

        updateCartCount();

        setupCheckoutButton();

    }
);

