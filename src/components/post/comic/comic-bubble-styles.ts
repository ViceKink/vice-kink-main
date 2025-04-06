
import { BubbleType } from './ComicBubble';

// Styles for different bubble types
export const bubbleStyles = {
  'comic-round': {
    borderRadius: '20px',
    padding: '8px 12px',
  },
  'comic-speech': {
    borderRadius: '20px',
    padding: '8px 12px',
    position: 'relative',
    background: 'white',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: '-15px',
      left: '50%',
      width: '30px',
      height: '15px',
      background: 'white',
      borderBottomRightRadius: '100%',
      transform: 'translateX(-80%)',
    }
  },
  'thought-cloud': {
    borderRadius: '50%',
    background: 'white',
    padding: '10px',
    boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.9), 0 0 0 16px rgba(255, 255, 255, 0.7), 0 0 0 24px rgba(255, 255, 255, 0.5)',
  }
};
