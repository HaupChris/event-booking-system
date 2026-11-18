# Event Booking System - PWA Implementation & Feature Roadmap

## Progressive Web App Implementation

### Phase 1: PWA Foundation ✅ COMPLETED
- [x] Create `manifest.json` with app metadata
  - App name, icons (192x192, 512x512)
  - Theme colors, display mode (standalone)
  - Start URL and scope
- [x] Add manifest link to `index.html`
- [x] Generate PWA icons in multiple sizes
- [ ] Test app installation on mobile devices (requires deployment)

### Phase 2: Service Worker Setup ✅ COMPLETED
- [x] Create basic service worker (`service-worker.js`)
- [x] Implement caching strategy for static assets
  - Cache-first for app shell (JS, CSS, images)
  - Network-first for API calls
  - Offline fallback page
- [x] Register service worker in React app
- [x] Add update notification when new version available

### Phase 3: Offline Functionality ✅ COMPLETED
- [x] Cache profile page for offline viewing
- [x] Store booking details in IndexedDB for offline access
- [x] Implement offline indicator in UI
- [x] Queue profile updates when offline (sync when online)

### Phase 4: Push Notifications
- [ ] Set up push notification backend (Firebase Cloud Messaging or web-push)
- [ ] Create notification subscription flow during registration
- [ ] Backend API endpoint to send notifications
- [ ] Implement notification types:
  - Work shift assignments
  - News feed updates
  - Payment reminders
  - Important announcements
- [ ] Add notification preferences to profile settings

---

## Profile Page System (Profilseite)

### Core Profile Features ✅ COMPLETED
- [x] **Unique Profile Access**
  - UUID v4-based profile IDs for each user
  - Profile links sent via email after registration
  - Email-based profile recovery mechanism
  - No login credentials needed

- [x] **Profile Overview Dashboard**
  - Display booking details (tickets, food, beverages, materials)
  - Show work shift assignments
  - Personal information summary
  - Payment status indicator
  - Burger menu navigation (mobile-optimized)

- [x] **News Feed** (Default Landing Page)
  - Admin-posted updates visible on profile
  - Content types: Anreise info, Timetable, Workshops, Announcements
  - Chronological feed with timestamps
  - Read/unread status tracking
  - Unread count badge
  - Expandable news cards with category icons
  - Offline support via IndexedDB caching

- [x] **Work Shift Management Interface**
  - View assigned shifts with details (time, location, description)
  - Accept/decline shift assignments
  - Rejection feedback form:
    - Optional reason text
    - Alternative preferences
  - Confirmation status tracking
  - Offline support with sync queue
  - Optimistic UI updates

- [x] **Admin Profile Management**
  - View all user profiles with access statistics
  - Send/resend profile links via email
  - Bulk send profile links
  - Copy profile link to clipboard
  - View profile as user
  - Profile link column in bookings table

- [x] **Admin News Management**
  - Create/edit/delete news items
  - Category-based organization
  - Active/inactive status management
  - Publishing workflow

- [x] **Additional Profile Sections**
  - FAQs page with 8+ common questions
  - Ride-sharing (Mitfahrbörse) placeholder
  - Booking details view
  - Profile overview page

- [ ] **Editable Booking Details**
  - Allow editing of certain booking details. This option can be turned off for all users in the admin frontend
  - Fields that can be edited:
    - Work shift preferences, material contributions, beverages, food option, ticket option
  - Fields that cannot be edited after payment has been received:
    - Tickets, food, beverages

- [ ] **Shift Exchange System (Tauschbörse)**
  - View available shift swaps (with names)
  - Post shift swap offers (48-hour validity)
  - For users with multiple shifts: select specific shift to swap
  - Notification when swap match found
  - For swaps, no admin approval is needed

- [ ] **FAQ Page**
  - Static FAQ content managed by admin
  - Searchable/filterable questions
  - Reduces WhatsApp group repetitive questions

- [ ] **Ride-Sharing Board (Mitfahrbörse)**
  - Post ride offers/requests
  - Filters: departure location, date/time, seats available
  - Contact mechanism between users

- [ ] **User Cancellation System (Abmeldung)**
  - Self-service cancellation button
  - Move user to "cancelled" category
  - Auto-send cancellation confirmation email
  - Refund information based on cancellation policy
  - Auto-reminder: Email after 2 weeks if payment not received
    - Push Notification 
    - Warning that booking will be cancelled
    - Follow-up auto-cancellation if no payment

---

## Admin Area Features (Admin Bereich)

### Food, Tickets, Beverages - Enhanced Display
- [ ] **Current Problem**: Unübersichtliche Darstellung
- [ ] Add tag system:
  - Tags: Vegetarian, Vegan, Gluten-free, etc.
  - Visual tag badges in admin view
- [ ] Add description field for each item
  - Long-form description for details/ingredients
- [ ] Improve admin UI layout:
  - Card-based view with tags and descriptions
  - Filter/search functionality
  - Bulk edit capabilities

### User Roles & Role Management
- [ ] **Current State**: Roles set in frontend but not editable in backend
- [ ] **Current Roles**: Regular, Artist
- [ ] Create comprehensive role management system:
  - Add "Orga" role
  - Custom role creation interface
  - Edit existing roles
  - Assign roles to users
- [ ] Role-specific configurations:
  - Work shift requirements (required/optional/exempt)
  - Material contribution list (customizable per role)
  - Pricing tiers:
    - Ticket prices per role
    - Food prices per role
    - Beverage prices per role
  - Registration form customization per role

### Financial Management System
- [ ] **Question**: Mit Spencer sprechen über Requirements?
- [ ] Budget Planning Table (Kostenvoranschlag):
  - Columns: Category, Item, Estimated Cost, Notes, Date
  - Categories: Venue, Sound, Catering, Materials, Marketing, etc.
  - Total estimated costs
- [ ] Actual Expenses Table (Tatsächliche Kosten):
  - Columns: Category, Item, Actual Cost, Invoice/Receipt Reference, Date, Paid By, Status
  - Link to uploaded receipts/invoices
  - Variance from estimate
- [ ] Financial Overview Dashboard:
  - Budget vs. Actual comparison
  - Income tracking (ticket sales, bar revenue)
  - Profit/loss calculation
  - Export to CSV/Excel
- [ ] What else needed? Discuss with Spencer

### Registration Management
- [ ] Password change for registration access
- [ ] Open/close registration toggle
  - Separate controls for Regular vs. Artist registration?
  - Scheduled open/close dates

### Work Shift Schedule Viewer
- [ ] Read-only shift schedule display in admin area
- [ ] Accessible to all admin/orga users
- [ ] Features:
  - Search by person name
  - Filter by shift type, time slot, date
  - Export to PDF/print view
  - Always shows current version

---

## Regular User Registration Features (Anmeldung Regulars)

### Multi-Shift Prevention
- [ ] Prevent users from signing up exclusively for easy shifts (e.g., only food shifts)
- [ ] Implement shift diversity requirement:
  - Minimum one shift from different categories?
  - Balanced shift assignment algorithm
  - Admin override capability

### Comment/Notes Field
- [ ] Add comment field during registration
- [ ] Use cases:
  - Indicate early departure date
  - Special requirements/constraints
- [ ] Consideration: Could this be used to decline shifts preemptively?
  - Admin review of comments before finalizing assignments

### Multiple Support Buddies
- [ ] Current: Single supporter buddy selection
- [ ] Change to: Multiple supporter buddies
  - Add/remove functionality
  - Limit on number of buddies?

### Invitation Tracking
- [ ] Add question at start of registration: "Wer hat dich eingeladen?"
- [ ] Dropdown/search of existing attendees
- [ ] Track invitation chains for community mapping

### Day Ticket Logic
- [ ] Day ticket holders exempt from work shifts
- [ ] Separate ticket type with different requirements
- [ ] Clear indication in admin view

---

## Artist Registration Features (Anmeldung Artists)

### Band Member Registration
- [ ] Artists can register band members directly
- [ ] Band member types:
  - Performing members (included in artist allocation)
  - Crew/entourage
- [ ] Entourage rules:
  - One-day attendance: Can be registered by artist
  - Multi-day attendance: Must register separately as Regular user
    - Full registration process
    - Work shift requirements apply

---

## General Features (Allgemeine Features)

### 404 Page
- [ ] Custom 404 page for invalid links
- [ ] Helpful navigation back to main areas
- [ ] Contact information for support

### Data Encryption (Verschlüsselung der Daten)
- [ ] Encrypt sensitive personal data at rest
- [ ] Use HTTPS for all communication (already in place?)
- [ ] Encrypt stored signatures and payment information
- [ ] Database field-level encryption for:
  - Email addresses
  - Phone numbers
  - Payment details

### reCAPTCHA Integration
- [ ] Add reCAPTCHA to registration forms
- [ ] Protect against automated scanning/submissions
- [ ] reCAPTCHA v3 (invisible) vs. v2 (checkbox)?

### Information Page - "Was ist der Wiesenwahn?"
- [ ] Location: After password entry OR on profile page
- [ ] Content:
  - Festival history
  - "Friends für Friends" philosophy
  - Community explanation
  - Orga structure and role
  - Work shift (Arbeitsdienste) concept
  - Values and culture
- [ ] Multimedia: Photos, videos from past years?

---

## Security Features (Absicherung vor Angriffen)

### Data Encryption
- [ ] Private data encryption (see above)
- [ ] Secure key management
- [ ] Regular security audits

### Cloudflare Integration
- [ ] Set up Cloudflare for DDoS protection
- [ ] Rate limiting to prevent brute force
- [ ] Bot detection and mitigation
- [ ] Web Application Firewall (WAF) rules

### Additional Security Measures
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (input sanitization)
- [ ] CSRF tokens on forms
- [ ] Secure headers (CSP, HSTS, X-Frame-Options)
- [ ] Regular dependency updates (npm audit, pip check)

---

## Open Questions (Offene Fragen)

### Awareness Team Pre-Selection
- [ ] **Question**: Wie mit Awareness Vorauswahl umgehen?
- [ ] Users should be able to indicate interest during registration
- [ ] Options to explore:
  - Checkbox during registration "Interested in Awareness team"
  - Separate application process?
  - Required training/briefing before assignment
  - Special vetting process
- [ ] Admin interface for managing Awareness assignments

---

## Implementation Priority Recommendations

### ✅ Completed (Phases 1-2)
1. ✅ Profile page system foundation
2. ✅ PWA basic implementation (manifest, service worker)
3. ✅ Work shift management interface
4. ✅ News feed with read/unread tracking
5. ✅ Admin profile management
6. ✅ Admin news management
7. ✅ Offline functionality with IndexedDB
8. ✅ Burger menu navigation for profile pages

### High Priority (Phase 3)
1. Admin role management system
2. Enhanced food/tickets/beverages display
3. Push notifications
4. Financial management system

### Medium Priority (Phase 4)
5. Shift exchange system (Tauschbörse)
6. Ride-sharing board implementation
7. User cancellation system
8. Information page ("Was ist der Wiesenwahn?")

### Lower Priority (Phase 5)
9. Multi-shift prevention logic
10. Band member registration for artists
11. Invitation tracking
12. Multiple support buddies

### Ongoing
- Security hardening
- Data encryption
- Testing and bug fixes
- Performance optimization

---

## Technical Implementation Status

### ✅ Completed Database Schema
- Profile UUID columns (Bookings, ArtistBookings)
- News feed table
- News read status tracking
- ShiftAssignments extended (status, rejection_reason, etc.)
- Profile access tracking (last_accessed, access_count)

### ✅ Completed API Endpoints
- Profile access and management (`/api/profile/{uuid}`)
- Profile recovery (`/api/profile/recover`)
- Shift acceptance/rejection
- News feed access
- News read status tracking
- Admin profile stats (`/api/admin/profiles/stats`)
- Admin profile link sending (individual & bulk)
- Admin news CRUD (`/api/admin/news`)

### ✅ Completed Frontend Components
- ProfilePage with burger menu navigation
- ProfileOverview dashboard
- BookingDetails viewer
- WorkShifts management interface
- NewsFeed with expandable cards
- ProfileRecovery form
- RideSharing placeholder
- FAQs accordion component
- Admin ProfileManagementPage
- Admin NewsManagementPage
- Profile link column in BookingsPage

### Still Needed
- Role configuration table
- Financial tables (budget, expenses)
- Shift exchange/swap table
- Notification preferences table
- Push notification infrastructure
- Admin financial dashboard
- Shift exchange UI

---

## Recent Accomplishments (2025-11-29)

### Backend
- ✅ Database migration adding profile_uuid to 139 bookings
- ✅ Profile service with shift management
- ✅ News service with read tracking
- ✅ Admin profile management API
- ✅ Email service for profile links
- ✅ Profile access tracking

### Frontend
- ✅ Complete profile page redesign with burger menu
- ✅ 6 profile sections (News, Profile, Booking, Shifts, Ride-share, FAQs)
- ✅ Offline-first architecture with IndexedDB
- ✅ Admin profile management interface
- ✅ Admin news management interface
- ✅ Profile link integration in bookings table
- ✅ Optimistic UI updates for offline operations

### PWA
- ✅ Service worker with offline caching
- ✅ IndexedDB for profile/booking/news data
- ✅ Sync queue for offline operations
- ✅ PWA install prompts
- ✅ Update notifications
- ✅ Offline indicators

---

## Next Steps

1. ✅ ~~Profile page system implementation~~ **COMPLETED**
2. ✅ ~~PWA offline functionality~~ **COMPLETED**
3. Test profile system with real users
4. Implement push notifications (decide: FCM vs. web-push)
5. Design and implement role management system
6. Discuss financial system requirements with Spencer
7. Implement shift exchange system
8. Add ride-sharing functionality
9. Create "Was ist der Wiesenwahn?" information page

**Last Updated**: 2025-11-29
