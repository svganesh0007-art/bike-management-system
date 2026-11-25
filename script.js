
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const otpForm = document.getElementById("otpForm");
const forgotForm = document.getElementById("forgotForm");
const resetOtpForm = document.getElementById("resetOtpForm");
const newPasswordForm = document.getElementById("newPasswordForm");

const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const otpSection = document.getElementById("otpSection");
const forgotSection = document.getElementById("forgotSection");
const resetOtpSection = document.getElementById("resetOtpSection");
const newPasswordSection = document.getElementById("newPasswordSection");

const message = document.getElementById("message");
const registerMessage = document.getElementById("registerMessage");
const otpMessage = document.getElementById("otpMessage");
const forgotMessage = document.getElementById("forgotMessage");
const resetOtpMessage = document.getElementById("resetOtpMessage");
const newPasswordMessage = document.getElementById("newPasswordMessage");

const API = "http://localhost:5001/api/auth";

let resetEmail = "";
let resetToken = "";

function showSection(section) {
    const sections = [
        loginSection,
        registerSection,
        otpSection,
        forgotSection,
        resetOtpSection,
        newPasswordSection
    ];

    sections.forEach(item => {
        item.style.display = "none";
    });

    section.style.display = "block";
}

document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", function() {
        const targetId = this.dataset.target;
        const passwordInput = document.getElementById(targetId);

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            this.textContent = "🙈";
            this.setAttribute("aria-label", "Hide password");
        } else {
            passwordInput.type = "password";
            this.textContent = "👁️";
            this.setAttribute("aria-label", "Show password");
        }
    });
});

document.getElementById("signup").addEventListener("click", function(event) {
    event.preventDefault();
    showSection(registerSection);
});

document.getElementById("backToLogin").addEventListener("click", function(event) {
    event.preventDefault();
    showSection(loginSection);
});

document.getElementById("forgot").addEventListener("click", function(event) {
    event.preventDefault();
    showSection(forgotSection);
});

document.getElementById("backForgotLogin").addEventListener("click", function(event) {
    event.preventDefault();
    showSection(loginSection);
});

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        message.style.color = "blue";
        message.textContent = "Logging in...";

        const response = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            message.style.color = "red";
            message.textContent = data.message;
            return;
        }

        message.style.color = "green";
        message.textContent = "Login successful! Welcome " + data.user.name;

        sessionStorage.setItem("userName", data.user.name);
        sessionStorage.setItem("userEmail", data.user.email);
        sessionStorage.setItem("userId", data.user.id);

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);

    } catch (error) {
        message.style.color = "red";
        message.textContent = "Unable to connect to server";
        console.error("Login Error:", error);
    }
});

registerForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    try {
        registerMessage.style.color = "blue";
        registerMessage.textContent = "Creating account and sending OTP...";

        const response = await fetch(`${API}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            registerMessage.style.color = "red";
            registerMessage.textContent = data.message;
            return;
        }

        document.getElementById("otpEmail").value = email;
        showSection(otpSection);

        otpMessage.style.color = "green";
        otpMessage.textContent = data.message;

    } catch (error) {
        registerMessage.style.color = "red";
        registerMessage.textContent = "Unable to connect to server";
        console.error("Registration Error:", error);
    }
});

otpForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("otpEmail").value.trim();
    const otp = document.getElementById("otpCode").value.trim();

    try {
        otpMessage.style.color = "blue";
        otpMessage.textContent = "Verifying OTP...";

        const response = await fetch(`${API}/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();

        if (!response.ok) {
            otpMessage.style.color = "red";
            otpMessage.textContent = data.message;
            return;
        }

        otpMessage.style.color = "green";
        otpMessage.textContent = "Email verified successfully! You can login now.";

        document.getElementById("email").value = email;

        setTimeout(() => {
            showSection(loginSection);
        }, 1500);

    } catch (error) {
        otpMessage.style.color = "red";
        otpMessage.textContent = "Unable to connect to server";
        console.error("OTP Verification Error:", error);
    }
});

forgotForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    resetEmail = document.getElementById("forgotEmail").value.trim();

    try {
        forgotMessage.style.color = "blue";
        forgotMessage.textContent = "Sending password reset OTP...";

        const response = await fetch(`${API}/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: resetEmail })
        });

        const data = await response.json();

        if (!response.ok) {
            forgotMessage.style.color = "red";
            forgotMessage.textContent = data.message;
            return;
        }

        document.getElementById("resetEmail").value = resetEmail;
        showSection(resetOtpSection);

        resetOtpMessage.style.color = "green";
        resetOtpMessage.textContent = data.message;

    } catch (error) {
        forgotMessage.style.color = "red";
        forgotMessage.textContent = "Unable to connect to server";
        console.error("Forgot Password Error:", error);
    }
});

resetOtpForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const otp = document.getElementById("resetOtp").value.trim();

    try {
        resetOtpMessage.style.color = "blue";
        resetOtpMessage.textContent = "Verifying reset OTP...";

        const response = await fetch(`${API}/verify-reset-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: resetEmail,
                otp
            })
        });

        const data = await response.json();

        if (!response.ok) {
            resetOtpMessage.style.color = "red";
            resetOtpMessage.textContent = data.message;
            return;
        }

        resetToken = data.resetToken;

        resetOtpMessage.style.color = "green";
        resetOtpMessage.textContent = "OTP verified successfully!";

        setTimeout(() => {
            showSection(newPasswordSection);
        }, 1000);

    } catch (error) {
        resetOtpMessage.style.color = "red";
        resetOtpMessage.textContent = "Unable to connect to server";
        console.error("Reset OTP Error:", error);
    }
});

newPasswordForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        newPasswordMessage.style.color = "red";
        newPasswordMessage.textContent = "Passwords do not match";
        return;
    }

    try {
        newPasswordMessage.style.color = "blue";
        newPasswordMessage.textContent = "Updating password...";

        const response = await fetch(`${API}/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: resetEmail,
                resetToken,
                newPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            newPasswordMessage.style.color = "red";
            newPasswordMessage.textContent = data.message;
            return;
        }

        newPasswordMessage.style.color = "green";
        newPasswordMessage.textContent = "Password reset successful! Please login.";

        loginForm.reset();
        document.getElementById("email").value = resetEmail;
        newPasswordForm.reset();

        resetToken = "";
        resetEmail = "";

        setTimeout(() => {
            showSection(loginSection);
        }, 2000);

    } catch (error) {
        newPasswordMessage.style.color = "red";
        newPasswordMessage.textContent = "Unable to connect to server";
        console.error("Password Reset Error:", error);
    }
});
