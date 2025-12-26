# Profile Page System Implementation Plan

## Overview
Implement unique profile pages for users to access their booking information, manage work shifts, view news, and interact with festival-related features without requiring login credentials.

## Current System Analysis

### Key Findings:
- **No persistent user accounts** - Each registration creates a new user/booking record
- **Booking ID is primary identifier** (integer)
- **Email confirmation** already implemented after registration
- **Payment tracking** fields exist (is_paid, paid_amount, payment_notes, payment_date)
- **ShiftAssignments table** exists for tracking shift assignments
- **No public endpoint** currently exists for users to view their own bookings

## Design Decisions

### Profile Access Model
**Approach:** UUID-based profile links (passwordless access)

**Rationale:**
- Aligns with roadmap requirement: "No login credentials needed"
- Email link provides secure access (UUID is cryptographically random)
- Simple user experience - click link in email
- No password management overhead
- Can regenerate/recover via email

**UUID Format:** `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` (UUID v4)
**Profile URL:** `https://domain.com/profile/{uuid}`

### Security Considerations
- UUID provides 128 bits of entropy (practically unguessable)
- Rate limiting on profile access endpoints
- Profile UUID acts as authentication token
- No sensitive data modification allowed without admin approval
- Can implement profile UUID regeneration if compromised

## Database Schema Changes

### 1. Add Profile UUID to Bookings

```sql
-- Migration script to add profile_uuid column
ALTER TABLE Bookings ADD COLUMN profile_uuid TEXT UNIQUE;
CREATE INDEX idx_bookings_profile_uuid ON Bookings(profile_uuid);

ALTER TABLE ArtistBookings ADD COLUMN profile_uuid TEXT UNIQUE;
CREATE INDEX idx_artist_bookings_profile_uuid ON ArtistBookings(profile_uuid);
```

**Note:** SQLite ALTER TABLE has limitations. Need to:
1. Create new table with updated schema
2. Copy data from old table
3. Generate UUIDs for existing records
4. Drop old table and rename new table

### 2. Extend ShiftAssignments for Acceptance Workflow

```sql
ALTER TABLE ShiftAssignments ADD COLUMN status TEXT DEFAULT 'pending';
ALTER TABLE ShiftAssignments ADD COLUMN rejection_reason TEXT;
ALTER TABLE ShiftAssignments ADD COLUMN alternative_preferences TEXT;
ALTER TABLE ShiftAssignments ADD COLUMN response_date DATETIME;

-- status values: 'pending', 'accepted', 'declined'
```

### 3. Create News Feed Table

```sql
CREATE TABLE IF NOT EXISTS News (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT, -- 'anreise', 'timetable', 'workshop', 'announcement'
    published_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    author TEXT,
    is_active INTEGER DEFAULT 1
);
```

### 4. Create News Read Tracking Table

```sql
CREATE TABLE IF NOT EXISTS NewsReadStatus (
    id INTEGER PRIMARY KEY NOT NULL,
    booking_id INTEGER NOT NULL,
    news_id INTEGER NOT NULL,
    read_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
    FOREIGN KEY(news_id) REFERENCES News(id) ON DELETE CASCADE,
    UNIQUE(booking_id, news_id)
);
```

### 5. Create Shift Exchange Table (Tauschbörse)

```sql
CREATE TABLE IF NOT EXISTS ShiftExchanges (
    id INTEGER PRIMARY KEY NOT NULL,
    booking_id INTEGER NOT NULL,
    timeslot_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'matched', 'expired', 'cancelled'
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATETIME, -- 24 hours from creation
    matched_with_booking_id INTEGER,
    match_date DATETIME,
    notes TEXT,
    FOREIGN KEY(booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
    FOREIGN KEY(timeslot_id) REFERENCES TimeSlots(id) ON DELETE CASCADE,
    FOREIGN KEY(matched_with_booking_id) REFERENCES Bookings(id) ON DELETE SET NULL
);
```

## Backend Implementation

### Phase 1: Database Migration & Core Profile Access

**Files to create:**
1. `server/src/migrations/add_profile_uuid.py` - Migration script
2. `server/src/api/profile.py` - Profile API endpoints blueprint
3. `server/src/services/profile_service.py` - Profile business logic
4. `server/src/services/news_service.py` - News management
5. `server/src/services/shift_service.py` - Shift management

**Endpoints:**

#### Profile Access (No Auth Required - UUID is the auth)
```
GET /api/profile/{profile_uuid}
- Returns: user info, booking details, payment status
- Response: { user: {...}, booking: {...}, shifts: [...], payment: {...} }

POST /api/profile/recover
- Input: { email: string }
- Sends email with profile link(s) to all bookings with that email
- Rate limited: 3/hour per IP
```

#### Shift Management
```
GET /api/profile/{profile_uuid}/shifts
- Returns: assigned shifts with status

PUT /api/profile/{profile_uuid}/shifts/{assignment_id}/accept
- Accept a shift assignment
- Updates ShiftAssignments.status to 'accepted'

PUT /api/profile/{profile_uuid}/shifts/{assignment_id}/decline
- Input: { rejection_reason: string, alternative_preferences: string }
- Updates ShiftAssignments.status to 'declined'
- Admin receives notification
```

#### News Feed
```
GET /api/profile/{profile_uuid}/news
- Returns: all active news items with read status
- Response: [{ id, title, content, category, published_date, is_read }]

POST /api/profile/{profile_uuid}/news/{news_id}/read
- Mark news item as read
- Creates entry in NewsReadStatus
```

#### Shift Exchange (Future Phase)
```
GET /api/profile/{profile_uuid}/shift-exchanges
- Returns: active shift exchange offers

POST /api/profile/{profile_uuid}/shift-exchanges
- Input: { timeslot_id: number, notes: string }
- Creates shift swap offer with 24h expiry
```

### Phase 2: Update Booking Creation Flow

**Modify:**
1. `server/src/services/booking_service.py` - Generate UUID on booking creation
2. `server/src/services/artist_service.py` - Generate UUID for artist bookings
3. `server/src/services/mail_service.py` - Include profile link in confirmation email

**Changes:**

```python
# booking_service.py
import uuid

def insert_booking(booking: Booking) -> int:
    # ... existing code ...

    # Generate unique profile UUID
    profile_uuid = str(uuid.uuid4())

    # Insert booking with profile_uuid
    cursor.execute("""
        INSERT INTO Bookings (
            user_id, ticket_option_id, ..., profile_uuid
        ) VALUES (?, ?, ..., ?)
    """, (..., profile_uuid))

    booking_id = cursor.lastrowid

    # Send confirmation email with profile link
    send_confirmation_mail(booking, form_content, profile_uuid)

    return booking_id
```

```python
# mail_service.py
def send_confirmation_mail(booking, form_content, profile_uuid):
    # ... existing email template ...

    # Add profile link section
    profile_link = f"https://wiesenwahn.de/profile/{profile_uuid}"

    html_content = f"""
    ...existing content...

    <div style="margin: 30px 0; padding: 20px; background: #1a1a2e; border-radius: 8px;">
        <h3 style="color: #64b5f6;">Dein Profil</h3>
        <p>Zugriff auf dein persönliches Profil:</p>
        <a href="{profile_link}"
           style="display: inline-block; padding: 12px 24px; background: #64b5f6;
                  color: white; text-decoration: none; border-radius: 4px; margin: 10px 0;">
            Profil öffnen
        </a>
        <p style="font-size: 12px; color: #aaa;">
            Speichere diesen Link - du brauchst ihn, um dein Profil später aufzurufen.
        </p>
    </div>
    """
```

### Phase 3: Admin News Management

**Files to create:**
1. `server/src/api/admin_news.py` - Admin news management endpoints

**Endpoints (Admin only):**
```
GET /api/admin/news
- List all news items

POST /api/admin/news
- Create news item
- Input: { title, content, category }

PUT /api/admin/news/{news_id}
- Update news item

DELETE /api/admin/news/{news_id}
- Soft delete (set is_active = 0)
```

## Frontend Implementation

### Phase 1: Profile Page Foundation

**Files to create:**
1. `frontend/src/pages/ProfilePage.tsx` - Main profile page component
2. `frontend/src/components/profile/ProfileOverview.tsx` - Overview dashboard
3. `frontend/src/components/profile/BookingDetails.tsx` - Booking info display
4. `frontend/src/components/profile/WorkShifts.tsx` - Shift management
5. `frontend/src/components/profile/NewsFeed.tsx` - News feed component
6. `frontend/src/components/profile/ProfileRecovery.tsx` - Email recovery form
7. `frontend/src/hooks/useProfile.ts` - Profile data hook
8. `frontend/src/services/profileService.ts` - Profile API client

**Route:**
```typescript
// App.tsx
<Route path="/profile/:profileUuid" element={<ProfilePage />} />
<Route path="/profile/recover" element={<ProfileRecovery />} />
```

**Component Structure:**
```
ProfilePage
├── ProfileOverview (dashboard)
│   ├── UserInfo
│   ├── PaymentStatus
│   └── QuickActions
├── BookingDetails (tabs)
│   ├── Tickets
│   ├── Food & Beverages
│   └── Materials
├── WorkShifts
│   ├── AssignedShifts (accept/decline)
│   └── ShiftExchange (future)
├── NewsFeed
│   └── NewsItem (multiple)
└── FAQ (future)
```

### Phase 2: Offline Integration

**Updates needed:**
1. `frontend/src/utils/indexedDB.ts` - Already has ProfileData and BookingData interfaces
2. `frontend/src/services/syncService.ts` - Already has profile sync methods
3. `frontend/src/hooks/useOfflineData.ts` - Already supports profile/booking data

**Integration:**
- Profile pages will automatically cache via service worker (already configured)
- Profile data stored in IndexedDB when viewed
- Shift acceptance/decline queued when offline via SyncQueueManager
- News marked as read queued when offline

### Phase 3: Profile Components

**ProfilePage.tsx:**
```typescript
import { useParams } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useOfflineData } from '../hooks/useOfflineData';

const ProfilePage: React.FC = () => {
  const { profileUuid } = useParams<{ profileUuid: string }>();
  const { profile, booking, shifts, news, loading, error } = useProfile(profileUuid);
  const { isOnline, queueOperation } = useOfflineData({ userId: profileUuid });

  // Component renders profile overview, booking details, shifts, news
}
```

## Migration Script

**File:** `server/src/migrations/add_profile_uuid.py`

```python
import sqlite3
import uuid
import os

def migrate():
    db_path = os.getenv('DATABASE_PATH', 'data/wiesenwahn.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # 1. Create new Bookings table with profile_uuid
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Bookings_new (
                id INTEGER PRIMARY KEY NOT NULL,
                Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                user_id INTEGER,
                ticket_option_id INTEGER,
                beverage_option_id INTEGER,
                food_option_id INTEGER,
                first_priority_timeslot_id INTEGER,
                second_priority_timeslot_id INTEGER,
                third_priority_timeslot_id INTEGER,
                amount_shifts INTEGER,
                supporter_buddy TEXT,
                signature BLOB,
                total_price REAL,
                is_paid INTEGER DEFAULT 0,
                paid_amount REAL DEFAULT 0.0,
                payment_notes TEXT DEFAULT '',
                payment_date TEXT DEFAULT NULL,
                profile_uuid TEXT UNIQUE,
                FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY(ticket_option_id) REFERENCES TicketOptions(id) ON DELETE SET NULL,
                FOREIGN KEY(beverage_option_id) REFERENCES BeverageOptions(id) ON DELETE SET NULL,
                FOREIGN KEY(food_option_id) REFERENCES FoodOptions(id) ON DELETE SET NULL
            )
        """)

        # 2. Copy data and generate UUIDs
        cursor.execute("SELECT * FROM Bookings")
        bookings = cursor.fetchall()

        for booking in bookings:
            profile_uuid = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO Bookings_new VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (*booking, profile_uuid))

        # 3. Drop old table and rename
        cursor.execute("DROP TABLE Bookings")
        cursor.execute("ALTER TABLE Bookings_new RENAME TO Bookings")

        # 4. Create index
        cursor.execute("CREATE INDEX idx_bookings_profile_uuid ON Bookings(profile_uuid)")

        # 5. Repeat for ArtistBookings
        # ... similar process ...

        # 6. Create News table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS News (
                id INTEGER PRIMARY KEY NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT,
                published_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                author TEXT,
                is_active INTEGER DEFAULT 1
            )
        """)

        # 7. Create NewsReadStatus table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS NewsReadStatus (
                id INTEGER PRIMARY KEY NOT NULL,
                booking_id INTEGER NOT NULL,
                news_id INTEGER NOT NULL,
                read_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
                FOREIGN KEY(news_id) REFERENCES News(id) ON DELETE CASCADE,
                UNIQUE(booking_id, news_id)
            )
        """)

        # 8. Extend ShiftAssignments
        cursor.execute("ALTER TABLE ShiftAssignments ADD COLUMN status TEXT DEFAULT 'pending'")
        cursor.execute("ALTER TABLE ShiftAssignments ADD COLUMN rejection_reason TEXT")
        cursor.execute("ALTER TABLE ShiftAssignments ADD COLUMN alternative_preferences TEXT")
        cursor.execute("ALTER TABLE ShiftAssignments ADD COLUMN response_date DATETIME")

        conn.commit()
        print("✅ Migration completed successfully")

        # Print sample profile UUID for testing
        cursor.execute("SELECT profile_uuid FROM Bookings LIMIT 1")
        sample_uuid = cursor.fetchone()
        if sample_uuid:
            print(f"Sample profile UUID: {sample_uuid[0]}")

    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()
```

## Implementation Phases

### Phase 1: Database & Backend Foundation ✅ COMPLETED
1. ✅ Create migration script
2. ✅ Run migration to add profile_uuid (139 bookings migrated)
3. ✅ Create profile API endpoints
4. ✅ Create admin profile management API
5. ✅ Update booking creation to generate UUIDs
6. ✅ Update email confirmation with profile link
7. ✅ Test profile access endpoint
8. ✅ Add profile access tracking (last_accessed, access_count)

### Phase 2: Frontend Profile Page ✅ COMPLETED
1. ✅ Create profile page components (burger menu navigation)
2. ✅ Integrate with existing offline infrastructure
3. ✅ Add profile recovery flow
4. ✅ Test offline functionality
5. ✅ Create 6 profile sections (News, Profile, Booking, Shifts, Ride-share, FAQs)
6. ✅ Add admin profile management interface
7. ✅ Add profile link column to bookings table

### Phase 3: Work Shift Management ✅ COMPLETED
1. ✅ Implement shift accept/decline UI
2. ✅ Add rejection feedback form (reason + alternatives)
3. ✅ Test offline shift acceptance
4. ✅ Implement optimistic UI updates
5. ✅ Add sync queue integration

### Phase 4: News Feed ✅ COMPLETED
1. ✅ Create admin news management UI
2. ✅ Implement news feed display (default landing page)
3. ✅ Add read status tracking
4. ✅ Implement unread count badge
5. ✅ Add category-based icons and organization
6. ✅ Offline support with IndexedDB caching

### Phase 5: Advanced Features (In Progress)
1. ✅ FAQ page (8+ questions with accordions)
2. ✅ Ride-sharing board (placeholder created)
3. ⏳ Shift exchange system (Tauschbörse) - Backend schema ready
4. ⏳ Cancellation system
5. ⏳ Push notifications
6. ⏳ Full ride-sharing implementation

## Testing Plan

### Backend Testing
```bash
# Test profile access
curl http://localhost:5001/api/profile/{uuid}

# Test profile recovery
curl -X POST http://localhost:5001/api/profile/recover \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test shift acceptance
curl -X PUT http://localhost:5001/api/profile/{uuid}/shifts/{id}/accept
```

### Frontend Testing
1. Navigate to `/profile/{uuid}` - should load profile
2. Navigate to `/profile/invalid-uuid` - should show error
3. Test offline access - should load cached profile
4. Test shift acceptance offline - should queue operation
5. Go back online - should sync queued operations

## Security Considerations

1. **UUID Entropy:** Use UUID v4 (128 bits) - unguessable
2. **Rate Limiting:** Implement on all profile endpoints
3. **Email Verification:** Profile recovery sends link to registered email only
4. **Data Exposure:** Only show data belonging to the profile UUID
5. **Admin Notifications:** Send notifications for shift declines
6. **HTTPS Required:** Profile links must use HTTPS in production
7. **UUID Regeneration:** Admin can regenerate UUID if compromised

## Email Template Updates

Add to confirmation email:
```
📱 DEIN PROFIL

Hier findest du alle Informationen zu deiner Anmeldung:
→ Buchungsdetails
→ Arbeitsdienste
→ Neuigkeiten zum Festival
→ Zahlungsstatus

[Profil öffnen]

Wichtig: Speichere diesen Link! Du brauchst keine Login-Daten -
der Link ist dein persönlicher Zugang.

Bei Verlust kannst du den Link erneut anfordern unter:
https://wiesenwahn.de/profile/recover
```

## Next Steps

1. Review and approve this implementation plan
2. Run database migration
3. Implement Phase 1 backend endpoints
4. Test backend with sample data
5. Proceed to frontend implementation