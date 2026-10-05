const PRODUCTS_API ="https://computer-shop-backend-agmw.onrender.com/api/products";
const UPLOAD_API = "https://computer-shop-backend-agmw.onrender.com/api/products/upload-image";
let allProducts = [];
let editingProductId = null;


// =====================================================
// IMAGE HELPERS
// =====================================================

// Convert paths such as uploads\mon1.jpg into mon1.jpg
function cleanImageName(image) {
    if (!image) {
        return "";
    }

    let imageName = String(image).trim();

    // Convert Windows backslashes to forward slashes
    imageName = imageName.replace(/\\/g, "/");

    // Remove uploads/ from the beginning if present
    imageName = imageName.replace(/^uploads\//i, "");

    return imageName;
}


// Build the correct image URL
function getProductImageUrl(image) {
    const imageName = cleanImageName(image);

    if (!imageName) {
        return "";
    }

    return `https://computer-shop-backend-agmw.onrender.com/uploads/${encodeURIComponent(imageName)}`;
}


// =====================================================
// UPLOAD PRODUCT IMAGE
// =====================================================

async function uploadProductImage() {

    const imageInput =
        document.getElementById("product-image");

    if (!imageInput || !imageInput.files.length) {
        return "";
    }

    const file = imageInput.files[0];

    const formData = new FormData();
    formData.append("image", file);

    try {

        const response = await fetch(UPLOAD_API, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(
                `Image upload failed. Status: ${response.status}`
            );
        }

        let imageName = await response.text();

        imageName = cleanImageName(imageName);

        if (
            !imageName ||
            imageName.toLowerCase().includes("upload failed")
        ) {
            throw new Error(
                "The server did not return a valid image filename."
            );
        }

        console.log(
            "Image uploaded successfully:",
            imageName
        );

        return imageName;

    } catch (error) {

        console.error(
            "Image upload error:",
            error
        );

        alert(
            "Unable to upload image. Please check the backend and try again."
        );

        throw error;
    }
}


// =====================================================
// CHECK ADMIN LOGIN
// =====================================================

function checkAdminAccess() {

    let adminUser = null;

    try {
        adminUser = JSON.parse(
            localStorage.getItem("adminUser")
        );
    } catch (error) {
        console.error("Invalid admin login data:", error);
    }

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
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

    if (!checkAdminAccess()) {
        return;
    }

    const container =
        document.getElementById("admin-products-container");

    if (!container) {
        return;
    }

    try {

        const response = await fetch(
            PRODUCTS_API + "?t=" + new Date().getTime(),
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load products");
        }

        allProducts = await response.json();

        console.log(
            "Products loaded:",
            allProducts
        );

        displayProducts(allProducts);

    } catch (error) {

        console.error(
            "Load products error:",
            error
        );

        container.innerHTML = `
            <div class="admin-products-error">

                <h3>Unable to load products</h3>

                <p>
                    Please make sure the Computer Shop
                    backend is running.
                </p>

                <button
                    type="button"
                    onclick="loadProducts()"
                    class="admin-primary-button"
                >
                    Try Again
                </button>

            </div>
        `;
    }
}


// =====================================================
// DISPLAY PRODUCTS
// =====================================================

function displayProducts(products) {

    const container =
        document.getElementById("admin-products-container");

    if (!container) {
        return;
    }

    if (!products || products.length === 0) {

        container.innerHTML = `
            <div class="admin-products-empty">

                <div class="admin-empty-icon">
                    📦
                </div>

                <h3>No Products Found</h3>

                <p>
                    Add your first product using
                    the form above.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML = "";

    products.forEach(product => {

        const card = document.createElement("div");

        card.className = "admin-product-card";

        const imageUrl =
            getProductImageUrl(product.image);

        const imageHTML = imageUrl
            ? `
                <img
                    src="${imageUrl}"
                    alt="${product.name || "Product image"}"
                    class="admin-product-photo"
                    onerror="
                        this.style.display='none';
                        this.parentElement.classList.add('no-image');
                    "
                >
            `
            : `
                <div class="product-no-image">
                    🖥️
                </div>
            `;

        card.innerHTML = `

            <div class="admin-product-image">

                ${imageHTML}

            </div>


            <div class="admin-product-details">

                <div class="admin-product-top">

                    <span class="admin-product-category">
                        ${product.category || "Other"}
                    </span>

                    <span class="admin-product-id">
                        ID: ${product.id}
                    </span>

                </div>


                <h3>
                    ${product.name || "Unnamed Product"}
                </h3>


                <p class="admin-product-description">
                    ${product.description || "No description available."}
                </p>


                <div class="admin-product-info">

                    <div>

                        <span>Price</span>

                        <strong>
                            KSh ${Number(
                                product.price || 0
                            ).toLocaleString()}
                        </strong>

                    </div>


                    <div>

                        <span>Stock</span>

                        <strong class="${
                            product.stock <= 0
                                ? "stock-out"
                                : product.stock <= 5
                                ? "stock-low"
                                : "stock-good"
                        }">

                            ${product.stock ?? 0}

                        </strong>

                    </div>

                </div>


                <div class="admin-product-actions">

                    <button
                        type="button"
                        class="admin-edit-button"
                        onclick="editProduct(${product.id})"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="admin-delete-button"
                        onclick="deleteProduct(${product.id})"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `;

        container.appendChild(card);

    });
}


// =====================================================
// ADD OR UPDATE PRODUCT
// =====================================================

async function saveProduct(event) {

    event.preventDefault();

    if (!checkAdminAccess()) {
        return;
    }

    const productId =
        document.getElementById("product-id").value;

    const name =
        document.getElementById("product-name").value.trim();

    const description =
        document.getElementById("product-description").value.trim();

    const price =
        Number(
            document.getElementById("product-price").value
        );

    const category =
        document.getElementById("product-category").value;

    const stock =
        Number(
            document.getElementById("product-stock").value
        );

    const imageInput =
        document.getElementById("product-image");

    if (
        !name ||
        !description ||
        !category ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(stock) ||
        stock < 0
    ) {

        alert(
            "Please enter valid product information."
        );

        return;
    }

    const saveButton =
        document.getElementById("save-product-button");

    if (!saveButton) {
        alert("The save button could not be found.");
        return;
    }

    const originalButtonText =
        productId ? "Update Product" : "Add Product";

    try {

        saveButton.disabled = true;

        let imageName = "";


        // =============================================
        // UPLOAD IMAGE IF SELECTED
        // =============================================

        if (
            imageInput &&
            imageInput.files.length > 0
        ) {

            saveButton.textContent =
                "Uploading Image...";

            imageName =
                await uploadProductImage();

        }


        // =============================================
        // KEEP EXISTING IMAGE WHEN EDITING
        // =============================================

        if (productId && !imageName) {

            const existingProduct =
                allProducts.find(
                    product =>
                        Number(product.id) === Number(productId)
                );

            if (existingProduct) {

                imageName =
                    cleanImageName(existingProduct.image);

            }
        }


        // =============================================
        // PRODUCT DATA
        // =============================================

        const productData = {

            name: name,

            description: description,

            price: price,

            category: category,

            stock: stock,

            image: imageName

        };


        console.log(
            "Product data being saved:",
            productData
        );


        // =============================================
        // UPDATE EXISTING PRODUCT
        // =============================================

        if (productId) {

            saveButton.textContent =
                "Updating...";

            const response = await fetch(
                `${PRODUCTS_API}/${productId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(productData)
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Unable to update product. Status: ${response.status}`
                );
            }

            alert(
                "Product updated successfully!"
            );

        } else {


            // =========================================
            // ADD NEW PRODUCT
            // =========================================

            saveButton.textContent =
                "Adding...";

            const response = await fetch(
                PRODUCTS_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(productData)
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Unable to add product. Status: ${response.status}`
                );
            }

            alert(
                "Product added successfully!"
            );
        }


        // =============================================
        // RESET AND RELOAD
        // =============================================

        resetProductForm();

        await loadProducts();

    } catch (error) {

        console.error(
            "Save product error:",
            error
        );

        alert(
            "Unable to save product. Check the browser console and backend logs."
        );

    } finally {

        saveButton.disabled = false;

        saveButton.textContent =
            originalButtonText;
    }
}


// =====================================================
// EDIT PRODUCT
// =====================================================

function editProduct(productId) {

    const product =
        allProducts.find(
            item => Number(item.id) === Number(productId)
        );

    if (!product) {

        alert(
            "Product could not be found."
        );

        return;
    }

    editingProductId = productId;


    document.getElementById(
        "product-id"
    ).value = product.id;


    document.getElementById(
        "product-name"
    ).value = product.name || "";


    document.getElementById(
        "product-description"
    ).value = product.description || "";


    document.getElementById(
        "product-price"
    ).value = product.price ?? "";


    document.getElementById(
        "product-category"
    ).value = product.category || "";


    document.getElementById(
        "product-stock"
    ).value = product.stock ?? "";


    // File inputs cannot be filled automatically.
    // The current image will be kept unless a new one is selected.

    const imageInput =
        document.getElementById("product-image");

    if (imageInput) {
        imageInput.value = "";
    }


    // Update form heading

    document.getElementById(
        "product-form-title"
    ).textContent = "Edit Product";


    // Update button

    document.getElementById(
        "save-product-button"
    ).textContent = "Update Product";


    // Show cancel button

    const cancelButton =
        document.getElementById("cancel-edit-button");

    if (cancelButton) {
        cancelButton.style.display = "inline-block";
    }


    // Scroll to form

    document.getElementById(
        "product-form"
    ).scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// =====================================================
// DELETE PRODUCT
// =====================================================

async function deleteProduct(productId) {

    if (!checkAdminAccess()) {
        return;
    }

    const product =
        allProducts.find(
            item => Number(item.id) === Number(productId)
        );

    if (!product) {
        return;
    }

    const confirmed = confirm(
        `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `${PRODUCTS_API}/${productId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error(
                `Unable to delete product. Status: ${response.status}`
            );
        }

        alert(
            "Product deleted successfully!"
        );

        await loadProducts();

    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        alert(
            "Unable to delete product. Please try again."
        );
    }
}


// =====================================================
// RESET PRODUCT FORM
// =====================================================

function resetProductForm() {

    const form =
        document.getElementById("product-form");

    if (form) {
        form.reset();
    }

    const productId =
        document.getElementById("product-id");

    if (productId) {
        productId.value = "";
    }

    const formTitle =
        document.getElementById("product-form-title");

    if (formTitle) {
        formTitle.textContent = "Add New Product";
    }

    const saveButton =
        document.getElementById("save-product-button");

    if (saveButton) {
        saveButton.textContent = "Add Product";
    }

    const cancelButton =
        document.getElementById("cancel-edit-button");

    if (cancelButton) {
        cancelButton.style.display = "none";
    }

    editingProductId = null;
}


// =====================================================
// SEARCH PRODUCTS
// =====================================================

function searchProducts() {

    const searchInput =
        document.getElementById("admin-product-search");

    if (!searchInput) {
        return;
    }

    const searchText =
        searchInput.value.trim().toLowerCase();

    if (!searchText) {

        displayProducts(allProducts);

        return;
    }

    const filteredProducts =
        allProducts.filter(product => {

            return (

                (product.name || "")
                    .toLowerCase()
                    .includes(searchText)

                ||

                (product.category || "")
                    .toLowerCase()
                    .includes(searchText)

                ||

                (product.description || "")
                    .toLowerCase()
                    .includes(searchText)

            );

        });

    displayProducts(filteredProducts);
}


// =====================================================
// ADMIN LOGOUT
// =====================================================

function logoutAdmin() {

    const confirmed = confirm(
        "Are you sure you want to logout?"
    );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem("adminUser");

    window.location.href = "login.html";
}


// =====================================================
// PAGE START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (!checkAdminAccess()) {
            return;
        }

        loadProducts();


        // =============================================
        // PRODUCT FORM
        // =============================================

        const productForm =
            document.getElementById("product-form");

        if (productForm) {

            productForm.addEventListener(
                "submit",
                saveProduct
            );

        }


        // =============================================
        // CANCEL EDIT
        // =============================================

        const cancelButton =
            document.getElementById("cancel-edit-button");

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                resetProductForm
            );

        }


        // =============================================
        // SEARCH
        // =============================================

        const searchInput =
            document.getElementById("admin-product-search");

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                searchProducts
            );

        }


        // =============================================
        // LOGOUT
        // =============================================

        const logoutButton =
            document.getElementById("admin-logout");

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


// =====================================================
// REFRESH PRODUCTS WHEN RETURNING TO PAGE
// =====================================================

window.addEventListener(
    "pageshow",
    () => {

        // Avoid running before the page is initialized
        if (document.readyState !== "loading") {

            if (
                document.getElementById(
                    "admin-products-container"
                )
            ) {
                loadProducts();
            }

        }

    }
);