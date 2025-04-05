
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
    description: 'Classic round comic bubble with tail pointing to speaker'
  },
  {
    id: 'comic-cloud',
    name: 'Cloud',
    description: 'Fluffy cloud-like bubble with round edges and small circular tails'
  },
  {
    id: 'comic-sharp',
    name: 'Sharp',
    description: 'Angular bubble with sharp corners and triangular tail'
  },
  {
    id: 'comic-burst',
    name: 'Burst',
    description: 'Star-burst style with jagged edges for emphasis or action'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Simple rectangular bubble with rounded corners and small tail'
  }
];

// CSS styles to be imported in global stylesheet
export const comicBubbleStyles = `
/* Comic-style speech bubbles */
.comic-speech-round {
  border-radius: 20px;
  position: relative;
}
.comic-speech-round:after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 30px;
  border: 10px solid transparent;
  border-top-color: inherit;
  border-bottom: 0;
  border-left: 0;
  margin-left: -10px;
  transform: rotate(25deg);
}

.comic-thought-round {
  border-radius: 25px;
  position: relative;
}
.comic-thought-round:before,
.comic-thought-round:after {
  content: '';
  position: absolute;
  background: inherit;
  border: 2px solid;
  border-color: inherit;
  border-radius: 50%;
}
.comic-thought-round:before {
  width: 15px;
  height: 15px;
  right: 20px;
  bottom: -25px;
}
.comic-thought-round:after {
  width: 10px;
  height: 10px;
  right: 5px;
  bottom: -35px;
}

.comic-speech-cloud {
  border-radius: 50% / 50%;
  position: relative;
}
.comic-speech-cloud:after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 25px;
  width: 30px;
  height: 15px;
  background: inherit;
  border: 2px solid;
  border-color: inherit;
  border-top: 0;
  border-radius: 0 0 60% 60% / 0 0 100% 100%;
}

.comic-thought-cloud {
  border-radius: 60% 40% 70% 30% / 60% 30% 70% 40%;
  position: relative;
}
.comic-thought-cloud:before,
.comic-thought-cloud:after {
  content: '';
  position: absolute;
  background: inherit;
  border: 2px solid;
  border-color: inherit;
}
.comic-thought-cloud:before {
  width: 20px;
  height: 20px;
  right: 20px;
  bottom: -25px;
  border-radius: 50%;
}
.comic-thought-cloud:after {
  width: 10px;
  height: 10px;
  right: 5px;
  bottom: -40px;
  border-radius: 50%;
}

.comic-speech-sharp {
  border-radius: 0;
  clip-path: polygon(0% 0%, 100% 0%, 95% 90%, 75% 100%, 80% 90%, 0% 100%);
}

.comic-thought-sharp {
  border-radius: 0;
  clip-path: polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%);
}

.comic-speech-burst {
  clip-path: polygon(50% 0%, 65% 15%, 85% 5%, 80% 30%, 100% 35%, 80% 50%, 95% 70%, 75% 65%, 70% 90%, 50% 70%, 30% 90%, 25% 65%, 5% 70%, 20% 50%, 0% 35%, 20% 30%, 15% 5%, 35% 15%);
}

.comic-thought-burst {
  border-radius: 50%;
  clip-path: polygon(50% 0%, 61% 25%, 98% 25%, 68% 47%, 79% 81%, 50% 60%, 21% 81%, 32% 47%, 2% 25%, 39% 25%);
}

/* Modern style bubbles */
.speech-bubble {
  border-radius: 12px;
  position: relative;
}
.speech-bubble:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 15px;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-top-color: inherit;
  border-bottom: 0;
  margin-left: -5px;
}

.thought-bubble {
  border-radius: 20px;
  position: relative;
}
.thought-bubble:after {
  content: '';
  position: absolute;
  bottom: -20px;
  right: 15px;
  width: 12px;
  height: 12px;
  background: inherit;
  border-radius: 50%;
}
.thought-bubble:before {
  content: '';
  position: absolute;
  bottom: -30px;
  right: 5px;
  width: 8px;
  height: 8px;
  background: inherit;
  border-radius: 50%;
}
`;
