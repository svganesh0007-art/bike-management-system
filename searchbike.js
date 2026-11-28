
const searchForm = document.getElementById("searchForm");
const message = document.getElementById("message");
const bikeResult = document.getElementById("bikeResult");

const API = "https://bike-management-system.onrender.com/api/api/bikes";

searchForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const registrationNumber = document
        .getElementById("registrationNumber")
        .value
        .trim()
        .toUpperCase();

    if (!registrationNumber) {
        message.style.color = "red";
        message.textContent = "Please enter registration number";
        return;
    }

    try {
        message.style.color = "blue";
        message.textContent = "Searching bike...";
        bikeResult.innerHTML = "";

        const response = await fetch(
            `${API}/search/${encodeURIComponent(registrationNumber)}`
        );

        const data = await response.json();

        if (!response.ok) {
            message.style.color = "red";
            message.textContent = data.message;
            bikeResult.innerHTML = "<p>No bike details available.</p>";
            return;
        }

        const bike = data.bike;

        message.style.color = "green";
        message.textContent = "Bike found successfully!";

        bikeResult.innerHTML = `
            <div class="bike-details">
                <h3>🏍️ ${bike.bikeName}</h3>
                <p><strong>Brand:</strong> ${bike.brand}</p>
                <p><strong>Model:</strong> ${bike.model}</p>
                <p><strong>Registration Number:</strong> ${bike.registrationNumber}</p>
                <p><strong>Fuel Type:</strong> ${bike.fuelType}</p>
                <p><strong>Purchase Date:</strong> ${new Date(bike.purchaseDate).toLocaleDateString()}</p>
            </div>
        `;

    } catch (error) {
        message.style.color = "red";
        message.textContent = "Unable to connect to server";
        bikeResult.innerHTML = "";
    }
});
