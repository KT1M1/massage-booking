export type UserRole = 'client' | 'admin';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive?: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  priceHuf: number;
  durationMinutes: number;
  category: 'relaxation' | 'therapeutic' | 'sports' | 'other' | string;
  image?: string;
  isActive?: boolean;
}

export interface Professional {
  id: string;
  profileId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialties: string[];
  bio?: string;
  image?: string;
  experienceYears?: number;
  isAcceptingBookings?: boolean;
}

export interface Booking {
  id: string;
  clientId: string;
  serviceId: string;
  adminId: string;
  status: BookingStatus;
  startsAt: Date;
  endsAt: Date;
  clientNote?: string;
  adminNote?: string;
  bookedPriceHuf: number;
  bookedDurationMinutes: number;
}

export interface TimeSlot {
  id: string;
  adminId: string;
  date: Date;
  startTime: string;
  endTime: string;
  startsAt: Date;
  endsAt: Date;
  available: boolean;
}
