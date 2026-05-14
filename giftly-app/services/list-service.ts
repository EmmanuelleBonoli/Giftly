import api from './api';
import { Endpoints } from '@/constants/api';
import type { WishList, WishItem } from '@/types';

export async function getListsByEvent(eventId: number): Promise<WishList[]> {
  const { data } = await api.get<WishList[]>(Endpoints.lists.byEvent(eventId));
  return data;
}

export async function getItemsByList(listId: number): Promise<WishItem[]> {
  const { data } = await api.get<WishItem[]>(Endpoints.items.byList(listId));
  return data;
}

export interface CreateItemPayload {
  name: string;
  description?: string;
  url?: string;
  price?: number;
  imageUrl?: string;
}

export async function addItem(listId: number, payload: CreateItemPayload): Promise<WishItem> {
  const { data } = await api.post<WishItem>(Endpoints.items.create(listId), payload);
  return data;
}

export async function deleteItem(itemId: number): Promise<void> {
  await api.delete(`/items/${itemId}`);
}

export async function reserveItem(itemId: number): Promise<WishItem> {
  const { data } = await api.post<WishItem>(Endpoints.items.reserve(itemId));
  return data;
}

export async function unreserveItem(itemId: number): Promise<WishItem> {
  const { data } = await api.delete<WishItem>(Endpoints.items.unreserve(itemId));
  return data;
}

export async function createInvitation(eventId: number, email?: string): Promise<{ code: string; link: string }> {
  const { data } = await api.post(`/events/${eventId}/invitations`, email ? { email } : {});
  return data;
}
