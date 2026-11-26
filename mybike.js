
const bikeForm = document.getElementById("bikeForm");
const message = document.getElementById("message");
const API = "http://https://bike-management-system.onrender.com/api/api/bikes";
const bikeList = document.getElementById("bikeList");

let editingBikeId = null;

const submitButton = bikeForm.querySelector("button[type='submit']");

async function loadMyBikes() {
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
        bikeList.innerHTML = "<p>Please login first.</p>";
        return;
    }

    try {
        const response = await fetch(`${API}/my-bikes/${userId}`);
        const data = await response.json();

        if (!response.ok) {
            bikeList.innerHTML = "<p>Unable to load bikes.</p>";
            return;
        }

        if (data.bikes.length === 0) {
            bikeList.innerHTML = "<p>No bikes registered yet.</p>";
            return;
        }

        bikeList.innerHTML = data.bikes.map(bike => `
            <div class="bike-card">
                <h3>🏍️ ${bike.bikeName}</h3>
                <p><strong>Brand:</strong> ${bike.brand}</p>
                <p><strong>Model:</strong> ${bike.model}</p>
                <p><strong>Registration:</strong> ${bike.registrationNumber}</p>
                <p><strong>Fuel Type:</strong> ${bike.fuelType}</p>
                <p><strong>Purchase Date:</strong> ${new Date(bike.purchaseDate).toLocaleDateString()}</p>
                <button type="button" onclick="editBike('${bike._id}')">EDIT</button>
                <button type="button" onclick="deleteBike('${bike._id}')" style="background:#dc2626; margin-top:10px;">DELETE</button>
            </div>
        `).join("");

    } catch (error) {
        bikeList.innerHTML = "<p>Unable to connect to server.</p>";
    }
}

async function editBike(bikeId) {
    const userId = sessionStorage.getItem("userId");

    try {
        const response = await fetch(`${API}/my-bikes/${userId}`);
        const data = await response.json();

        const bike = data.bikes.find(item => item._id === bikeId);

        if (!bike) {
            alert("Bike not found");
            return;
        }

        editingBikeId = bikeId;

        document.getElementById("bikeName").value = bike.bikeName;
        document.getElementById("brand").value = bike.brand;
        document.getElementById("model").value = bike.model;
        document.getElementById("registrationNumber").value = bike.registrationNumber;
        document.getElementById("fuelType").value = bike.fuelType;
        document.getElementById("purchaseDate").value = new Date(bike.purchaseDate).toISOString().split("T")[0];

        submitButton.textContent = "UPDATE BIKE";
        message.textContent = "Editing bike details...";

        bikeForm.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        alert("Unable to load bike details");
    }
}

async function deleteBike(bikeId) {
    const userId = sessionStorage.getItem("userId");

    if (!confirm("Are you sure you want to delete this bike?")) {
        return;
    }

    try {
        const response = await fetch(`${API}/delete/${bikeId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Bike deleted successfully!");
        loadMyBikes();

    } catch (error) {
        alert("Unable to connect to server");
    }
}

bikeForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const userId = sessionStorage.getItem("userId");

    if (!userId) {
        message.textContent = "Please login first";
        return;
    }

    const bikeData = {
        userId,
        bikeName: document.getElementById("bikeName").value.trim(),
        brand: document.getElementById("brand").value.trim(),
        model: document.getElementById("model").value.trim(),
        registrationNumber: document.getElementById("registrationNumber").value.trim(),
        fuelType: document.getElementById("fuelType").value,
        purchaseDate: document.getElementById("purchaseDate").value
    };

    try {
        const isEditing = editingBikeId !== null;

        message.style.color = "blue";
        message.textContent = isEditing ? "Updating your bike..." : "Adding your bike...";

        const response = await fetch(
            isEditing ? `${API}/update/${editingBikeId}` : `${API}/add`,
            {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(bikeData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.style.color = "red";
            message.textContent = data.message;
            return;
        }

        message.style.color = "green";
        message.textContent = isEditing
            ? "Bike updated successfully!"
            : "Bike added successfully!";

        bikeForm.reset();
        editingBikeId = null;
        submitButton.textContent = "ADD MY BIKE";

        loadMyBikes();

    } catch (error) {
        message.style.color = "red";
        message.textContent = "Unable to connect to server";
    }
});

loadMyBikes();
