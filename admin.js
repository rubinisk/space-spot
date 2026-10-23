// ==============================================================================
// SpaceSpot – Admin Portal Logic (admin.js)
// ==============================================================================
// Features:
// 1. Google Authentication with strict authorization check (skrubini5@gmail.com).
// 2. Real-time Classroom listener (onSnapshot).
// 3. 12-Slot Schedule Management:
//    - 1-Click toggle on ANY of the 12 college time slots directly from table
//    - Full 12-slot availability editor in Add & Edit modals
// 4. Full CRUD Operations:
//    - CREATE: addDoc with slots schedule & serverTimestamp()
//    - READ: Real-time onSnapshot queries
//    - UPDATE: updateDoc for modal edits & individual slot toggles
//    - DELETE: deleteDoc with confirmation dialog
// 5. Batch Seeding: Loads 10 sample classrooms with full 12-slot schedules.
// ==============================================================================

import { 
  db, 
  auth, 
  googleProvider, 
  serverTimestamp, 
  isFirebaseConfigured,
  firebaseConfig 
} from "./firebase-config.js";

import { 
  TIME_SLOTS, 
  getDefaultSlotsMap 
} from "./slots-config.js";

import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  orderBy, 
  query 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { seedClassrooms } from "./seed.js";

// ==============================================================================
// CONFIGURATION & CONSTANTS
// ==============================================================================
// Only this exact email is granted write access to SpaceSpot
const AUTHORIZED_ADMIN_EMAIL = "skrubini5@gmail.com";

// DOM Elements: Navigation & Auth
const configWarning = document.getElementById("config-warning");
const authSection = document.getElementById("auth-section");
const adminDashboardSection = document.getElementById("admin-dashboard-section");
const btnGoogleLogin = document.getElementById("btn-google-login");
const btnSignOut = document.getElementById("btn-sign-out");
const accessDeniedAlert = document.getElementById("access-denied-alert");
const accessDeniedText = document.getElementById("access-denied-text");
const adminUserEmail = document.getElementById("admin-user-email");
const adminUserPhoto = document.getElementById("admin-user-photo");
const adminAvatarFallback = document.getElementById("admin-avatar-fallback");

// DOM Elements: Admin Table & Stats
const adminTableBody = document.getElementById("admin-table-body");
const adminStatTotal = document.getElementById("admin-stat-total");
const adminStatAvailable = document.getElementById("admin-stat-available");
const adminStatOccupied = document.getElementById("admin-stat-occupied");

// DOM Elements: Modals & Buttons
const btnOpenAddModal = document.getElementById("btn-open-add-modal");
const btnSeedData = document.getElementById("btn-seed-data");
const classroomModal = document.getElementById("classroom-modal");
const classroomForm = document.getElementById("classroom-form");
const modalTitle = document.getElementById("modal-title");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelModal = document.getElementById("btn-cancel-modal");
const formRoomId = document.getElementById("form-room-id");
const formName = document.getElementById("form-name");
const formBlock = document.getElementById("form-block");
const formFloor = document.getElementById("form-floor");
const formCapacity = document.getElementById("form-capacity");
const formStatus = document.getElementById("form-status");
const formType = document.getElementById("form-type");

// Helper to format floor number to name
function formatFloorName(floor) {
  if (floor === 0 || floor === "0") return "Ground Floor";
  if (floor === 1 || floor === "1") return "1st Floor";
  if (floor === 2 || floor === "2") return "2nd Floor";
  if (floor === 3 || floor === "3") return "3rd Floor";
  return `Level ${floor ?? "-"}`;
}

// Modal Slot Helpers
const modalSlotCheckboxesContainer = document.getElementById("modal-slot-checkboxes");
const btnModalAllFree = document.getElementById("btn-modal-all-free");
const btnModalAllBusy = document.getElementById("btn-modal-all-busy");

// DOM Elements: Delete Modal
const deleteModal = document.getElementById("delete-modal");
const deleteModalMsg = document.getElementById("delete-modal-msg");
const btnCloseDeleteModal = document.getElementById("btn-close-delete-modal");
const btnCancelDelete = document.getElementById("btn-cancel-delete");
const btnConfirmDelete = document.getElementById("btn-confirm-delete");

// State
let unsubscribeAdminListener = null;
let currentDeletingRoomId = null;
let currentDeletingRoomName = null;
let cachedRoomsMap = new Map();

// ==============================================================================
// INITIALIZATION & AUTHENTICATION STATE OBSERVER
// ==============================================================================
function initAdminApp() {
  // Check if Firebase keys are set
  if (!isFirebaseConfigured()) {
    configWarning.classList.remove("hidden");
  }

  // Render 12 slot checkboxes inside modal
  renderModalSlotCheckboxes();

  setupEventListeners();

  // AUTH CHECK: Listen to Firebase Authentication state changes
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userEmail = (user.email || "").toLowerCase();
      
      // Strict Authorization Check: Only skrubini5@gmail.com is allowed
      if (userEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        console.log(`[AUTH] Welcome, authorized administrator: ${user.email}`);
        
        // Show Admin Dashboard & Hide Login
        authSection.classList.add("hidden");
        accessDeniedAlert.classList.add("hidden");
        adminDashboardSection.classList.remove("hidden");

        // Populate Admin Profile Info
        adminUserEmail.textContent = user.email;
        if (user.photoURL) {
          adminUserPhoto.src = user.photoURL;
          adminUserPhoto.style.display = "block";
          adminAvatarFallback.style.display = "none";
        } else {
          adminUserPhoto.style.display = "none";
          adminAvatarFallback.style.display = "flex";
          adminAvatarFallback.textContent = user.email.charAt(0).toUpperCase();
        }

        // Initialize real-time classroom listener for admin
        initAdminClassroomListener();
        showToast(`Signed in as ${user.email}`, "success");
      } else {
        // UNAUTHORIZED USER: Show Access Denied and auto sign out
        console.warn(`[AUTH] Access denied for unauthorized account: ${user.email}`);
        accessDeniedText.textContent = `Access denied: Account '${user.email}' is not authorized. Only ${AUTHORIZED_ADMIN_EMAIL} can access this admin panel.`;
        accessDeniedAlert.classList.remove("hidden");
        authSection.classList.remove("hidden");
        adminDashboardSection.classList.add("hidden");

        // Automatically sign unauthorized user out
        await signOut(auth);
      }
    } else {
      // USER SIGNED OUT
      console.log("[AUTH] No active admin session.");
      authSection.classList.remove("hidden");
      adminDashboardSection.classList.add("hidden");

      // Detach Firestore listener
      if (unsubscribeAdminListener) {
        unsubscribeAdminListener();
        unsubscribeAdminListener = null;
      }
    }
  });
}

// Ensure startup runs whether DOM is still loading or already parsed
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdminApp);
} else {
  initAdminApp();
}

// ==============================================================================
// MODAL 12-SLOT CHECKBOXES BUILDER
// ==============================================================================
function renderModalSlotCheckboxes() {
  if (!modalSlotCheckboxesContainer) return;
  modalSlotCheckboxesContainer.innerHTML = TIME_SLOTS.map(slot => `
    <label class="modal-slot-item">
      <span>S${slot.num}: ${slot.time}</span>
      <input type="checkbox" id="chk_${slot.id}" value="available" checked>
    </label>
  `).join("");
}

// ==============================================================================
// EVENT LISTENERS SETUP
// ==============================================================================
function setupEventListeners() {
  // Google Sign-In with Popup
  btnGoogleLogin.addEventListener("click", async () => {
    try {
      accessDeniedAlert.classList.add("hidden");
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        showToast(`Sign in error: ${error.message}`, "error");
      }
    }
  });

  // Sign Out
  btnSignOut.addEventListener("click", async () => {
    try {
      await signOut(auth);
      showToast("Signed out successfully", "info");
    } catch (error) {
      console.error("Sign-Out Error:", error);
      showToast(`Error signing out: ${error.message}`, "error");
    }
  });

  // Modal Open for "Add Classroom"
  btnOpenAddModal.addEventListener("click", () => {
    openClassroomModal("add");
  });

  // Modal Quick Slot Buttons
  if (btnModalAllFree) {
    btnModalAllFree.addEventListener("click", () => {
      TIME_SLOTS.forEach(slot => {
        const cb = document.getElementById(`chk_${slot.id}`);
        if (cb) cb.checked = true;
      });
    });
  }

  if (btnModalAllBusy) {
    btnModalAllBusy.addEventListener("click", () => {
      TIME_SLOTS.forEach(slot => {
        const cb = document.getElementById(`chk_${slot.id}`);
        if (cb) cb.checked = false;
      });
    });
  }

  // Modal Close buttons
  btnCloseModal.addEventListener("click", closeClassroomModal);
  btnCancelModal.addEventListener("click", closeClassroomModal);

  // Classroom Form Submit (Handles both ADD and EDIT)
  classroomForm.addEventListener("submit", handleClassroomFormSubmit);

  // Seed Button
  btnSeedData.addEventListener("click", handleSeedDatabase);

  // Delete Modal Close buttons
  btnCloseDeleteModal.addEventListener("click", closeDeleteModal);
  btnCancelDelete.addEventListener("click", closeDeleteModal);

  // Confirm Delete Button
  btnConfirmDelete.addEventListener("click", handleConfirmDelete);
}

// ==============================================================================
// READ OPERATION: REAL-TIME CLASSROOM LISTENER (onSnapshot & Fast Direct Fetch)
// ==============================================================================
async function fetchDirectAdminRooms() {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/classrooms?key=${firebaseConfig.apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.documents || data.documents.length === 0) return [];
    return data.documents.map(parseAdminRestDoc);
  } catch (err) {
    console.warn("Direct admin fetch note:", err);
    return null;
  }
}

function parseAdminRestDoc(doc) {
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

function isValidCampusRoom(room) {
  if (!room || !room.name) return false;
  const name = String(room.name).toUpperCase().trim();
  const block = String(room.block || "").toUpperCase().trim();

  // Exclude staff rooms (Blocks B & E)
  if (block === "B" || block === "E" || name.startsWith("B-") || name.startsWith("E-")) {
    return false;
  }

  // Exclude non-existent room numbers (101, 202, 303, 404)
  const parts = name.split("-");
  const num = parts.length > 1 ? parts[1].trim() : "";
  if (num === "101" || num === "202" || num === "303" || num === "404") {
    return false;
  }

  return true;
}

function renderAdminTableFromRooms(rooms) {
  cachedRoomsMap.clear();

  // Filter out any legacy invalid rooms
  const validRooms = rooms.filter(isValidCampusRoom);

  if (validRooms.length === 0) {
    adminTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">
          <div style="font-size: 1.1rem; margin-bottom: 0.5rem; color:var(--primary); font-weight:700;">Database Ready for Seeding</div>
          <strong>No official campus classrooms found.</strong><br>
          Click <strong>"Reset & Seed Campus Database"</strong> to populate the 16 classrooms and labs across Blocks A, C, D, and F.
        </td>
      </tr>
    `;
    adminStatTotal.textContent = "0";
    adminStatAvailable.textContent = "0";
    adminStatOccupied.textContent = "0";
    return;
  }

  adminTableBody.innerHTML = "";
  let totalCount = 0;
  let availableCount = 0;
  let occupiedCount = 0;

  // Sort by name
  validRooms.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  validRooms.forEach(room => {
    cachedRoomsMap.set(room.id, room);
    totalCount++;

    const isAnySlotFree = TIME_SLOTS.some(slot => (room.slots?.[slot.id] || room.status) === "available");
    if (isAnySlotFree) {
      availableCount++;
    } else {
      occupiedCount++;
    }

    const tr = createAdminTableRow(room.id, room);
    adminTableBody.appendChild(tr);
  });

  adminStatTotal.textContent = totalCount;
  adminStatAvailable.textContent = availableCount;
  adminStatOccupied.textContent = occupiedCount;
}

function initAdminClassroomListener() {
  if (unsubscribeAdminListener) {
    unsubscribeAdminListener();
  }

  // Fast direct REST fetch so admin table loads in < 200ms
  fetchDirectAdminRooms().then(rooms => {
    if (rooms && cachedRoomsMap.size === 0) {
      renderAdminTableFromRooms(rooms);
    }
  });

  try {
    const classroomsRef = collection(db, "classrooms");
    const adminQuery = query(classroomsRef, orderBy("name", "asc"));

    unsubscribeAdminListener = onSnapshot(
      adminQuery,
      (snapshot) => {
        const rooms = [];
        snapshot.forEach(docSnap => {
          rooms.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderAdminTableFromRooms(rooms);
      },
      (error) => {
        console.error("Admin Firestore Listener Error:", error);
        // Only show toast if cached map is empty
        if (cachedRoomsMap.size === 0) {
          showToast(`Firestore Read Error: ${error.message}`, "error");
        }
      }
    );
  } catch (error) {
    console.error("Failed to start admin listener:", error);
    if (cachedRoomsMap.size === 0) {
      showToast(`Error initializing listener: ${error.message}`, "error");
    }
  }
}

// ==============================================================================
// TABLE ROW RENDERER & 12-SLOT TOGGLE BUTTONS
// ==============================================================================
function createAdminTableRow(id, room) {
  const tr = document.createElement("tr");

  // Format timestamp
  let updatedText = "Just now";
  if (room.updatedAt && room.updatedAt.toDate) {
    updatedText = room.updatedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Facilities badges
  const facilities = Array.isArray(room.facilities) ? room.facilities : [];
  const facilitiesHtml = facilities.length > 0
    ? facilities.map(f => `<span class="facility-chip" style="font-size:0.7rem; padding:0.15rem 0.4rem;">${escapeHtml(f)}</span>`).join(" ")
    : `<span style="color:var(--text-light); font-size:0.75rem;">None</span>`;

  // Build 12-Slot Interactive Toggle Matrix
  const slotsGridHtml = TIME_SLOTS.map(slot => {
    const slotStatus = room.slots?.[slot.id] || room.status || "available";
    const isFree = slotStatus === "available";
    const title = `${slot.name} (${slot.time}): ${isFree ? 'Free (Click to Occupy)' : 'Occupied (Click to Free)'}`;

    return `
      <button 
        type="button" 
        class="btn-slot-toggle ${isFree ? 'free' : 'busy'}" 
        data-action="toggle-slot" 
        data-room-id="${id}" 
        data-slot-id="${slot.id}" 
        data-current-status="${slotStatus}"
        title="${escapeHtml(title)}"
      >
        S${slot.num}
      </button>
    `;
  }).join("");

  const isLab = room.type === "lab";

  tr.innerHTML = `
    <td>
      <strong>${escapeHtml(room.name || "Unnamed")}</strong>
      ${isLab ? `<span class="badge-tag" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-size:0.65rem; margin-left:4px;">Laboratory</span>` : ''}
    </td>
    <td>
      <span>Block ${escapeHtml(room.block || "-")} &bull; ${formatFloorName(room.floor)}</span>
    </td>
    <td>
      <span>${room.capacity ?? 0} seats</span>
    </td>
    <td>
      <div style="display:flex; flex-wrap:wrap; gap:0.25rem; max-width:220px;">
        ${facilitiesHtml}
      </div>
    </td>
    <td>
      <!-- 12-PERIOD INTERACTIVE SCHEDULE MATRIX (1-CLICK TOGGLE) -->
      <div class="admin-slot-grid">
        ${slotsGridHtml}
      </div>
    </td>
    <td>
      <span style="font-size:0.775rem; color:var(--text-muted);">${updatedText}</span>
    </td>
    <td>
      <div class="action-btn-group">
        <button class="btn btn-outline btn-sm" data-action="edit" data-id="${id}" title="Edit classroom details">
          Edit
        </button>
        <button class="btn btn-outline btn-sm" style="color:var(--occupied-dot);" data-action="delete" data-id="${id}" title="Delete classroom">
          Delete
        </button>
      </div>
    </td>
  `;

  // Attach event listeners for each individual slot toggle button
  tr.querySelectorAll('[data-action="toggle-slot"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const roomId = btn.getAttribute("data-room-id");
      const slotId = btn.getAttribute("data-slot-id");
      const currentStatus = btn.getAttribute("data-current-status");
      handleToggleSpecificSlot(roomId, slotId, currentStatus);
    });
  });

  const editBtn = tr.querySelector('[data-action="edit"]');
  editBtn.addEventListener("click", () => openClassroomModal("edit", id));

  const deleteBtn = tr.querySelector('[data-action="delete"]');
  deleteBtn.addEventListener("click", () => openDeleteModal(id, room.name));

  return tr;
}

// ==============================================================================
// UPDATE OPERATION (1-CLICK TOGGLE FOR INDIVIDUAL TIME SLOT)
// ==============================================================================
/**
 * Toggles a specific slot between "available" and "occupied" for a room with 1-click.
 * Updates Cloud Firestore document via updateDoc() with serverTimestamp().
 */
async function handleToggleSpecificSlot(roomId, slotId, currentStatus) {
  const newStatus = currentStatus === "available" ? "occupied" : "available";
  const slotInfo = TIME_SLOTS.find(s => s.id === slotId);
  const slotName = slotInfo ? slotInfo.name : slotId;

  try {
    const docRef = doc(db, "classrooms", roomId);

    // UPDATE OPERATION: update nested slot field in Firestore
    await updateDoc(docRef, {
      [`slots.${slotId}`]: newStatus,
      updatedAt: serverTimestamp()
    });

    showToast(`${slotName} marked as ${newStatus.toUpperCase()}`, "success");
  } catch (error) {
    console.error("Error toggling slot:", error);
    showToast(`Failed to update slot: ${error.message}`, "error");
  }
}

// ==============================================================================
// CREATE & UPDATE OPERATION (MODAL SUBMISSION): addDoc / updateDoc
// ==============================================================================
async function handleClassroomFormSubmit(e) {
  e.preventDefault();

  const roomId = formRoomId.value.trim();
  const name = formName.value.trim();
  const block = formBlock.value;
  const floor = Number(formFloor.value);
  const capacity = Number(formCapacity.value);
  const status = formStatus.value;
  const type = formType ? formType.value : "classroom";

  // Collect checked facilities
  const facilityCheckboxes = document.querySelectorAll('input[name="facilities"]:checked');
  const facilities = Array.from(facilityCheckboxes).map(cb => cb.value);

  // Collect 12 slots availability
  const slots = {};
  TIME_SLOTS.forEach(slot => {
    const cb = document.getElementById(`chk_${slot.id}`);
    slots[slot.id] = (cb && cb.checked) ? "available" : "occupied";
  });

  if (!name) {
    showToast("Classroom name is required", "error");
    return;
  }

  const roomData = {
    name,
    block,
    floor,
    type,
    capacity,
    status,
    slots,
    facilities,
    updatedAt: serverTimestamp() // Always stamp changes with serverTimestamp()
  };

  try {
    if (roomId) {
      // UPDATE OPERATION: updateDoc for existing classroom
      const docRef = doc(db, "classrooms", roomId);
      await updateDoc(docRef, roomData);
      showToast(`Classroom "${name}" updated successfully`, "success");
    } else {
      // CREATE OPERATION: addDoc to create new classroom document
      const classroomsCollection = collection(db, "classrooms");
      await addDoc(classroomsCollection, roomData);
      showToast(`Classroom "${name}" added successfully`, "success");
    }

    closeClassroomModal();
  } catch (error) {
    console.error("Error saving classroom:", error);
    showToast(`Error saving classroom: ${error.message}`, "error");
  }
}

// ==============================================================================
// DELETE OPERATION: deleteDoc
// ==============================================================================
function openDeleteModal(id, name) {
  currentDeletingRoomId = id;
  currentDeletingRoomName = name || "this classroom";
  deleteModalMsg.textContent = `Are you sure you want to delete classroom "${currentDeletingRoomName}"? This action cannot be undone.`;
  deleteModal.classList.add("active");
}

function closeDeleteModal() {
  deleteModal.classList.remove("active");
  currentDeletingRoomId = null;
  currentDeletingRoomName = null;
}

async function handleConfirmDelete() {
  if (!currentDeletingRoomId) return;

  try {
    const docRef = doc(db, "classrooms", currentDeletingRoomId);
    
    // DELETE OPERATION: deleteDoc removes document from collection
    await deleteDoc(docRef);

    showToast(`Classroom "${currentDeletingRoomName}" deleted`, "info");
    closeDeleteModal();
  } catch (error) {
    console.error("Error deleting classroom:", error);
    showToast(`Failed to delete classroom: ${error.message}`, "error");
  }
}

// ==============================================================================
// SEEDING DATABASE: seedClassrooms() from seed.js
// ==============================================================================
async function handleSeedDatabase() {
  const confirmed = confirm("This will purge existing records and seed all 64 official campus classrooms & labs (Blocks A, C, D, F, Floors 0–3, 4 rooms per floor including 1 lab per floor). Proceed?");
  if (!confirmed) return;

  btnSeedData.disabled = true;
  btnSeedData.textContent = "Resetting & Seeding...";

  try {
    // Calls batch seeding function in seed.js
    const count = await seedClassrooms(db, serverTimestamp);
    showToast(`Database reset successfully with ${count} campus classrooms & labs!`, "success");
  } catch (error) {
    console.error("Error seeding classrooms:", error);
    showToast(`Seeding failed: ${error.message}`, "error");
  } finally {
    btnSeedData.disabled = false;
    btnSeedData.innerHTML = `<span>Reset & Seed Campus Database</span>`;
  }
}

// ==============================================================================
// MODAL CONTROLS & FORM POPULATION
// ==============================================================================
function openClassroomModal(mode, id = null) {
  classroomForm.reset();
  
  // Uncheck all facilities checkboxes
  document.querySelectorAll('input[name="facilities"]').forEach(cb => {
    cb.checked = false;
  });

  if (mode === "edit" && id) {
    modalTitle.textContent = "Edit Classroom / Lab";
    formRoomId.value = id;

    const data = cachedRoomsMap.get(id);
    if (data) {
      formName.value = data.name || "";
      formBlock.value = data.block || "A";
      formFloor.value = data.floor !== undefined ? data.floor : 0;
      formCapacity.value = data.capacity || 40;
      formStatus.value = data.status || "available";
      if (formType) formType.value = data.type || "classroom";

      if (Array.isArray(data.facilities)) {
        data.facilities.forEach(facility => {
          const cb = document.querySelector(`input[name="facilities"][value="${facility}"]`);
          if (cb) cb.checked = true;
        });
      }

      // Populate 12 slot checkboxes
      TIME_SLOTS.forEach(slot => {
        const cb = document.getElementById(`chk_${slot.id}`);
        if (cb) {
          const slotStatus = data.slots?.[slot.id] || data.status || "available";
          cb.checked = (slotStatus === "available");
        }
      });
    }
  } else {
    modalTitle.textContent = "Add New Classroom / Lab";
    formRoomId.value = "";
    formBlock.value = "A";
    formFloor.value = "0"; // Ground Floor
    formCapacity.value = "40";
    formStatus.value = "available";
    if (formType) formType.value = "classroom";

    // Default all 12 slots to free/available
    TIME_SLOTS.forEach(slot => {
      const cb = document.getElementById(`chk_${slot.id}`);
      if (cb) cb.checked = true;
    });
  }

  classroomModal.classList.add("active");
}

function closeClassroomModal() {
  classroomModal.classList.remove("active");
  classroomForm.reset();
  formRoomId.value = "";
}

// ==============================================================================
// TOAST NOTIFICATIONS HELPER
// ==============================================================================
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const icon = type === "success" ? "" : type === "error" ? "" : "";
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Escape HTML utility for XSS safety
function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
