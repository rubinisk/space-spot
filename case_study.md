# SpaceSpot: Cloud Firestore Database Case Study

**Course:** Database Management Systems (DBMS)  
**Project:** SpaceSpot – Smart Classroom & Laboratory Availability Finder  
**Selected Database:** Google Cloud Firestore (NoSQL document database)  
**Firebase Project Identifier:** `spacespot-137e6`  
**Project Repository:** https://github.com/rubinisk/space-spot  
**Dataset Described by Project:** 64 classroom/laboratory records across Blocks A, C, D, and F, with 12 timetable slots per room.  

> **Verification Scope:** This document describes the repository's design and source-code demonstrations. A configured Firebase project or source-code operation is not, by itself, proof that an operation succeeded against the live database. Screenshots, timings, authorization tests and deployment status should be confirmed during the demonstration. The 64-room dataset represents project test data.

---

## 1. Introduction

### 1.1 Overview
Cloud Firestore is Google's managed, cloud-hosted NoSQL document database, available through Firebase and Google Cloud Platform (GCP). It organizes records as documents within collections and supports queries, transactions, access control rules, and real-time change listeners. It is designed for web and mobile applications that need synchronized data without managing a dedicated database server directly.

### 1.2 History and Evolution
Firebase began as a real-time application platform in 2012 and was acquired by Google in 2014. Cloud Firestore entered public beta in 2017 and reached general availability in 2019. Google continues to develop Firestore, including compound query improvements, enterprise backup capabilities, and vector search. Cloud Firestore is architecturally distinct from the earlier Firebase Realtime Database (RTDB), which stores data as a single JSON tree.

### 1.3 Relevance to SpaceSpot
SpaceSpot lets students inspect classroom and laboratory availability and allows an authorized administrator to update room records and timetable slots. Firestore's document model is convenient because a room's details, physical facilities, and slot statuses can be retrieved together. Its `onSnapshot()` listener enables the student interface to respond to database changes in real time without manually refreshing the page.

---

## 2. Database Type and Model

### 2.1 Classification
Cloud Firestore is a **NoSQL document-oriented database**. Unlike a relational DBMS, it does not require every document in a collection to have identical fields and does not support SQL-style joins. The application enforces a consistent document shape through its code and Firestore Security Rules.

### 2.2 SpaceSpot Data Model
```text
Firestore database
└── classrooms (collection)
    ├── <document-id> (classroom document)
    │   ├── name: "A-102"
    │   ├── block: "A"
    │   ├── floor: 0
    │   ├── type: "classroom"
    │   ├── capacity: 55
    │   ├── status: "available"
    │   ├── facilities: ["Projector", "AC", "Whiteboard"]
    │   ├── slots: { slot1: "available", slot2: "occupied", ... }
    │   └── updatedAt: timestamp
    └── <other room documents>
```
The exact document IDs are generated during document creation or seeding. Firestore supports strings, numbers, booleans, timestamps, arrays, maps, references, and other supported data types. A document has a maximum size of 1 MiB. Subcollections are supported by Firestore but are not necessary for SpaceSpot's current classroom model.

### 2.3 Suitability
The document model works well for displaying each room's facilities and availability together. It reduces the need for application-side joins, although embedding slot data also means that frequent updates to the same room document may cause contention in a larger system.

---

## 3. Architecture and Design

### 3.1 System Architecture
```text
Student Browser                    Administrator Browser
HTML / CSS / JavaScript            HTML / CSS / JavaScript
          |                                  |
          | Firebase Web SDK                 | Firebase Auth + SDK
          v                                  v
                 Cloud Firestore
                 classrooms collection
                        |
                 Firestore Security Rules
                 (authorize client requests)
```
SpaceSpot is a browser-based application using the Firebase JavaScript SDK v10. Student views read classroom data and subscribe to updates; the administrator interface performs authorized writes. Firestore manages its server-side storage, indexing, and replication. The application does not need to implement those internal systems itself.

### 3.2 Storage and Indexing
Firestore maintains indexes to support queries. Automatic single-field indexes cover many basic equality, range, and sorting queries; some multi-field combinations require composite indexes. Firestore can also combine results across multiple single-field indexes (index merging) for certain compound queries.

The following four queries are implemented and verifiable in SpaceSpot's built-in **DBMS Query & Index Inspector**:

```javascript
// 1. Single-field equality filter (Automated single-field B-Tree index)
query(collection(db, "classrooms"), where("block", "==", "A"));

// 2. Range filter and ordering on the same field (Single-field ordered index)
query(collection(db, "classrooms"),
      where("capacity", ">=", 60),
      orderBy("capacity", "asc"));

// 3. Compound equality query on different fields (May use index merging across single-field indexes)
query(collection(db, "classrooms"),
      where("block", "==", "A"),
      where("floor", "==", 1));

// 4. Equality and range filter on different fields (Composite index may be required depending on configuration)
query(collection(db, "classrooms"),
      where("block", "==", "A"),
      where("capacity", ">=", 50));
```

Cloud Firestore query and indexing characteristics demonstrated by these presets:
- **Automated Single-Field Indexing:** Firestore automatically maintains single-field B-Tree indexes for every field in a document, supporting basic equality, range, and sorting operations without manual indexing (Queries 1 and 2).
- **Index Merging:** For multi-field equality filters (Query 3), Firestore can intersect independent single-field B-Tree indexes via index merging, avoiding the requirement of an explicit composite index under default configurations.
- **Composite Index Requirements:** Compound queries combining equality filters with inequality filters or multiple sort directions across distinct fields (Query 4) may require an explicitly configured multi-column composite index `(block ASC, capacity ASC, __name__ ASC)`.
- **Conditional Missing-Index Error:** A missing-index error (`FAILED_PRECONDITION`) occurs only when the required composite index is unavailable in the database. When unindexed, Firestore generates an error response containing a direct link to the Firebase Console to build the required index.
- **Execution Upon Index Creation:** Once the composite index has been generated and reaches the `Ready` status, the query executes successfully and streams the matching document set directly.

### 3.3 Query Processing and Optimization
Firestore uses indexes to avoid scanning every document for supported queries. The number of returned documents, index entries examined, network conditions, and query design affect latency. The claim that every Firestore query runs in constant or $O(k)$ time is not a universal guarantee, as index key lookups scale logarithmically ($O(\log N)$) before matching documents are streamed. SpaceSpot also filters its downloaded room collection in browser memory for interactive UI selections; this is client-side projection, not a new server database query.

### 3.4 Transactions, Concurrency, and Consistency
Cloud Firestore supports ACID (Atomicity, Consistency, Isolation, Durability) transactions and atomic batched writes:
- **Concurrency Model:** Mobile and Web client SDKs (such as SpaceSpot's JavaScript client) utilize **Optimistic Concurrency Control (OCC)**. The client reads documents without holding shared locks. If any document read during the transaction is modified by a concurrent operation before commit, the client SDK automatically aborts and retries the transaction. In contrast, server-side Admin SDKs (Node.js, Go, Java) can utilize pessimistic concurrency control and lock contention controls depending on database configuration.
- **Batched Writes vs. Transactions:** A simple `updateDoc()` call atomically updates fields on a single document. A batched write (`writeBatch()`) commits multiple create, update, or delete operations atomically across multiple documents in a single network roundtrip (either all succeed or all fail), without requiring read preconditions. SpaceSpot demonstrates atomic batched writes during database seeding in [`seed.js`](./seed.js) to populate or reset the 64 campus records atomically.
- **Global Strong Consistency:** Firestore server reads and queries are strongly consistent by default, linearizing all committed mutations across quorum replicas. Cached local reads or offline persistence states must be identified separately from server-verified state.

### 3.5 Scalability and Replication
Firestore is managed and scales across infrastructure without application-managed database shards. It offers regional and multi-region database locations with different availability and durability characteristics. High write rates (greater than 1 write per second) to the same document can create contention.

---

## 4. Core Features

| Feature | Firestore Capability | SpaceSpot Evidence or Scope |
| :--- | :--- | :--- |
| **Query Language** | SDK query methods including `where()`, `orderBy()`, `limit()` | Query & Index Inspector demonstrations |
| **Authentication** | Integrates with Firebase Authentication (OAuth / Google) | Admin login in `admin.html` and `admin.js` |
| **Authorization** | Firestore Security Rules control client reads and writes | `firestore.rules` restricts writes to admin email |
| **Encryption** | Encryption in transit (TLS 1.3) and at rest (AES-256) | Managed by Google Cloud platform |
| **Transactions** | ACID transactions and atomic batched writes | Demonstrated via batch seeding (`writeBatch`) in `seed.js` |
| **Integrity Constraints** | Rules validate data types, value ranges, and allowed domains | `isValidClassroomData` in `firestore.rules` |
| **Backup / Recovery** | Managed backups, exports, and Point-in-Time Recovery (PITR) | Platform capability; availability documented |
| **Triggers** | Cloud Functions can react to document mutations | Platform capability; optional serverless extension |
| **Integrations** | Firebase SDKs, BigQuery, Vertex AI, and Google Cloud services | Firebase Web SDK v10 used in client |

> **Security Note:** The current rule design permits public reads for campus availability while restricting writes to an authenticated administrator email (`skrubini5@gmail.com`). It validates core classroom fields, floor ranges (0–3), capacity ranges (10–200), status domains, individual slot values (`available`/`occupied`), and optional fields (`type`, `facilities`) on create and update operations.

---

## 5. Strengths, Limitations and Comparison with MySQL

| Criterion | Relational DBMS (MySQL) | Cloud Firestore |
| :--- | :--- | :--- |
| **Data Model** | Relational tables and SQL | Semi-structured documents and SDK queries |
| **Schema** | Structured tables, constraints, and DDL migrations | Flexible documents; rules and application validation |
| **Joins** | Native SQL joins; efficient on indexed single nodes | No native SQL joins; denormalization or multiple reads |
| **Real-Time Client Updates** | Requires application layer (WebSockets / Socket.io / PubSub) | Built-in reactive `onSnapshot()` listeners |
| **Transactions** | ACID transactions | ACID transactions and atomic batches |
| **Query Flexibility** | Arbitrary joins, aggregations, and complex SQL | Constrained by supported indexes and operators |
| **Scaling & Operations** | Self-managed or managed hosting (e.g. Cloud SQL) | Serverless managed infrastructure |
| **Pricing Model** | Provisioned instance hours and storage | Usage-based billing (document reads, writes, deletes, storage) |
| **Offline Synchronization** | Requires custom client application design | SDK local caching (IndexedDB in browser, SQLite on mobile) |

### 5.1 Strengths for SpaceSpot
1. Real-time listeners keep room availability views updated without manual page reloads.
2. Each room document groups physical facilities and slot statuses for straightforward retrieval.
3. Managed serverless hosting eliminates database server administration.
4. Security Rules provide server-enforced controls for browser SDK requests.

### 5.2 Limitations
1. No native relational joins or general-purpose SQL query language.
2. Compound queries combining multiple inequalities or distinct sort fields require explicitly configured composite indexes.
3. Rapid simultaneous writes to a single document can cause contention (1 write/second rule of thumb).
4. Firestore does not provide native arbitrary substring or full-text search comparable to a specialized search engine.

**Architecture Evaluation:** Firestore is well-suited for SpaceSpot's document-centric, real-time availability tracking. MySQL remains a strong alternative for join-intensive academic scheduling, complex degree audits, and relational administrative reporting.

---

## 6. Applications and Relevance

Firestore is commonly utilized for real-time dashboards, mobile applications, collaborative document tools, and lightweight resource tracking. A classroom availability finder is a practical campus-focused example because students need frequently updated room availability while administrators require controlled write access.

- **SpaceSpot Case Study:** The project monitors 64 classroom/laboratory records in blocks A, C, D, and F with 12 timetable slots per room. Students filter rooms by properties and inspect availability. Administrators maintain room records and slot states.
- **Enterprise Adoption Context:** Cloud Firestore is utilized across industry applications requiring real-time document sync, such as collaborative content management (The New York Times), real-time game lobby state management (Gameloft), and digital content delivery (The Economist).

---

## 7. Hands-on Demonstration

### 7.1 Setup and Demonstration Sequence
1. Create or select a Firebase project and register a web application (`firebase-config.js`).
2. Enable Cloud Firestore and Google Authentication.
3. Deploy and verify `firestore.rules` and any required composite indexes.
4. Seed classroom documents using the project's seeding functionality (`seed.js`).
5. Open the student view (`index.html`) and administrator portal (`admin.html`) in separate browser sessions.

**Project Files Demonstrated:**
- [`firebase-config.js`](./firebase-config.js): Database connection settings.
- [`app.js`](./app.js): Student reads, real-time listeners, and server query execution.
- [`admin.js`](./admin.js): Admin authentication and CRUD operations.
- [`seed.js`](./seed.js): 64-room campus data generator.
- [`firestore.rules`](./firestore.rules): Access authorization and data integrity constraints.

### 7.2 Example Document Structure
```javascript
{
  name: "A-102",
  block: "A",
  floor: 0,
  type: "classroom",
  capacity: 55,
  status: "available",
  facilities: ["Projector", "AC", "Whiteboard"],
  slots: {
    slot1: "available",
    slot2: "occupied"
    // slot3 through slot12
  },
  updatedAt: serverTimestamp()
}
```

### 7.3 CRUD Operations Implementation

#### CREATE
```javascript
const ref = await addDoc(collection(db, "classrooms"), {
  name: "C-201", block: "C", floor: 1, type: "classroom",
  capacity: 65, status: "available", facilities: ["Projector"],
  slots: getDefaultSlotsMap("available"), updatedAt: serverTimestamp()
});
```

#### READ & Real-Time Listener
```javascript
const unsubscribe = onSnapshot(collection(db, "classrooms"), (snapshot) => {
  const rooms = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  renderLiveClassrooms(rooms);
});
```

#### UPDATE (Targeted Nested Slot Field)
```javascript
await updateDoc(doc(db, "classrooms", roomId), {
  [`slots.${slotId}`]: newStatus,
  updatedAt: serverTimestamp()
});
```

#### DELETE
```javascript
await deleteDoc(doc(db, "classrooms", roomId));
```

### 7.4 Indexing Demonstration
Run the four queries from Section 3.2 using the Query & Index Inspector in `index.html`. Capture the query, returned documents, and any index requirement. When executing `where("block", "==", "A")` and `where("capacity", ">=", 50)`, explain that this query pattern may require an explicit composite index depending on whether it has already been generated in the project. If unindexed, demonstrate the Firebase Console generation link; if already indexed, demonstrate the resulting document stream.

### 7.5 Authentication, Authorization, and Integrity Demonstration
1. Sign in with the designated administrator account (`skrubini5@gmail.com`) and perform a valid room slot update.
2. Sign out or use an unauthenticated session and attempt an admin write; confirm access is blocked.
3. Test schema integrity constraints in `firestore.rules` by verifying that invalid capacities or disallowed blocks are rejected by the database.
4. Verify that student sessions receive the updated availability state without page refresh.

---

## 8. Performance Considerations

Firestore performance depends on network latency, query shape, index selection, result set size, document contention, browser runtime conditions, and caching. Browser-side filtering for 64 room objects is fast, but it reflects local CPU execution rather than server-side query throughput.

### 8.1 Measurement Methodology
For reproducible demonstration during evaluation, elapsed client-observed time can be measured using `performance.now()` around `getDocs()` calls:

| Operation | Status / Measured Trial | Measurement Methodology |
| :--- | :--- | :--- |
| **Server-Side Query (`getDocs`)** | Live-instrumented in Inspector | High-resolution timestamp (`performance.now()`) around `getDocs()` network roundtrip. |
| **Admin-to-Student Push Propagation** | Observed across 2 windows | Difference between admin commit timestamp and `onSnapshot` render execution. |
| **Client-Side In-Memory Projection** | Local CPU measurement | Timed execution of `.filter()` and `.sort()` over the cached 64-room array. |
| **Classroom Dataset Payload** | DevTools inspection | Network inspection of JSON payload for 64 records (~26 KB). |

> **Note:** Performance timings vary based on client hardware, internet connection bandwidth, and geographical proximity to Google Cloud data centers (`asia-south1` / `us-central1`). Specific static figures have been excluded to avoid presenting sample numbers as general benchmarks or platform SLA guarantees. Actual live timings are observed directly through the project's built-in Query & Index Inspector.

### 8.2 Scalability Considerations
A 64-document classroom dataset is modest and well within Firestore's free tier limits. For larger enterprise scale, best practices include:
1. Selective queries with limits and pagination (`startAfter()`).
2. Careful composite index planning.
3. Distributing high-frequency counters across distributed counter shards to avoid single-document write contention.

---

## 9. Future Trends and Roadmap

1. **Vector Similarity Search:** Firestore supports vector embeddings and k-nearest neighbor (k-NN) queries, facilitating AI Retrieval-Augmented Generation (RAG) directly on document collections.
2. **Operational Resilience:** Point-in-Time Recovery (PITR) and scheduled backups for enterprise disaster recovery.
3. **Application Extensions:** Potential future enhancements for SpaceSpot include date-specific academic calendar integration, laboratory equipment reservation workflows, and IoT occupancy sensor feeds.
4. **Hybrid Architectures:** Firebase Data Connect enables connecting Google Cloud SQL (PostgreSQL) with Firebase client SDKs for applications requiring deep relational joins alongside serverless mobile/web features.

---

## 10. Conclusion

SpaceSpot demonstrates how Google Cloud Firestore supports a campus classroom and laboratory availability application using document records, browser-based CRUD operations, real-time listeners, indexed queries, and declarative security rules. Firestore is an effective fit for this document-oriented, real-time campus tracking workload. Its trade-offs include restricted relational join capabilities, explicit index planning for compound queries, and write-rate constraints on individual documents. A relational database like MySQL remains a standard alternative for join-intensive scheduling, complex financial transactions, and normalized institutional administration.

---

## 11. References

1. **Google Firebase Documentation:** *Cloud Firestore Overview and Architecture*. https://firebase.google.com/docs/firestore
2. **Google Firebase Data Model:** *Understand Collections, Documents, and Subcollections*. https://firebase.google.com/docs/firestore/data-model
3. **Google Firebase Indexing:** *Index Types and Query Performance in Cloud Firestore*. https://firebase.google.com/docs/firestore/query-data/indexing
4. **Google Firebase Concurrency:** *Transactions and Batched Writes*. https://firebase.google.com/docs/firestore/manage-data/transactions
5. **Google Firebase Real-Time Listeners:** *Listen for Realtime Updates with onSnapshot*. https://firebase.google.com/docs/firestore/query-data/listen
6. **Google Firebase Security Rules:** *Get Started with Cloud Firestore Security Rules*. https://firebase.google.com/docs/firestore/security/get-started
7. **Google Cloud Firestore Best Practices:** *Designing for Scale and Avoiding Hotspots*. https://cloud.google.com/firestore/native/docs/best-practices
8. **Google Cloud Firestore Locations:** *Regional and Multi-Region Architectures*. https://cloud.google.com/firestore/native/docs/locations
9. **Corbett, J. C., et al.** (2013). "Spanner: Google’s Globally Distributed Database." *ACM Transactions on Computer Systems (TOCS)*, 31(3), 1-22.
10. **Stonebraker, M.** (2010). "SQL databases v. NoSQL databases." *Communications of the ACM*, 53(4), 10-11.
11. **SpaceSpot Source Repository:** https://github.com/rubinisk/space-spot

---
