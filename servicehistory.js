
const serviceForm = document.getElementById("serviceForm");
const bikeSelect = document.getElementById("bikeId");
const serviceList = document.getElementById("serviceList");
const message = document.getElementById("message");

const API = "http://https://bike-management-system.onrender.com/api/api";
const userId = sessionStorage.getItem("userId");

let editingServiceId = null;

const submitButton = serviceForm.querySelector("button[type='submit']");

async function loadBikes() {
    if (!userId) {
        bikeSelect.innerHTML = '<option value="">Please login first</option>';
        return;
    }

    try {
        const response = await fetch(`${API}/bikes/my-bikes/${userId}`);
        const data = await response.json();

        if (!response.ok || data.bikes.length === 0) {
            bikeSelect.innerHTML = '<option value="">No bikes registered</option>';
            return;
        }

        bikeSelect.innerHTML = '<option value="">Select your bike</option>';

        data.bikes.forEach(bike => {
            const option = document.createElement("option");
            option.value = bike._id;
            option.textContent = `${bike.bikeName} - ${bike.registrationNumber}`;
            bikeSelect.appendChild(option);
        });

    } catch (error) {
        bikeSelect.innerHTML = '<option value="">Unable to load bikes</option>';
    }
}

async function loadServices() {
    const bikeId = bikeSelect.value;

    if (!bikeId) {
        serviceList.innerHTML = "<p>Select a bike to view service records.</p>";
        return;
    }

    try {
        const response = await fetch(
            `${API}/services/bike/${bikeId}?userId=${encodeURIComponent(userId)}`
        );

        const data = await response.json();

        if (!response.ok) {
            serviceList.innerHTML = `<p>${data.message}</p>`;
            return;
        }

        const total = data.services.reduce((sum, service) => {
    return sum + Number(service.amount);
}, 0);

document.getElementById("totalExpenses").textContent =
    "₹" + total.toLocaleString("en-IN");
        if (data.services.length === 0) {
            serviceList.innerHTML = "<p>No service records available.</p>";
            return;
        }

        serviceList.innerHTML = data.services.map(service => `
            <div class="service-card">
                <h3>🔧 ${service.serviceType}</h3>
                <p><strong>Service Center:</strong> ${service.serviceCenter}</p>
                <p><strong>Service Date:</strong> ${new Date(service.serviceDate).toLocaleDateString()}</p>
                <p><strong>Amount:</strong> ₹${service.amount}</p>
                <p><strong>Description:</strong> ${service.description || "N/A"}</p>
                <p><strong>Next Service:</strong> ${service.nextServiceDate ? new Date(service.nextServiceDate).toLocaleDateString() : "Not specified"}</p>

                <button type="button" onclick="editService('${service._id}')">EDIT</button>
                <button type="button" onclick="deleteService('${service._id}')" style="background:#dc2626;">DELETE</button>
            </div>
        `).join("");

    } catch (error) {
        serviceList.innerHTML = "<p>Unable to connect to server.</p>";
    }
}

async function editService(serviceId) {
    const bikeId = bikeSelect.value;

    try {
        const response = await fetch(
            `${API}/services/bike/${bikeId}?userId=${encodeURIComponent(userId)}`
        );

        const data = await response.json();

        const service = data.services.find(item => item._id === serviceId);

        if (!service) {
            alert("Service record not found");
            return;
        }

        editingServiceId = serviceId;

        document.getElementById("serviceDate").value =
            new Date(service.serviceDate).toISOString().split("T")[0];

        document.getElementById("serviceCenter").value = service.serviceCenter;
        document.getElementById("serviceType").value = service.serviceType;
        document.getElementById("amount").value = service.amount;
        document.getElementById("description").value = service.description || "";

        document.getElementById("nextServiceDate").value =
            service.nextServiceDate
                ? new Date(service.nextServiceDate).toISOString().split("T")[0]
                : "";

        submitButton.textContent = "UPDATE SERVICE";

        message.style.color = "blue";
        message.textContent = "Editing service details...";

        serviceForm.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        alert("Unable to load service details");
    }
}

async function deleteService(serviceId) {
    if (!confirm("Are you sure you want to delete this service record?")) {
        return;
    }

    try {
        const response = await fetch(`${API}/services/delete/${serviceId}`, {
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

        if (editingServiceId === serviceId) {
            resetServiceForm();
        }

        alert("Service record deleted successfully!");
        await loadServices();

    } catch (error) {
        alert("Unable to connect to server");
    }
}

function resetServiceForm() {
    serviceForm.reset();
    editingServiceId = null;
    submitButton.textContent = "ADD SERVICE";
}

bikeSelect.addEventListener("change", function() {
    if (editingServiceId !== null) {
        resetServiceForm();
        message.textContent = "";
    }

    loadServices();
});

serviceForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const bikeId = bikeSelect.value;
    const isEditing = editingServiceId !== null;

    if (!userId) {
        message.style.color = "red";
        message.textContent = "Please login first";
        return;
    }

    if (!bikeId) {
        message.style.color = "red";
        message.textContent = "Please select a bike";
        return;
    }

    const serviceData = {
        userId,
        serviceDate: document.getElementById("serviceDate").value,
        serviceCenter: document.getElementById("serviceCenter").value.trim(),
        serviceType: document.getElementById("serviceType").value,
        amount: document.getElementById("amount").value,
        description: document.getElementById("description").value.trim(),
        nextServiceDate: document.getElementById("nextServiceDate").value
    };

    const nextDate = serviceData.nextServiceDate;
    const currentDate = serviceData.serviceDate;

    if (nextDate && nextDate < currentDate) {
        message.style.color = "red";
        message.textContent = "Next service date cannot be before service date";
        return;
    }

    try {
        message.style.color = "blue";
        message.textContent = isEditing ? "Updating service..." : "Adding service record...";

        const response = await fetch(
            isEditing
                ? `${API}/services/update/${editingServiceId}`
                : `${API}/services/add`,
            {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...serviceData,
                    bikeId
                })
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
            ? "Service record updated successfully!"
            : "Service record added successfully!";

        resetServiceForm();
        bikeSelect.value = bikeId;

        await loadServices();

    } catch (error) {
        message.style.color = "red";
        message.textContent = "Unable to connect to server";
    }
});

loadBikes();
