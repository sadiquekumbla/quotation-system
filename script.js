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

// Debug function
function debug(message, data = null) {
    console.log(`[Debug] ${message}`, data || '');
}

// Error handling function
function showError(message) {
    alert(`Error: ${message}`);
    console.error(`[Error] ${message}`);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    debug('DOM Content Loaded');
    
    // Add Item Form Submit
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        debug('Add Item button found');
        addItemBtn.addEventListener('click', function(e) {
            e.preventDefault();
            debug('Add Item button clicked');
            addItem();
        });
    } else {
        showError('Add Item button not found in the DOM');
    }

    // Generate Quotation Button
    if (generateQuotationBtn) {
        debug('Generate Quotation button found');
        generateQuotationBtn.addEventListener('click', generateQuotation);
    } else {
        showError('Generate Quotation button not found in the DOM');
    }
});

// Function to add item
function addItem() {
    try {
        debug('Adding new item');
        
        const description = document.getElementById('itemDescription');
        const quantity = document.getElementById('quantity');
        const rate = document.getElementById('rate');
        
        if (!description || !quantity || !rate) {
            showError('Required form fields not found');
            return;
        }
        
        const descriptionValue = description.value.trim();
        const quantityValue = parseFloat(quantity.value);
        const rateValue = parseFloat(rate.value);
        
        debug('Form values:', { description: descriptionValue, quantity: quantityValue, rate: rateValue });
        
        if (!descriptionValue) {
            showError('Please enter an item description');
            return;
        }
        
        if (isNaN(quantityValue) || quantityValue <= 0) {
            showError('Please enter a valid quantity');
            return;
        }
        
        if (isNaN(rateValue) || rateValue <= 0) {
            showError('Please enter a valid rate');
            return;
        }
        
        const amount = quantityValue * rateValue;
        const item = { 
            description: descriptionValue, 
            quantity: quantityValue, 
            rate: rateValue, 
            amount: amount 
        };
        
        debug('New item created:', item);
        
        items.push(item);
        updateItemsList();
        updateTotalAmount();
        
        // Clear form
        description.value = '';
        quantity.value = '';
        rate.value = '';
        
        debug('Item added successfully');
    } catch (error) {
        showError(`Error adding item: ${error.message}`);
    }
}

// Function to update items list
function updateItemsList() {
    try {
        debug('Updating items list');
        const tbody = document.querySelector('#itemsTable tbody');
        if (!tbody) {
            showError('Items table body not found');
            return;
        }
        
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
        
        debug('Items list updated', items);
    } catch (error) {
        showError(`Error updating items list: ${error.message}`);
    }
}

// Function to remove item
function removeItem(index) {
    try {
        debug('Removing item at index:', index);
        items.splice(index, 1);
        updateItemsList();
        updateTotalAmount();
        debug('Item removed successfully');
    } catch (error) {
        showError(`Error removing item: ${error.message}`);
    }
}

// Function to update total amount
function updateTotalAmount() {
    try {
        debug('Updating total amount');
        totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
        if (totalAmountElement) {
            totalAmountElement.textContent = `₹${totalAmount.toFixed(2)}`;
            debug('Total amount updated:', totalAmount);
        } else {
            showError('Total amount element not found');
        }
    } catch (error) {
        showError(`Error updating total amount: ${error.message}`);
    }
}

// Function to generate quotation
async function generateQuotation() {
    try {
        debug('Generating quotation');
        
        if (items.length === 0) {
            showError('Please add at least one item');
            return;
        }
        
        const companyName = document.getElementById('companyName').value;
        const clientName = document.getElementById('clientName').value;
        
        if (!companyName || !clientName) {
            showError('Please fill company and client details');
            return;
        }
        
        const quotationData = {
            company: {
                name: companyName,
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
        
        debug('Quotation data prepared:', quotationData);
        
        try {
            // Save to Firestore
            const docRef = await db.collection('quotations').add(quotationData);
            debug('Quotation saved with ID:', docRef.id);
            
            // Generate PDF
            generatePDF(quotationData, docRef.id);
            
            alert('Quotation generated and saved successfully!');
        } catch (error) {
            showError(`Error saving quotation: ${error.message}`);
        }
    } catch (error) {
        showError(`Error generating quotation: ${error.message}`);
    }
}

// Function to generate PDF
function generatePDF(quotationData, quotationId) {
    try {
        debug('Generating PDF');
        
        // Create new jsPDF instance
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
        debug('PDF generated successfully');
    } catch (error) {
        showError(`Error generating PDF: ${error.message}`);
    }
}

// Initialize
debug('Initializing application');
updateTotalAmount(); 