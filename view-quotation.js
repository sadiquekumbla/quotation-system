// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM Elements
const companyName = document.getElementById('companyName');
const companyEmail = document.getElementById('companyEmail');
const companyPhone = document.getElementById('companyPhone');
const companyAddress = document.getElementById('companyAddress');
const clientName = document.getElementById('clientName');
const clientEmail = document.getElementById('clientEmail');
const clientPhone = document.getElementById('clientPhone');
const clientAddress = document.getElementById('clientAddress');
const itemsTable = document.getElementById('itemsTable').getElementsByTagName('tbody')[0];
const totalAmount = document.getElementById('totalAmount');
const downloadPDFBtn = document.getElementById('downloadPDF');

// Load quotation data
function loadQuotation() {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('id');

    if (!quotationId) {
        showError('No quotation ID provided');
        return;
    }

    const quotationRef = db.ref('quotations/' + quotationId);
    quotationRef.once('value')
        .then((snapshot) => {
            const quotation = snapshot.val();
            if (quotation) {
                displayQuotation(quotation);
            } else {
                showError('Quotation not found');
            }
        })
        .catch((error) => {
            console.error('Error loading quotation:', error);
            showError('Error loading quotation');
        });
}

// Display quotation data
function displayQuotation(quotation) {
    // Company details
    companyName.textContent = quotation.company.name;
    companyEmail.textContent = quotation.company.email;
    companyPhone.textContent = quotation.company.phone;
    companyAddress.textContent = quotation.company.address;

    // Client details
    clientName.textContent = quotation.client.name;
    clientEmail.textContent = quotation.client.email;
    clientPhone.textContent = quotation.client.phone;
    clientAddress.textContent = quotation.client.address;

    // Items
    itemsTable.innerHTML = '';
    quotation.items.forEach(item => {
        const row = itemsTable.insertRow();
        row.insertCell(0).textContent = item.description;
        row.insertCell(1).textContent = item.quantity;
        row.insertCell(2).textContent = `₹${item.rate.toFixed(2)}`;
        row.insertCell(3).textContent = `₹${item.amount.toFixed(2)}`;
    });

    // Total amount
    totalAmount.textContent = `₹${quotation.totalAmount.toFixed(2)}`;
}

// Generate PDF
function generatePDF(quotation) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add company details
    doc.setFontSize(20);
    doc.text('Quotation', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Company Details:', 20, 40);
    doc.setFontSize(10);
    doc.text(`Name: ${quotation.company.name}`, 20, 50);
    doc.text(`Email: ${quotation.company.email}`, 20, 60);
    doc.text(`Phone: ${quotation.company.phone}`, 20, 70);
    doc.text(`Address: ${quotation.company.address}`, 20, 80);

    // Add client details
    doc.setFontSize(12);
    doc.text('Client Details:', 20, 100);
    doc.setFontSize(10);
    doc.text(`Name: ${quotation.client.name}`, 20, 110);
    doc.text(`Email: ${quotation.client.email}`, 20, 120);
    doc.text(`Phone: ${quotation.client.phone}`, 20, 130);
    doc.text(`Address: ${quotation.client.address}`, 20, 140);

    // Add items table
    doc.autoTable({
        startY: 160,
        head: [['Description', 'Quantity', 'Rate', 'Amount']],
        body: quotation.items.map(item => [
            item.description,
            item.quantity,
            `₹${item.rate.toFixed(2)}`,
            `₹${item.amount.toFixed(2)}`
        ]),
        foot: [['', '', 'Total:', `₹${quotation.totalAmount.toFixed(2)}`]],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        footStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] }
    });

    // Save the PDF
    doc.save(`quotation_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger text-center';
    errorDiv.textContent = message;
    document.querySelector('.container').prepend(errorDiv);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', loadQuotation);

downloadPDFBtn.addEventListener('click', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('id');
    
    if (quotationId) {
        const quotationRef = db.ref('quotations/' + quotationId);
        quotationRef.once('value')
            .then((snapshot) => {
                const quotation = snapshot.val();
                if (quotation) {
                    generatePDF(quotation);
                } else {
                    showError('Quotation not found');
                }
            })
            .catch((error) => {
                console.error('Error generating PDF:', error);
                showError('Error generating PDF');
            });
    }
}); 