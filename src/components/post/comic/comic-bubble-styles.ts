
import { BubbleStyle } from './ComicBubble';

export interface BubbleStyleOption {
  id: BubbleStyle;
  name: string;
  description: string;
}

export const bubbleStyles: BubbleStyleOption[] = [
  {
    id: 'comic-round',
    name: 'Round',
    description: 'Classic round comic bubble'
  },
  {
    id: 'comic-cloud',
    name: 'Cloud',
    description: 'Fluffy cloud-like bubble'
  },
  {
    id: 'comic-sharp',
    name: 'Sharp',
    description: 'Angular bubble with sharp corners'
  },
  {
    id: 'comic-burst',
    name: 'Burst',
    description: 'Star-burst style for emphasis'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Simple modern style bubble'
  }
];
