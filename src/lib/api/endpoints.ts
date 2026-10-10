import { api } from './client';
import type {
  AuthResponse,
  Conversation,
  CreatedInvite,
  Invite,
  Member,
  Message,
  Paginated,
  Role,
  WhatsAppNumber,
} from '@/types/api';

export interface PublicConfig {
  defaultProvider: 'meta' | '360dialog';
  embeddedSignup: {
    enabled: boolean;
    metaAppId: string;
    graphApiVersion: string;
  };
  threeSixtyDialog: {
    enabled: boolean;
  };
}

export const configApi = {
  get: () => api.get<PublicConfig>('/config').then((r) => r.data),
};

export const authApi = {
  signup: (body: { email: string; password: string; name: string; organizationName?: string }) =>
    api.post<AuthResponse>('/auth/signup', body).then((r) => r.data),
  login: (body: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', body).then((r) => r.data),
  acceptInvite: (body: { token: string; password: string; name: string }) =>
    api.post<AuthResponse>('/auth/accept-invite', body).then((r) => r.data),
  logout: () => api.post<void>('/auth/logout').then((r) => r.data),
};

export const meApi = {
  me: () => api.get<Member>('/me').then((r) => r.data),
};

export const membersApi = {
  list: () => api.get<Member[]>('/members').then((r) => r.data),
  updateRole: (membershipId: string, role: Role) =>
    api.patch<Member>(`/members/${membershipId}/role`, { role }).then((r) => r.data),
  remove: (membershipId: string) => api.delete<void>(`/members/${membershipId}`).then((r) => r.data),
};

export const invitesApi = {
  list: () => api.get<Invite[]>('/invites').then((r) => r.data),
  create: (body: { email: string; role: Role }) =>
    api.post<CreatedInvite>('/invites', body).then((r) => r.data),
  revoke: (id: string) => api.delete<void>(`/invites/${id}`).then((r) => r.data),
};

export const numbersApi = {
  list: () => api.get<WhatsAppNumber[]>('/whatsapp-numbers').then((r) => r.data),
  create: (body: {
    phoneNumberId: string;
    wabaId: string;
    displayPhone: string;
    displayName: string;
    accessToken: string;
  }) => api.post<WhatsAppNumber>('/whatsapp-numbers', body).then((r) => r.data),
  update: (id: string, body: Partial<{ displayName: string; accessToken: string; isActive: boolean }>) =>
    api.patch<WhatsAppNumber>(`/whatsapp-numbers/${id}`, body).then((r) => r.data),
  remove: (id: string) => api.delete<void>(`/whatsapp-numbers/${id}`).then((r) => r.data),
  assignUsers: (id: string, userIds: string[]) =>
    api.put<WhatsAppNumber>(`/whatsapp-numbers/${id}/assignments`, { userIds }).then((r) => r.data),
  embeddedSignup: (body: { code: string; wabaId: string; phoneNumberId: string }) =>
    api.post<WhatsAppNumber>('/whatsapp-numbers/embedded-signup', body).then((r) => r.data),
  threeSixtyOnboardingUrl: (redirectUrl: string) =>
    api
      .get<{ url: string }>('/whatsapp-numbers/360dialog/onboarding-url', { params: { redirectUrl } })
      .then((r) => r.data),
  threeSixtyConnect: (channelId: string) =>
    api.post<WhatsAppNumber>('/whatsapp-numbers/360dialog/connect', { channelId }).then((r) => r.data),
};

export const conversationsApi = {
  list: (params: { whatsappNumberId?: string; scope?: string; page?: number; limit?: number }) =>
    api.get<Paginated<Conversation>>('/conversations', { params }).then((r) => r.data),
  get: (id: string) => api.get<Conversation>(`/conversations/${id}`).then((r) => r.data),
  listMessages: (id: string, params?: { limit?: number; before?: string }) =>
    api.get<Message[]>(`/conversations/${id}/messages`, { params }).then((r) => r.data),
  send: (id: string, text: string) =>
    api.post<Message>(`/conversations/${id}/messages`, { text }).then((r) => r.data),
  markRead: (id: string) => api.post<void>(`/conversations/${id}/read`).then((r) => r.data),
  updateStatus: (id: string, status: 'OPEN' | 'RESOLVED' | 'SNOOZED') =>
    api.patch<Conversation>(`/conversations/${id}/status`, { status }).then((r) => r.data),
  assign: (id: string, userId?: string) =>
    api.post<Conversation>(`/conversations/${id}/assignment`, { userId }).then((r) => r.data),
  unassign: (id: string) =>
    api.delete<Conversation>(`/conversations/${id}/assignment`).then((r) => r.data),
};
