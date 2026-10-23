# SpaceSpot – Smart Classroom & Laboratory Availability Finder

A modern, student-centered campus web application that provides real-time tracking of classroom and laboratory availability across college blocks, floor levels, capacities, and facilities.

Built with **plain HTML5, CSS3, vanilla JavaScript (ES modules)**, and **Google Cloud Firestore + Firebase Authentication (v10 modular SDK)**. Runs directly using the **VS Code Live Server extension** without any node packages, frameworks, or build tools.

---

## Problem Statement & Solution
- **The Campus Challenge:** Finding an empty classroom or specialized laboratory on a large multi-block college campus typically requires physical walking between blocks and checking room doors, leading to significant wasted time and scheduling disruptions.
- **The SpaceSpot Solution:** A centralized, real-time availability finder backed by Cloud Firestore. SpaceSpot tracks 64 campus rooms across 12 daily academic periods (8:00 AM – 6:15 PM), providing instant visibility into room capacity, amenities, and period-by-period occupancy without page reloads.

---

## Key Features
- **Dual-View Campus Portal:**
  - *Student View:* Real-time search, filters (block, floor, capacity, facilities), auto-detect active college period, and live status indicators.
  - *Admin Portal:* Google Authentication restricted to verified administrator, 1-click period slot toggle, batch seeder, and full CRUD management.
- **DBMS Query & Index Inspector:** An interactive evaluation panel allowing students and evaluators to execute live server-side Firestore queries with real-time `performance.now()` latency benchmarking and index analysis.
- **Serverless & Zero DevOps:** Runs 100% serverless on Google Cloud Firestore with native WebChannel real-time delta streaming.

---

## Technology Stack
- **Frontend:** Plain HTML5, CSS3 (Collegiate Crimson & White Theme), Vanilla JavaScript (ES6 Modules).
- **Database:** Google Cloud Firestore (Firebase v10 Modular SDK).
- **Authentication:** Firebase Authentication (Google OAuth Provider).
- **Hosting / Local Server:** VS Code Live Server extension (no Node.js build tools, bundlers, or frameworks required).

---

## Live Database & Architecture Status
- **Google Cloud Project ID:** `spacespot-137e6`
- **Active Documents:** 64 Monitored Classrooms & Laboratories
- **Campus Distribution:** Blocks A, C, D, and F (4 Floors, 4 Rooms/Floor, 1 Laboratory/Floor)
- **Schedule Matrix:** 12 Academic Period Slots (8:00 AM – 6:15 PM)
- **Design Theme:** University Collegiate Crimson / Maroon (`#a40046`) & White

---

## Project Structure

```text
SpaceSpot/
├── index.html          # Student View: Real-time search, filters, live availability counters & cards
├── admin.html          # Admin Portal: Google Auth, classroom inventory, 1-click status toggle & CRUD
├── app.js              # Student page logic: onSnapshot listeners, DBMS Query & Index Inspector
├── admin.js            # Admin page logic: skrubini5@gmail.com auth check, addDoc, updateDoc, deleteDoc
├── seed.js             # Database Seeder: Generates 64 realistic rooms across Blocks A, C, D, F
├── slots-config.js     # 12-Slot collegiate schedule configuration and auto-detect logic
├── style.css           # Clean collegiate crimson/white theme, responsive layouts & modals
├── firebase-config.js  # Firebase modular SDK initialization and project configuration
├── firestore.rules     # Cloud Firestore security rules (public read, authenticated admin write)
├── case_study.md       # Comprehensive 11-section academic DBMS case study & defense report
└── README.md           # Setup, configuration, and evaluator presentation defense guide
```

---

## Evaluator Walkthrough: Hands-on Demonstration (5 Marks)

Use this step-by-step sequence during your presentation to demonstrate all database operations to your evaluator:

### Step 1: Real-Time Synchronization Across Two Windows
1. Open `http://127.0.0.1:5500/index.html` in one browser window (Student View).
2. Open `http://127.0.0.1:5500/admin.html` in a second browser window side-by-side (Admin View).
3. In the Admin View, locate any classroom (e.g., `A-102`) and click any slot button (e.g., `S3` or `Free/Occupied`).
4. **Observe the result:** The Student View updates instantly in real time via Cloud Firestore's WebChannel stream with **zero page reloads**!

### Step 2: Live Server-Side Query & Index Inspector
1. On the Student View (`index.html`), click the **"DBMS Query & Index Inspector"** button in the filter header.
2. The modal allows the evaluator to test four distinct indexing scenarios:
   - **Preset 1 (Single-Field B-Tree):** Executes `query(collection(db, "classrooms"), where("block", "==", "A"))`.  
     *Theoretical Defense:* Demonstrates automated single-field B-Tree indexing.
   - **Preset 2 (Range & Sorting on Same Field):** Executes `query(collection(db, "classrooms"), where("capacity", ">=", 60), orderBy("capacity", "asc"))`.  
     *Theoretical Defense:* Demonstrates range inequality filtering combined with index ordering on the same field using a single-field B-Tree.
   - **Preset 3 (Index Merging across Multiple Fields):** Executes `query(collection(db, "classrooms"), where("block", "==", "A"), where("floor", "==", 1))`.  
     *Theoretical Defense:* Demonstrates Firestore index merging intersecting two independent single-field B-Tree indexes without requiring a composite index.
   - **Preset 4 (Composite Index Requirement Demo):** Executes `query(collection(db, "classrooms"), where("block", "==", "A"), where("capacity", ">=", 50))`.  
     *Theoretical Defense:* Demonstrates when Firestore requires a multi-column composite index `(block ASC, capacity ASC, __name__ ASC)` for combining equality with range inequality across different fields. When the index is unbuilt, captures the Google Cloud `FAILED_PRECONDITION` error with the direct index generation URL; once created in the Firebase Console, the query executes directly against the composite index.
3. Click **"Execute Server-Side Query on Firestore"**:
   - The system measures live roundtrip latency in real time using `performance.now()`.
   - Results are rendered in a live snapshot table directly from Google Cloud servers.

### Step 3: Complete CRUD Operations
- **CREATE:** Click "Add Classroom" in Admin Portal or run `node seed.js` (uses `addDoc` or `writeBatch`).
- **READ:** Handled continuously via `onSnapshot` streaming and `getDocs` in the Inspector.
- **UPDATE:** Click any period slot in the admin table (executes `updateDoc` targeting `slots.slotX`).
- **DELETE:** Click the "Delete" button on any room in the Admin Portal (executes `deleteDoc`).

### Step 4: Security Rules & Data Integrity Enforcement
1. In `admin.html`, sign out or attempt signing in with an unauthorized Google account.
2. The system intercepts the JWT token and denies access.
3. Show the professor [firestore.rules](./firestore.rules) to demonstrate edge-proxy access restriction AND database-level integrity constraints (`isValidClassroomData` validating `name`, `block`, `floor 0..3`, `capacity 10..200`, and `status`).

---

## Step-by-Step Setup Guide

### Step 1: Open with VS Code Live Server
1. Install the **Live Server** extension in VS Code.
2. Open the `SpaceSpot` folder in VS Code.
3. Right-click on [index.html](./index.html) and select **Open with Live Server** (or click **Go Live** on the bottom blue status bar).
4. The browser will open at `http://127.0.0.1:5500/index.html`.

> [!NOTE]
> Browsers strictly block native JavaScript ES modules on `file:///` URLs due to CORS security policies. Live Server provides the local HTTP server required for native module loading.

### Step 2: Verify Firebase Configuration
The application is pre-configured and connected to the live Firebase project:
- File: [firebase-config.js](./firebase-config.js)
- Project ID: `spacespot-137e6`

### Step 3: Publish Firestore Security Rules
Security rules are defined in [firestore.rules](./firestore.rules):
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthorizedAdmin() {
      return request.auth != null 
        && request.auth.token.email == "skrubini5@gmail.com";
    }

    function isValidClassroomData(data) {
      return data.keys().hasAll(['name', 'block', 'floor', 'capacity', 'status', 'slots'])
        && data.keys().hasOnly(['name', 'block', 'floor', 'type', 'capacity', 'status', 'slots', 'facilities', 'updatedAt'])
        && data.name is string && data.name.size() >= 2 && data.name.size() <= 20
        && data.block is string && data.block in ['A', 'C', 'D', 'F']
        && (data.floor is int || data.floor is number) && data.floor >= 0 && data.floor <= 3
        && (data.capacity is int || data.capacity is number) && data.capacity >= 10 && data.capacity <= 200
        && data.status is string && data.status in ['available', 'occupied']
        && data.slots is map;
    }

    match /classrooms/{classroomId} {
      // Public read access for classroom availability
      allow read: if true;

      // Restricted create & update: verified admin + schema & domain validation
      allow create: if isAuthorizedAdmin() && isValidClassroomData(request.resource.data);
      allow update: if isAuthorizedAdmin() && isValidClassroomData(request.resource.data);

      // Restricted delete: verified admin only
      allow delete: if isAuthorizedAdmin();
    }
  }
}
```

---

## Firestore Data Model & Campus Architecture

Collection name: **`classrooms`**

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `name` | string | Classroom identification code (`<Block>-<Number>`) | `"A-102"`, `"C-201"`, `"D-104"` |
| `block` | string | Academic block code (`"A"`, `"C"`, `"D"`, `"F"`) | `"A"` (Blocks B & E are Staff Rooms) |
| `floor` | number | Floor index (`0`=Ground, `1`=1st, `2`=2nd, `3`=3rd) | `0` (Ground Floor) |
| `type` | string | Space type (`"classroom"` or `"lab"`) | `"classroom"` or `"lab"` |
| `capacity` | number | Maximum seating capacity | `50` |
| `status` | string | Overall fallback availability | `"available"` or `"occupied"` |
| `slots` | map | 12-Slot Schedule (`slot1` to `slot12`) | `{"slot1": "available", "slot2": "occupied", ...}` |
| `facilities` | array | Amenities equipped in the room | `["Projector", "AC", "Lab Computers"]` |
| `updatedAt` | timestamp | Server timestamp of last edit | `serverTimestamp()` |

### Campus Layout & Room Numbering Specification
- **Campus Blocks (4 Academic Blocks):** `A`, `C`, `D`, `F` *(Blocks B and E are Staff Rooms)*.
- **4 Rooms Per Floor, 1 Laboratory Per Floor (64 Total Rooms):**
  - **Ground Floor (Floor 0):** `102`, `103` *(Lab)*, `104`, `105` *(Room 101 does not exist)*
  - **1st Floor (Floor 1):** `201`, `203`, `204` *(Lab)*, `205` *(Room 202 does not exist)*
  - **2nd Floor (Floor 2):** `301`, `302`, `304`, `305` *(Lab)* *(Room 303 does not exist)*
  - **3rd Floor (Floor 3):** `401`, `402` *(Lab)*, `403`, `405` *(Room 404 does not exist)*
- **Total Campus Capacity:** 4 blocks x 16 rooms = 64 rooms (48 Classrooms + 16 Laboratories).

### 12 College Time Slots Schedule

| Slot | Time Window | Academic Period |
| :--- | :--- | :--- |
| **Slot 1** | 8:00 AM – 8:50 AM | Period 1 |
| **Slot 2** | 8:50 AM – 9:40 AM | Period 2 |
| **Slot 3** | 9:40 AM – 10:30 AM | Period 3 |
| *(Break)* | 10:30 AM – 10:45 AM | Morning Recess (15 mins) |
| **Slot 4** | 10:45 AM – 11:35 AM | Period 4 |
| **Slot 5** | 11:35 AM – 12:25 PM | Period 5 |
| **Slot 6** | 12:25 PM – 1:15 PM | Period 6 |
| **Slot 7** | 1:15 PM – 2:05 PM | **Lunch Break Period** |
| **Slot 8** | 2:05 PM – 2:55 PM | Period 8 |
| **Slot 9** | 2:55 PM – 3:45 PM | Period 9 |
| **Slot 10** | 3:45 PM – 4:35 PM | Period 10 |
| **Slot 11** | 4:35 PM – 5:25 PM | Period 11 |
| **Slot 12** | 5:25 PM – 6:15 PM | Period 12 |

---

## Technical Concept Defense: Indexing & Joins

### 1. How SpaceSpot Handles "Joins" in NoSQL (Denormalization vs. SQL Relational Joins)

One of the central questions during an academic DBMS evaluation is:  
**"How does your database perform JOINs between classrooms, daily time slots, and amenities?"**

#### The Traditional Relational Approach (MySQL):
In a relational DBMS, modeling this system requires three normalized tables:
```sql
SELECT c.name, s.slot_id, s.status, f.facility_name
FROM classrooms c
JOIN room_slots s ON c.id = s.classroom_id
JOIN room_facilities f ON c.id = f.classroom_id
WHERE c.block = 'A';
```
- **Trade-off:** In a single-node database, indexed B-Tree joins are efficient. However, in distributed systems partitioned across multiple database servers, distributed joins require network shuffles and cross-node RPC calls, creating major latency bottlenecks.

#### The NoSQL Document Approach (Cloud Firestore):
In Cloud Firestore, relationships are modeled using **Data Denormalization & Nested Structures**:
- The 12-period daily timetable schedule is embedded directly as a **Map** (`slots`).
- Physical facilities are embedded directly as an **Array** (`facilities`).
- **Result:** An entire classroom record, its schedule, and its amenities are fetched in a single document read without requiring multi-table SQL joins or distributed network shuffles.

### 2. Querying & Indexing Architecture in SpaceSpot
- **Server-Side B-Tree Indexing:** Firestore automatically maintains ascending and descending single-field B-Tree indexes on every document field.
- **Index Merging (Single-Field Index Intersection):** For queries with multiple equality filters (e.g. `block == 'A'` and `floor == 1`), Firestore can intersect individual single-field indexes without requiring a composite index.
- **Composite Indexes:** When queries combine equality filters with inequality filters or sorting on different fields (`block == 'A'` and `capacity >= 50`), Firestore strictly requires a multi-column composite index.
- **Client-Side In-Memory Projection:** For interactive user interface filtering (switching periods), client-side in-memory projection executes quickly on the local browser CPU without redundant server reads or extra index requirements.

---

## Performance Considerations & Measurement Methodology

| Operation | Measurement Status | Methodology / Tooling |
| :--- | :--- | :--- |
| **Server Query Elapsed Time (`getDocs`)** | Live-instrumented in Inspector | High-resolution timestamp (`performance.now()`) around the `getDocs()` network request. |
| **Admin-to-Student Push Propagation** | Observable in two-window demo | Difference between admin commit time and student `onSnapshot` listener render. |
| **Client In-Memory Projection** | Local CPU measurement | Timed execution of `.filter()` and `.sort()` over the cached 64-document array. |
| **Classroom Dataset Payload** | Network tab inspection | Inspected via browser DevTools Network tab (~26 KB uncompressed JSON). |

> **Note:** Timings observed during demonstrations depend on client hardware, network bandwidth, and proximity to Google Cloud data centers; they represent live observed trials rather than guaranteed SLAs.
---

## System Limitations

1. **Absence of Native SQL Joins:** Firestore does not support multi-table relational joins; relationships are modeled via document denormalization.
2. **Composite Index Requirements:** Compound queries combining equality filters with inequality filters or ordering on distinct fields require explicitly created composite indexes.
3. **Single-Document Write Contention:** Cloud Firestore targets a maximum sustained write rate of approximately 1 write per second per document.
4. **No Native Arbitrary Substring Search:** Querying arbitrary substrings (e.g. `LIKE '%projector%'`) requires third-party search integrations (such as Algolia or Typesense).

---

## Case Study Documentation Link

For the complete 11-section theoretical and empirical analysis covering Firestore architecture, Spanner TrueTime consistency, B-Tree indexing, MySQL comparative trade-offs, and security rule specifications, consult:
- [SpaceSpot: Cloud Firestore Database Case Study Report](./case_study.md)

---

## References

1. **Google Firebase Documentation:** [Cloud Firestore Overview](https://firebase.google.com/docs/firestore)
2. **Google Firebase Data Model:** [Collections and Documents Guide](https://firebase.google.com/docs/firestore/data-model)
3. **Google Firebase Indexing:** [Manage Indexes in Cloud Firestore](https://firebase.google.com/docs/firestore/query-data/indexing)
4. **Google Firebase Security Rules:** [Get Started with Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
5. **Corbett, J. C., et al. (2013):** *Spanner: Google's Globally Distributed Database*, ACM TOCS, 31(3), 1–22.
