import api from './api';
import { Endpoints } from '@/constants/api';
import type { Event } from '@/types';

export interface CreateEventPayload {
  name: string;
  type: Event['type'];
  eventDate?: string;
}

export async function getMyEvents(): Promise<Event[]> {
  const { data } = await api.get<Event[]>(Endpoints.events.list);
  return data;
}

export async function getEventById(id: number): Promise<Event> {
  const { data } = await api.get<Event>(Endpoints.events.detail(id));
  return data;
}

export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  const { data } = await api.post<Event>(Endpoints.events.create, payload);
  return data;
}

export async function joinByCode(code: string): Promise<{ event: Event; myListId: number }> {
  const { data } = await api.post(Endpoints.events.join(code));
  return data;
}

export async function archiveEvent(id: number): Promise<Event> {
  const { data } = await api.patch<Event>(`${Endpoints.events.detail(id)}/archive`);
  return data;
}
