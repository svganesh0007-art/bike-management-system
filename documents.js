
const documentForm = document.getElementById("documentForm");
const bikeSelect = document.getElementById("bikeId");
const documentList = document.getElementById("documentList");
const message = document.getElementById("message");
const fileInput = document.getElementById("documentFile");

const API = "http://https://bike-management-system.onrender.com/api/api";
const userId = sessionStorage.getItem("userId");

let editingDocumentId = null;

const submitButton = documentForm.querySelector("button[type='submit']");

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

async function loadDocuments() {
    const bikeId = bikeSelect.value;

    if (!bikeId) {
        documentList.innerHTML = "<p>Select a bike to view its documents.</p>";
        return;
    }

    try {
        const response = await fetch(
            `${API}/documents/bike/${bikeId}?userId=${encodeURIComponent(userId)}`
        );

        const data = await response.json();

        if (!response.ok) {
            documentList.innerHTML = `<p>${data.message}</p>`;
            return;
        }

        if (data.documents.length === 0) {
            documentList.innerHTML = "<p>No documents added yet.</p>";
            return;
        }

        documentList.innerHTML = data.documents.map(doc => {
            let statusClass = "valid";

            if (doc.status === "Expired") {
                statusClass = "expired";
            } else if (doc.status === "Expiring Soon") {
                statusClass = "expiring";
            }

            const fileLink = doc.fileUrl
                ? `<a href="http://https://bike-management-system.onrender.com/api${doc.fileUrl}" target="_blank" rel="noopener">VIEW DOCUMENT</a>`
                : "<p>No file uploaded</p>";

            return `
                <div class="document-card">
                    <h3>📄 ${doc.documentType}</h3>
                    <p><strong>Document Number:</strong> ${doc.documentNumber}</p>
                    <p><strong>Issue Date:</strong> ${new Date(doc.issueDate).toLocaleDateString()}</p>
                    <p><strong>Expiry Date:</strong> ${new Date(doc.expiryDate).toLocaleDateString()}</p>
                    <span class="status ${statusClass}">${doc.status}</span>
                    <p><strong>Days Left:</strong> ${doc.daysLeft < 0 ? "Expired" : doc.daysLeft}</p>
                    ${fileLink}

                    <div class="document-actions">
                        <button type="button" onclick="editDocument('${doc._id}')">EDIT</button>
                        <button type="button" onclick="deleteDocument('${doc._id}')">DELETE</button>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        documentList.innerHTML = "<p>Unable to connect to server.</p>";
    }
}

async function editDocument(documentId) {
    const bikeId = bikeSelect.value;

    try {
        const response = await fetch(
            `${API}/documents/bike/${bikeId}?userId=${encodeURIComponent(userId)}`
        );

        const data = await response.json();

        const doc = data.documents.find(item => item._id === documentId);

        if (!doc) {
            alert("Document not found");
            return;
        }

        editingDocumentId = documentId;

        document.getElementById("documentType").value = doc.documentType;
        document.getElementById("documentNumber").value = doc.documentNumber;
        document.getElementById("issueDate").value = new Date(doc.issueDate).toISOString().split("T")[0];
        document.getElementById("expiryDate").value = new Date(doc.expiryDate).toISOString().split("T")[0];

        fileInput.value = "";
        fileInput.required = false;

        submitButton.textContent = "UPDATE DOCUMENT";

        message.style.color = "blue";
        message.textContent = "Editing document details. Upload a new file only if you want to replace the existing one.";

        documentForm.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        alert("Unable to load document details");
    }
}

async function deleteDocument(documentId) {
    if (!confirm("Are you sure you want to delete this document?")) {
        return;
    }

    try {
        const response = await fetch(`${API}/documents/delete/${documentId}`, {
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

        if (editingDocumentId === documentId) {
            resetDocumentForm();
        }

        alert("Document deleted successfully!");
        await loadDocuments();

    } catch (error) {
        alert("Unable to connect to server");
    }
}

function resetDocumentForm() {
    documentForm.reset();
    editingDocumentId = null;
    fileInput.required = true;
    submitButton.textContent = "UPLOAD DOCUMENT";
}

bikeSelect.addEventListener("change", function() {
    if (editingDocumentId !== null) {
        resetDocumentForm();
        message.textContent = "";
    }

    loadDocuments();
});

documentForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const bikeId = bikeSelect.value;
    const selectedFile = fileInput.files[0];
    const isEditing = editingDocumentId !== null;

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

    if (!isEditing && !selectedFile) {
        message.style.color = "red";
        message.textContent = "Please select a document file";
        return;
    }

    if (selectedFile) {
        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png"
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            message.style.color = "red";
            message.textContent = "Only PDF, JPG and PNG files are allowed";
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            message.style.color = "red";
            message.textContent = "File size must be below 5 MB";
            return;
        }
    }

    const issueDate = document.getElementById("issueDate").value;
    const expiryDate = document.getElementById("expiryDate").value;

    if (expiryDate < issueDate) {
        message.style.color = "red";
        message.textContent = "Expiry date cannot be before issue date";
        return;
    }

    const formData = new FormData();

    formData.append("userId", userId);
    formData.append("documentType", document.getElementById("documentType").value);
    formData.append("documentNumber", document.getElementById("documentNumber").value.trim());
    formData.append("issueDate", issueDate);
    formData.append("expiryDate", expiryDate);

    if (!isEditing) {
        formData.append("bikeId", bikeId);
    }

    if (selectedFile) {
        formData.append("documentFile", selectedFile);
    }

    try {
        message.style.color = "blue";
        message.textContent = isEditing ? "Updating document..." : "Uploading document...";

        const response = await fetch(
            isEditing
                ? `${API}/documents/update/${editingDocumentId}`
                : `${API}/documents/add`,
            {
                method: isEditing ? "PUT" : "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.style.color = "red";
            message.textContent = data.message || "Document operation failed";
            return;
        }

        message.style.color = "green";
        message.textContent = isEditing
            ? "Document updated successfully!"
            : "Document uploaded successfully!";

        resetDocumentForm();
        bikeSelect.value = bikeId;

        await loadDocuments();

    } catch (error) {
        message.style.color = "red";
        message.textContent = "Unable to connect to server";
    }
});

loadBikes();
