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

### Phase 3: Offline Functionality
- [ ] Cache profile page for offline viewing
- [ ] Store booking details in IndexedDB for offline access
- [ ] Implement offline indicator in UI
- [ ] Queue profile updates when offline (sync when online)

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

### Core Profile Features
- [ ] **Unique Profile Access**
  - Generate unique profile ID for each user (UUID or short code)
  - Send profile link via email after registration
  - ID regeneration/recovery mechanism via email
  - No login credentials needed

- [ ] **Profile Overview Dashboard**
  - Display booking details (tickets, food, beverages, materials)
  - Show work shift assignments
  - Personal information summary
  - Payment status indicator

- [ ] **Editable Booking Details**
  - Allow editing until specified deadline
  - Lock editing after payment received
  - Fields that can be edited:
    - Work shift preferences and material contributions
  - Fields that cannot be edited after payment:
    - Tickets, food, beverages
  - Consider: Allow ticket/food/beverage changes before payment?

- [ ] **News Feed**
  - Admin-posted updates visible on profile
  - Content types: Anreise info, Timetable, Workshops, Announcements
  - Push notification integration
  - Chronological feed with timestamps

- [ ] **Work Shift Management Interface**
  - View assigned shifts with details (time, location, description)
  - Accept/decline shift assignments
  - Rejection feedback form:
    - Reason selection (not available that day, preference for different shift, etc.)
    - Alternative preferences
  - Confirmation status tracking

- [ ] **Shift Exchange System (Tauschbörse)**
  - View available shift swaps (anonymized or with names?)
  - Post shift swap offers (24-hour validity)
  - For users with multiple shifts: select specific shift to swap
  - Notification when swap match found
  - Admin approval workflow for swaps?

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

### High Priority (Phase 1)
1. Profile page system foundation
2. PWA basic implementation (manifest, service worker)
3. Work shift management interface
4. Admin role management system

### Medium Priority (Phase 2)
5. Push notifications
6. News feed
7. Financial management system
8. Enhanced food/tickets/beverages display

### Lower Priority (Phase 3)
9. Shift exchange system (Tauschbörse)
10. Ride-sharing board
11. Multi-shift prevention logic
12. Information page

### Ongoing
- Security hardening
- Data encryption
- Testing and bug fixes

---

## Technical Considerations

### Database Schema Changes Needed
- User profiles table with unique IDs
- News feed table
- Shift exchange/swap table
- Role configuration table
- Financial tables (budget, expenses)
- FAQ content table
- Notification preferences table
- Awareness team tracking

### API Endpoints to Create
- Profile access and management
- News feed CRUD
- Shift acceptance/rejection
- Shift swap posting/matching
- Push notification subscription
- Role management
- Financial data management

### Frontend Components Needed
- Profile dashboard component
- News feed component
- Shift management interface
- FAQ viewer
- Ride-sharing board
- Admin financial dashboard

---

## Next Steps

1. Review and prioritize features
2. Decide on PWA notification provider (FCM vs. web-push)
3. Design database schema changes
4. Create wireframes for profile page
5. Discuss financial system requirements with Spencer
6. Determine Awareness team workflow

**Last Updated**: 2025-11-29