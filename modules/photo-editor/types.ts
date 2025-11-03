/**
 * Types untuk Photo Editor
 */

import type React from 'react';

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
  cellAspectRatio: number;
};

export type GridCell = {
  id: string;
  photoId: string | null;
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
