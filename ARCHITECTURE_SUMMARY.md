
# Grupo Ribeiro Architecture Summary

## System Architecture

### Frontend
- **Main Landing Page**: `index.html` with dynamic JavaScript content
- **Credit Analysis Form**: `analise-credito.html` for document submission
- **Admin Dashboard**: PHP-based admin panel in `ham_admin/` directory

### Backend
- **API Layer**: RESTful PHP APIs in `api/` directory
- **Database**: MySQL with PDO connection
- **Authentication**: Session-based for admin panel

### Data Storage
- **Database**: MySQL with 4 main tables (employees, credit_analysis, contacts, appointments)
- **File Storage**: Local file system for uploaded documents

## Data Flow

1. **User Interaction**:
   - Visitors access `index.html` or `analise-credito.html`
   - JavaScript handles frontend interactions
   - Forms submit data to PHP APIs

2. **API Processing**:
   - PHP scripts process requests
   - Data validated and sanitized
   - Database queries executed
   - JSON responses returned

3. **Admin Management**:
   - Employees login to admin panel
   - Dashboard displays statistics
   - Appointments and credit analyses managed
   - Status updates via API calls

## Security Measures

- Input validation and sanitization
- File upload restrictions
- Session-based authentication
- Database prepared statements
- CORS headers for API access

## Deployment Requirements

- Web server with PHP support
- MySQL database server
- Writable directories for file uploads
- Proper database configuration in `config/database.php`
