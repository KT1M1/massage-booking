export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'professional';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  category: string;
  image?: string;
}

export interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialties: string[];
  bio?: string;
  image?: string;
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  professionalId: string;
  date: Date;
  timeSlot: string; // "10:00-11:00"
  timeSlotId?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

export interface TimeSlot {
  id: string;
  professionalId: string;
  date: Date;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  available: boolean;
}
