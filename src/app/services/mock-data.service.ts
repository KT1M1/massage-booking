import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User, Service, Professional, Booking, TimeSlot } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly bookingsStorageKey = 'massage_bookings';
  private readonly slotsStorageKey = 'massage_time_slots';

  private users: User[] = [
    {
      id: '1',
      email: 'user@masszazs.hu',
      password: 'user',
      firstName: 'Teszt',
      lastName: 'Felhasználó',
      phone: '+36 30 123 4567',
      role: 'customer'
    }
  ];

  private services: Service[] = [
    {
      id: '1',
      name: 'Svéd masszázs',
      description: 'Relaxációs masszázs teljes testre, amely segít csökkenteni a stresszt és javítani a vérkeringést.',
      price: 15000,
      duration: 60,
      category: 'Relaxációs',
      image: '/assets/img/massage1.jpg'
    },
    {
      id: '2',
      name: 'Talpmasszázs',
      description: 'Hagyományos talpmasszázs reflexzónák stimulálásával az egész szervezet harmonizálására.',
      price: 8000,
      duration: 30,
      category: 'Reflexológia',
      image: '/assets/img/footmassage.jpg'
    },
    {
      id: '3',
      name: 'Sport masszázs',
      description: 'Sportolók számára tervezett masszázs izomlazítással és teljesítményfokozással.',
      price: 12000,
      duration: 45,
      category: 'Sport',
      image: '/assets/img/sportsmassage.jpg'
    }
  ];

  private professionals: Professional[] = [
    {
      id: '1',
      firstName: 'Anna',
      lastName: 'Kovács',
      email: 'anna@masszazs.hu',
      phone: '+36 30 987 6543',
      specialties: ['Svéd masszázs', 'Talpmasszázs'],
      bio: '10 éves tapasztalattal rendelkező masszőr, szakosodott relaxációs technikákra.',
      image: '/assets/img/Anna.jpg'
    },
    {
      id: '2',
      firstName: 'Bence',
      lastName: 'Nagy',
      email: 'bence@masszazs.hu',
      phone: '+36 20 555 1234',
      specialties: ['Sport masszázs', 'Svéd masszázs'],
      bio: 'Sportmasszázs-specialista, olimpikonokkal dolgozott.',
      image: '/assets/img/Bence.jpg'
    }
  ];

  private timeSlots: TimeSlot[] = [
    // Kovács Anna időpontjai
    { id: '1', professionalId: '1', date: new Date('2026-03-30'), startTime: '10:00', endTime: '11:00', available: true },
    { id: '2', professionalId: '1', date: new Date('2026-03-30'), startTime: '11:00', endTime: '12:00', available: true },
    { id: '3', professionalId: '1', date: new Date('2026-03-30'), startTime: '14:00', endTime: '15:00', available: true },
    { id: '4', professionalId: '1', date: new Date('2026-03-31'), startTime: '09:00', endTime: '10:00', available: true },
    { id: '5', professionalId: '1', date: new Date('2026-03-31'), startTime: '10:00', endTime: '11:00', available: false }, // foglalt

    // Nagy Bence időpontjai
    { id: '6', professionalId: '2', date: new Date('2026-03-30'), startTime: '13:00', endTime: '13:45', available: true },
    { id: '7', professionalId: '2', date: new Date('2026-03-30'), startTime: '15:00', endTime: '15:45', available: true },
    { id: '8', professionalId: '2', date: new Date('2026-03-31'), startTime: '11:00', endTime: '11:45', available: true },
  ];

  private bookings: Booking[] = [];

  constructor() {
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storedSlots = localStorage.getItem(this.slotsStorageKey);
    if (storedSlots) {
      try {
        const parsedSlots = JSON.parse(storedSlots) as Array<TimeSlot & { date: string }>;
        this.timeSlots = parsedSlots.map(slot => ({ ...slot, date: new Date(slot.date) }));
      } catch {
      }
    }

    const storedBookings = localStorage.getItem(this.bookingsStorageKey);
    if (storedBookings) {
      try {
        const parsedBookings = JSON.parse(storedBookings) as Array<Booking & { date: string }>;
        this.bookings = parsedBookings.map(booking => ({ ...booking, date: new Date(booking.date) }));
      } catch {
      }
    }
  }

  private persistToStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(this.bookingsStorageKey, JSON.stringify(this.bookings));
    localStorage.setItem(this.slotsStorageKey, JSON.stringify(this.timeSlots));
  }

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private ensureSlotsForDate(professionalId: string, date: Date): void {
    const sameDaySlots = this.timeSlots.filter(
      slot =>
        slot.professionalId === professionalId &&
        slot.date.toDateString() === date.toDateString()
    );

    if (sameDaySlots.length > 0) {
      return;
    }

    const dateKey = this.formatDateKey(date);
    const baseSlots: Array<{ start: string; end: string }> = [
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '13:00', end: '14:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' }
    ];

    const generatedSlots: TimeSlot[] = baseSlots.map((slot, index) => ({
      id: `${professionalId}-${dateKey}-${index + 1}`,
      professionalId,
      date: new Date(date),
      startTime: slot.start,
      endTime: slot.end,
      available: true
    }));

    this.timeSlots.push(...generatedSlots);
    this.persistToStorage();
  }

  getUsers(): User[] {
    return [...this.users];
  }

  getServices(): Service[] {
    return [...this.services];
  }

  getServiceById(id: string): Service | undefined {
    return this.services.find(service => service.id === id);
  }

  getProfessionals(): Professional[] {
    return [...this.professionals];
  }

  getProfessionalById(id: string): Professional | undefined {
    return this.professionals.find(prof => prof.id === id);
  }

  getTimeSlots(professionalId?: string, date?: Date): TimeSlot[] {
    if (professionalId && date) {
      this.ensureSlotsForDate(professionalId, date);
    }

    let slots = [...this.timeSlots];

    if (professionalId) {
      slots = slots.filter(slot => slot.professionalId === professionalId);
    }

    if (date) {
      slots = slots.filter(slot =>
        slot.date.toDateString() === date.toDateString()
      );
    }

    return slots;
  }

  getBookings(userId?: string): Booking[] {
    let bookings = [...this.bookings];

    if (userId) {
      bookings = bookings.filter(booking => booking.userId === userId);
    }

    return bookings;
  }

  addBooking(booking: Booking): void {
    this.bookings.push(booking);
    // Mark time slot as unavailable
    const slotId = booking.timeSlotId || booking.timeSlot;
    const slot = this.timeSlots.find(s => s.id === slotId);
    if (slot) {
      slot.available = false;
    }
    this.persistToStorage();
  }

  cancelBooking(bookingId: string): void {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'cancelled';
      // Make time slot available again
      const slotId = booking.timeSlotId || booking.timeSlot;
      const slot = this.timeSlots.find(s => s.id === slotId);
      if (slot) {
        slot.available = true;
      }
      this.persistToStorage();
    }
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }
}

