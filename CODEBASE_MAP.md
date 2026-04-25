
# Codebase Map

## Project Overview

This is a complete website for a consortium company with both public-facing and admin components. The frontend is built with vanilla HTML/CSS/JavaScript while the backend uses PHP with a MySQL database.

## File Structure

### Main Public Pages
- **index.html** - Main landing page with all public facing content
- **analise-credito.html** - Credit analysis request page
- **style.css** - Main stylesheet for public pages

### Assets Directory
- **assets/css/**
  - **style.css** - Shared admin/frontend styles
  - **analise-credito.css** - Credit analysis page styles
  - **dashboard.css** - Admin dashboard styles
  - **admin.css** - Admin panel component styles

- **assets/js/**
  - **main.js** - Calendar and scheduling system
  - **calendar-border.js** - Calendar UI enhancements
  - **analise-credito.js** - Credit analysis functionality
  - **dashboard-admin.js** - Admin dashboard functionality
  - **rank-admin.js** - Employee ranking functionality
  - **register-admin.js** - Employee registration functionality

### API Layer (PHP Backend)
- **api/appointments.php** - Appointment CRUD operations and blocked slots
- **api/auth.php** - Authentication system
- **api/contacts.php** - Contact form submissions
- **api/credit-analysis.php** - Credit analysis CRUD operations
- **api/employees.php** - Employee management
- **api/stats.php** - Dashboard statistics
- **api/teste.php** - Testing endpoint

### Admin Panel
- **ham_admin/dashboard.php** - Admin dashboard main page
- **ham_admin/home.php** - Admin home page
- **ham_admin/index.php** - Admin login page
- **ham_admin/logout.php** - Admin logout handler
- **ham_admin/register.php** - Employee registration page
- **ham_admin/partials/header.php** - Admin header component
- **ham_admin/partials/sidebar.php** - Admin sidebar component

### Configuration and Data
- **config/database.php** - Database configuration
- **data/mock_clients.json** - Mock client data
- **sql.sql** - Database schema

### Assets and Media
- **images/** - All image assets (logo, backgrounds, etc.)
- **public/** - Publicly accessible assets
- **favicon.ico** - Site favicon

## Dependencies

### Frontend Dependencies
1. **DOM Elements**
   - Calendar system depends on specific HTML structure
   - Form elements for credit analysis
   - Appointment scheduling widgets

2. **CSS Classes**
   - Animation classes for scroll effects
   - Component-specific styling classes
   - Responsive utility classes

3. **JavaScript Libraries**
   - Vanilla JavaScript (no external libraries)
   - Fetch API for backend communication

### Backend Dependencies
1. **PHP Extensions**
   - MySQLi or PDO for database operations
   - JSON support for API responses
   - File upload handling

2. **Database**
   - MySQL database with specific schema (sql.sql)
   - Tables for appointments, employees, credit analysis, etc.

3. **File System**
   - Upload directory for credit analysis documents
   - Read/write permissions for data files

## Functionality Breakdown

### Public Website (index.html)
1. **Navigation**
   - Responsive navbar with mobile menu
   - Smooth scrolling to sections

2. **Hero Section**
   - Auto-rotating background slides
   - Animated text elements
   - Call-to-action buttons

3. **Content Sections**
   - Consortium types carousel
   - Benefits listing
   - How it works steps
   - Trust statistics
   - Testimonials with pagination
   - FAQ accordion
   - Contact information

4. **Scheduling System**
   - Calendar date selection
   - Time slot selection with blocked indicators
   - Personal information form
   - Appointment submission

### Credit Analysis System (analise-credito.html)
1. **Document Upload**
   - Multiple file upload fields
   - Preview for uploaded files
   - "Don't have" toggle for missing documents

2. **Form Processing**
   - Client-side validation
   - Phone number formatting
   - File type/size validation
   - Submission to backend API

## File Relationships

### Core Website Files
1. **index.html** ↔ **style.css** ↔ **script.js**
   - Main landing page with all JavaScript functionality

2. **analise-credito.html** ↔ **assets/css/analise-credito.css** ↔ **assets/js/analise-credito.js**
   - Credit analysis system with document upload

3. **assets/js/main.js** ↔ **api/appointments.php**
   - Calendar system with blocked time slots integration

### Admin Panel Files
1. **ham_admin/dashboard.php** ↔ **assets/css/dashboard.css** ↔ **assets/js/dashboard-admin.js**
   - Dashboard with statistics and appointment management

2. **ham_admin/register.php** ↔ **assets/js/register-admin.js**
   - Employee registration with form validation

3. **All admin files** ↔ **assets/css/admin.css**
   - Shared styling for admin components

### API Integration
1. **All frontend JavaScript files** → **api/*.php**
   - REST API calls for data operations

2. **api/*.php** ↔ **config/database.php**
   - Database connection and queries

3. **api/credit-analysis.php** ↔ **uploads/**
   - File upload/download operations
