// ==============================================================================
// SpaceSpot – Database Seeder (seed.js)
// ==============================================================================
// Campus Architecture & Room Numbering Specification:
// - Blocks: A, C, D, F (Blocks B and E are Staff Rooms and excluded).
// - 4 Floors per Block:
//     * Floor 0 (Ground): 102, 103 (Lab), 104, 105 (101 does not exist)
//     * Floor 1 (1st):    201, 203, 204 (Lab), 205 (202 does not exist)
//     * Floor 2 (2nd):    301, 302, 304, 305 (Lab) (303 does not exist)
//     * Floor 3 (3rd):    401, 402 (Lab), 403, 405 (404 does not exist)
// - Exactly 4 rooms per floor per block (3 Classrooms + 1 Lab).
// - Total: 4 blocks x 16 rooms = 64 campus rooms with full 12-slot schedules.
// ==============================================================================

import { 
  collection, 
  doc, 
  writeBatch,
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const sampleClassrooms = [
  {
    "name": "A-102",
    "block": "A",
    "floor": 0,
    "type": "classroom",
    "capacity": 55,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "occupied",
      "slot10": "occupied",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "A-103",
    "block": "A",
    "floor": 0,
    "type": "lab",
    "capacity": 40,
    "facilities": [
      "Lab Computers",
      "AC",
      "LAN Ports",
      "Smart Board"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "A-104",
    "block": "A",
    "floor": 0,
    "type": "classroom",
    "capacity": 60,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Podium"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "available",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "A-105",
    "block": "A",
    "floor": 0,
    "type": "classroom",
    "capacity": 50,
    "facilities": [
      "Whiteboard",
      "AC",
      "Mic & Speakers"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "available",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "A-201",
    "block": "A",
    "floor": 1,
    "type": "classroom",
    "capacity": 65,
    "facilities": [
      "Smart Board",
      "Mic & Speakers",
      "AC",
      "Podium"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "available",
      "slot5": "available",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "available",
      "slot11": "occupied",
      "slot12": "occupied"
    }
  },
  {
    "name": "A-203",
    "block": "A",
    "floor": 1,
    "type": "classroom",
    "capacity": 70,
    "facilities": [
      "Projector",
      "AC",
      "Mic & Speakers",
      "Smart Board"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "A-204",
    "block": "A",
    "floor": 1,
    "type": "lab",
    "capacity": 35,
    "facilities": [
      "Lab Computers",
      "AC",
      "Smart Board",
      "LAN Ports"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "A-205",
    "block": "A",
    "floor": 1,
    "type": "classroom",
    "capacity": 60,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "A-301",
    "block": "A",
    "floor": 2,
    "type": "classroom",
    "capacity": 50,
    "facilities": [
      "Whiteboard",
      "AC",
      "Smart Board"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "occupied",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "A-302",
    "block": "A",
    "floor": 2,
    "type": "classroom",
    "capacity": 55,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Podium"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "occupied",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "occupied",
      "slot12": "occupied"
    }
  },
  {
    "name": "A-304",
    "block": "A",
    "floor": 2,
    "type": "classroom",
    "capacity": 65,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Mic & Speakers"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "A-305",
    "block": "A",
    "floor": 2,
    "type": "lab",
    "capacity": 35,
    "facilities": [
      "Lab Computers",
      "Smart Board",
      "AC",
      "Auditorium Audio"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "A-401",
    "block": "A",
    "floor": 3,
    "type": "classroom",
    "capacity": 45,
    "facilities": [
      "Whiteboard",
      "Smart Board",
      "AC"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "A-402",
    "block": "A",
    "floor": 3,
    "type": "lab",
    "capacity": 40,
    "facilities": [
      "Lab Computers",
      "LAN Ports",
      "AC",
      "Smart Board"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "A-403",
    "block": "A",
    "floor": 3,
    "type": "classroom",
    "capacity": 55,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Podium"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "A-405",
    "block": "A",
    "floor": 3,
    "type": "classroom",
    "capacity": 50,
    "facilities": [
      "Whiteboard",
      "AC",
      "Mic & Speakers"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "C-102",
    "block": "C",
    "floor": 0,
    "type": "classroom",
    "capacity": 55,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "available",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "C-103",
    "block": "C",
    "floor": 0,
    "type": "lab",
    "capacity": 40,
    "facilities": [
      "Lab Computers",
      "AC",
      "LAN Ports",
      "Smart Board"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "available",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "available",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "C-104",
    "block": "C",
    "floor": 0,
    "type": "classroom",
    "capacity": 60,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Podium"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "available",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "C-105",
    "block": "C",
    "floor": 0,
    "type": "classroom",
    "capacity": 50,
    "facilities": [
      "Whiteboard",
      "AC",
      "Mic & Speakers"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "available",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "C-201",
    "block": "C",
    "floor": 1,
    "type": "classroom",
    "capacity": 65,
    "facilities": [
      "Smart Board",
      "Mic & Speakers",
      "AC",
      "Podium"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "available",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "C-203",
    "block": "C",
    "floor": 1,
    "type": "classroom",
    "capacity": 70,
    "facilities": [
      "Projector",
      "AC",
      "Mic & Speakers",
      "Smart Board"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "available",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "C-204",
    "block": "C",
    "floor": 1,
    "type": "lab",
    "capacity": 35,
    "facilities": [
      "Lab Computers",
      "AC",
      "Smart Board",
      "LAN Ports"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "available",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "C-205",
    "block": "C",
    "floor": 1,
    "type": "classroom",
    "capacity": 60,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "occupied",
      "slot12": "occupied"
    }
  },
  {
    "name": "C-301",
    "block": "C",
    "floor": 2,
    "type": "classroom",
    "capacity": 50,
    "facilities": [
      "Whiteboard",
      "AC",
      "Smart Board"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "occupied",
      "slot5": "available",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "C-302",
    "block": "C",
    "floor": 2,
    "type": "classroom",
    "capacity": 55,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Podium"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "available",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "C-304",
    "block": "C",
    "floor": 2,
    "type": "classroom",
    "capacity": 65,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Mic & Speakers"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "available",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "C-305",
    "block": "C",
    "floor": 2,
    "type": "lab",
    "capacity": 35,
    "facilities": [
      "Lab Computers",
      "Smart Board",
      "AC",
      "Auditorium Audio"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "available",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "C-401",
    "block": "C",
    "floor": 3,
    "type": "classroom",
    "capacity": 45,
    "facilities": [
      "Whiteboard",
      "Smart Board",
      "AC"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "occupied",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "available",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "available",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "C-402",
    "block": "C",
    "floor": 3,
    "type": "lab",
    "capacity": 40,
    "facilities": [
      "Lab Computers",
      "LAN Ports",
      "AC",
      "Smart Board"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "occupied",
      "slot5": "available",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "C-403",
    "block": "C",
    "floor": 3,
    "type": "classroom",
    "capacity": 55,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Podium"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "occupied",
      "slot5": "available",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "C-405",
    "block": "C",
    "floor": 3,
    "type": "classroom",
    "capacity": 50,
    "facilities": [
      "Whiteboard",
      "AC",
      "Mic & Speakers"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "occupied",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "D-102",
    "block": "D",
    "floor": 0,
    "type": "classroom",
    "capacity": 55,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "D-103",
    "block": "D",
    "floor": 0,
    "type": "lab",
    "capacity": 40,
    "facilities": [
      "Lab Computers",
      "AC",
      "LAN Ports",
      "Smart Board"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "D-104",
    "block": "D",
    "floor": 0,
    "type": "classroom",
    "capacity": 60,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Podium"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "D-105",
    "block": "D",
    "floor": 0,
    "type": "classroom",
    "capacity": 50,
    "facilities": [
      "Whiteboard",
      "AC",
      "Mic & Speakers"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "D-201",
    "block": "D",
    "floor": 1,
    "type": "classroom",
    "capacity": 65,
    "facilities": [
      "Smart Board",
      "Mic & Speakers",
      "AC",
      "Podium"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "available",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "D-203",
    "block": "D",
    "floor": 1,
    "type": "classroom",
    "capacity": 70,
    "facilities": [
      "Projector",
      "AC",
      "Mic & Speakers",
      "Smart Board"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "D-204",
    "block": "D",
    "floor": 1,
    "type": "lab",
    "capacity": 35,
    "facilities": [
      "Lab Computers",
      "AC",
      "Smart Board",
      "LAN Ports"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "D-205",
    "block": "D",
    "floor": 1,
    "type": "classroom",
    "capacity": 60,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "D-301",
    "block": "D",
    "floor": 2,
    "type": "classroom",
    "capacity": 50,
    "facilities": [
      "Whiteboard",
      "AC",
      "Smart Board"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "occupied",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "D-302",
    "block": "D",
    "floor": 2,
    "type": "classroom",
    "capacity": 55,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Podium"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "occupied",
      "slot12": "occupied"
    }
  },
  {
    "name": "D-304",
    "block": "D",
    "floor": 2,
    "type": "classroom",
    "capacity": 65,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Mic & Speakers"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "available",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "D-305",
    "block": "D",
    "floor": 2,
    "type": "lab",
    "capacity": 35,
    "facilities": [
      "Lab Computers",
      "Smart Board",
      "AC",
      "Auditorium Audio"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "available",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "D-401",
    "block": "D",
    "floor": 3,
    "type": "classroom",
    "capacity": 45,
    "facilities": [
      "Whiteboard",
      "Smart Board",
      "AC"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "occupied",
      "slot3": "occupied",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "available",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "D-402",
    "block": "D",
    "floor": 3,
    "type": "lab",
    "capacity": 40,
    "facilities": [
      "Lab Computers",
      "LAN Ports",
      "AC",
      "Smart Board"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "occupied",
      "slot3": "occupied",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "occupied",
      "slot10": "occupied",
      "slot11": "occupied",
      "slot12": "occupied"
    }
  },
  {
    "name": "D-403",
    "block": "D",
    "floor": 3,
    "type": "classroom",
    "capacity": 55,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Podium"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "occupied",
      "slot3": "occupied",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "occupied",
      "slot10": "occupied",
      "slot11": "occupied",
      "slot12": "occupied"
    }
  },
  {
    "name": "D-405",
    "block": "D",
    "floor": 3,
    "type": "classroom",
    "capacity": 50,
    "facilities": [
      "Whiteboard",
      "AC",
      "Mic & Speakers"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "available",
      "slot4": "available",
      "slot5": "available",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "available",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "F-102",
    "block": "F",
    "floor": 0,
    "type": "classroom",
    "capacity": 55,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "available",
      "slot5": "available",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "occupied",
      "slot12": "occupied"
    }
  },
  {
    "name": "F-103",
    "block": "F",
    "floor": 0,
    "type": "lab",
    "capacity": 40,
    "facilities": [
      "Lab Computers",
      "AC",
      "LAN Ports",
      "Smart Board"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "occupied",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "available",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "available",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "F-104",
    "block": "F",
    "floor": 0,
    "type": "classroom",
    "capacity": 60,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Podium"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "occupied",
      "slot3": "occupied",
      "slot4": "occupied",
      "slot5": "available",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "available",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "F-105",
    "block": "F",
    "floor": 0,
    "type": "classroom",
    "capacity": 50,
    "facilities": [
      "Whiteboard",
      "AC",
      "Mic & Speakers"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "occupied",
      "slot3": "occupied",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "available",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "F-201",
    "block": "F",
    "floor": 1,
    "type": "classroom",
    "capacity": 65,
    "facilities": [
      "Smart Board",
      "Mic & Speakers",
      "AC",
      "Podium"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "available",
      "slot4": "available",
      "slot5": "available",
      "slot6": "available",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "available",
      "slot11": "occupied",
      "slot12": "occupied"
    }
  },
  {
    "name": "F-203",
    "block": "F",
    "floor": 1,
    "type": "classroom",
    "capacity": 70,
    "facilities": [
      "Projector",
      "AC",
      "Mic & Speakers",
      "Smart Board"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "available",
      "slot4": "available",
      "slot5": "available",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "occupied",
      "slot10": "occupied",
      "slot11": "occupied",
      "slot12": "occupied"
    }
  },
  {
    "name": "F-204",
    "block": "F",
    "floor": 1,
    "type": "lab",
    "capacity": 35,
    "facilities": [
      "Lab Computers",
      "AC",
      "Smart Board",
      "LAN Ports"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "occupied",
      "slot10": "occupied",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "F-205",
    "block": "F",
    "floor": 1,
    "type": "classroom",
    "capacity": 60,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "available",
      "slot4": "occupied",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "F-301",
    "block": "F",
    "floor": 2,
    "type": "classroom",
    "capacity": 50,
    "facilities": [
      "Whiteboard",
      "AC",
      "Smart Board"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "available",
      "slot5": "available",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "available",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "F-302",
    "block": "F",
    "floor": 2,
    "type": "classroom",
    "capacity": 55,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Podium"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "available",
      "slot5": "available",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "available",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "F-304",
    "block": "F",
    "floor": 2,
    "type": "classroom",
    "capacity": 65,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Mic & Speakers"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "F-305",
    "block": "F",
    "floor": 2,
    "type": "lab",
    "capacity": 35,
    "facilities": [
      "Lab Computers",
      "Smart Board",
      "AC",
      "Auditorium Audio"
    ],
    "status": "occupied",
    "slots": {
      "slot1": "occupied",
      "slot2": "available",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "available",
      "slot10": "occupied",
      "slot11": "occupied",
      "slot12": "available"
    }
  },
  {
    "name": "F-401",
    "block": "F",
    "floor": 3,
    "type": "classroom",
    "capacity": 45,
    "facilities": [
      "Whiteboard",
      "Smart Board",
      "AC"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "available",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "available",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "occupied",
      "slot11": "available",
      "slot12": "available"
    }
  },
  {
    "name": "F-402",
    "block": "F",
    "floor": 3,
    "type": "lab",
    "capacity": 40,
    "facilities": [
      "Lab Computers",
      "LAN Ports",
      "AC",
      "Smart Board"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "occupied",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "available",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "F-403",
    "block": "F",
    "floor": 3,
    "type": "classroom",
    "capacity": 55,
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC",
      "Podium"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "occupied",
      "slot3": "occupied",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "occupied",
      "slot7": "available",
      "slot8": "available",
      "slot9": "occupied",
      "slot10": "available",
      "slot11": "available",
      "slot12": "occupied"
    }
  },
  {
    "name": "F-405",
    "block": "F",
    "floor": 3,
    "type": "classroom",
    "capacity": 50,
    "facilities": [
      "Whiteboard",
      "AC",
      "Mic & Speakers"
    ],
    "status": "available",
    "slots": {
      "slot1": "available",
      "slot2": "occupied",
      "slot3": "available",
      "slot4": "available",
      "slot5": "occupied",
      "slot6": "available",
      "slot7": "available",
      "slot8": "occupied",
      "slot9": "available",
      "slot10": "available",
      "slot11": "occupied",
      "slot12": "available"
    }
  }
];

/**
 * Seed sample classrooms into the Firestore 'classrooms' collection.
 * Conforms to the campus layout: Blocks A, C, D, F and Floors 0, 1, 2, 3.
 * Automatically purges any legacy test records (e.g. A-101, B-block, etc.) before writing.
 * 
 * @param {Firestore} db - Firestore database instance
 * @param {Function} serverTimestamp - Firestore serverTimestamp helper
 * @returns {Promise<number>} - Count of seeded classrooms
 */
export async function seedClassrooms(db, serverTimestamp) {
  const classroomsCollection = collection(db, "classrooms");

  // Step 1: Wipe all legacy/test documents to eliminate ghost rooms
  try {
    const existingSnap = await getDocs(classroomsCollection);
    if (!existingSnap.empty) {
      // Chunk deletions if larger than batch limit
      const docs = existingSnap.docs;
      for (let i = 0; i < docs.length; i += 400) {
        const deleteBatch = writeBatch(db);
        docs.slice(i, i + 400).forEach(d => deleteBatch.delete(d.ref));
        await deleteBatch.commit();
      }
    }
  } catch (err) {
    console.warn("Notice during database wipe:", err);
  }

  // Step 2: Insert the 64 official campus classrooms and labs in batches
  for (let i = 0; i < sampleClassrooms.length; i += 400) {
    const insertBatch = writeBatch(db);
    const chunk = sampleClassrooms.slice(i, i + 400);
    for (const room of chunk) {
      const newDocRef = doc(classroomsCollection);
      insertBatch.set(newDocRef, {
        ...room,
        updatedAt: serverTimestamp()
      });
    }
    await insertBatch.commit();
  }

  return sampleClassrooms.length;
}
