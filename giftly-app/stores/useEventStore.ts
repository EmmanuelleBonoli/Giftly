import { create } from 'zustand';
import * as eventService from '@/services/event-service';
import type { Event } from '@/types';

interface EventState {
  events: Event[];
  isLoading: boolean;
  fetchMyEvents: () => Promise<void>;
  createEvent: (payload: eventService.CreateEventPayload) => Promise<Event>;
  joinByCode: (code: string) => Promise<{ event: Event; myListId: number }>;
  archiveEvent: (id: number) => Promise<void>;
  /** Met à jour un événement dans la liste locale (utilisé par le WebSocket) */
  upsertEvent: (event: Event) => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  isLoading: false,

  fetchMyEvents: async () => {
    set({ isLoading: true });
    try {
      const events = await eventService.getMyEvents();
      set({ events, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error('Impossible de charger les événements');
    }
  },

  createEvent: async (payload) => {
    const event = await eventService.createEvent(payload);
    set((state) => ({ events: [event, ...state.events] }));
    return event;
  },

  joinByCode: async (code) => {
    const result = await eventService.joinByCode(code);
    set((state) => ({ events: [result.event, ...state.events] }));
    return result;
  },

  archiveEvent: async (id) => {
    await eventService.archiveEvent(id);
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, isActive: false } : e)),
    }));
  },

  upsertEvent: (event) => {
    set((state) => {
      const exists = state.events.some((e) => e.id === event.id);
      return {
        events: exists
          ? state.events.map((e) => (e.id === event.id ? event : e))
          : [event, ...state.events],
      };
    });
  },
}));
