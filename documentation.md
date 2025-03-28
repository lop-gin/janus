/**
 * Documentation for Janus Manufacturing System
 * 
 * This document provides an overview of the Janus Manufacturing System,
 * including its architecture, components, and implementation details.
 */

# Janus Manufacturing System

## Overview

Janus is a comprehensive manufacturing and distribution system designed to help manufacturers manage their entire business process, from purchasing raw materials to selling finished products. The system is inspired by QuickBooks UI but enhanced with manufacturing-specific features and improvements.

## Architecture

The system is built using the following technologies:

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL database with RESTful API)
- **Authentication**: Supabase Auth

The application follows a client-server architecture where the frontend communicates with the Supabase backend via API calls.

## Components

### Frontend Components

The frontend is organized into the following main components:

1. **Pages**: Each form in the system has its own page component in the `/app` directory.
2. **Components**: Reusable UI components are stored in the `/components` directory.
3. **Lib**: Utility functions and services for interacting with the database are in the `/lib` directory.

### Database Schema

The database schema is designed to support all the functionality required by a manufacturing system, including:

- Authentication & Authorization (companies, profiles, roles, permissions)
- Inventory & Products (products, categories, units of measure, storage locations)
- Purchasing (suppliers, purchase orders, purchases, supplier credits/refunds)
- Production (production records, inputs/outputs)
- Packaging & Transport (packaging records, transport records)
- Sales (customers, invoices, sales receipts, refund receipts, credit notes)

## Forms Implementation

The system includes the following forms, each designed to match the QuickBooks UI while incorporating specific requirements for manufacturers:

### Purchase Order Form

The Purchase Order Form allows users to create and manage purchase orders for suppliers. It includes:

- Supplier information (name, email, address)
- Purchase order details (number, date, procurement representative)
- Line items with product, description, quantity, unit of measure, unit price, tax%, and amount
- Totals calculation (net, tax, gross)
- Notes/message to supplier

### Invoice Form

The Invoice Form allows users to create and manage invoices for customers. It includes:

- Customer information (name, email, billing address)
- Invoice details (number, date, terms, due date)
- Line items with product, description, quantity, unit of measure, unit price, tax%, and amount
- Totals calculation (net, tax, gross)
- Message on invoice

### Production Record Form

The Production Record Form allows users to record manufacturing production activities. It includes:

- Production details (number, date, status)
- Input materials with product, description, quantity, and unit of measure
- Output products with product, description, quantity, and unit of measure
- Notes

### Packaging Record Form

The Packaging Record Form allows users to record packaging activities for finished goods. It includes:

- Packaging details (number, date, status)
- Input materials (finished goods and packaging materials) with product, description, quantity, and unit of measure
- Output products (packaged products) with product, description, quantity, and unit of measure
- Notes

### Transport Record Form

The Transport Record Form allows users to record movement of goods between locations. It includes:

- Transport details (number, date, from location, to location, status)
- Items being transported with product, description, quantity, and unit of measure
- Notes

### Sales Receipt Form

The Sales Receipt Form allows users to record immediate sales with payment. It includes:

- Customer information (name, email, address)
- Sales receipt details (number, date, sales representative)
- Payment method and reference number
- Line items with product, description, quantity, unit of measure, unit price, tax%, and amount
- Totals calculation (net, tax, gross)
- Notes

### Refund Receipt Form

The Refund Receipt Form allows users to process refunds for customers. It includes:

- Customer information (name, email, address)
- Refund details (number, date, original sales receipt)
- Refund method and reference number
- Reason for refund
- Line items with product, description, quantity, unit of measure, unit price, tax%, and amount
- Totals calculation (net, tax, gross)
- Notes

### Credit Note Form

The Credit Note Form allows users to issue credit notes for customers. It includes:

- Customer information (name, email, address)
- Credit note details (number, date, original invoice)
- Reason for credit
- Line items with product, description, quantity, unit of measure, unit price, tax%, and amount
- Totals calculation (net, tax, gross)
- Notes

### Supplier Credit Form

The Supplier Credit Form allows users to record credits from suppliers. It includes:

- Supplier information (name, email, address)
- Credit details (number, date, original bill)
- Reason for credit
- Line items with product, description, quantity, unit of measure, unit price, tax%, and amount
- Totals calculation (net, tax, gross)
- Notes

### Supplier Refund Form

The Supplier Refund Form allows users to process refunds from suppliers. It includes:

- Supplier information (name, email, address)
- Refund details (number, date, original reference)
- Refund method and reference number
- Reason for refund
- Line items with product, description, quantity, unit of measure, unit price, tax%, and amount
- Totals calculation (net, tax, gross)
- Notes

### Estimate Form

The Estimate Form allows users to create estimates for potential customers. It includes:

- Customer information (name, email, billing address, shipping address)
- Estimate details (number, date, expiry date, sales representative)
- Line items with product, description, quantity, unit of measure, unit price, tax%, and amount
- Totals calculation (net, tax, gross)
- Notes and terms & conditions

### Receive Payment Form

The Receive Payment Form allows users to record payments received from customers. It includes:

- Customer information (name, email, address)
- Payment details (number, date, payment method, reference number)
- Deposit account
- Outstanding invoices with payment allocation
- Total payment amount
- Memo

## Database Interaction

Each form is designed to interact with the Supabase database through service files that provide CRUD operations. These services handle:

- Fetching data from the database
- Creating new records
- Updating existing records
- Deleting records
- Managing relationships between tables

## Testing

The system includes a testing environment that allows users to interact with the UI components without connecting to a database. This environment is accessible through the `/test` route and provides:

- An overview of the system
- Access to all forms with dummy data
- Testing instructions

## Future Enhancements

Planned future enhancements include:

1. Integration with the Supabase database
2. Implementation of authentication and authorization
3. Dashboard with key performance indicators
4. Reporting functionality
5. Mobile responsiveness improvements
6. Integration with other systems (e.g., shipping, accounting)

## Conclusion

The Janus Manufacturing System provides a comprehensive solution for manufacturers and distributors, with a user-friendly interface inspired by QuickBooks but enhanced with manufacturing-specific features. The system is designed to be scalable, maintainable, and adaptable to the specific needs of manufacturing businesses.
