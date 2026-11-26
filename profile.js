
const API = "http://https://bike-management-system.onrender.com/api/api";
const userId = sessionStorage.getItem("userId");

const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");

if (!userId) {
    alert("Please login first");
    window.location.href = "index.html";
}

async function loadProfile() {
    try {
        const response = await fetch(`${API}/profile/${userId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        const user = data.user;

        document.getElementById("name").value = user.name || "";
        document.getElementById("fatherName").value = user.fatherName || "";
        document.getElementById("dateOfBirth").value = user.dateOfBirth
            ? new Date(user.dateOfBirth).toISOString().split("T")[0]
            : "";
        document.getElementById("mobileNumber").value = user.mobileNumber || "";
        document.getElementById("gender").value = user.gender || "";
        document.getElementById("email").value = user.email || "";

        document.getElementById("profileHeading").textContent =
            "Welcome, " + (user.name || "User") + "!";

    } catch (error) {
        document.getElementById("profileMessage").textContent = error.message;
    }
}

profileForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const fatherName = document.getElementById("fatherName").value.trim();
    const dateOfBirth = document.getElementById("dateOfBirth").value;
    const mobileNumber = document.getElementById("mobileNumber").value.trim();
    const gender = document.getElementById("gender").value;

    if (mobileNumber && !/^[0-9]{10}$/.test(mobileNumber)) {
        document.getElementById("profileMessage").textContent =
            "Enter a valid 10-digit mobile number";
        return;
    }

    try {
        const response = await fetch(`${API}/profile/update/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                fatherName,
                dateOfBirth,
                mobileNumber,
                gender
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        sessionStorage.setItem("userName", data.user.name);

        document.getElementById("profileHeading").textContent =
            "Welcome, " + data.user.name + "!";

        document.getElementById("profileMessage").textContent =
            "Profile details updated successfully!";

    } catch (error) {
        document.getElementById("profileMessage").textContent = error.message;
    }
});

passwordForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;

    try {
        const response = await fetch(`${API}/profile/change-password/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        document.getElementById("passwordMessage").textContent =
            "Password changed successfully!";

        passwordForm.reset();

    } catch (error) {
        document.getElementById("passwordMessage").textContent = error.message;
    }
});

document.getElementById("logoutBtn").addEventListener("click", function() {
    sessionStorage.clear();
    window.location.href = "index.html";
});

if (userId) {
    loadProfile();
}
