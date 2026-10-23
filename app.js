// ==============================================================================
// SpaceSpot – Student View Logic (app.js)
// ==============================================================================
// DBMS Demonstration:
// 1. READ OPERATION (CRUD): Real-Time Snapshot Listener (onSnapshot) on collection "classrooms".
// 2. NOSQL JOIN EQUIVALENT: Solves multi-table relational joins via document denormalization 
//    and client-side projection of embedded slots map & facilities array.
// 3. INDEXING STRATEGY: Demonstrates automated single-field B-Tree indexing combined with
//    zero-index reactive client streaming to prevent composite index bottlenecks.
// 4. PERFORMANCE: Dual-engine instant loader (Direct REST fetch < 200ms initial render).
// 5. 12-Slot College Schedule integration (8:00 AM - 6:15 PM) with live active period tracker.
// ==============================================================================

import { 
  db, 
  firebaseConfig,
  isFirebaseConfigured 
} from "./firebase-config.js";

import { 
  TIME_SLOTS, 
  getCurrentSlot 
} from "./slots-config.js";

import { 
  collection, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// DOM Elements
const roomsGrid = document.getElementById("rooms-grid");
const resultsCountText = document.getElementById("results-count-text");
const statAvailable = document.getElementById("stat-available");
const statOccupied = document.getElementById("stat-occupied");
const statTotal = document.getElementById("stat-total");
const statAvailableLabel = document.getElementById("stat-available-label");
const statOccupiedLabel = document.getElementById("stat-occupied-label");
const configWarning = document.getElementById("config-warning");

// Slot UI Elements
const filterSlot = document.getElementById("filter-slot");
const slotPillsBar = document.getElementById("slot-pills-bar");
const currentClockDisplay = document.getElementById("current-clock-display");
const activeSlotIndicator = document.getElementById("active-slot-indicator");

// Filter Form Elements
const filterBlock = document.getElementById("filter-block");
const filterFloor = document.getElementById("filter-floor");
const filterStatus = document.getElementById("filter-status");
const filterCapacity = document.getElementById("filter-capacity");
const capacityBadge = document.getElementById("capacity-badge");
const filterSort = document.getElementById("filter-sort");
const btnResetFilters = document.getElementById("btn-reset-filters");

// Index Error Alert Elements
const indexErrorBox = document.getElementById("index-error-box");
const indexErrorMsg = document.getElementById("index-error-msg");
const indexErrorLink = document.getElementById("index-error-link");

// Store active unsubscribe function & cached rooms
let unsubscribeRooms = null;
let allRoomsCache = [];

// ==============================================================================
// INITIALIZATION
// ==============================================================================
function initStudentApp() {
  if (!isFirebaseConfigured()) {
    configWarning.classList.remove("hidden");
    renderNotConfiguredState();
    return;
  }

  // Render horizontal slot selection buttons
  renderSlotPillScroller();

  // Start live clock & ongoing slot tracker
  initSlotClockTracker();

  // Bind filter change events
  setupEventListeners();

  // Initialize real-time collection listener (Index-free architecture)
  initRealtimeClassrooms();
}

// Ensure startup runs whether DOM is still loading or already parsed
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStudentApp);
} else {
  initStudentApp();
}

// ==============================================================================
// LIVE CLOCK & ONGOING SLOT TRACKER
// ==============================================================================
function initSlotClockTracker() {
  function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentSlot = getCurrentSlot();

    if (currentSlot) {
      currentClockDisplay.textContent = `Current Time: ${timeStr} • Active Campus Hours`;
      activeSlotIndicator.innerHTML = `<strong>Active:</strong> ${currentSlot.name} (${currentSlot.time})`;
    } else {
      currentClockDisplay.textContent = `Current Time: ${timeStr} • Campus Hours: 8:00 AM – 6:15 PM`;
      activeSlotIndicator.innerHTML = `Campus Schedule Inactive (Next: Slot 1 @ 8:00 AM)`;
    }
  }

  updateClock();
  setInterval(updateClock, 10000);
}

// ==============================================================================
// RENDER QUICK HORIZONTAL SLOT PILLS
// ==============================================================================
function renderSlotPillScroller() {
  if (!slotPillsBar) return;
  slotPillsBar.innerHTML = "";

  // Auto/Current Slot Button
  const autoBtn = document.createElement("button");
  autoBtn.type = "button";
  autoBtn.className = "btn-slot-pill active";
  autoBtn.id = "pill-CURRENT";
  autoBtn.innerHTML = `
    <span class="slot-pill-title">Current Period</span>
    <span class="slot-pill-time">Auto-detect</span>
  `;
  autoBtn.addEventListener("click", () => {
    filterSlot.value = "CURRENT";
    updateActivePillHighlight("CURRENT");
    applyClientFiltersAndRender();
  });
  slotPillsBar.appendChild(autoBtn);

  // 12 College Slots
  TIME_SLOTS.forEach(slot => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "btn-slot-pill";
    pill.id = `pill-${slot.id}`;
    pill.innerHTML = `
      <span class="slot-pill-title">${slot.name}${slot.isLunch ? " (Lunch)" : ""}</span>
      <span class="slot-pill-time">${slot.time}</span>
    `;
    pill.addEventListener("click", () => {
      filterSlot.value = slot.id;
      updateActivePillHighlight(slot.id);
      applyClientFiltersAndRender();
    });
    slotPillsBar.appendChild(pill);
  });
}

function updateActivePillHighlight(activeSlotVal) {
  document.querySelectorAll(".btn-slot-pill").forEach(btn => {
    btn.classList.remove("active");
  });
  const target = document.getElementById(`pill-${activeSlotVal}`);
  if (target) {
    target.classList.add("active");
    target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
}

// ==============================================================================
// EVENT LISTENERS SETUP
// ==============================================================================
function setupEventListeners() {
  filterCapacity.addEventListener("input", (e) => {
    const val = Number(e.target.value);
    capacityBadge.textContent = val === 0 ? "Any (0+)" : `${val}+ seats`;
    applyClientFiltersAndRender();
  });

  filterSlot.addEventListener("change", (e) => {
    updateActivePillHighlight(e.target.value);
    applyClientFiltersAndRender();
  });

  // Re-filter instantly in memory whenever any dropdown changes (0ms delay)
  [filterBlock, filterFloor, filterStatus, filterSort].forEach((elem) => {
    elem.addEventListener("change", () => {
      applyClientFiltersAndRender();
    });
  });

  btnResetFilters.addEventListener("click", () => {
    filterSlot.value = "CURRENT";
    updateActivePillHighlight("CURRENT");
    filterBlock.value = "ALL";
    filterFloor.value = "ALL";
    filterStatus.value = "available";
    filterCapacity.value = 0;
    capacityBadge.textContent = "Any (0+)";
    filterSort.value = "asc";
    applyClientFiltersAndRender();
  });
}

// ==============================================================================
// RESOLVE TARGET TIME SLOT & ROOM STATUS
// ==============================================================================
function getEffectiveSlot() {
  const chosen = filterSlot.value;
  if (chosen === "CURRENT") {
    const active = getCurrentSlot();
    return active || TIME_SLOTS[0];
  }
  if (chosen === "ALL") {
    return null;
  }
  return TIME_SLOTS.find(s => s.id === chosen) || TIME_SLOTS[0];
}

function getRoomStatusForSlot(room, slotId) {
  if (room.slots && room.slots[slotId]) {
    return room.slots[slotId];
  }
  return room.status || "available";
}

// ==============================================================================
// STATS RIBBON CALCULATOR
// ==============================================================================
function updateStatsRibbon() {
  const effectiveSlot = getEffectiveSlot();
  const total = allRoomsCache.length;
  let available = 0;
  let occupied = 0;

  if (effectiveSlot) {
    statAvailableLabel.textContent = `Free in ${effectiveSlot.name}`;
    statOccupiedLabel.textContent = `Busy in ${effectiveSlot.name}`;

    allRoomsCache.forEach(room => {
      const status = getRoomStatusForSlot(room, effectiveSlot.id);
      if (status === "available") {
        available++;
      } else {
        occupied++;
      }
    });
  } else {
    statAvailableLabel.textContent = `Available (General)`;
    statOccupiedLabel.textContent = `Occupied (General)`;

    allRoomsCache.forEach(room => {
      if (room.status === "available") available++;
      else occupied++;
    });
  }

  statTotal.textContent = total;
  statAvailable.textContent = available;
  statOccupied.textContent = occupied;
}

// ==============================================================================
// FAST DIRECT REST FETCH (INITIAL POPULATION < 200ms)
// ==============================================================================
async function fetchDirectRooms() {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/classrooms?key=${firebaseConfig.apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.documents || data.documents.length === 0) return [];
    return data.documents.map(parseRestDoc);
  } catch (err) {
    console.warn("Direct REST fetch note:", err);
    return null;
  }
}

function parseRestDoc(doc) {
  const fields = doc.fields || {};
  const id = doc.name.split("/").pop();
  
  const facilities = fields.facilities?.arrayValue?.values?.map(v => v.stringValue) || [];
  
  const slots = {};
  if (fields.slots?.mapValue?.fields) {
    for (const [k, v] of Object.entries(fields.slots.mapValue.fields)) {
      slots[k] = v.stringValue;
    }
  }

  return {
    id,
    name: fields.name?.stringValue || "Room",
    block: fields.block?.stringValue || "-",
    floor: Number(fields.floor?.integerValue ?? 0),
    capacity: Number(fields.capacity?.integerValue ?? 40),
    status: fields.status?.stringValue || "available",
    type: fields.type?.stringValue || "classroom",
    facilities,
    slots,
    updatedAt: fields.updatedAt?.timestampValue ? new Date(fields.updatedAt.timestampValue) : new Date()
  };
}

// Validation for Official Campus Layout:
// - Blocks: A, C, D, F only (B and E are Staff Rooms and excluded).
// - Exclude non-existent rooms: 101, 202, 303, 404.
// - Floor 0 (Ground: 102, 103, 104); Floor 1 (1st: 201, 203, 204); Floor 2 (2nd: 301, 302, 304); Floor 3 (3rd: 401, 402, 403).
function isValidCampusRoom(room) {
  if (!room || !room.name) return false;
  const name = String(room.name).toUpperCase().trim();
  const block = String(room.block || "").toUpperCase().trim();

  // Exclude staff rooms (Blocks B & E)
  if (block === "B" || block === "E" || name.startsWith("B-") || name.startsWith("E-")) {
    return false;
  }

  // Exclude non-existent room numbers
  const parts = name.split("-");
  const num = parts.length > 1 ? parts[1].trim() : "";
  if (num === "101" || num === "202" || num === "303" || num === "404") {
    return false;
  }

  return true;
}

// ==============================================================================
// IN-MEMORY FILTERING & SORTING (INDEX-FREE, 0ms LATENCY)
// ==============================================================================
function filterAndSortRooms(roomsList) {
  const selectedBlock = filterBlock.value;
  const selectedFloor = filterFloor.value;
  const minCap = Number(filterCapacity.value);
  const sortDirection = filterSort.value;
  const effectiveSlot = getEffectiveSlot();
  const desiredStatus = filterStatus.value;

  const filtered = roomsList.filter(room => {
    // 0. Enforce official campus room layout (filters out legacy test data like A-101)
    if (!isValidCampusRoom(room)) return false;

    // 1. Block Filter
    if (selectedBlock !== "ALL" && room.block !== selectedBlock) return false;

    // 2. Floor Filter
    if (selectedFloor !== "ALL" && Number(room.floor) !== Number(selectedFloor)) return false;

    // 3. Minimum Capacity Filter
    if (minCap > 0 && Number(room.capacity) < minCap) return false;

    // 4. Slot Availability Filter
    if (effectiveSlot && desiredStatus !== "ALL") {
      const slotStatus = getRoomStatusForSlot(room, effectiveSlot.id);
      if (slotStatus !== desiredStatus) return false;
    } else if (!effectiveSlot && desiredStatus !== "ALL") {
      if (room.status !== desiredStatus) return false;
    }

    return true;
  });

  // 5. Sort by Capacity (Low to High / High to Low)
  filtered.sort((a, b) => {
    const capA = Number(a.capacity || 0);
    const capB = Number(b.capacity || 0);
    return sortDirection === "desc" ? capB - capA : capA - capB;
  });

  return filtered;
}

function renderRoomsFromList(roomsList, effectiveSlot = getEffectiveSlot()) {
  const desiredStatus = filterStatus.value;
  const count = roomsList.length;
  const slotNameText = effectiveSlot ? ` in ${effectiveSlot.name} (${effectiveSlot.time})` : "";
  resultsCountText.textContent = count === 1 
    ? `Showing 1 matching classroom${slotNameText}` 
    : `Showing ${count} matching classrooms${slotNameText}`;

  if (count === 0) {
    if (allRoomsCache.length === 0) {
      renderEmptyState(
        `The classroom database is currently empty.<br>Open the <strong>Admin Portal</strong> and click <strong>"Seed Campus Database"</strong> to populate all 64 classrooms and labs.`,
        true
      );
    } else {
      const advice = desiredStatus === "available" 
        ? `No classrooms are free in ${effectiveSlot ? effectiveSlot.name : "this period"}. Try checking another time slot or loosening capacity/block filters.`
        : `No classrooms match your filter criteria. Try clearing some filters.`;
      renderEmptyState(advice, false);
    }
    return;
  }

  roomsGrid.innerHTML = "";
  roomsList.forEach(room => {
    const card = createRoomCardElement(room.id, room, effectiveSlot);
    roomsGrid.appendChild(card);
  });
}

function applyClientFiltersAndRender() {
  hideIndexAlert();
  updateStatsRibbon();

  if (allRoomsCache.length === 0) {
    renderLoadingState();
    return;
  }

  const filtered = filterAndSortRooms(allRoomsCache);
  renderRoomsFromList(filtered);
}

// ==============================================================================
// REAL-TIME FIRESTORE LISTENER (INDEX-FREE ARCHITECTURE)
// ==============================================================================
function initRealtimeClassrooms() {
  hideIndexAlert();

  // Fast direct REST fetch so rooms appear in < 200ms
  fetchDirectRooms().then(directRooms => {
    if (directRooms && directRooms.length > 0 && allRoomsCache.length === 0) {
      allRoomsCache = directRooms;
      applyClientFiltersAndRender();
    }
  });

  if (unsubscribeRooms) {
    unsubscribeRooms();
    unsubscribeRooms = null;
  }

  renderLoadingState();

  try {
    const classroomsRef = collection(db, "classrooms");

    // Listening to the collection WITHOUT compound where/orderBy queries
    // means Cloud Firestore NEVER requests composite indexes!
    unsubscribeRooms = onSnapshot(
      classroomsRef,
      (snapshot) => {
        hideIndexAlert();

        if (snapshot.empty) {
          allRoomsCache = [];
          resultsCountText.textContent = "No classrooms in database";
          renderEmptyState(
            `The classroom database is currently empty.<br>Open the <strong>Admin Portal</strong> and click <strong>"Seed Campus Database"</strong> to populate all 64 classrooms and labs.`,
            true
          );
          updateStatsRibbon();
          return;
        }

        const updatedRooms = [];
        snapshot.forEach((docSnap) => {
          updatedRooms.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Ensure only official campus rooms are cached
        allRoomsCache = updatedRooms.filter(isValidCampusRoom);
        applyClientFiltersAndRender();
      },
      (error) => {
        console.error("Firestore Real-time Listener Error:", error);
        if (allRoomsCache.length === 0) {
          handleQueryError(error);
        }
      }
    );
  } catch (err) {
    console.error("Firestore initialization error:", err);
    if (allRoomsCache.length === 0) {
      handleQueryError(err);
    }
  }
}

// Helper to format floor number to name
function formatFloorName(floor) {
  if (floor === 0 || floor === "0") return "Ground Floor";
  if (floor === 1 || floor === "1") return "1st Floor";
  if (floor === 2 || floor === "2") return "2nd Floor";
  if (floor === 3 || floor === "3") return "3rd Floor";
  return `Level ${floor ?? "-"}`;
}

// ==============================================================================
// DOM CARD COMPONENT BUILDER (WITH 12-SLOT SCHEDULE TIMELINE)
// ==============================================================================
function createRoomCardElement(id, room, effectiveSlot) {
  const slotStatus = effectiveSlot 
    ? getRoomStatusForSlot(room, effectiveSlot.id)
    : (room.status || "available");
  const isAvailable = slotStatus === "available";
  const isLab = room.type === "lab";

  const card = document.createElement("article");
  card.className = `room-card ${isAvailable ? "is-available" : "is-occupied"}`;
  card.id = `room-card-${id}`;

  let updatedTimeText = "Just now";
  if (room.updatedAt) {
    const date = room.updatedAt.toDate ? room.updatedAt.toDate() : new Date(room.updatedAt);
    updatedTimeText = formatRelativeTime(date);
  }

  const facilitiesList = Array.isArray(room.facilities) ? room.facilities : [];
  const facilitiesHtml = facilitiesList.length > 0 
    ? facilitiesList.map(f => `<span class="facility-chip">${escapeHtml(f)}</span>`).join("")
    : `<span class="facility-chip" style="color:var(--text-light)">Standard Desk Setup</span>`;

  // Build 12-Slot Schedule Timeline Matrix
  const slotTimelinePillsHtml = TIME_SLOTS.map(slot => {
    const status = getRoomStatusForSlot(room, slot.id);
    const isFree = status === "available";
    const isFiltered = effectiveSlot && effectiveSlot.id === slot.id;
    const title = `${slot.name} (${slot.time}): ${isFree ? 'AVAILABLE' : 'OCCUPIED'}`;

    return `
      <div 
        class="mini-slot-pill ${isFree ? 'is-free' : 'is-busy'} ${isFiltered ? 'is-current-filtered' : ''}" 
        title="${escapeHtml(title)}"
        data-slot-id="${slot.id}"
      >
        <span>S${slot.num}</span>
      </div>
    `;
  }).join("");

  const slotHeaderLabel = effectiveSlot 
    ? `Status in ${effectiveSlot.name} (${effectiveSlot.time})`
    : `Overall Status`;

  card.innerHTML = `
    <div class="card-header-row">
      <div class="room-name-wrapper">
        <div style="display:flex; align-items:center; gap:0.4rem;">
          <h3 class="room-name">${escapeHtml(room.name || "Room")}</h3>
          ${isLab ? `<span class="badge-tag" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-size:0.65rem;">Laboratory</span>` : ''}
        </div>
        <div class="room-location">
          <span>Block ${escapeHtml(room.block || "-")}</span>
          <span>&bull;</span>
          <span>${formatFloorName(room.floor)}</span>
        </div>
      </div>
      <div class="status-badge ${isAvailable ? "available" : "occupied"}">
        <span class="badge-dot"></span>
        <span>${isAvailable ? "Available" : "Occupied"}</span>
      </div>
    </div>

    <!-- Active Slot Indicator on Card -->
    <div style="font-size: 0.775rem; font-weight: 700; color: ${isAvailable ? 'var(--available-text)' : 'var(--occupied-text)'}; margin-bottom: 0.75rem; display:flex; align-items:center; gap:0.35rem;">
      <span class="badge-dot" style="background:${isAvailable ? '#10b981' : '#dc2626'};"></span>
      <span>${isAvailable ? 'Available' : 'Occupied'}: ${escapeHtml(slotHeaderLabel)}</span>
    </div>

    <div class="room-capacity-bar">
      <span class="capacity-icon" style="display:inline-flex; align-items:center;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
      </span>
      <span class="capacity-text">${room.capacity ?? 0} Seats</span>
      <span class="capacity-sub">Capacity</span>
    </div>

    <!-- 12-Slot Schedule Timeline Strip -->
    <div class="card-slot-timeline-section">
      <div class="slot-timeline-header">
        <span>12-Period Availability Timeline</span>
        <span>${effectiveSlot ? effectiveSlot.name : 'Day View'}</span>
      </div>
      <div class="slot-timeline-matrix">
        ${slotTimelinePillsHtml}
      </div>
    </div>

    <div class="facilities-section">
      <div class="facilities-label">Equipped Facilities</div>
      <div class="facilities-chips">
        ${facilitiesHtml}
      </div>
    </div>

    <div class="card-footer-row">
      <span>Updated: ${updatedTimeText}</span>
      <span>${isAvailable ? "Open for Study / Class" : "Class Session in Progress"}</span>
    </div>
  `;

  // Clicking any slot mini-pill switches the view directly to that period
  card.querySelectorAll(".mini-slot-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const slotId = pill.getAttribute("data-slot-id");
      if (slotId) {
        filterSlot.value = slotId;
        updateActivePillHighlight(slotId);
        applyClientFiltersAndRender();
      }
    });
  });

  return card;
}

// ==============================================================================
// ERROR HANDLING & COMPOSITE INDEX DETECTION
// ==============================================================================
function handleQueryError(error) {
  console.error("Firestore Query Snapshot Error:", error);
  const errMsg = error.message || error.toString();

  const indexUrlMatch = errMsg.match(/https:\/\/console\.firebase\.google\.com[^\s)]+/);

  if (indexUrlMatch) {
    const indexUrl = indexUrlMatch[0];
    indexErrorBox.classList.remove("hidden");
    indexErrorMsg.innerHTML = `
      <strong>Firestore Composite Index Required:</strong> The current combination of filters 
      requires an index.
    `;
    indexErrorLink.href = indexUrl;
    indexErrorLink.style.display = "inline-flex";

    renderEmptyState(
      "This query requires a Firestore composite index. Click the button below to generate it instantly.",
      false
    );
  } else {
    renderEmptyState(`An error occurred while fetching classrooms: ${escapeHtml(errMsg)}`, false);
  }
}

function hideIndexAlert() {
  indexErrorBox.classList.add("hidden");
}

// ==============================================================================
// UI STATES (Loading, Empty, Unconfigured, Delayed)
// ==============================================================================
function renderLoadingState() {
  roomsGrid.innerHTML = `
    <div class="empty-state">
      <div class="loading-spinner"></div>
      <div class="empty-title" style="margin-top:1rem;">Syncing Classrooms...</div>
      <p class="empty-desc">Fetching real-time snapshot from Cloud Firestore.</p>
    </div>
  `;
}

function renderEmptyState(message, isDatabaseEmpty = false) {
  const iconSvg = isDatabaseEmpty
    ? `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11H9z"/></svg>`
    : `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;

  roomsGrid.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon" style="color:var(--text-muted); display:flex; justify-content:center;">${iconSvg}</div>
      <h3 class="empty-title">${isDatabaseEmpty ? "Classroom Database is Empty" : "No Matching Rooms Found"}</h3>
      <p class="empty-desc" style="max-width: 480px; margin: 0 auto 1.5rem; line-height: 1.6;">${message}</p>
      ${isDatabaseEmpty
        ? `<a href="admin.html" class="btn btn-primary btn-sm">Open Admin to Seed Rooms &rarr;</a>`
        : `<button class="btn btn-outline btn-sm" onclick="document.getElementById('btn-reset-filters').click()">Reset All Filters</button>`
      }
    </div>
  `;
}

function renderNotConfiguredState() {
  roomsGrid.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon" style="color:var(--text-muted); display:flex; justify-content:center;">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </div>
      <h3 class="empty-title">Firebase Configuration Required</h3>
      <p class="empty-desc">
        Please open <code>firebase-config.js</code> and paste your Firebase Project API credentials to connect to Cloud Firestore.
      </p>
      <a href="admin.html" class="btn btn-primary btn-sm">
        Go to Admin Portal &rarr;
      </a>
    </div>
  `;
  resultsCountText.textContent = "Awaiting Firebase configuration";
}

function renderConnectionDelayedState() {
  roomsGrid.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon" style="color:var(--text-muted); display:flex; justify-content:center;">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <h3 class="empty-title">Initial Connection Delayed</h3>
      <p class="empty-desc">
        Firestore is establishing a secure connection. If this persists, verify your network connectivity or reload the page.
      </p>
      <div style="display:flex; justify-content:center; gap:0.5rem; margin-top:1rem;">
        <button class="btn btn-primary btn-sm" onclick="location.reload()">
          Reload Page
        </button>
        <a href="admin.html" class="btn btn-outline btn-sm">
          Open Admin Portal
        </a>
      </div>
    </div>
  `;
  resultsCountText.textContent = "Connection delayed";
}

// ==============================================================================
// HELPER UTILITIES
// ==============================================================================
function getFacilityIcon(name) {
  return ""; // Clean textual chips without cartoon emojis
}

function formatRelativeTime(date) {
  const diffSec = Math.floor((new Date() - date) / 1000);
  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
}

function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
