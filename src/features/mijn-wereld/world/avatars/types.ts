// Avatar contract: plain SVG in local coordinates, x = 0 at the left edge, standing on GROUND_Y (layout.ts).
// Avatars are brand-neutral: they paint the brands they get (a shared place can carry several).

import type { ReactElement } from 'react';

import type { Household, PlacedBrand } from '../types';

export interface AvatarProps {
  width: number;
  label: string;
  brands: PlacedBrand[];
  household: Household;
  /** Plays the household's wave at the end of the fly-in. */
  wave?: boolean;
}

export interface AvatarSpec {
  Avatar: (props: AvatarProps) => ReactElement;
  /** y of the drawing's top: the Kate flag and the shield sit there. */
  top: number;
  /** Where the Kate flag's pole stands (on the roof, the car, the sand…). */
  flag: { x: number; y: number };
  /** Attachments as stickers at this base y instead of signposts in front. */
  stickerY?: number;
  /** Signposts against the right wall instead of centred in front (they would hide the door). */
  attachRight?: boolean;
}
