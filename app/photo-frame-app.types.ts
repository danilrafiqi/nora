/**
 * Types dan Constants untuk Photo Frame App
 */

import React from 'react';

// ============ CONSTANTS ============

export const EXPORT_WIDTH = 1200;  // 102mm @ 300 DPI
export const EXPORT_HEIGHT = 1800; // 152mm @ 300 DPI
export const EXPORT_SCALE = 1; // Already high resolution

// ============ TYPES ============

export type FrameType = {
  id: string;
  name: string;
  type: 'svg';
  component: (size: number) => React.ReactNode;
  color: string;
};

export type LayoutTemplate = {
  id: string;
  name: string;
  cols: number;
  rows: number;
  cellAspectRatio: number; // width/height
};

export type GridCell = {
  id: string;
  photoId: string | null; // foto mana yang di-place di cell ini
};

export type PhotoTransform = {
  photoId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export type StickerData = {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  uri: string | null;
  emoji?: string;
};

export type StickerItem = {
  id: string;
  name: string;
  uri: string | null;
  emoji?: string;
};
