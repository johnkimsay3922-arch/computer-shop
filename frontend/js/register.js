const USERS_API =
    "https://computer-shop-backend-agmw.onrender.com/api/users";


// =====================================================
// REGISTER USER
// =====================================================

async function registerUser(event) {

    event.preventDefault();


    // Get form

    const form =
        document.getElementById(
            "register-form"
        );


    // Get values

    const name =
        document.getElementById(
            "register-name"
        ).value.trim();


    const email =
        document.getElementById(
            "register-email"
        ).value.trim();


    const password =
        document.getElementById(
            "register-password"
        ).value;


    const confirmPassword =
        document.getElementById(
            "register-confirm-password"
        ).value;


    // =================================================
    // VALIDATION
    // =================================================

    if (
        !name ||
        !email ||
        !password ||
        !confirmPassword
    ) {

        alert(
            "Please fill in all fields."
        );

        return;

    }


    // Check password length

    if (password.length < 6) {

        alert(
            "Password must be at least 6 characters."
        );

        return;

    }


    // Check passwords

    if (password !== confirmPassword) {

        alert(
            "Passwords do not match."
        );

        return;

    }


    try {

        // Disable button

        const registerButton =
            form.querySelector(
                ".auth-button"
            );


        registerButton.disabled =
            true;


        registerButton.textContent =
            "Creating Account...";


        // =================================================
        // SEND USER TO JAVA BACKEND
        // =================================================

        const response =
            await fetch(
                USERS_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        password: password,

                        role: "CUSTOMER"

                    })

                }
            );


        // Backend error

        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Registration failed"
            );

        }


        // Get created user

        const user =
            await response.json();


        console.log(
            "Registered user:",
            user
        );


        // =================================================
        // SUCCESS
        // =================================================

        alert(
            "Account created successfully! Please login."
        );


        // Go to login page

        window.location.href =
            "login.html";


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        alert(
            "Unable to create account. Please try again."
        );


        // Enable button again

        const registerButton =
            form.querySelector(
                ".auth-button"
            );


        registerButton.disabled =
            false;


        registerButton.textContent =
            "Create Account";

    }

}


// =====================================================
// PAGE START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const registerForm =
            document.getElementById(
                "register-form"
            );


        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                registerUser
            );

        }

    }
);

