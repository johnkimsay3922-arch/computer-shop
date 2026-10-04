// =====================================================
// AUTHENTICATION / USER NAVIGATION
// =====================================================

function getLoggedInUser() {

    return JSON.parse(
        localStorage.getItem("user")
    );

}


// =====================================================
// UPDATE NAVIGATION
// =====================================================

function updateAuthNavigation() {

    const user =
        getLoggedInUser();


    const navbar =
        document.querySelector(
            ".navbar"
        );


    if (!navbar) {
        return;
    }


    // Find existing Login link

    const loginLink =
        navbar.querySelector(
            'a[href="login.html"]'
        );


    if (user) {

        // =================================================
        // USER IS LOGGED IN
        // =================================================

        if (loginLink) {

            loginLink.outerHTML = `
                <a href="account.html">
                    My Account
                </a>
            `;

        }


        // Don't create duplicate logout links

        const existingLogout =
            navbar.querySelector(
                ".logout-link"
            );


        if (!existingLogout) {

            const logoutLink =
                document.createElement(
                    "a"
                );


            logoutLink.href = "#";

            logoutLink.textContent =
                "Logout";

            logoutLink.className =
                "logout-link";


            logoutLink.addEventListener(
                "click",
                logoutUser
            );


            navbar.appendChild(
                logoutLink
            );

        }

    } else {

        // =================================================
        // USER IS NOT LOGGED IN
        // =================================================

        const accountLink =
            navbar.querySelector(
                'a[href="account.html"]'
            );


        if (accountLink) {

            accountLink.outerHTML = `
                <a href="login.html">
                    Login
                </a>
            `;

        }


        const logoutLink =
            navbar.querySelector(
                ".logout-link"
            );


        if (logoutLink) {

            logoutLink.remove();

        }

    }

}


// =====================================================
// LOGOUT
// =====================================================

function logoutUser(event) {

    event.preventDefault();


    const user =
        getLoggedInUser();


    if (!user) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to logout, ${user.name}?`
        );


    if (!confirmed) {
        return;
    }


    // Remove logged-in user

    localStorage.removeItem(
        "user"
    );


    // Return to home page

    window.location.href =
        "index.html";

}


// =====================================================
// CART COUNT
// =====================================================

function updateAuthCartCount() {

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

        updateAuthNavigation();

        updateAuthCartCount();

    }
);
