/**
 * Office layout configuration.
 *
 * Coordinates are in meters on a flat X/Z plane (Y is up).
 * Replace this with your actual floor plan dimensions and room positions
 * once you attach your office plan.
 *
 * Each wall is a box: { x, z, width, depth, height?, color? }
 * Each desk is: { x, z, rotation?, label? }
 * Each room label is: { x, z, label, width?, depth? }
 */

export interface Wall {
  x: number;
  z: number;
  width: number;
  depth: number;
  height?: number;
  color?: string;
}

export interface Desk {
  x: number;
  z: number;
  rotation?: number;
  label?: string;
}

export interface Room {
  x: number;
  z: number;
  width: number;
  depth: number;
  label: string;
  floorColor?: string;
}

export interface OfficeLayout {
  /** Total floor dimensions */
  width: number;
  depth: number;
  /** Outer boundary walls */
  walls: Wall[];
  /** Interior partition walls */
  partitions: Wall[];
  /** Desks / workstations */
  desks: Desk[];
  /** Named rooms / zones */
  rooms: Room[];
  /** Spawn point for new players */
  spawn: { x: number; z: number };
}

export const officeLayout: OfficeLayout = {
  width: 24,
  depth: 16,
  spawn: { x: 12, z: 8 },

  walls: [
    { x: 12, z: 0.15, width: 24, depth: 0.3, height: 2.5, color: '#5c6b7a' },
    { x: 12, z: 15.85, width: 24, depth: 0.3, height: 2.5, color: '#5c6b7a' },
    { x: 0.15, z: 8, width: 0.3, depth: 16, height: 2.5, color: '#5c6b7a' },
    { x: 23.85, z: 8, width: 0.3, depth: 16, height: 2.5, color: '#5c6b7a' },
  ],

  partitions: [
    // Meeting room divider (left)
    { x: 7, z: 4, width: 0.15, depth: 8, height: 2.5, color: '#7a8a99' },
    { x: 4, z: 8.15, width: 6, depth: 0.15, height: 2.5, color: '#7a8a99' },
    // Kitchen divider (right)
    { x: 17, z: 4, width: 0.15, depth: 8, height: 2.5, color: '#7a8a99' },
    { x: 20, z: 8.15, width: 6, depth: 0.15, height: 2.5, color: '#7a8a99' },
    // Door gaps are left open at z=6-7 on partition walls
  ],

  rooms: [
    { x: 4, z: 4, width: 6, depth: 8, label: 'Meeting Room', floorColor: '#dbeafe' },
    { x: 12, z: 8, width: 10, depth: 16, label: 'Open Plan', floorColor: '#f0fdf4' },
    { x: 20, z: 4, width: 6, depth: 8, label: 'Kitchen', floorColor: '#fef3c7' },
    { x: 12, z: 13, width: 10, depth: 4, label: 'Lounge', floorColor: '#fce7f3' },
  ],

  desks: [
    // Open plan desks (2 rows of 4)
    { x: 9, z: 6, label: 'Desk 1' },
    { x: 11, z: 6, label: 'Desk 2' },
    { x: 13, z: 6, label: 'Desk 3' },
    { x: 15, z: 6, label: 'Desk 4' },
    { x: 9, z: 9, label: 'Desk 5' },
    { x: 11, z: 9, label: 'Desk 6' },
    { x: 13, z: 9, label: 'Desk 7' },
    { x: 15, z: 9, label: 'Desk 8' },
    // Meeting room table
    { x: 4, z: 4, label: 'Meeting Table', rotation: 0 },
    // Lounge seating
    { x: 10, z: 13, label: 'Sofa' },
    { x: 14, z: 13, label: 'Sofa' },
  ],
};

/** Movement bounds derived from layout */
export function getMovementBounds(layout: OfficeLayout) {
  const margin = 0.5;
  return {
    minX: margin,
    maxX: layout.width - margin,
    minZ: margin,
    maxZ: layout.depth - margin,
  };
}
