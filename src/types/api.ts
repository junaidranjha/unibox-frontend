export type Role = 'OWNER' | 'ADMIN' | 'AGENT';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  organizationName: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: SessionUser;
}

export interface Member {
  id: string; // membership id
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: Role;
  createdAt: string;
}

export interface Invite {
  id: string;
  email: string;
  role: Role;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
}

export interface CreatedInvite extends Invite {
  token: string;
  acceptUrl: string;
}

export type WhatsAppProvider = 'META' | 'THREESIXTYDIALOG' | 'UNOFFICIAL';

export interface WhatsAppNumber {
  id: string;
  provider: WhatsAppProvider;
  phoneNumberId: string;
  wabaId: string | null;
  displayPhone: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  assignedUserIds: string[];
}

/** Link state of an UNOFFICIAL (gateway) number, polled during QR onboarding. */
export interface ConnectionStatus {
  status: string; // gateway session status: qr_ready | authenticating | ready | ...
  connected: boolean;
  qrCode?: string | null; // data-URL PNG to render while qr_ready
}

export interface Contact {
  id: string;
  waId: string;
  name?: string | null;
  profileName?: string | null;
}

export interface ConversationAssignmentInfo {
  userId: string;
  userName: string;
  assignedAt: string;
}

export type ConversationStatus = 'OPEN' | 'RESOLVED' | 'SNOOZED';

export interface Conversation {
  id: string;
  whatsappNumberId: string;
  status: ConversationStatus;
  lastMessageAt?: string | null;
  lastMessagePreview?: string | null;
  unreadCount: number;
  contact: Contact;
  assignment?: ConversationAssignmentInfo | null;
  createdAt: string;
  updatedAt: string;
}

export type MessageDirection = 'INBOUND' | 'OUTBOUND';
export type MessageStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface Message {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  type: string;
  text?: string | null;
  mediaUrl?: string | null;
  status: MessageStatus;
  errorMessage?: string | null;
  sentByUserId?: string | null;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
