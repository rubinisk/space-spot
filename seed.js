// ==============================================================================
// SpaceSpot – Database Seeder (seed.js)
// ==============================================================================
// DBMS Demonstration:
// 1. SCHEMA DESIGN: Documents stored in collection "classrooms".
// 2. NOSQL JOIN ALTERNATIVE: Solves relational joins via Denormalization (embedding
//    the 12-slot schedule map and facilities array directly inside each document).
// 3. BATCH CREATE (CRUD): Uses writeBatch() for atomic multi-document creation.
// 
// Campus Architecture & Room Numbering Specification:
// - Blocks: A, C, D, F (Blocks B and E are Staff Rooms and excluded).
// - Floors:
//     * Floor 0: Ground Floor (102, 103, 104 - 101 does not exist)
//     * Floor 1: 1st Floor    (201, 203, 204 - 202 does not exist)
//     * Floor 2: 2nd Floor    (301, 302, 304 - 303 does not exist)
//     * Floor 3: 3rd Floor    (401, 402, 403 - 404 does not exist)
// - Room codes: <Block>-<Number> (e.g. A-102, C-201, D-104)
// - Includes 3-4 rooms per block with realistic Labs and Classrooms.
// - Full 12-slot daily schedule per room.
// ==============================================================================

import { 
  collection, 
  doc, 
  writeBatch 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const sampleClassrooms = [
  // =================== BLOCK A ===================
  {
    name: "A-102",
    block: "A",
    floor: 0, // Ground Floor
    type: "classroom",
    capacity: 50,
    facilities: ["Projector", "Whiteboard", "AC"],
    status: "available",
    slots: {
      slot1: "available", slot2: "available", slot3: "occupied", slot4: "occupied",
      slot5: "available", slot6: "available", slot7: "available", slot8: "occupied",
      slot9: "available", slot10: "available", slot11: "available", slot12: "available"
    }
  },
  {
    name: "A-103",
    block: "A",
    floor: 0, // Ground Floor
    type: "lab",
    capacity: 40,
    facilities: ["Lab Computers", "AC", "LAN Ports", "Projector"],
    status: "occupied",
    slots: {
      slot1: "occupied", slot2: "occupied", slot3: "available", slot4: "available",
      slot5: "occupied", slot6: "occupied", slot7: "available", slot8: "available",
      slot9: "occupied", slot10: "occupied", slot11: "available", slot12: "available"
    }
  },
  {
    name: "A-201",
    block: "A",
    floor: 1, // 1st Floor
    type: "classroom",
    capacity: 65,
    facilities: ["Smart Board", "Mic & Speakers", "AC", "Podium"],
    status: "available",
    slots: {
      slot1: "available", slot2: "available", slot3: "available", slot4: "occupied",
      slot5: "occupied", slot6: "available", slot7: "available", slot8: "available",
      slot9: "available", slot10: "occupied", slot11: "available", slot12: "available"
    }
  },
  {
    name: "A-301",
    block: "A",
    floor: 2, // 2nd Floor
    type: "classroom",
    capacity: 45,
    facilities: ["Whiteboard", "High-speed Wi-Fi", "AC"],
    status: "available",
    slots: {
      slot1: "available", slot2: "occupied", slot3: "available", slot4: "available",
      slot5: "available", slot6: "occupied", slot7: "available", slot8: "available",
      slot9: "occupied", slot10: "available", slot11: "available", slot12: "available"
    }
  },

  // =================== BLOCK C ===================
  {
    name: "C-102",
    block: "C",
    floor: 0, // Ground Floor
    type: "classroom",
    capacity: 55,
    facilities: ["Projector", "Whiteboard", "AC"],
    status: "available",
    slots: {
      slot1: "available", slot2: "available", slot3: "occupied", slot4: "available",
      slot5: "available", slot6: "available", slot7: "available", slot8: "occupied",
      slot9: "occupied", slot10: "available", slot11: "available", slot12: "available"
    }
  },
  {
    name: "C-104",
    block: "C",
    floor: 0, // Ground Floor
    type: "lab",
    capacity: 35,
    facilities: ["Lab Computers", "AC", "Smart Board", "LAN Ports"],
    status: "occupied",
    slots: {
      slot1: "occupied", slot2: "occupied", slot3: "occupied", slot4: "available",
      slot5: "available", slot6: "occupied", slot7: "available", slot8: "available",
      slot9: "occupied", slot10: "available", slot11: "available", slot12: "available"
    }
  },
  {
    name: "C-203",
    block: "C",
    floor: 1, // 1st Floor
    type: "classroom",
    capacity: 70,
    facilities: ["Projector", "AC", "Mic & Speakers", "Smart Board"],
    status: "available",
    slots: {
      slot1: "available", slot2: "available", slot3: "available", slot4: "available",
      slot5: "occupied", slot6: "occupied", slot7: "available", slot8: "available",
      slot9: "available", slot10: "occupied", slot11: "occupied", slot12: "available"
    }
  },
  {
    name: "C-401",
    block: "C",
    floor: 3, // 3rd Floor
    type: "classroom",
    capacity: 40,
    facilities: ["Whiteboard", "Smart Board", "AC"],
    status: "available",
    slots: {
      slot1: "available", slot2: "occupied", slot3: "occupied", slot4: "occupied",
      slot5: "available", slot6: "available", slot7: "available", slot8: "available",
      slot9: "available", slot10: "available", slot11: "occupied", slot12: "available"
    }
  },

  // =================== BLOCK D ===================
  {
    name: "D-104",
    block: "D",
    floor: 0, // Ground Floor
    type: "classroom",
    capacity: 60,
    facilities: ["Projector", "Whiteboard", "AC", "Podium"],
    status: "available",
    slots: {
      slot1: "available", slot2: "available", slot3: "available", slot4: "occupied",
      slot5: "available", slot6: "available", slot7: "available", slot8: "occupied",
      slot9: "available", slot10: "available", slot11: "available", slot12: "available"
    }
  },
  {
    name: "D-201",
    block: "D",
    floor: 1, // 1st Floor
    type: "lab",
    capacity: 45,
    facilities: ["Lab Computers", "High-speed Wi-Fi", "AC", "Smart Board"],
    status: "occupied",
    slots: {
      slot1: "occupied", slot2: "available", slot3: "available", slot4: "occupied",
      slot5: "occupied", slot6: "occupied", slot7: "available", slot8: "available",
      slot9: "available", slot10: "occupied", slot11: "occupied", slot12: "available"
    }
  },
  {
    name: "D-204",
    block: "D",
    floor: 1, // 1st Floor
    type: "classroom",
    capacity: 55,
    facilities: ["Projector", "Whiteboard", "AC"],
    status: "available",
    slots: {
      slot1: "available", slot2: "available", slot3: "occupied", slot4: "available",
      slot5: "available", slot6: "available", slot7: "available", slot8: "available",
      slot9: "available", slot10: "occupied", slot11: "available", slot12: "available"
    }
  },
  {
    name: "D-302",
    block: "D",
    floor: 2, // 2nd Floor
    type: "classroom",
    capacity: 90,
    facilities: ["Auditorium Audio", "Projector", "AC", "Podium", "Stage Mic"],
    status: "available",
    slots: {
      slot1: "available", slot2: "occupied", slot3: "occupied", slot4: "available",
      slot5: "available", slot6: "available", slot7: "available", slot8: "occupied",
      slot9: "available", slot10: "available", slot11: "available", slot12: "available"
    }
  },

  // =================== BLOCK F ===================
  {
    name: "F-103",
    block: "F",
    floor: 0, // Ground Floor
    type: "classroom",
    capacity: 50,
    facilities: ["Projector", "Whiteboard", "AC"],
    status: "available",
    slots: {
      slot1: "available", slot2: "available", slot3: "available", slot4: "occupied",
      slot5: "available", slot6: "available", slot7: "available", slot8: "available",
      slot9: "occupied", slot10: "available", slot11: "available", slot12: "available"
    }
  },
  {
    name: "F-204",
    block: "F",
    floor: 1, // 1st Floor
    type: "lab",
    capacity: 35,
    facilities: ["Lab Computers", "Smart Board", "AC", "Auditorium Audio"],
    status: "occupied",
    slots: {
      slot1: "occupied", slot2: "occupied", slot3: "occupied", slot4: "available",
      slot5: "available", slot6: "occupied", slot7: "available", slot8: "available",
      slot9: "occupied", slot10: "available", slot11: "available", slot12: "available"
    }
  },
  {
    name: "F-304",
    block: "F",
    floor: 2, // 2nd Floor
    type: "classroom",
    capacity: 60,
    facilities: ["Projector", "Whiteboard", "AC", "Mic & Speakers"],
    status: "available",
    slots: {
      slot1: "available", slot2: "available", slot3: "available", slot4: "available",
      slot5: "occupied", slot6: "occupied", slot7: "available", slot8: "available",
      slot9: "available", slot10: "occupied", slot11: "occupied", slot12: "available"
    }
  },
  {
    name: "F-402",
    block: "F",
    floor: 3, // 3rd Floor
    type: "classroom",
    capacity: 45,
    facilities: ["Smart Board", "Mic & Speakers", "AC"],
    status: "available",
    slots: {
      slot1: "available", slot2: "occupied", slot3: "occupied", slot4: "available",
      slot5: "available", slot6: "available", slot7: "available", slot8: "occupied",
      slot9: "available", slot10: "available", slot11: "available", slot12: "available"
    }
  }
];

/**
 * Seed sample classrooms into the Firestore 'classrooms' collection.
 * Conforms to the campus layout: Blocks A, C, D, F and Floors 0, 1, 2, 3.
 * 
 * @param {Firestore} db - Firestore database instance
 * @param {Function} serverTimestamp - Firestore serverTimestamp helper
 * @returns {Promise<number>} - Count of seeded classrooms
 */
export async function seedClassrooms(db, serverTimestamp) {
  const batch = writeBatch(db);
  const classroomsCollection = collection(db, "classrooms");

  for (const room of sampleClassrooms) {
    const newDocRef = doc(classroomsCollection);
    batch.set(newDocRef, {
      ...room,
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
  return sampleClassrooms.length;
}
