import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
from quotation_system import QuotationSystem
import json
import os
from datetime import datetime

class QuotationGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Quotation System")
        self.root.geometry("1200x800")
        
        # Initialize quotation system
        self.quotation_system = QuotationSystem()
        
        # Load saved company details if exists
        self.load_company_details()
        
        # Create main notebook (tabs)
        self.notebook = ttk.Notebook(root)
        self.notebook.pack(fill='both', expand=True, padx=10, pady=5)
        
        # Create tabs
        self.company_frame = ttk.Frame(self.notebook)
        self.quotation_frame = ttk.Frame(self.notebook)
        
        self.notebook.add(self.company_frame, text="Company Details")
        self.notebook.add(self.quotation_frame, text="Create Quotation")
        
        # Setup company details tab
        self.setup_company_tab()
        
        # Setup quotation tab
        self.setup_quotation_tab()
        
        # Initialize items list
        self.items = []

    def load_company_details(self):
        try:
            if os.path.exists('company_details.json'):
                with open('company_details.json', 'r') as f:
                    details = json.load(f)
                    self.quotation_system.set_company_details(**details)
        except Exception as e:
            print(f"Error loading company details: {e}")

    def save_company_details(self):
        details = {
            'name': self.company_name.get(),
            'address': self.company_address.get(),
            'phone': self.company_phone.get(),
            'email': self.company_email.get(),
            'website': self.company_website.get(),
            'gst': self.company_gst.get()
        }
        try:
            with open('company_details.json', 'w') as f:
                json.dump(details, f)
            self.quotation_system.set_company_details(**details)
            messagebox.showinfo("Success", "Company details saved successfully!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save company details: {e}")

    def setup_company_tab(self):
        # Company Details Form
        form_frame = ttk.LabelFrame(self.company_frame, text="Company Information", padding=20)
        form_frame.pack(fill='both', expand=True, padx=10, pady=5)
        
        # Company Name
        ttk.Label(form_frame, text="Company Name:").grid(row=0, column=0, sticky='w', pady=5)
        self.company_name = ttk.Entry(form_frame, width=50)
        self.company_name.grid(row=0, column=1, pady=5)
        self.company_name.insert(0, self.quotation_system.company_name)
        
        # Company Address
        ttk.Label(form_frame, text="Address:").grid(row=1, column=0, sticky='w', pady=5)
        self.company_address = ttk.Entry(form_frame, width=50)
        self.company_address.grid(row=1, column=1, pady=5)
        self.company_address.insert(0, self.quotation_system.company_address)
        
        # Phone
        ttk.Label(form_frame, text="Phone:").grid(row=2, column=0, sticky='w', pady=5)
        self.company_phone = ttk.Entry(form_frame, width=50)
        self.company_phone.grid(row=2, column=1, pady=5)
        self.company_phone.insert(0, self.quotation_system.company_phone)
        
        # Email
        ttk.Label(form_frame, text="Email:").grid(row=3, column=0, sticky='w', pady=5)
        self.company_email = ttk.Entry(form_frame, width=50)
        self.company_email.grid(row=3, column=1, pady=5)
        self.company_email.insert(0, self.quotation_system.company_email)
        
        # Website
        ttk.Label(form_frame, text="Website:").grid(row=4, column=0, sticky='w', pady=5)
        self.company_website = ttk.Entry(form_frame, width=50)
        self.company_website.grid(row=4, column=1, pady=5)
        self.company_website.insert(0, self.quotation_system.company_website)
        
        # GST
        ttk.Label(form_frame, text="GST Number:").grid(row=5, column=0, sticky='w', pady=5)
        self.company_gst = ttk.Entry(form_frame, width=50)
        self.company_gst.grid(row=5, column=1, pady=5)
        self.company_gst.insert(0, self.quotation_system.gst_number)
        
        # Save Button
        ttk.Button(form_frame, text="Save Company Details", command=self.save_company_details).grid(row=6, column=0, columnspan=2, pady=20)

    def setup_quotation_tab(self):
        # Create main frames
        client_frame = ttk.LabelFrame(self.quotation_frame, text="Client Details", padding=20)
        client_frame.pack(fill='x', padx=10, pady=5)
        
        items_frame = ttk.LabelFrame(self.quotation_frame, text="Items", padding=20)
        items_frame.pack(fill='both', expand=True, padx=10, pady=5)
        
        # Client Details
        ttk.Label(client_frame, text="Client Name:").grid(row=0, column=0, sticky='w', pady=5)
        self.client_name = ttk.Entry(client_frame, width=50)
        self.client_name.grid(row=0, column=1, pady=5)
        
        ttk.Label(client_frame, text="Address:").grid(row=1, column=0, sticky='w', pady=5)
        self.client_address = ttk.Entry(client_frame, width=50)
        self.client_address.grid(row=1, column=1, pady=5)
        
        ttk.Label(client_frame, text="Phone:").grid(row=2, column=0, sticky='w', pady=5)
        self.client_phone = ttk.Entry(client_frame, width=50)
        self.client_phone.grid(row=2, column=1, pady=5)
        
        ttk.Label(client_frame, text="Email:").grid(row=3, column=0, sticky='w', pady=5)
        self.client_email = ttk.Entry(client_frame, width=50)
        self.client_email.grid(row=3, column=1, pady=5)
        
        # Items Section
        # Item Entry Frame
        item_entry_frame = ttk.Frame(items_frame)
        item_entry_frame.pack(fill='x', pady=5)
        
        ttk.Label(item_entry_frame, text="Description:").grid(row=0, column=0, padx=5)
        self.item_description = ttk.Entry(item_entry_frame, width=40)
        self.item_description.grid(row=0, column=1, padx=5)
        
        ttk.Label(item_entry_frame, text="Quantity:").grid(row=0, column=2, padx=5)
        self.item_quantity = ttk.Entry(item_entry_frame, width=10)
        self.item_quantity.grid(row=0, column=3, padx=5)
        
        ttk.Label(item_entry_frame, text="Rate (₹):").grid(row=0, column=4, padx=5)
        self.item_rate = ttk.Entry(item_entry_frame, width=15)
        self.item_rate.grid(row=0, column=5, padx=5)
        
        ttk.Button(item_entry_frame, text="Add Item", command=self.add_item).grid(row=0, column=6, padx=5)
        
        # Items Table
        self.items_tree = ttk.Treeview(items_frame, columns=('Description', 'Quantity', 'Rate', 'Amount'), show='headings')
        self.items_tree.heading('Description', text='Description')
        self.items_tree.heading('Quantity', text='Quantity')
        self.items_tree.heading('Rate', text='Rate (₹)')
        self.items_tree.heading('Amount', text='Amount (₹)')
        self.items_tree.pack(fill='both', expand=True, pady=5)
        
        # Remove Item Button
        ttk.Button(items_frame, text="Remove Selected Item", command=self.remove_item).pack(pady=5)
        
        # Generate Quotation Button
        ttk.Button(self.quotation_frame, text="Generate Quotation", command=self.generate_quotation).pack(pady=20)

    def add_item(self):
        try:
            description = self.item_description.get()
            quantity = int(self.item_quantity.get())
            rate = float(self.item_rate.get())
            amount = quantity * rate
            
            self.items_tree.insert('', 'end', values=(description, quantity, rate, amount))
            
            # Clear entry fields
            self.item_description.delete(0, tk.END)
            self.item_quantity.delete(0, tk.END)
            self.item_rate.delete(0, tk.END)
            
        except ValueError:
            messagebox.showerror("Error", "Please enter valid quantity and rate values")

    def remove_item(self):
        selected_item = self.items_tree.selection()
        if selected_item:
            self.items_tree.delete(selected_item)

    def generate_quotation(self):
        try:
            # Get client details
            client = {
                "name": self.client_name.get(),
                "address": self.client_address.get(),
                "phone": self.client_phone.get(),
                "email": self.client_email.get()
            }
            
            # Validate client details
            if not all(client.values()):
                messagebox.showerror("Error", "Please fill in all client details")
                return
            
            # Get items from treeview
            items = []
            for item in self.items_tree.get_children():
                values = self.items_tree.item(item)['values']
                items.append({
                    "description": values[0],
                    "quantity": values[1],
                    "rate": values[2]
                })
            
            if not items:
                messagebox.showerror("Error", "Please add at least one item")
                return
            
            # Generate quotation number
            quotation_number = f"QT{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            # Generate quotation
            output_file = self.quotation_system.generate_quotation(client, items, quotation_number)
            
            messagebox.showinfo("Success", f"Quotation generated successfully!\nSaved as: {output_file}")
            
            # Clear form
            self.clear_form()
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate quotation: {e}")

    def clear_form(self):
        # Clear client details
        self.client_name.delete(0, tk.END)
        self.client_address.delete(0, tk.END)
        self.client_phone.delete(0, tk.END)
        self.client_email.delete(0, tk.END)
        
        # Clear items
        for item in self.items_tree.get_children():
            self.items_tree.delete(item)

if __name__ == "__main__":
    root = tk.Tk()
    app = QuotationGUI(root)
    root.mainloop() 