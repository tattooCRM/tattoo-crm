import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ChatPage from './ChatPage';
import TattooArtistChat from './TattooArtistChat';

export default function ChatRouter() {
  const { isTattooArtist } = useAuth();

  // Si c'est un tatoueur, afficher l'interface tatoueur
  if (isTattooArtist()) {
    return <TattooArtistChat />;
  }

  // Sinon, afficher l'interface client
  return <ChatPage />;
}
