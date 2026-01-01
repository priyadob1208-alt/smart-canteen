import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCBeagTIJdFAjF5nX1wyFVgopiTUlBYR1U",
  authDomain: "smart-canteen-2568a.firebaseapp.com",
  projectId: "smart-canteen-2568a",
  storageBucket: "smart-canteen-2568a.firebasestorage.app",
  messagingSenderId: "1020397991620",
  appId: "1:1020397991620:web:0cdc26edca7e9dbcb77b91"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log(" Firebase & Firestore connected");

// Form submission
const form = document.getElementById("orderForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const item = document.getElementById("item").value;
  const quantity = Number(document.getElementById("quantity").value);
  const pickupTime = document.getElementById("pickupTime").value;
  const paymentMode = document.getElementById("paymentMode").value;

  // Auto Order ID
  const orderId = 'ORD-' + Date.now();

  try {
    // Save to Firestore
    await addDoc(collection(db, "orders"), {
      orderId,
      item,
      quantity,
      pickupTime,
      paymentMode,
      status: "Pre-Ordered",
      createdAt: new Date()
    });

    alert(` Order ${orderId} placed successfully!`);
    form.reset();

    // Generate PDF bill
    generatePDF(orderId, item, quantity, pickupTime, paymentMode);

  } catch (error) {
    console.error(" Error saving order:", error);
    alert("Error placing order!");
  }
});

// Real-time Orders List & Status Update
const ordersList = document.getElementById("ordersList");
const ordersCollection = collection(db, "orders");

onSnapshot(ordersCollection, (snapshot) => {
  ordersList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const order = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${order.orderId}</strong> - ${order.item} x ${order.quantity}, Pickup: ${order.pickupTime}, Payment: ${order.paymentMode}, Status: ${order.status}
      <button id="update-${docSnap.id}">Mark Ready</button>
    `;
    ordersList.appendChild(li);

    document.getElementById(`update-${docSnap.id}`).addEventListener("click", async () => {
      const docRef = doc(db, "orders", docSnap.id);
      await updateDoc(docRef, { status: "Ready for Pickup" });
      alert(` Order ${order.orderId} marked as Ready`);
    });
  });
});

// PDF Bill generation
function generatePDF(orderId, item, quantity, pickupTime, paymentMode) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Smart Canteen - Order Bill", 20, 20);
  doc.setFontSize(12);
  doc.text(`Order ID: ${orderId}`, 20, 40);
  doc.text(`Item: ${item}`, 20, 50);
  doc.text(`Quantity: ${quantity}`, 20, 60);
  doc.text(`Pickup Time: ${pickupTime}`, 20, 70);
  doc.text(`Payment Mode: ${paymentMode}`, 20, 80);
  doc.text(`Status: Pre-Ordered`, 20, 90);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 100);

  doc.save(`${orderId}_Bill.pdf`);
}
