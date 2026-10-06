const API_URL =
    "https://computer-shop-backend-agmw.onrender.com/api/products";

const BACKEND_URL =
    "https://computer-shop-backend-agmw.onrender.com";
    
let allProducts = [];


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

    const productContainer =
        document.getElementById("product-container");

    if (!productContainer) {
        return;
    }

    try {

        const response = await fetch(
            API_URL + "?t=" + Date.now(),
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        allProducts = await response.json();

        console.log(
            "PRODUCTS FROM BACKEND:",
            allProducts
        );

        displayProducts(allProducts);

        applyCategoryFromURL();

    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );

        productContainer.innerHTML = `
            <div class="error-message">
                <h3>Unable to load products</h3>
                <p>
                    Unable to connect to the Computer Shop backend.
                </p>
            </div>
        `;
    }
}


// =====================================================
// DISPLAY PRODUCTS
// =====================================================

function displayProducts(products) {

    const productContainer =
        document.getElementById("product-container");

    if (!productContainer) {
        return;
    }

    productContainer.innerHTML = "";


    if (products.length === 0) {

        productContainer.innerHTML = `
            <div class="no-products">
                <h3>No products found</h3>
                <p>
                    Try another search or category.
                </p>
            </div>
        `;

        return;
    }


    products.forEach(product => {

        const productCard =
            document.createElement("div");

        productCard.className =
            "product-card";


        // =================================================
        // PRODUCT IMAGE
        // =================================================

        let imageUrl =
            "https://via.placeholder.com/400x300?text=Computer+Product";


        if (product.image) {

            let imageName =
                String(product.image).trim();


            // Remove uploads/ if already included

            imageName =
                imageName.replace(
                    /^uploads[\\/]/i,
                    ""
                );


            // Remove leading slash

            imageName =
                imageName.replace(
                    /^\/+/,
                    ""
                );


            if (
                imageName &&
                !imageName
                    .toLowerCase()
                    .includes("upload failed")
            ) {

                if (
                    imageName.startsWith("http://") ||
                    imageName.startsWith("https://")
                ) {

                    imageUrl = imageName;

                } else {

                    imageUrl =
                        `${BACKEND_URL}/uploads/${encodeURIComponent(imageName)}`;
                }
            }
        }


        console.log(
            "Product:",
            product.name,
            "Image:",
            product.image,
            "Image URL:",
            imageUrl
        );


        // =================================================
        // PRODUCT CARD
        // =================================================

        productCard.innerHTML = `

            <img
                src="${imageUrl}"
                alt="${product.name || "Computer Product"}"
                class="product-image"
                onerror="
                    console.error(
                        'IMAGE FAILED:',
                        this.src
                    );

                    this.onerror = null;

                    this.src =
                        'https://via.placeholder.com/400x300?text=Computer+Product';
                "
            >


            <div class="product-info">

                <p class="product-category">
                    ${product.category || "Other"}
                </p>


                <h3 class="product-name">
                    ${product.name || "Unnamed Product"}
                </h3>


                <p class="product-description">
                    ${product.description || "No description available."}
                </p>


                <p class="product-price">
                    KSh ${Number(
                        product.price || 0
                    ).toLocaleString()}
                </p>


                <p class="product-stock">
                    ${
                        product.stock > 0
                            ? `${product.stock} in stock`
                            : "Out of stock"
                    }
                </p>


                <div class="quantity-control">

                    <button
                        type="button"
                        class="quantity-button"
                        onclick="decreaseQuantity(${product.id})"
                        ${product.stock <= 0 ? "disabled" : ""}
                    >
                        −
                    </button>


                    <span
                        class="quantity-number"
                        id="quantity-${product.id}"
                    >
                        1
                    </span>


                    <button
                        type="button"
                        class="quantity-button"
                        onclick="increaseQuantity(
                            ${product.id},
                            ${product.stock}
                        )"
                        ${product.stock <= 0 ? "disabled" : ""}
                    >
                        +
                    </button>

                </div>


                <button
                    type="button"
                    class="product-button"
                    onclick="addSelectedQuantityToCart(
                        ${product.id},
                        ${product.stock}
                    )"
                    ${product.stock <= 0 ? "disabled" : ""}
                >
                    ${
                        product.stock > 0
                            ? "Add to Cart"
                            : "Out of Stock"
                    }
                </button>

            </div>
        `;


        productContainer.appendChild(
            productCard
        );

    });
}


// =====================================================
// INCREASE QUANTITY
// =====================================================

function increaseQuantity(
    productId,
    stock
) {

    const quantityElement =
        document.getElementById(
            `quantity-${productId}`
        );

    if (!quantityElement) {
        return;
    }

    let quantity =
        parseInt(
            quantityElement.textContent
        );

    if (quantity < stock) {
        quantity++;
    }

    quantityElement.textContent =
        quantity;
}


// =====================================================
// DECREASE QUANTITY
// =====================================================

function decreaseQuantity(productId) {

    const quantityElement =
        document.getElementById(
            `quantity-${productId}`
        );

    if (!quantityElement) {
        return;
    }

    let quantity =
        parseInt(
            quantityElement.textContent
        );

    if (quantity > 1) {
        quantity--;
    }

    quantityElement.textContent =
        quantity;
}


// =====================================================
// ADD TO CART
// =====================================================

function addSelectedQuantityToCart(
    productId,
    stock
) {

    const quantityElement =
        document.getElementById(
            `quantity-${productId}`
        );

    if (!quantityElement) {
        return;
    }

    const quantity =
        parseInt(
            quantityElement.textContent
        );


    if (quantity <= 0) {

        alert(
            "Please select a valid quantity."
        );

        return;
    }


    if (quantity > stock) {

        alert(
            "Not enough stock available."
        );

        return;
    }


    let cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];


    const existingProduct =
        cart.find(
            item => item.id === productId
        );


    if (existingProduct) {

        if (
            existingProduct.quantity +
            quantity >
            stock
        ) {

            alert(
                `You can only add ${
                    stock -
                    existingProduct.quantity
                } more item(s) of this product.`
            );

            return;
        }

        existingProduct.quantity +=
            quantity;

    } else {

        cart.push({
            id: productId,
            quantity: quantity
        });
    }


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    updateCartCount();


    quantityElement.textContent =
        1;


    alert(
        `${quantity} product(s) added to cart!`
    );
}


// =====================================================
// FILTER PRODUCTS
// =====================================================

function filterProducts() {

    const searchInput =
        document.getElementById(
            "search-input"
        );

    const categoryFilter =
        document.getElementById(
            "category-filter"
        );


    const searchText =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
            : "All";


    const filteredProducts =
        allProducts.filter(
            product => {

                const matchesSearch =
                    !searchText ||

                    (product.name || "")
                        .toLowerCase()
                        .includes(searchText) ||

                    (product.description || "")
                        .toLowerCase()
                        .includes(searchText) ||

                    (product.category || "")
                        .toLowerCase()
                        .includes(searchText);


                const matchesCategory =
                    selectedCategory === "All" ||

                    (product.category || "")
                        .toLowerCase() ===
                    selectedCategory
                        .toLowerCase();


                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );


    displayProducts(
        filteredProducts
    );
}


// =====================================================
// SEARCH
// =====================================================

function searchProducts() {

    filterProducts();
}


// =====================================================
// CATEGORY FILTER
// =====================================================

function filterByCategory() {

    filterProducts();
}


// =====================================================
// CATEGORY FROM URL
// =====================================================

function applyCategoryFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const category =
        params.get("category");


    if (!category) {
        return;
    }


    const categoryFilter =
        document.getElementById(
            "category-filter"
        );


    if (categoryFilter) {

        categoryFilter.value =
            category;
    }


    if (
        category.toLowerCase() ===
        "all"
    ) {

        displayProducts(
            allProducts
        );

        return;
    }


    const filteredProducts =
        allProducts.filter(
            product =>
                (product.category || "")
                    .toLowerCase() ===
                category.toLowerCase()
        );


    displayProducts(
        filteredProducts
    );
}


// =====================================================
// CART COUNT
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
// PAGE EVENTS
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProducts();

        updateCartCount();


        const searchInput =
            document.getElementById(
                "search-input"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                searchProducts
            );

        }


        const categoryFilter =
            document.getElementById(
                "category-filter"
            );


        if (categoryFilter) {

            categoryFilter.addEventListener(
                "change",
                filterByCategory
            );

        }

    }
);
