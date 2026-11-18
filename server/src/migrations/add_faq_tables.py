"""
Database Migration: Add FAQ System
===================================

This migration creates FAQCategories and FAQs tables,
populates default categories, and migrates existing static FAQs.

Run this script once to migrate the database.
"""

import os
import sqlite3

# Determine database path
IN_DOCKER = os.environ.get("IN_DOCKER", "False").lower() == "true"

if IN_DOCKER:
    DB_FILE_PATH = "/app/user_data/bookings.db"
else:
    # Local development path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    DB_DIR = os.path.join(script_dir, "../../db")
    DB_FILE_PATH = os.path.join(DB_DIR, "bookings.db")


def migrate():
    """Run the FAQ tables migration"""
    print("=" * 60)
    print("Starting FAQ System Migration")
    print("=" * 60)
    print(f"Database path: {DB_FILE_PATH}")

    conn = sqlite3.connect(DB_FILE_PATH)
    cursor = conn.cursor()

    try:
        # ===================================================================
        # 1. CREATE FAQCATEGORIES TABLE
        # ===================================================================
        print("\n[1/4] Creating FAQCategories table...")

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS FAQCategories (
                id INTEGER PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                display_order INTEGER NOT NULL DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        print("   ✓ Created FAQCategories table")

        # ===================================================================
        # 2. INSERT DEFAULT CATEGORIES
        # ===================================================================
        print("\n[2/4] Inserting default FAQ categories...")

        default_categories = [
            (1, "Allgemein", 1, 1),
            (2, "Profil & Zugang", 2, 1),
            (3, "Schichten & Aufgaben", 3, 1),
            (4, "Buchung & Tickets", 4, 1),
            (5, "Anreise & Mitfahren", 5, 1),
            (6, "Festival & Wetter", 6, 1),
            (7, "Technisches & App", 7, 1),
        ]

        for cat_id, name, order, active in default_categories:
            cursor.execute(
                """
                INSERT OR IGNORE INTO FAQCategories (id, name, display_order, is_active)
                VALUES (?, ?, ?, ?)
            """,
                (cat_id, name, order, active),
            )

        print(f"   ✓ Inserted {len(default_categories)} default categories")

        # ===================================================================
        # 3. CREATE FAQS TABLE
        # ===================================================================
        print("\n[3/4] Creating FAQs table...")

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS FAQs (
                id INTEGER PRIMARY KEY NOT NULL,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                category_id INTEGER NOT NULL,
                display_order INTEGER NOT NULL DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(category_id) REFERENCES FAQCategories(id) ON DELETE CASCADE
            )
        """)

        print("   ✓ Created FAQs table")

        # ===================================================================
        # 4. MIGRATE EXISTING STATIC FAQS
        # ===================================================================
        print("\n[4/4] Migrating existing static FAQs...")

        # Existing FAQs from FAQs.tsx with category mapping
        static_faqs = [
            {
                "question": "Wie kann ich meinen Profil-Link wiederfinden?",
                "answer": "Dein Profil-Link wurde dir per E-Mail zugeschickt. Überprüfe deine E-Mails (auch den Spam-Ordner). Falls du die E-Mail nicht findest, kannst du auf der Startseite einen neuen Link anfordern.",
                "category_id": 2,  # Profil & Zugang
                "display_order": 1,
            },
            {
                "question": "Kann ich meine Schichtzuweisung ändern?",
                "answer": "Du kannst zugewiesene Schichten annehmen oder ablehnen. Bei Ablehnung kannst du einen Grund und alternative Präferenzen angeben. Das Orga-Team wird dann versuchen, eine passende Alternative zu finden.",
                "category_id": 3,  # Schichten & Aufgaben
                "display_order": 1,
            },
            {
                "question": "Was mache ich, wenn ich offline bin?",
                "answer": "Die Profil-Seite funktioniert auch offline! Alle wichtigen Informationen werden lokal gespeichert. Änderungen (wie Schicht-Annahmen) werden automatisch synchronisiert, sobald du wieder online bist.",
                "category_id": 7,  # Technisches & App
                "display_order": 1,
            },
            {
                "question": "Wie kann ich meine Buchungsdetails ändern?",
                "answer": "Für Änderungen an deiner Buchung (Ticket, Verpflegung, etc.) wende dich bitte direkt an das Orga-Team per E-Mail.",
                "category_id": 4,  # Buchung & Tickets
                "display_order": 1,
            },
            {
                "question": "Wann erhalte ich Neuigkeiten zum Festival?",
                "answer": "Alle aktuellen Informationen werden im Neuigkeiten-Bereich veröffentlicht. Neue Nachrichten werden mit einem Badge markiert.",
                "category_id": 1,  # Allgemein
                "display_order": 1,
            },
            {
                "question": "Wo finde ich Informationen zur Anreise?",
                "answer": 'Informationen zur Anreise findest du in den Neuigkeiten unter der Kategorie "Anreise", rechtzeitig vor Festivalbeginn. Außerdem kannst du die Mitfahrbörse nutzen, um Fahrgemeinschaften zu bilden.',
                "category_id": 5,  # Anreise & Mitfahren
                "display_order": 1,
            },
            {
                "question": "Was passiert bei schlechtem Wetter?",
                "answer": "Das Wiesenwahn Festival findet bei jedem Wetter statt! Aktuelle Wetterinformationen und eventuelle Anpassungen werden rechtzeitig über die Neuigkeiten bekannt gegeben.",
                "category_id": 6,  # Festival & Wetter
                "display_order": 1,
            },
            {
                "question": "Kann ich die Profil-Seite als App installieren?",
                "answer": "Ja! Die Profil-Seite kann als Progressive Web App (PWA) auf deinem Smartphone installiert werden. Beim ersten Besuch erscheint eine Installationsaufforderung, oder du kannst sie manuell über das Browser-Menü hinzufügen.",
                "category_id": 7,  # Technisches & App
                "display_order": 2,
            },
        ]

        for faq in static_faqs:
            cursor.execute(
                """
                INSERT INTO FAQs (question, answer, category_id, display_order, is_active)
                VALUES (?, ?, ?, ?, 1)
            """,
                (faq["question"], faq["answer"], faq["category_id"], faq["display_order"]),
            )

        print(f"   ✓ Migrated {len(static_faqs)} existing FAQs")

        # ===================================================================
        # COMMIT AND PRINT SUMMARY
        # ===================================================================
        conn.commit()

        print("\n" + "=" * 60)
        print("Migration Summary")
        print("=" * 60)
        print(f"✓ Created FAQCategories table")
        print(f"✓ Inserted {len(default_categories)} default categories")
        print(f"✓ Created FAQs table")
        print(f"✓ Migrated {len(static_faqs)} existing FAQs")

        # Print category breakdown
        print("\nFAQ Distribution by Category:")
        print("-" * 60)
        cursor.execute("""
            SELECT c.name, COUNT(f.id) as faq_count
            FROM FAQCategories c
            LEFT JOIN FAQs f ON c.id = f.category_id
            GROUP BY c.id, c.name
            ORDER BY c.display_order
        """)
        for category_name, count in cursor.fetchall():
            print(f"  {category_name}: {count} FAQ(s)")

        print("\n" + "=" * 60)
        print("✓ Migration completed successfully!")
        print("=" * 60)

    except Exception as e:
        conn.rollback()
        print(f"\n❌ Migration failed: {e}")
        import traceback

        traceback.print_exc()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
