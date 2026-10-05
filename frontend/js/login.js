const LOGIN_API =
    "http://computer-shop-backend-agmw.onrender.com/api/users/login";


// =====================================================
// LOGIN USER
// =====================================================

async function loginUser(event) {

    event.preventDefault();


    const form =
        document.getElementById(
            "login-form"
        );


    // Get values

    const email =
        document.getElementById(
            "login-email"
        ).value.trim();


    const password =
        document.getElementById(
            "login-password"
        ).value;


    // =================================================
    // VALIDATION
    // =================================================

    if (!email || !password) {

        alert(
            "Please enter your email and password."
        );

        return;
    }


    try {

        const loginButton =
            form.querySelector(
                ".auth-button"
            );


        loginButton.disabled = true;

        loginButton.textContent =
            "Logging in...";


        // =================================================
        // SEND LOGIN REQUEST TO JAVA
        // =================================================

        const response =
            await fetch(
                LOGIN_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        email: email,

                        password: password

                    })
                }
            );


        // Check response

        if (!response.ok) {

            throw new Error(
                "Invalid email or password."
            );

        }


        // Get user returned by Java

        const user =
            await response.json();


        console.log(
            "Logged in user:",
            user
        );


        // =================================================
        // SAVE USER IN BROWSER
        // =================================================

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );


        // =================================================
        // LOGIN SUCCESS
        // =================================================

        alert(
            `Welcome back, ${user.name}!`
        );


        // Redirect

        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        alert(
            "Login failed. Please check your email and password."
        );


        const loginButton =
            form.querySelector(
                ".auth-button"
            );


        loginButton.disabled = false;

        loginButton.textContent =
            "Login";

    }

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

        const loginForm =
            document.getElementById(
                "login-form"
            );


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                loginUser
            );

        }


        updateCartCount();

    }
);
