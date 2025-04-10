from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from datetime import datetime
import os

class QuotationSystem:
    def __init__(self):
        self.company_name = "Your Company Name"
        self.company_address = "Your Company Address"
        self.company_phone = "Your Phone Number"
        self.company_email = "your.email@example.com"
        self.company_website = "www.yourcompany.com"
        self.gst_number = "Your GST Number"
        
    def set_company_details(self, name, address, phone, email, website, gst):
        """Set company details for the quotation"""
        self.company_name = name
        self.company_address = address
        self.company_phone = phone
        self.company_email = email
        self.company_website = website
        self.gst_number = gst

    def generate_quotation(self, client_details, items, quotation_number, output_path="quotations"):
        """
        Generate a quotation PDF
        
        Args:
            client_details (dict): Dictionary containing client information
            items (list): List of dictionaries containing item details
            quotation_number (str): Unique quotation number
            output_path (str): Directory to save the quotation
        """
        # Create output directory if it doesn't exist
        if not os.path.exists(output_path):
            os.makedirs(output_path)

        # Create the PDF document
        filename = f"{output_path}/Quotation_{quotation_number}_{datetime.now().strftime('%Y%m%d')}.pdf"
        doc = SimpleDocTemplate(filename, pagesize=letter)
        styles = getSampleStyleSheet()
        
        # Create custom styles
        styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30
        ))
        
        # Build the document content
        content = []
        
        # Add company header
        content.append(Paragraph(self.company_name, styles['CustomTitle']))
        content.append(Paragraph(self.company_address, styles['Normal']))
        content.append(Paragraph(f"Phone: {self.company_phone}", styles['Normal']))
        content.append(Paragraph(f"Email: {self.company_email}", styles['Normal']))
        content.append(Paragraph(f"Website: {self.company_website}", styles['Normal']))
        content.append(Paragraph(f"GST: {self.gst_number}", styles['Normal']))
        content.append(Spacer(1, 20))
        
        # Add quotation details
        content.append(Paragraph(f"QUOTATION", styles['Heading1']))
        content.append(Paragraph(f"Quotation No: {quotation_number}", styles['Normal']))
        content.append(Paragraph(f"Date: {datetime.now().strftime('%d-%m-%Y')}", styles['Normal']))
        content.append(Spacer(1, 20))
        
        # Add client details
        content.append(Paragraph("Client Details:", styles['Heading2']))
        content.append(Paragraph(f"Name: {client_details['name']}", styles['Normal']))
        content.append(Paragraph(f"Address: {client_details['address']}", styles['Normal']))
        content.append(Paragraph(f"Phone: {client_details['phone']}", styles['Normal']))
        content.append(Paragraph(f"Email: {client_details['email']}", styles['Normal']))
        content.append(Spacer(1, 20))
        
        # Add items table
        table_data = [['Sr No', 'Description', 'Quantity', 'Rate', 'Amount']]
        total_amount = 0
        
        for idx, item in enumerate(items, 1):
            # Convert quantity and rate to float/int
            quantity = float(item['quantity'])
            rate = float(item['rate'])
            amount = quantity * rate
            total_amount += amount
            
            table_data.append([
                str(idx),
                str(item['description']),
                str(quantity),
                f"₹{rate:,.2f}",
                f"₹{amount:,.2f}"
            ])
        
        # Add total row
        table_data.append(['', '', '', 'Total:', f"₹{total_amount:,.2f}"])
        
        # Create and style the table
        table = Table(table_data, colWidths=[0.5*inch, 3*inch, 0.75*inch, 1*inch, 1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, -1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.black),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        content.append(table)
        content.append(Spacer(1, 20))
        
        # Add terms and conditions
        content.append(Paragraph("Terms and Conditions:", styles['Heading2']))
        terms = [
            "1. This quotation is valid for 30 days from the date of issue.",
            "2. Payment terms: 50% advance, 50% upon completion.",
            "3. GST will be charged as applicable.",
            "4. Delivery timeline will be confirmed upon order confirmation.",
            "5. Any additional requirements will be charged extra."
        ]
        for term in terms:
            content.append(Paragraph(term, styles['Normal']))
        
        # Build the PDF
        doc.build(content)
        return filename

# Example usage
if __name__ == "__main__":
    # Initialize the quotation system
    quotation_system = QuotationSystem()
    
    # Set company details
    quotation_system.set_company_details(
        name="ABC Technologies",
        address="123 Business Street, City, State - 123456",
        phone="+91 1234567890",
        email="info@abctech.com",
        website="www.abctech.com",
        gst="GSTIN123456789"
    )
    
    # Client details
    client = {
        "name": "XYZ Corporation",
        "address": "456 Corporate Avenue, City, State - 789012",
        "phone": "+91 9876543210",
        "email": "contact@xyzcorp.com"
    }
    
    # Items for quotation
    items = [
        {
            "description": "Web Development Services",
            "quantity": 1,
            "rate": 50000
        },
        {
            "description": "Mobile App Development",
            "quantity": 1,
            "rate": 75000
        },
        {
            "description": "UI/UX Design",
            "quantity": 1,
            "rate": 25000
        }
    ]
    
    # Generate quotation
    quotation_number = "QT2024001"
    output_file = quotation_system.generate_quotation(client, items, quotation_number)
    print(f"Quotation generated successfully: {output_file}") 