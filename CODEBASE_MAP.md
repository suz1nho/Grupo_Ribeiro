
# Grupo Ribeiro Codebase Map

## Overview
This is a comprehensive map of the Grupo Ribeiro website codebase, showing all files, their dependencies, and how they interact with each other.

## File Structure

### Root Files
- `index.html` - Main landing page
- `analise-credito.html` - Credit analysis form page
- `script.js` - Main JavaScript with data and functionality
- `style.css` - Main stylesheet
- `sql.sql` - Database schema

### API Directory (`api/`)
- `appointments.php` - Appointment management API
- `auth.php` - Authentication API
- `contacts.php` - Contact form API
- `credit-analysis.php` - Credit analysis API
- `employees.php` - Employee management API
- `stats.php` - Statistics API
- `teste.php` - Test file

### Configuration (`config/`)
- `database.php` - Database connection and configuration

### Admin Panel (`ham_admin/`)
- `dashboard.php` - Main admin dashboard
- `home.php` - Admin home page
- `index.php` - Admin login page
- `logout.php` - Admin logout
- `register.php` - Employee registration
- `partials/`
  - `header.php` - Admin header
  - `sidebar.php` - Admin sidebar

### Assets
#### CSS (`assets/css/`)
- `admin.css` - Admin panel styles
- `analise-credito.css` - Credit analysis form styles
- `dashboard.css` - Dashboard styles
- `style.css` - General styles

#### JavaScript (`assets/js/`)
- `analise-credito.js` - Credit analysis form JavaScript
- `calendar-border.js` - Calendar functionality
- `dashboard-admin.js` - Admin dashboard JavaScript
- `main.js` - Main site JavaScript
- `rank-admin.js` - Admin ranking functionality
- `register-admin.js` - Admin registration JavaScrip

## Dependencies and Interactions

### Frontend (Client-side)

#### Main Landing Page (`index.html`)
**Dependencies:**
- `style.css` - Main styling
- `script.js` - Dynamic content and data
- `assets/js/main.js` - Additional functionality
- `assets/js/calendar-border.js` - Calendar functionality
- Various images from `images/` directory

**Interactions:**
- Connects to `api/appointments.php` for appointment scheduling
- Uses data from `script.js` for dynamic content
- Links to `analise-credito.html` for credit analysis

#### Credit Analysis Page (`analise-credito.html`)
**Dependencies:**
- `assets/css/style.css` - General styling
- `assets/css/analise-credito.css` - Specific styling
- `assets/js/analise-credito.js` - Form functionality

**Interactions:**
- Connects to `api/credit-analysis.php` for form submission
- Uploads files to `uploads/credit-analysis/` directory

#### Main JavaScript (`script.js`)
**Dependencies:**
- None (self-contained data and functions)

**Provides Data To:**
- `index.html` - Dynamic content for:
  - Brands ticker
  - Carousel slides
  - Benefits section
  - Steps section
  - Trust statistics
  - Testimonials
  - FAQ section

### Backend (Server-side)

#### Database Configuration (`config/database.php`)
**Used By:**
- `api/appointments.php`
- `api/auth.php`
- `api/contacts.php`
- `api/credit-analysis.php`
- `api/employees.php`
- `api/stats.php`
- All admin panel files (`ham_admin/*.php`)

#### API Files

##### Appointments API (`api/appointments.php`)
**Dependencies:**
- `config/database.php`

**Database Tables Used:**
- `appointments`

**Provides Endpoints For:**
- GET - Retrieve appointments
- POST - Create new appointments
- PUT - Update appointment status
- DELETE - Delete appointments

**Used By:**
- `index.html` - Appointment scheduling
- Admin panel - Appointment management

##### Credit Analysis API (`api/credit-analysis.php`)
**Dependencies:**
- `config/database.php`

**Database Tables Used:**
- `credit_analysis`
- `employees`

**Provides Endpoints For:**
- GET - Retrieve credit analyses
- POST - Create new credit analysis
- PUT - Update credit analysis status
- DELETE - Delete credit analysis

**Used By:**
- `analise-credito.html` - Form submission
- Admin panel - Credit analysis management

#### Admin Panel (`ham_admin/`)

##### Dashboard (`ham_admin/dashboard.php`)
**Dependencies:**
- `config/database.php`
- `ham_admin/partials/header.php`
- `ham_admin/partials/sidebar.php`
- `assets/css/dashboard.css`
- `assets/js/dashboard-admin.js`

**Database Tables Used:**
- `appointments`
- `credit_analysis`
- `employees`

**Interactions:**
- Retrieves appointment statistics
- Manages appointment statuses
- Manages credit analysis statuses
- Connects to `api/credit-analysis.php` for employee data

##### Authentication (`ham_admin/index.php`)
**Dependencies:**
- `config/database.php`

**Database Tables Used:**
- `employees`

**Interactions:**
- Authenticates employees
- Creates user sessions

### Database Schema (`sql.sql`)

#### Tables:
1. **employees**
   - Stores employee information
   - Used for admin panel authentication
   - Linked to appointments and credit analysis

2. **credit_analysis**
   - Stores credit analysis submissions
   - Links to employees table via analyzed_by
   - Stores document file paths

3. **contacts**
   - Stores contact form submissions
   - Links to employees table via responded_by

4. **appointments**
   - Stores appointment scheduling data
   - Links to employees table via confirmed_by and contract_closed_by

## Data Flow

### Appointment Scheduling Flow
1. User fills appointment form on `index.html`
2. Form data sent to `api/appointments.php` via POST
3. Data stored in `appointments` table
4. Admin views appointments in `ham_admin/dashboard.php`
5. Admin updates appointment status
6. Status updates sent to `api/appointments.php` via PUT

### Credit Analysis Flow
1. User fills credit analysis form on `analise-credito.html`
2. Form data and files sent to `api/credit-analysis.php` via POST
3. Data stored in `credit_analysis` table
4. Files uploaded to `uploads/credit-analysis/`
5. Admin views analyses in `ham_admin/dashboard.php`
6. Admin updates analysis status
7. Status updates sent to `api/credit-analysis.php` via PUT

### Authentication Flow
1. Employee accesses `ham_admin/index.php`
2. Login credentials checked against `employees` table
3. Session created on successful authentication
4. Session used for access control throughout admin panel

## Security Considerations
- Database credentials stored in `config/database.php`
- File upload validation in `api/credit-analysis.php`
- Session-based authentication for admin panel
- Input validation in API endpoints
- CORS headers configured for API access

## Deployment Considerations
- Database server at `192.168.122.175` must be accessible
- Web server must support PHP
- Upload directory must be writable
- Database must be initialized with `sql.sql`
