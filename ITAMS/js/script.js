// Base URL of your backend API
const API_BASE = "http://127.0.0.1:8000";

// --- Fetch and Display Assets ---
async function getAssets() {
  try {
    const response = await fetch(`${API_BASE}/assets`);
    if (!response.ok) throw new Error("Failed to fetch assets");
    const assets = await response.json();
    displayAssets(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    alert("Could not load assets. Check backend connection.");
  }
}

// --- Display Assets in Table ---
function displayAssets(assets) {
  const tableBody = document.querySelector("#assetTable tbody");
  if (!tableBody) return;
  
  tableBody.innerHTML = assets
    .map(
      (a) => `
      <tr>
        <td>${a.id}</td>
        <td>${a.type}</td>
        <td>${a.brand}</td>
        <td>${a.model}</td>
        <td>${a.serial}</td>
        <td>${a.purchase_date}</td>
        <td>${a.cost}</td>
        <td>${a.warranty_status}</td>
        <td>${a.status}</td>
        <td>${a.assignee || "-"}</td>
      </tr>
    `
    )
    .join("");
}


// --- Add New Asset ---
async function addAsset(event) {
  event.preventDefault();

  // Collect input values from form
  const newAsset = {
    id: `IT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, // Auto-generate ID
    type: document.getElementById("assetType").value,
    brand: document.getElementById("assetBrand").value,
    model: document.getElementById("assetModel").value,
    serial: document.getElementById("assetSerial").value,
    purchaseDate: document.getElementById("assetPurchaseDate").value,
    cost: parseFloat(document.getElementById("assetCost").value),
    warrantyStatus: "Active", // you can change this later
    status: document.getElementById("assetStatus").value,
    assignee: null
  };

  try {
    // Send POST request to backend
    const response = await fetch(`${API_BASE}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAsset)
    });

    if (!response.ok) throw new Error("Failed to add asset");

    alert("✅ Asset added successfully!");
    getAssets(); // Refresh asset table

    // Optionally clear the form
    event.target.reset();

  } catch (error) {
    console.error("Error adding asset:", error);
    alert("❌ Could not add asset. Check backend connection or data format.");
  }
}


// --- Delete Asset ---
async function deleteAsset(id) {
  if (!confirm("Are you sure you want to delete this asset?")) return;

  try {
    const response = await fetch(`${API_BASE}/assets/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete asset");
    alert("Asset deleted successfully!");
    getAssets();
  } catch (error) {
    console.error("Error deleting asset:", error);
  }
}

// --- Initialize on Page Load ---
document.addEventListener("DOMContentLoaded", () => {
  getAssets();
  const form = document.getElementById("addAssetForm");
  if (form) form.addEventListener("submit", addAsset);
});
