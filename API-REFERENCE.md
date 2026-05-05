# CRUD Operations API Reference

## Overview
This document provides detailed API reference for the `crud-operations.js` module that powers all button functionality in the Smart School Transport System.

---

## Core Utility Functions

### `getToken()`
Retrieves the authentication token from localStorage.

**Returns**: `String` - JWT token or empty string if not found

**Usage**:
```javascript
const token = getToken();
if (!token) {
    // User not authenticated, redirect to login
    window.location.href = 'admin-login.html';
}
```

---

### `apiCall(endpoint, method, data)`
Makes an authenticated API request to the backend.

**Parameters**:
- `endpoint` (String): API endpoint path (e.g., '/students', '/drivers/5')
- `method` (String): HTTP method - 'GET', 'POST', 'PUT', 'DELETE' (default: 'GET')
- `data` (Object): Request payload for POST/PUT requests (optional)

**Returns**: `Promise<Object>` - API response object

**Usage**:
```javascript
// Get list of students
const result = await apiCall('/students', 'GET');

// Create new student
const result = await apiCall('/students', 'POST', {
    full_name: 'John Doe',
    grade: 'Grade 5',
    parent_phone: '555-0123'
});

// Update student
const result = await apiCall('/students/123', 'PUT', {
    grade: 'Grade 6'
});

// Delete student
const result = await apiCall('/students/123', 'DELETE');
```

**Response Format**:
```javascript
{
    success: true,
    data: { /* response data */ },
    message: "Operation successful"
}
```

---

### `showLoading(button, show)`
Shows/hides loading indicator on a button element.

**Parameters**:
- `button` (HTMLElement): Button element to show loading on
- `show` (Boolean): true to show, false to hide (default: true)

**Usage**:
```javascript
const button = document.querySelector('.save-button');
showLoading(button, true);  // Show spinner

// ... do work ...

showLoading(button, false); // Hide spinner, restore original text
```

**Visual Effect**:
```
BEFORE:  [Save Button]
AFTER:   [🔄 Processing...]
```

---

### `showToast(message, type)`
Displays a toast notification to the user.

**Parameters**:
- `message` (String): Notification message text
- `type` (String): Notification type - 'success', 'error', 'warning', 'info' (default: 'info')

**Usage**:
```javascript
showToast('Student added successfully', 'success');
showToast('Error saving student', 'error');
showToast('Are you sure?', 'warning');
showToast('Data is loading', 'info');
```

**Visual Effect**:
```
SUCCESS:  ✓ Student added successfully
ERROR:    ✗ Error saving student
WARNING:  ⚠ Are you sure?
INFO:     ℹ Data is loading
```

---

## Student Operations

### `openStudentModal(studentId)`
Opens the student form modal for adding or editing.

**Parameters**:
- `studentId` (Number|null): Student ID to edit, or null to create new (default: null)

**Behavior**:
- If studentId provided: Loads student data and pre-fills form
- If null: Shows empty form with "Add New Student" title

**Usage**:
```javascript
// Open form to add new student
openStudentModal();

// Open form to edit student with ID 5
openStudentModal(5);
```

---

### `closeStudentModal()`
Closes the student form modal.

**Usage**:
```javascript
closeStudentModal();
```

---

### `saveStudent(event)`
Saves student data (creates new or updates existing).

**Parameters**:
- `event` (Event): Form submit event (optional, can be called without)

**Form Fields Expected**:
- firstName, lastName, email, phone, grade, route
- address, parentName, parentPhone, parentEmail
- emergencyContact

**Behavior**:
- Validates all required fields
- Shows loading state on submit button
- POSTs to `/api/students` (new) or PUTs to `/api/students/:id` (update)
- Shows success/error toast
- Closes modal and reloads student table

**Usage**:
```javascript
// As form submission handler
document.getElementById('studentForm').addEventListener('submit', saveStudent);

// Or called directly
saveStudent(event);
```

---

### `deleteStudent(studentId)`
Deletes a student record after confirmation.

**Parameters**:
- `studentId` (Number): Student ID to delete

**Behavior**:
- Shows confirmation dialog
- Sends DELETE request if confirmed
- Updates student table
- Shows success message

**Usage**:
```javascript
// Called from delete button
deleteStudent(5);
```

---

### `loadStudents()`
Loads and displays all students in the table.

**Behavior**:
- Shows loading spinner while fetching
- GETs from `/api/students`
- Populates table with student data
- Shows empty state if no students found
- Adds event listeners to action buttons

**Usage**:
```javascript
loadStudents();

// Typically called after operations
saveStudent().then(() => loadStudents());
```

---

## Driver Operations

### `openDriverModal(driverId)`
Opens the driver form modal.

**Parameters**:
- `driverId` (Number|null): Driver ID to edit, or null for new

**Usage**:
```javascript
openDriverModal();        // Create new driver
openDriverModal(10);      // Edit driver 10
```

---

### `closeDriverModal()`
Closes the driver form modal.

**Usage**:
```javascript
closeDriverModal();
```

---

### `saveDriver(event)`
Saves driver data.

**Form Fields Expected**:
- fullName, email, phone, licenseNumber, licenseExpiry, address

**Behavior**:
- Validates required fields
- POSTs to `/api/drivers` (new) or PUTs to `/api/drivers/:id` (update)
- Sets initial status as "pending" for new drivers
- Reloads driver table

**Usage**:
```javascript
document.getElementById('driverForm').addEventListener('submit', saveDriver);
```

---

### `deleteDriver(driverId)`
Deletes a driver with confirmation.

**Usage**:
```javascript
deleteDriver(10);
```

---

### `approveDriver(driverId)`
Approves a pending driver application.

**Behavior**:
- Sends PUT to `/api/drivers/:id/status` with `{status: 'approved'}`
- Updates driver status from "pending" to "approved"
- Reloads driver approval list and drivers table
- Shows success notification

**Usage**:
```javascript
approveDriver(10);
```

---

### `loadDrivers()`
Loads and displays all drivers.

**Usage**:
```javascript
loadDrivers();
```

---

## Bus Operations

### `openBusModal(busId)`
Opens the bus form modal.

**Parameters**:
- `busId` (Number|null): Bus ID to edit, or null for new

**Behavior**:
- Loads available drivers for dropdown
- Pre-fills form if editing

**Usage**:
```javascript
openBusModal();         // Create new bus
openBusModal(3);        // Edit bus 3
```

---

### `closeBusModal()`
Closes the bus form modal.

**Usage**:
```javascript
closeBusModal();
```

---

### `saveBus(event)`
Saves bus data.

**Form Fields Expected**:
- busNumber, registrationNumber, capacity, model, year, driverId

**Behavior**:
- Validates required fields
- POSTs to `/api/buses` (new) or PUTs to `/api/buses/:id` (update)
- Reloads bus table

**Usage**:
```javascript
document.getElementById('busForm').addEventListener('submit', saveBus);
```

---

### `deleteBus(busId)`
Deletes a bus with confirmation.

**Usage**:
```javascript
deleteBus(3);
```

---

### `loadBuses()`
Loads and displays all buses.

**Usage**:
```javascript
loadBuses();
```

---

## Route Operations

### `openRouteModal(routeId)`
Opens the route form modal.

**Parameters**:
- `routeId` (Number|null): Route ID to edit, or null for new

**Behavior**:
- Loads available buses for assignment
- Pre-fills form if editing

**Usage**:
```javascript
openRouteModal();        // Create new route
openRouteModal(2);       // Edit route 2
```

---

### `closeRouteModal()`
Closes the route form modal.

**Usage**:
```javascript
closeRouteModal();
```

---

### `saveRoute(event)`
Saves route data.

**Form Fields Expected**:
- routeName, routeCode, description, distance, busId

**Behavior**:
- Validates required fields
- POSTs to `/api/routes` (new) or PUTs to `/api/routes/:id` (update)
- Reloads route table

**Usage**:
```javascript
document.getElementById('routeForm').addEventListener('submit', saveRoute);
```

---

### `deleteRoute(routeId)`
Deletes a route with confirmation.

**Usage**:
```javascript
deleteRoute(2);
```

---

### `loadRoutes()`
Loads and displays all routes.

**Usage**:
```javascript
loadRoutes();
```

---

## Attendance Operations

### `markAttendance(studentId, type)`
Marks a student's attendance (boarding or drop-off).

**Parameters**:
- `studentId` (Number): Student ID
- `type` (String): 'boarding' or 'dropoff'

**Behavior**:
- POSTs to `/api/attendance` with appropriate status and time
- Shows success notification
- Reloads attendance table
- If "boarding": sets `boarding_status: 'present'`, records boarding time
- If "dropoff": sets `dropoff_status: 'present'`, records dropoff time

**Usage**:
```javascript
markAttendance(7, 'boarding');  // Mark student 7 as boarded
markAttendance(7, 'dropoff');   // Mark student 7 as dropped off
```

---

### `loadAttendance()`
Loads and displays all attendance records.

**Usage**:
```javascript
loadAttendance();
```

---

## Payment Operations

### `recordPayment(studentId)`
Records a payment for a student.

**Parameters**:
- `studentId` (Number): Student ID

**Behavior**:
- Prompts user for payment amount (via `prompt()`)
- POSTs to `/api/payments` with amount, date, method, status
- Shows success notification
- Reloads payment table

**Usage**:
```javascript
recordPayment(7);  // Record payment for student 7
```

---

### `generateReceipt(paymentId)`
Generates and displays a printable receipt for a payment.

**Parameters**:
- `paymentId` (Number): Payment ID

**Behavior**:
- GETs payment details from `/api/payments/:id`
- Formats receipt HTML
- Opens in new window
- User can print or save as PDF

**Receipt Includes**:
- Receipt number
- Student name
- Amount
- Payment date
- Payment method
- Status

**Usage**:
```javascript
generateReceipt(15);  // Show receipt for payment 15
```

---

### `loadPayments()`
Loads and displays all payment records.

**Usage**:
```javascript
loadPayments();
```

---

## Driver Approval Operations

### `loadDriverApproval()`
Loads pending driver applications.

**Behavior**:
- GETs from `/api/drivers?status=pending`
- Displays driver applications in grid
- Shows details and action buttons
- Shows empty state if no pending drivers

**Usage**:
```javascript
loadDriverApproval();
```

---

### `rejectDriver(driverId)`
Rejects a pending driver application.

**Parameters**:
- `driverId` (Number): Driver ID

**Behavior**:
- Shows confirmation dialog
- Sends DELETE request if confirmed
- Removes from pending applications
- Reloads driver approval list

**Usage**:
```javascript
rejectDriver(10);  // Reject driver 10
```

---

## Form Handler Functions

### `setupFormHandlers()`
Sets up all form event listeners.

**Called Automatically**: During page load

**Behavior**:
- Attaches submit handlers to all forms
- Sets up modal close handlers
- Configures validation listeners

**Usage**:
```javascript
setupFormHandlers(); // Usually called automatically in DOMContentLoaded
```

---

## Integration Examples

### Complete Add Student Workflow
```javascript
// 1. User clicks "Add Student" button
openStudentModal();

// 2. Form appears, user fills it out and submits
// Form triggers saveStudent() automatically

// 3. saveStudent():
// - Validates form
// - Shows loading state
// - POSTs to /api/students
// - Closes modal
// - Calls loadStudents()

// 4. loadStudents():
// - Fetches all students
// - Populates table
// - New student appears automatically
```

### Complete Edit Student Workflow
```javascript
// 1. User clicks edit icon on student row
openStudentModal(123);

// 2. Function:
// - GETs /api/students/123
// - Pre-fills form with existing data
// - Shows modal with "Edit Student" title

// 3. User modifies field and submits
// Form triggers saveStudent()

// 4. saveStudent():
// - Validates form
// - Shows loading state
// - PUTs to /api/students/123
// - Closes modal
// - Calls loadStudents()

// 5. Table updates with new values
```

### Complete Delete Workflow
```javascript
// 1. User clicks delete icon on student row
deleteStudent(123);

// 2. Function:
// - Shows confirm dialog
// - If confirmed, sends DELETE /api/students/123
// - Shows success toast
// - Calls loadStudents()

// 3. Table refreshes, deleted student gone
```

---

## Error Handling

### Standard Error Flow
```javascript
try {
    const result = await apiCall('/students', 'POST', data);
    if (result && result.success) {
        showToast('Success!', 'success');
        loadStudents();
    } else {
        showToast('Operation failed', 'error');
    }
} catch (error) {
    showToast('Error: ' + error.message, 'error');
}
```

### Common Errors
```javascript
// No token found
// → User not authenticated, redirect to login

// 401 Unauthorized
// → Token expired, force re-login

// 404 Not Found
// → Record doesn't exist in database

// 500 Server Error
// → Backend error, check server logs

// Network Error
// → Backend server not running
```

---

## Best Practices

### Always Show Loading State
```javascript
const button = event.target.closest('button');
showLoading(button);
try {
    // ... do work ...
} finally {
    showLoading(button, false);
}
```

### Validate Before Sending
```javascript
if (!form.checkValidity()) {
    showToast('Please fill all required fields', 'warning');
    return;
}
```

### Handle All API Responses
```javascript
const result = await apiCall(endpoint, method, data);
if (result && result.success) {
    // Success
    showToast(result.message || 'Success!', 'success');
    // Reload data
    loadStudents();
} else {
    // Error
    showToast(result?.error?.message || 'Operation failed', 'error');
}
```

### Keep Modal Closed When Not Needed
```javascript
closeStudentModal();
closeDriverModal();
closeBusModal();
closeRouteModal();
```

---

## Debugging Tips

### Check Browser Console
```javascript
// Open DevTools (F12) and check Console tab for:
// - JavaScript errors
// - Network errors
// - Console logs from functions
```

### Monitor Network Requests
```javascript
// Open DevTools Network tab and check:
// - API request URLs
// - Request headers (Authorization)
// - Response status codes
// - Response body content
```

### Verify Data in Database
```javascript
// Connect to database and check:
// SELECT * FROM students;
// SELECT * FROM drivers;
// SELECT * FROM buses;
// SELECT * FROM routes;
```

### Add Console Logs
```javascript
// Modify functions to log progress:
console.log('Opening student modal for ID:', studentId);
console.log('Saving student:', data);
console.log('API Response:', result);
```

---

## Reference Quick Links

- **Main Module**: `frontend/public/js/crud-operations.js`
- **Implementation Guide**: `IMPLEMENTATION-GUIDE.md`
- **Quick Start**: `QUICK-START.md`
- **Admin Dashboard**: `frontend/public/admin-dashboard.html`
- **API Endpoints**: `backend/server-simple.js`
- **Database Schema**: `backend/database/schema.sql`

---

**Version**: 2.0.0
**Last Updated**: January 26, 2024
**Status**: Complete & Production Ready
