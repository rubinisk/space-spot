# SpaceSpot – Smart Classroom Availability Finder 

A modern, student-centered campus web application that provides real-time tracking of classroom availability across college blocks, floor levels, capacities, and facilities.

Built with **plain HTML5, CSS3, vanilla JavaScript (ES modules)**, and **Firebase Cloud Firestore + Firebase Authentication (v10 modular SDK)**. Runs directly using the **VS Code Live Server extension** without any node packages, frameworks, or build tools.

---

## Project Structure

```text
SpaceSpot/
├── index.html          # Student View: Real-time search, filters, live availability counters & cards
├── admin.html          # Admin Portal: Google Auth, classroom inventory, 1-click status toggle & CRUD
├── app.js              # Student page logic: Firestore where() & orderBy() queries, onSnapshot listeners
├── admin.js            # Admin page logic: skrubini5@gmail.com auth check, addDoc, updateDoc, deleteDoc
├── seed.js             # Database Seeder: Generates 10 realistic classrooms across Blocks A, B, C
├── style.css           # Clean, modern, responsive UI design with animated status badges
├── firebase-config.js  # Firebase modular SDK initialization and configuration placeholder
├── firestore.rules     # Cloud Firestore security rules (public read, admin write)
└── README.md           # Setup, configuration, and presentation guide
```

---

## Step-by-Step Setup Guide

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add project**.
2. Name your project (e.g. `spacespot-college-project`) and click **Continue**.
3. (Optional) Disable Google Analytics or leave default, then click **Create project**.

### Step 2: Enable Cloud Firestore
1. In the Firebase Console left menu, navigate to **Build** &rarr; **Firestore Database**.
2. Click **Create database**.
3. Select a database location nearest to you (e.g., `asia-south1` or `nam5 (us-central)`).
4. For initial security rules, select **Start in test mode** or **Production mode** (we will publish strict rules in Step 5).
5. Click **Create**.

### Step 3: Enable Google Authentication
1. In the left menu, navigate to **Build** &rarr; **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, choose **Google**.
4. Enable the toggle switch, provide your project support email (e.g., `skrubini5@gmail.com`), and click **Save**.
5. Under **Settings** &rarr; **Authorized domains**, ensure `localhost` and `127.0.0.1` are listed (they are present by default).

### Step 4: Paste Credentials into `firebase-config.js`
1. In the Firebase Console, click the **Gear Icon (⚙️)** &rarr; **Project settings**.
2. Scroll down to **Your apps**, click the **Web icon (`</>`)**, and register your app (e.g., `SpaceSpot Web`).
3. Under **Firebase SDK snippet**, choose **Config** to view your keys:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "spacespot-project.firebaseapp.com",
     projectId: "spacespot-project",
     storageBucket: "spacespot-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef..."
   };
   ```
4. Open [firebase-config.js](file:///c:/Users/Rubini/OneDrive/Desktop/SpaceSpot/firebase-config.js) in VS Code.
5. Replace the placeholder values with your real project credentials and save the file.

### Step 5: Publish Firestore Security Rules
1. In the Firebase Console, navigate to **Firestore Database** &rarr; **Rules** tab.
2. Replace all existing text with the rules from [firestore.rules](file:///c:/Users/Rubini/OneDrive/Desktop/SpaceSpot/firestore.rules):
   ```firestore
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /classrooms/{classroomId} {
         // Anyone can read classroom availability (students & visitors)
         allow read: if true;

         // Only skrubini5@gmail.com can write, edit, or delete
         allow write: if request.auth != null && 
                        request.auth.token.email == "skrubini5@gmail.com";
       }
     }
   }
   ```
3. Click **Publish**.

---

## How to Run with VS Code Live Server

1. Install the **Live Server** extension in VS Code if you don't already have it:
   - Press `Ctrl + Shift + X` in VS Code, search for **Live Server** by *Ritwick Dey*, and click **Install**.
2. Open the project folder in VS Code (`SpaceSpot`).
3. Right-click on [index.html](file:///c:/Users/Rubini/OneDrive/Desktop/SpaceSpot/index.html) in the file explorer and select **Open with Live Server** (or click **Go Live** on the bottom status bar).
4. The student page will launch in your browser at `http://127.0.0.1:5500/index.html`.
5. Access the Admin Portal by clicking **Admin Portal** on the navbar or navigating to `http://127.0.0.1:5500/admin.html`.

> [!NOTE]
> Browsers enforce CORS and security policies on ES module imports (`import ... from '...'`). Opening HTML files directly via `file:///` in the browser will block ES module loading. Live Server provides the local HTTP web server required for native ES modules.

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

### Blocks & Room Numbering Specification
- **Campus Blocks (4 Academic Blocks):** `A`, `C`, `D`, `F` *(Blocks B and E are Staff Rooms and excluded)*.
- **4 Rooms Per Floor, 1 Laboratory Per Floor (64 Total Rooms):**
  - **Ground Floor (Floor 0):** `102`, `103` *(Lab)*, `104`, `105` *(Room 101 does not exist)*
  - **1st Floor (Floor 1):** `201`, `203`, `204` *(Lab)*, `205` *(Room 202 does not exist)*
  - **2nd Floor (Floor 2):** `301`, `302`, `304`, `305` *(Lab)* *(Room 303 does not exist)*
  - **3rd Floor (Floor 3):** `401`, `402` *(Lab)*, `403`, `405` *(Room 404 does not exist)*
- **Total Campus Capacity:** 4 blocks x 16 rooms = 64 rooms (48 Classrooms + 16 Laboratories).

### 12 College Time Slots Schedule

| Slot | Time Window | Notes |
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

## Admin Portal & Security Verification

1. Open `admin.html`.
2. Click **Sign in with Google**.
3. **If you sign in with `skrubini5@gmail.com`:**
   - Full management panel unlocks.
   - You can click **"Seed 10 Classrooms"** to instantly generate 10 diverse test rooms.
   - You can toggle availability with **1-click** (instantly synced to all open student screens).
   - You can add, edit, or delete classrooms.
4. **If any other email signs in:**
   - The system intercepts the authentication token, displays **"Access denied: Unauthorized account"**, and immediately revokes the session via `signOut(auth)`.
   - Security is additionally enforced at the database layer via `firestore.rules`.

---

## Why Firestore Requires Indexes & The Alternate Solution

### 1. The Classic Problem: Why Firestore Asks for an Index for Every Query
In Cloud Firestore, when you execute queries combining multiple fields on the database server:
- Example: `where("block", "==", "A")` + `where("floor", "==", 1)` + `orderBy("capacity", "asc")`

Firestore **demands a pre-computed "Composite Index"** for every single permutation of fields. If you have:
- 4 Blocks × 4 Floors × 12 Slots × Sort by Capacity = **over a dozen separate indexes** to create manually in Firebase Console!
If an index is missing, Firestore halts the query with an `index-required` error.

---

### 2. The Smart Alternate Way: In-Memory Reactive Architecture (Used in SpaceSpot)
Instead of forcing you to create 15+ composite indexes in Firebase Console, SpaceSpot implements the industry-standard **Single-Collection Real-time Stream + In-Memory Reactive Filter**:

```mermaid
flowchart LR
    A["Cloud Firestore"] -->|Single onSnapshot Listener| B["app.js Cache (allRoomsCache)"]
    B -->|0ms Instant JS Filter & Sort| C["Student UI (Cards Grid)"]
    Admin["Admin Toggles Slot"] -->|updateDoc()| A
```

#### How it works:
1. **Single Collection Listener (`app.js`)**:
   We attach one real-time listener to `classrooms` without compound `where()` or `orderBy()` clauses:
   ```javascript
   onSnapshot(collection(db, "classrooms"), (snapshot) => {
     allRoomsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
     applyClientFiltersAndRender();
   });
   ```
   **Cloud Firestore never asks for composite indexes on simple collection listeners!**
2. **Instant In-Memory JavaScript Filtering**:
   When the student clicks a Block, Floor, Slot, or Minimum Capacity dropdown, the filter runs immediately in JavaScript memory:
   ```javascript
   const filtered = allRoomsCache.filter(room => {
     if (selectedBlock !== "ALL" && room.block !== selectedBlock) return false;
     if (selectedFloor !== "ALL" && room.floor !== selectedFloor) return false;
     if (room.capacity < minCap) return false;
     return true;
   });
   ```

#### Why This Alternate Way is Far Superior:
- **Zero Indexes Needed:** You will **never** have to build or wait for composite indexes in Firebase Console again.
- **0ms Latency:** Filter changes happen instantaneously in memory with zero network delay.
- **100% Real-Time Sync:** When the admin marks a room occupied or updates a slot, Firestore's `onSnapshot` fires instantly across all student screens.
- **Lower Firestore Billing/Quota Usage:** Instead of charging a read request on every single filter dropdown click, all filtering is computed locally in the browser!

## How SpaceSpot Handles "Joins" in NoSQL (Denormalization vs. SQL Relational Joins)

One of the most common questions during a Database presentation is: **"How does your NoSQL database perform JOINs between classrooms, daily time slots, and amenities?"**

### The Traditional Relational Approach (MySQL):
In a traditional relational DBMS (like MySQL or PostgreSQL), achieving SpaceSpot's functionality requires **3 separate tables and multiple expensive `JOIN` operations**:
```sql
-- MySQL requires joining tables:
SELECT c.name, s.slot_id, s.status, f.facility_name
FROM classrooms c
JOIN room_slots s ON c.id = s.classroom_id
JOIN room_facilities f ON c.id = f.classroom_id
WHERE c.block = 'A';
```
*Drawback:* Every query performs disk scans, lock checks, and index joins across multiple tables, which creates severe performance bottlenecks as the database scales.

### The NoSQL Document Approach (Cloud Firestore in SpaceSpot):
In Cloud Firestore, relationships are modeled using **Data Denormalization & Nested Data Structures**:
```text
classrooms (Collection)
  └── document ("A-102")
        ├── name: "A-102"
        ├── block: "A"
        ├── floor: 0
        ├── facilities: ["Projector", "AC", "Whiteboard"]   <-- Embedded Array (No Join Table)
        └── slots: {                                         <-- Embedded Map (No Join Table)
              "slot1": "available",
              "slot2": "available",
              ...
              "slot12": "occupied"
            }
```
*Why this is superior:*
- **Atomic Single-Read Latency ($O(1)$):** The classroom details, its full 12-period daily timetable, and all its physical facilities are retrieved in a **single document read**.
- **Zero Join Penalties:** Eliminates relational join latency, reduces memory overhead, and allows distributed horizontal scaling across Google Spanner storage tablets.
---
