// Initialize Firebase
const firebaseConfig = {
    // Your Firebase configuration will go here
    // You'll need to replace this with your actual Firebase config
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global variables
let items = [];
let totalAmount = 0;

// DOM Elements
const companyForm = document.getElementById('companyForm');
const clientForm = document.getElementById('clientForm');
const itemForm = document.getElementById('itemForm');
const itemsList = document.getElementById('itemsList');
const totalAmountElement = document.getElementById('totalAmount');
const generateQuotationBtn = document.getElementById('generateQuotation');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add Item Form Submit
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addItem();
        });
    }

    // Generate Quotation Button
    if (generateQuotationBtn) {
        generateQuotationBtn.addEventListener('click', generateQuotation);
    }
});

// Function to add item
function addItem() {
    const description = document.getElementById('itemDescription').value;
    const quantity = parseFloat(document.getElementById('quantity').value);
    const rate = parseFloat(document.getElementById('rate').value);
    
    if (!description || !quantity || !rate) {
        alert('Please fill all fields');
        return;
    }
    
    const amount = quantity * rate;
    const item = { description, quantity, rate, amount };
    
    items.push(item);
    updateItemsList();
    updateTotalAmount();
    
    // Clear form
    document.getElementById('itemDescription').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('rate').value = '';
}

// Function to update items list
function updateItemsList() {
    const tbody = document.querySelector('#itemsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>₹${item.rate.toFixed(2)}</td>
            <td>₹${item.amount.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="removeItem(${index})">Remove</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to remove item
function removeItem(index) {
    items.splice(index, 1);
    updateItemsList();
    updateTotalAmount();
}

// Function to update total amount
function updateTotalAmount() {
    totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    if (totalAmountElement) {
        totalAmountElement.textContent = `₹${totalAmount.toFixed(2)}`;
    }
}

// Function to generate quotation
async function generateQuotation() {
    if (items.length === 0) {
        alert('Please add at least one item');
        return;
    }
    
    const companyName = document.getElementById('companyName').value;
    const clientName = document.getElementById('clientName').value;
    
    if (!companyName || !clientName) {
        alert('Please fill company and client details');
        return;
    }
    
    const quotationData = {
        company: {
            name: companyName,
            gst: document.getElementById('gstNumber').value,
            address: document.getElementById('companyAddress').value,
            phone: document.getElementById('companyPhone').value,
            email: document.getElementById('companyEmail').value
        },
        client: {
            name: clientName,
            phone: document.getElementById('clientPhone').value,
            address: document.getElementById('clientAddress').value,
            email: document.getElementById('clientEmail').value
        },
        items: items,
        totalAmount: totalAmount,
        date: new Date().toLocaleDateString(),
        status: 'pending'
    };
    
    try {
        // Save to Firestore
        const docRef = await db.collection('quotations').add(quotationData);
        console.log('Quotation saved with ID:', docRef.id);
        
        // Generate PDF
        generatePDF(quotationData, docRef.id);
        
        alert('Quotation generated and saved successfully!');
    } catch (error) {
        console.error('Error saving quotation:', error);
        alert('Error saving quotation. Please try again.');
    }
}

// Function to generate PDF
function generatePDF(quotationData, quotationId) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add company details
    doc.setFontSize(20);
    doc.text('QUOTATION', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('From:', 20, 40);
    doc.text(quotationData.company.name, 20, 50);
    doc.text(quotationData.company.address, 20, 60);
    doc.text(`Phone: ${quotationData.company.phone}`, 20, 70);
    doc.text(`Email: ${quotationData.company.email}`, 20, 80);
    doc.text(`GST: ${quotationData.company.gst}`, 20, 90);
    
    // Add client details
    doc.text('To:', 20, 110);
    doc.text(quotationData.client.name, 20, 120);
    doc.text(quotationData.client.address, 20, 130);
    doc.text(`Phone: ${quotationData.client.phone}`, 20, 140);
    doc.text(`Email: ${quotationData.client.email}`, 20, 150);
    
    // Add items table
    doc.autoTable({
        startY: 170,
        head: [['Description', 'Quantity', 'Rate', 'Amount']],
        body: quotationData.items.map(item => [
            item.description,
            item.quantity,
            `₹${item.rate.toFixed(2)}`,
            `₹${item.amount.toFixed(2)}`
        ]),
        foot: [['', '', 'Total:', `₹${quotationData.totalAmount.toFixed(2)}`]]
    });
    
    // Add terms and conditions
    const terms = [
        'Terms and Conditions:',
        '1. Payment is due within 30 days',
        '2. Prices are subject to change without notice',
        '3. Goods once sold will not be taken back',
        '4. Interest @ 18% p.a. will be charged on overdue payments'
    ];
    
    doc.setFontSize(10);
    terms.forEach((term, index) => {
        doc.text(term, 20, doc.autoTable.previous.finalY + 20 + (index * 10));
    });
    
    // Save the PDF
    doc.save(`Quotation_${quotationId}.pdf`);
}

// Initialize
updateTotalAmount(); 