import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Booking, Service, Professional, TimeSlot } from '../models/models';
import { MockDataService } from './mock-data.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  constructor(
    private mockDataService: MockDataService,
    private authService: AuthService
  ) {}

  getServices(): Observable<Service[]> {
    return of(this.mockDataService.getServices());
  }

  getServiceById(id: string): Observable<Service | undefined> {
    return of(this.mockDataService.getServiceById(id));
  }

  getProfessionals(): Observable<Professional[]> {
    return of(this.mockDataService.getProfessionals());
  }

  getProfessionalById(id: string): Observable<Professional | undefined> {
    return of(this.mockDataService.getProfessionalById(id));
  }

  getTimeSlots(professionalId?: string, date?: Date): Observable<TimeSlot[]> {
    return of(this.mockDataService.getTimeSlots(professionalId, date));
  }

  getUserBookings(): Observable<Booking[]> {
    const user = this.authService.currentUser;
    if (user) {
      return of(this.mockDataService.getBookings(user.id));
    }
    return of([]);
  }

  createBooking(serviceId: string, professionalId: string, date: Date, timeSlotId: string, notes?: string): Observable<boolean> {
    return new Observable(observer => {
      const user = this.authService.currentUser;
      if (!user) {
        observer.next(false);
        observer.complete();
        return;
      }

      const selectedSlot = this.mockDataService
        .getTimeSlots(professionalId, date)
        .find(slot => slot.id === timeSlotId);

      const booking: Booking = {
        id: Date.now().toString(),
        userId: user.id,
        serviceId,
        professionalId,
        date,
        timeSlot: selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : timeSlotId,
        timeSlotId,
        status: 'confirmed',
        notes
      };

      this.mockDataService.addBooking(booking);
      observer.next(true);
      observer.complete();
    });
  }

  cancelBooking(bookingId: string): Observable<boolean> {
    return new Observable(observer => {
      this.mockDataService.cancelBooking(bookingId);
      observer.next(true);
      observer.complete();
    });
  }
}
