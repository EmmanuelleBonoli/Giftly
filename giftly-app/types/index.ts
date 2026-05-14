/** Types partagés entre les stores, services et composants */

export type Plan = 'FREE' | 'PREMIUM';
export type EventType = 'CHRISTMAS' | 'BIRTHDAY' | 'OTHER';
export type ParticipantRole = 'ADMIN' | 'MEMBER';

export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: Plan;
}

export interface Event {
  id: number;
  name: string;
  type: EventType;
  eventDate?: string;
  createdBy: number;
  isActive: boolean;
  participantCount: number;
  code: string;
}

export interface WishList {
  id: number;
  eventId: number;
  userId: number;
  ownerName: string;
  itemCount: number;
}

export interface WishItem {
  id: number;
  listId: number;
  name: string;
  description?: string;
  url?: string;
  price?: number;
  imageUrl?: string;
  /** null si non réservé — absent si l'appelant est le propriétaire */
  reservedBy?: number | null;
  reservedByName?: string | null;
}

export interface Invitation {
  id: number;
  eventId: number;
  code: string;
  email?: string;
  expiresAt: string;
}

/** Payload WebSocket — broadcast général */
export interface WsEventPayload {
  type: 'PARTICIPANT_JOINED' | 'ITEM_ADDED' | 'ITEM_REMOVED';
  eventId: number;
  data: unknown;
}

/** Payload WebSocket — réservation */
export interface WsReservationPayload {
  type: 'ITEM_RESERVED' | 'ITEM_UNRESERVED';
  itemId: number;
  listId: number;
  reservedBy?: number;
  reservedByName?: string;
}
