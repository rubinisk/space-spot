// ==============================================================================
// SpaceSpot – Time Slots Configuration (slots-config.js)
// ==============================================================================
// Standard College Schedule with 12 Slots:
// Slot 1:  08:00 - 08:50
// Slot 2:  08:50 - 09:40
// Slot 3:  09:40 - 10:30
// Slot 4:  10:45 - 11:35  (15-min morning break before slot 4)
// Slot 5:  11:35 - 12:25
// Slot 6:  12:25 - 13:15
// Slot 7:  13:15 - 14:05  (Lunch Slot)
// Slot 8:  14:05 - 14:55
// Slot 9:  14:55 - 15:45
// Slot 10: 15:45 - 16:35
// Slot 11: 16:35 - 17:25
// Slot 12: 17:25 - 18:15
// ==============================================================================

export const TIME_SLOTS = [
  { id: "slot1",  num: 1,  name: "Slot 1",  time: "8:00 - 8:50",   startH: 8,  startM: 0,  endH: 8,  endM: 50 },
  { id: "slot2",  num: 2,  name: "Slot 2",  time: "8:50 - 9:40",   startH: 8,  startM: 50, endH: 9,  endM: 40 },
  { id: "slot3",  num: 3,  name: "Slot 3",  time: "9:40 - 10:30",  startH: 9,  startM: 40, endH: 10, endM: 30 },
  { id: "slot4",  num: 4,  name: "Slot 4",  time: "10:45 - 11:35", startH: 10, startM: 45, endH: 11, endM: 35 },
  { id: "slot5",  num: 5,  name: "Slot 5",  time: "11:35 - 12:25", startH: 11, startM: 35, endH: 12, endM: 25 },
  { id: "slot6",  num: 6,  name: "Slot 6",  time: "12:25 - 1:15",  startH: 12, startM: 25, endH: 13, endM: 15 },
  { id: "slot7",  num: 7,  name: "Slot 7",  time: "1:15 - 2:05 (Lunch)", startH: 13, startM: 15, endH: 14, endM: 5, isLunch: true },
  { id: "slot8",  num: 8,  name: "Slot 8",  time: "2:05 - 2:55",   startH: 14, startM: 5,  endH: 14, endM: 55 },
  { id: "slot9",  num: 9,  name: "Slot 9",  time: "2:55 - 3:45",   startH: 14, startM: 55, endH: 15, endM: 45 },
  { id: "slot10", num: 10, name: "Slot 10", time: "3:45 - 4:35",   startH: 15, startM: 45, endH: 16, endM: 35 },
  { id: "slot11", num: 11, name: "Slot 11", time: "4:35 - 5:25",   startH: 16, startM: 35, endH: 17, endM: 25 },
  { id: "slot12", num: 12, name: "Slot 12", time: "5:25 - 6:15",   startH: 17, startM: 25, endH: 18, endM: 15 }
];

/**
 * Returns the currently active slot based on system local time,
 * or null if outside college operational hours (before 8:00 AM or after 6:15 PM).
 */
export function getCurrentSlot() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const slot of TIME_SLOTS) {
    const startMinutes = slot.startH * 60 + slot.startM;
    const endMinutes = slot.endH * 60 + slot.endM;

    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return slot;
    }
  }

  return null;
}

/**
 * Generates a default slots map with all 12 slots set to 'available'.
 */
export function getDefaultSlotsMap(initialStatus = "available") {
  const slots = {};
  TIME_SLOTS.forEach(slot => {
    slots[slot.id] = initialStatus;
  });
  return slots;
}
