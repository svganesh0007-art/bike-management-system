
const expenseForm = document.getElementById("expenseForm");
const bikeSelect = document.getElementById("bikeId");
const expenseList = document.getElementById("expenseList");
const message = document.getElementById("message");

const API = "http://https://bike-management-system.onrender.com/api/api";
const userId = sessionStorage.getItem("userId");

let editingExpenseId = null;

const submitButton = expenseForm.querySelector("button[type='submit']");

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

async function loadExpenses() {
    const bikeId = bikeSelect.value;

    if (!bikeId) {
        expenseList.innerHTML = "<p>Select a bike to view expenses.</p>";
        document.getElementById("totalExpenses").textContent = "₹0";
        return;
    }

    try {
        const response = await fetch(
            `${API}/expenses/bike/${bikeId}?userId=${encodeURIComponent(userId)}`
        );

        const data = await response.json();

        if (!response.ok) {
            expenseList.innerHTML = `<p>${data.message}</p>`;
            return;
        }

        const expenses = data.expenses || [];

        const total = expenses.reduce((sum, expense) => {
            return sum + Number(expense.amount);
        }, 0);

        document.getElementById("totalExpenses").textContent =
            "₹" + total.toLocaleString("en-IN");

        if (expenses.length === 0) {
            expenseList.innerHTML = "<p>No expense records available.</p>";
            return;
        }

        expenseList.innerHTML = expenses.map(expense => `
            <div class="expense-card">
                <h3>💰 ${expense.category}</h3>
                <p><strong>Date:</strong> ${new Date(expense.expenseDate).toLocaleDateString()}</p>
                <p><strong>Amount:</strong> ₹${Number(expense.amount).toLocaleString("en-IN")}</p>
                <p><strong>Description:</strong> ${expense.description || "N/A"}</p>

                <button type="button" onclick="editExpense('${expense._id}')">EDIT</button>
                <button type="button" class="delete-btn" onclick="deleteExpense('${expense._id}')">DELETE</button>
            </div>
        `).join("");

    } catch (error) {
        expenseList.innerHTML = "<p>Unable to connect to server.</p>";
    }
}

async function editExpense(expenseId) {
    try {
        const bikeId = bikeSelect.value;

        const response = await fetch(
            `${API}/expenses/bike/${bikeId}?userId=${encodeURIComponent(userId)}`
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        const expense = data.expenses.find(item => item._id === expenseId);

        if (!expense) {
            alert("Expense not found");
            return;
        }

        editingExpenseId = expenseId;

        document.getElementById("expenseDate").value =
            new Date(expense.expenseDate).toISOString().split("T")[0];

        document.getElementById("category").value = expense.category;
        document.getElementById("amount").value = expense.amount;
        document.getElementById("description").value = expense.description || "";

        submitButton.textContent = "UPDATE EXPENSE";

        message.style.color = "blue";
        message.textContent = "Editing expense details...";

        expenseForm.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        alert("Unable to load expense details");
    }
}

async function deleteExpense(expenseId) {
    if (!confirm("Are you sure you want to delete this expense?")) {
        return;
    }

    try {
        const response = await fetch(`${API}/expenses/delete/${expenseId}`, {
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

        if (editingExpenseId === expenseId) {
            resetExpenseForm();
        }

        alert("Expense deleted successfully!");
        await loadExpenses();

    } catch (error) {
        alert("Unable to connect to server");
    }
}

function resetExpenseForm() {
    expenseForm.reset();
    editingExpenseId = null;
    submitButton.textContent = "ADD EXPENSE";
}

bikeSelect.addEventListener("change", function() {
    if (editingExpenseId !== null) {
        resetExpenseForm();
        message.textContent = "";
    }

    loadExpenses();
});

expenseForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const bikeId = bikeSelect.value;
    const isEditing = editingExpenseId !== null;

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

    const expenseData = {
        userId,
        bikeId,
        expenseDate: document.getElementById("expenseDate").value,
        category: document.getElementById("category").value,
        amount: document.getElementById("amount").value,
        description: document.getElementById("description").value.trim()
    };

    try {
        message.style.color = "blue";
        message.textContent = isEditing ? "Updating expense..." : "Adding expense...";

        const response = await fetch(
            isEditing
                ? `${API}/expenses/update/${editingExpenseId}`
                : `${API}/expenses/add`,
            {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(expenseData)
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
            ? "Expense updated successfully!"
            : "Expense added successfully!";

        resetExpenseForm();
        bikeSelect.value = bikeId;

        await loadExpenses();

    } catch (error) {
        message.style.color = "red";
        message.textContent = "Unable to connect to server";
    }
});

loadBikes();
