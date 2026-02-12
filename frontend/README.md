# Store Rating Platform – Frontend

## Project Overview

The Store Rating Platform frontend is a React.js application that allows users to discover, rate, and review stores. The application features role-based access control, providing different experiences for Normal Users, Store Owners, and Administrators. Users can browse stores, submit ratings, and manage their accounts, while Store Owners can monitor their store's performance and Administrators have full system oversight.

## User Roles & UI Access

### Normal User
- Browse and search stores
- View store details and ratings
- Submit and edit ratings (1-5 stars)
- Manage personal profile and password
- Access public store information

### Store Owner
- View dashboard with store performance metrics
- Monitor average ratings and user feedback
- See list of users who rated their store
- Manage store information and password
- Access analytics for their owned stores

### Admin
- Full access to all system modules
- View and manage all users
- View and manage all stores
- Access comprehensive dashboard with system statistics
- Perform administrative operations across the platform

## Application Pages & Modules

### A. Authentication Module

#### Login Page
**Purpose**: Authenticate users and redirect to appropriate dashboard based on role

**Form Fields**:
- Email (required, email format)
- Password (required, 8-16 characters)
- Remember Me checkbox
- Login button
- "Don't have an account?" link (for Normal Users only)

**Validation Rules**:
- Email: Valid email format required
- Password: Minimum 8 characters, maximum 16 characters
- Display error messages for invalid credentials
- Loading state during authentication

**Error Handling**:
- Invalid email/password combination
- Network errors
- Server unavailable messages

#### Signup Page (Normal User only)
**Purpose**: Register new Normal User accounts

**Form Fields**:
- Full Name (required, 20-60 characters)
- Email (required, unique, email format)
- Password (required, 8-16 chars, uppercase, special char)
- Confirm Password (required, must match password)
- Address (optional, max 400 characters)
- Signup button
- "Already have an account?" link

**Validation Rules**:
- Name: 20-60 characters, alphabets and spaces only
- Email: Valid format, check for uniqueness
- Password: 8-16 characters, at least one uppercase, one special character
- Confirm Password: Must match password exactly
- Address: Maximum 400 characters

**Error Handling**:
- Email already exists
- Password mismatch
- Weak password validation
- Network errors during registration

#### Logout Behavior
- Clear authentication tokens
- Reset user state
- Redirect to login page
- Clear sensitive data from local storage

### B. Common Layout Module

#### Navbar Components
**Logo/Brand**: Platform name and logo
**Navigation Links** (role-based):
- Normal User: Home, My Profile, Logout
- Store Owner: Dashboard, My Stores, Profile, Logout
- Admin: Dashboard, Users, Stores, Profile, Logout

**User Menu**:
- Display user name and role
- Dropdown with profile and logout options
- Avatar or user icon

#### Sidebar (role-based)
**Normal User Sidebar**:
- Store Listing
- My Ratings
- Profile Settings
- Logout

**Store Owner Sidebar**:
- Dashboard
- My Stores
- Ratings & Reviews
- Profile Settings
- Logout

**Admin Sidebar**:
- Dashboard
- Users Management
- Stores Management
- System Reports
- Profile Settings
- Logout

#### Protected Routes
- Implement route guards for authenticated users
- Role-based access control for different routes
- Redirect unauthenticated users to login
- Show 403 page for unauthorized access attempts

#### Page Access Control
- Use React Router with route protection
- Check user role before rendering components
- Implement loading states during role verification
- Handle edge cases for role changes

### C. Normal User Module

#### Store Listing Page
**Purpose**: Display all available stores with search and filtering capabilities

**Components**:
- Search bar (by store name and address)
- Filter options (rating, location)
- Sort options (name, rating, distance)
- Store grid/list view toggle
- Pagination controls

**Store Card UI**:
- Store name
- Address (truncated if long)
- Overall rating display (star rating + average)
- Number of ratings
- Distance from user (if location available)
- "View Details" button
- "Rate Store" button

#### Store Search Functionality
**Search Inputs**:
- Store name search (real-time filtering)
- Address/location search
- Clear search button
- Search suggestions (optional)

**Search Behavior**:
- Real-time search results update
- Debounced search API calls
- Empty state for no results
- Loading state during search

#### Rating Component
**Star Rating Display**:
- Interactive 1-5 star rating system
- Visual feedback on hover
- Selected stars highlighted
- Half-star support for average ratings

**Rating Submission**:
- Click to set rating
- Optional review text field
- Submit button with validation
- Success/error message display

**Rating Display**:
- Show overall average rating
- Display user's previous rating
- Show total number of ratings
- Rating distribution chart (optional)

#### User Rating Management
**Submit Rating**:
- 1-5 star selection
- Optional review text (max 500 characters)
- Submit button with loading state
- Success confirmation message

**Edit Rating**:
- Pre-fill with existing rating
- Update star selection
- Modify review text
- Save changes with confirmation

#### Change Password Page
**Form Fields**:
- Current Password (required)
- New Password (required, 8-16 chars, uppercase, special char)
- Confirm New Password (required, must match)
- Update Password button

**Validation**:
- Current password verification
- New password strength validation
- Password match confirmation
- Error messages for each field

### D. Store Owner Module

#### Owner Dashboard
**Key Metrics Display**:
- Overall average rating
- Total number of ratings
- Rating trend (last 30 days)
- Top rated stores (if multiple)
- Recent user activity

**Visual Components**:
- Rating distribution chart
- Monthly rating trend graph
- Quick stats cards
- Recent reviews section

#### Average Rating Display
**Rating Overview**:
- Large, prominent average rating display
- Star visualization
- Total number of ratings
- Rating breakdown (1-5 star counts)
- Comparison with industry average

#### User Ratings List
**Table Columns**:
- User name (with avatar)
- Rating (star display)
- Review text (if provided)
- Date of rating
- Actions (view details, respond)

**Features**:
- Sort by date, rating, user name
- Filter by rating level
- Pagination for large lists
- Search by user name

#### Change Password Page
(Same as Normal User module with Store Owner context)

### E. Admin Module

#### Admin Dashboard
**System Statistics**:
- Total users count
- Total stores count
- Total ratings submitted
- Average platform rating
- New registrations (last 30 days)
- Active users (last 30 days)

**Visual Charts**:
- User registration trend
- Rating submission trend
- Store category distribution
- Geographic distribution heat map

#### View All Users
**User Table Columns**:
- User ID
- Name
- Email
- Role (Normal User/Store Owner/Admin)
- Registration Date
- Last Login
- Status (Active/Inactive)
- Actions (Edit, Deactivate, View Details)

**Features**:
- Sort by any column
- Filter by role, status, registration date
- Search by name or email
- Bulk actions (activate/deactivate)
- Pagination

#### View All Stores
**Store Table Columns**:
- Store ID
- Store Name
- Owner Name
- Address
- Average Rating
- Total Ratings
- Status (Active/Inactive)
- Registration Date
- Actions (View Details, Edit, Deactivate)

**Features**:
- Sort by rating, name, date
- Filter by rating range, status
- Search by store name or owner
- Bulk status changes
- Export data functionality

#### Sorting & Filtering UI
**Sorting Options**:
- Ascending/Descending toggle
- Sort by: Name, Rating, Date, Status
- Multi-column sorting support

**Filter Controls**:
- Date range pickers
- Rating range sliders
- Status dropdowns
- Role checkboxes
- Clear all filters button

#### View User Details
**User Information Panel**:
- Personal details
- Contact information
- Registration and login history
- Role and permissions
- Account status

**User Activity**:
- Rating history
- Login logs
- Store ownership (if applicable)
- Recent actions

#### View Store Details
**Store Information Panel**:
- Store details and address
- Owner information
- Registration date
- Current status
- Contact details

**Performance Metrics**:
- Rating statistics
- User engagement data
- Rating trends over time
- Top reviewers

## Form Validation Rules (Frontend)

### Name Validation
- **Required**: Yes
- **Minimum Length**: 20 characters
- **Maximum Length**: 60 characters
- **Allowed Characters**: Alphabets, spaces, hyphens, apostrophes
- **Error Messages**: 
  - "Name must be between 20 and 60 characters"
  - "Name can only contain letters, spaces, hyphens, and apostrophes"

### Address Validation
- **Required**: No
- **Maximum Length**: 400 characters
- **Allowed Characters**: Alphanumeric, spaces, commas, periods, hyphens
- **Error Messages**: "Address cannot exceed 400 characters"

### Email Validation
- **Required**: Yes
- **Format**: Standard email format (user@domain.com)
- **Error Messages**: 
  - "Email is required"
  - "Please enter a valid email address"

### Password Validation
- **Required**: Yes
- **Minimum Length**: 8 characters
- **Maximum Length**: 16 characters
- **Requirements**:
  - At least one uppercase letter
  - At least one special character (!@#$%^&*)
  - Can contain numbers and lowercase letters
- **Error Messages**:
  - "Password must be between 8 and 16 characters"
  - "Password must contain at least one uppercase letter"
  - "Password must contain at least one special character"

### Rating Validation
- **Required**: Yes
- **Valid Values**: 1, 2, 3, 4, 5
- **Error Messages**: "Please select a valid rating between 1 and 5 stars"

## Sorting & Filtering (UI behavior)

### Ascending / Descending Sorting
- **Visual Indicators**: Arrow icons showing current sort direction
- **Multi-column Support**: Hold Ctrl/Cmd for secondary sorting
- **Persistence**: Remember user's sort preferences
- **Reset**: Clear all sorting option

### Search Inputs
- **Real-time Search**: Debounced input with 300ms delay
- **Clear Button**: Quick search reset
- **Placeholder Text**: Descriptive search hints
- **Search History**: Recent searches (optional)

### Filter Dropdowns
- **Multi-select**: Checkbox lists for multiple options
- **Range Filters**: Sliders for numeric ranges (rating, date)
- **Active Filters**: Display selected filters as removable pills
- **Filter Count**: Show number of active filters
- **Clear All**: Reset all filters at once

## Routing Strategy

### Public Routes
- `/` - Landing page (optional)
- `/login` - User authentication
- `/signup` - User registration (Normal User only)
- `/forgot-password` - Password recovery

### Protected Routes
- `/dashboard` - Role-based dashboard
- `/profile` - User profile management
- `/change-password` - Password change

### Role-based Route Guarding
```javascript
// Route protection logic (conceptual)
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/unauthorized" />;
  
  return children;
};
```

**Route Examples**:
- `/user/stores` - Normal User store listing
- `/owner/dashboard` - Store Owner dashboard
- `/admin/users` - Admin user management
- `/admin/stores` - Admin store management

## State Management (High-level)

### Auth State
- **User Information**: Name, email, role, ID
- **Authentication Status**: Logged in/out state
- **Tokens**: JWT access and refresh tokens
- **Loading States**: Authentication in progress

### User Role State
- **Current Role**: Normal User/Store Owner/Admin
- **Permissions**: Array of allowed actions
- **Role Transitions**: Handle role changes if applicable

### Store and Rating State
- **Store List**: Array of all stores
- **Current Store**: Selected store details
- **User Ratings**: User's submitted ratings
- **Store Ratings**: All ratings for a store
- **Filter State**: Current search and filter settings

## UI/UX Best Practices

### Error Messages
- **Inline Validation**: Real-time field validation
- **Toast Notifications**: Success/error messages for actions
- **Error Boundaries**: Catch and display React errors gracefully
- **Consistent Styling**: Unified error message design

### Loading States
- **Skeleton Loaders**: Content placeholders during data fetch
- **Spinners**: Loading indicators for buttons and forms
- **Progress Bars**: For long-running operations
- **Disabled States**: Prevent user interaction during loading

### Empty States
- **No Data Messages**: Friendly messages when no content exists
- **Illustrations**: Visual elements for empty states
- **Call-to-Action**: Guide users on what to do next
- **Search Suggestions**: Help users find content

### Responsive Design
- **Mobile First**: Design for smallest screens first
- **Breakpoints**: Tablet (768px), Desktop (1024px), Large (1440px)
- **Touch Targets**: Minimum 44px for interactive elements
- **Readable Text**: Minimum 16px font size for body text

### Reusable Components
- **Button Component**: Variants (primary, secondary, danger)
- **Input Component**: With validation states
- **Card Component**: Flexible content container
- **Modal Component**: For dialogs and confirmations
- **Table Component**: With sorting and filtering

## Folder Structure (Frontend only)

```
frontend-js/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Generic components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   ├── Loading/
│   │   │   └── ErrorBoundary/
│   │   ├── layout/          # Layout components
│   │   │   ├── Navbar/
│   │   │   ├── Sidebar/
│   │   │   └── Footer/
│   │   └── forms/           # Form components
│   │       ├── LoginForm/
│   │       ├── SignupForm/
│   │       └── RatingForm/
│   ├── pages/               # Page components
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── user/
│   │   │   ├── StoreListing.jsx
│   │   │   ├── StoreDetails.jsx
│   │   │   └── Profile.jsx
│   │   ├── owner/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MyStores.jsx
│   │   │   └── Ratings.jsx
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Stores.jsx
│   │   │   └── UserDetails.jsx
│   │   └── common/
│   │       ├── NotFound.jsx
│   │       ├── Unauthorized.jsx
│   │       └── ChangePassword.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   ├── useLocalStorage.js
│   │   └── useDebounce.js
│   ├── services/            # API services
│   │   ├── authService.js
│   │   ├── storeService.js
│   │   ├── ratingService.js
│   │   └── userService.js
│   ├── context/             # React Context providers
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   ├── utils/               # Utility functions
│   │   ├── validation.js
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── formatters.js
│   ├── styles/              # CSS/SCSS files
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── components/
│   ├── assets/              # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── App.jsx
│   ├── index.js
│   └── setupTests.js
├── package.json
├── package-lock.json
└── README.md
```

## Future Backend Integration Notes

### API Connection Strategy
- **Base URL Configuration**: Environment-based API endpoints
- **HTTP Client**: Use Axios for API requests with interceptors
- **Request/Response Interceptors**: Handle authentication and errors globally
- **Error Handling**: Centralized error handling for API responses

### Token Handling
- **Storage**: Store JWT tokens in localStorage or httpOnly cookies
- **Refresh Token**: Implement automatic token refresh mechanism
- **Token Expiry**: Handle expired tokens gracefully with re-authentication
- **Authorization Headers**: Include Bearer token in all protected API calls

### Error Handling Strategy
- **HTTP Status Codes**: 
  - 401: Redirect to login
  - 403: Show unauthorized message
  - 404: Show not found page
  - 500: Show server error message
- **Network Errors**: Retry mechanism with exponential backoff
- **Validation Errors**: Display field-specific error messages
- **Timeout Handling**: Set reasonable timeouts for API calls

### API Endpoints (Expected Structure)
```
Authentication:
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/logout
POST /api/auth/refresh-token

Stores:
GET /api/stores
GET /api/stores/:id
POST /api/stores
PUT /api/stores/:id
DELETE /api/stores/:id

Ratings:
GET /api/stores/:id/ratings
POST /api/stores/:id/ratings
PUT /api/ratings/:id
DELETE /api/ratings/:id

Users:
GET /api/users/profile
PUT /api/users/profile
GET /api/admin/users
GET /api/admin/users/:id
```

### Integration Best Practices
- **Environment Variables**: Use .env files for configuration
- **Mock Data**: Create mock services for frontend development
- **Type Safety**: Consider PropTypes for better API integration
- **Caching**: Implement client-side caching for frequently accessed data
- **Offline Support**: Consider service workers for basic offline functionality

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

#### `npm start`
Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

#### `npm test`
Launches the test runner in the interactive watch mode.

#### `npm run build`
Builds the app for production to the `build` folder.

#### `npm run eject`
Removes this tool and copies build dependencies, configuration files and scripts into the app directory.

### Dependencies
- React.js
- React Router DOM
- Axios (for API calls)
- React Hook Form (form handling)
- Yup (validation)
- Tailwind CSS (styling)
- Lucide React (icons)

## Contributing

1. Follow the existing code structure and naming conventions
2. Write clean, readable, and maintainable code
3. Add comments for complex logic
4. Test your changes before submitting
5. Follow the Git workflow for commits and pull requests

## License

This project is licensed under the MIT License.
