const LOGIN_API =
    "https://computer-shop-backend-agmw.onrender.com/api/users/login";


// =====================================================
// ADMIN LOGIN
// =====================================================

async function adminLogin(event) {

    event.preventDefault();


    const form =
        document.getElementById(
            "admin-login-form"
        );


    const email =
        document.getElementById(
            "admin-email"
        ).value.trim();


    const password =
        document.getElementById(
            "admin-password"
        ).value;


    if (!email || !password) {

        alert(
            "Please enter your admin email and password."
        );

        return;
    }


    const loginButton =
        form.querySelector(
            ".admin-login-button"
        );


    try {

        loginButton.disabled = true;

        loginButton.textContent =
            "Checking Login...";


        // =================================================
        // LOGIN THROUGH JAVA BACKEND
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


        if (!response.ok) {

            throw new Error(
                "Invalid login details"
            );

        }


        const user =
            await response.json();


        console.log(
            "Admin login response:",
            user
        );


        // =================================================
        // CHECK ADMIN ROLE
        // =================================================

        if (
            !user.role ||
            user.role.toUpperCase() !== "ADMIN"
        ) {

            alert(
                "Access denied. This account is not an administrator."
            );


            loginButton.disabled = false;

            loginButton.textContent =
                "Login to Dashboard";

            return;

        }


        // =================================================
        // SAVE ADMIN
        // =================================================

        localStorage.setItem(
            "adminUser",
            JSON.stringify(user)
        );


        // =================================================
        // SUCCESS
        // =================================================

        alert(
            `Welcome, ${user.name}!`
        );


        window.location.href =
            "dashboard.html";


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        alert(
            "Admin login failed. Please check your email and password."
        );


        loginButton.disabled = false;

        loginButton.textContent =
            "Login to Dashboard";

    }

}


// =====================================================
// PAGE START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const adminLoginForm =
            document.getElementById(
                "admin-login-form"
            );


        if (adminLoginForm) {

            adminLoginForm.addEventListener(
                "submit",
                adminLogin
            );

        }

    }
);
