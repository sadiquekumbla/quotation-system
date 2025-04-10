// Global variables
let items = [];
let totalAmount = 0;

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM Elements
const companyForm = document.getElementById('companyForm');
const clientForm = document.getElementById('clientForm');
const itemForm = document.getElementById('itemForm');
const itemsTable = document.getElementById('itemsTable');
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

// Function to save quotation to Firebase
async function saveToFirebase(quotationData) {
    try {
        debug('Saving quotation to Firebase', quotationData);
        const quotationsRef = db.ref('quotations');
        const newQuotationRef = quotationsRef.push();
        await newQuotationRef.set(quotationData);
        debug('Quotation saved successfully with ID:', newQuotationRef.key);
        return newQuotationRef.key; // Return the quotation ID
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        throw error;
    }
}

// Function to generate shareable link
function generateShareableLink(quotationId) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/view-quotation.html?id=${quotationId}`;
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
        // Validate forms
        if (!companyForm.checkValidity() || !clientForm.checkValidity()) {
            alert('Please fill in all required fields');
            return;
        }

        if (items.length === 0) {
            alert('Please add at least one item');
            return;
        }

        // Get company details
        const companyDetails = {
            name: document.getElementById('companyName').value,
            address: document.getElementById('companyAddress').value,
            phone: document.getElementById('companyPhone').value,
            email: document.getElementById('companyEmail').value
        };

        // Get client details
        const clientDetails = {
            name: document.getElementById('clientName').value,
            address: document.getElementById('clientAddress').value,
            phone: document.getElementById('clientPhone').value,
            email: document.getElementById('clientEmail').value
        };

        // Create quotation data
        const quotationData = {
            company: companyDetails,
            client: clientDetails,
            items: items,
            total: totalAmount,
            date: new Date().toISOString()
        };

        // Save to Firebase
        const quotationId = await saveToFirebase(quotationData);
        
        // Generate shareable link
        const shareableLink = generateShareableLink(quotationId);

        // Generate PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add company details
        doc.setFontSize(20);
        doc.text('Quotation', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`From: ${quotationData.company.name}`, 20, 40);
        doc.text(quotationData.company.address, 20, 50);
        doc.text(`Phone: ${quotationData.company.phone}`, 20, 60);
        doc.text(`Email: ${quotationData.company.email}`, 20, 70);

        // Add client details
        doc.text(`To: ${quotationData.client.name}`, 20, 90);
        doc.text(quotationData.client.address, 20, 100);
        doc.text(`Phone: ${quotationData.client.phone}`, 20, 110);
        doc.text(`Email: ${quotationData.client.email}`, 20, 120);

        // Add items table
        const tableColumn = ["Description", "Quantity", "Rate", "Amount"];
        const tableRows = items.map(item => [
            item.description,
            item.quantity.toString(),
            `₹${item.rate.toFixed(2)}`,
            `₹${item.amount.toFixed(2)}`
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 130,
            theme: 'grid'
        });

        // Add total
        const finalY = doc.lastAutoTable.finalY || 130;
        doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 20, finalY + 20);

        // Save the PDF
        doc.save(`quotation_${new Date().toISOString().split('T')[0]}.pdf`);

        // Show success message with shareable link
        alert(`Quotation generated successfully!\n\nShareable link: ${shareableLink}`);
    } catch (error) {
        console.error('Error generating quotation:', error);
        alert('Error generating quotation. Please try again.');
    }
}

// Initialize
debug('Initializing application');
updateTotalAmount(); 