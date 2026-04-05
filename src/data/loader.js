/**
 * loader.js — The Centralized Math Curriculum Hub
 * Dynamically aggregates world-chunked missions for the RebuildController.
 */

import world1 from './world_1.json';
import world2 from './world_2.json';
import world3 from './world_3.json';
import world4 from './world_4.json';
import world5 from './world_5.json';

// Flatten all worlds into a single mission pipeline
export const questions = [...world1, ...world2, ...world3, ...world4, ...world5];

// Registry for World Map Navigation & Gating
export const WORLDS = [
  { id: 1, name: 'Addition Kingdom', levels: world1 },
  { id: 2, name: 'Subtraction Safari', levels: world2 },
  { id: 3, name: 'Multiplication Mountain', levels: world3 },
  { id: 4, name: 'Division Deep Sea', levels: world4 },
  { id: 5, name: 'Mixed Challenge', levels: world5 },
];
