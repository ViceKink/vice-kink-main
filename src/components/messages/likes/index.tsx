
import React from 'react';
import LikesContainer from './LikesContainer';
import { ProfileWithInteraction } from '@/models/profileTypes';

interface LikesProps {
  likes: ProfileWithInteraction[];
}

export const Likes: React.FC<LikesProps> = ({ likes }) => {
  return <LikesContainer likes={likes} />;
};

export default Likes;
