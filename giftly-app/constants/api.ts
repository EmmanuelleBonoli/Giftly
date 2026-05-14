/** URL de base de l'API — à surcharger via variable d'environnement */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api';
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'http://10.0.2.2:8080/api/ws';
/** Endpoint WebSocket natif (sans SockJS) — utilisé par le client React Native */
export const WS_NATIVE_URL = process.env.EXPO_PUBLIC_WS_NATIVE_URL ?? 'ws://10.0.2.2:8080/api/ws-native';

/** Endpoints REST */
export const Endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    oauth2: (provider: string) => `/auth/oauth2/${provider}`,
  },
  events: {
    list: '/events',
    create: '/events',
    detail: (id: number) => `/events/${id}`,
    join: (code: string) => `/events/join/${code}`,
    participants: (id: number) => `/events/${id}/participants`,
  },
  lists: {
    byEvent: (eventId: number) => `/events/${eventId}/lists`,
    detail: (id: number) => `/lists/${id}`,
  },
  items: {
    byList: (listId: number) => `/lists/${listId}/items`,
    create: (listId: number) => `/lists/${listId}/items`,
    reserve: (itemId: number) => `/items/${itemId}/reserve`,
    unreserve: (itemId: number) => `/items/${itemId}/unreserve`,
  },
  invitations: {
    create: (eventId: number) => `/events/${eventId}/invitations`,
  },
} as const;

/** Topics WebSocket STOMP */
export const WsTopics = {
  eventBroadcast: (eventId: number) => `/topic/event.${eventId}`,
  userReservations: '/user/queue/reservations',
  userNotifications: '/user/queue/notifications',
} as const;
