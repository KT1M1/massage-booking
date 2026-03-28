import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Booking, Service, Professional } from '../../models/models';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { ICON_PACK } from '../../shared/icon-pack';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  bookings: Booking[] = [];
  services: Service[] = [];
  professionals: Professional[] = [];
  userName = '';
  icons = ICON_PACK;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.currentUser;
    if (user) {
      this.userName = `${user.firstName} ${user.lastName}`;
      this.loadData();
    }
  }

  loadData() {
    this.bookingService.getUserBookings().subscribe(bookings => {
      this.bookings = bookings;
    });

    this.bookingService.getServices().subscribe(services => {
      this.services = services;
    });

    this.bookingService.getProfessionals().subscribe(professionals => {
      this.professionals = professionals;
    });
  }

  getServiceName(serviceId: string): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.name : serviceId;
  }

  getProfessionalName(professionalId: string): string {
    const prof = this.professionals.find(p => p.id === professionalId);
    return prof ? `${prof.firstName} ${prof.lastName}` : professionalId;
  }

  getProfessionalImage(professionalId: string): string {
    const prof = this.professionals.find(p => p.id === professionalId);
    return prof?.image || '/assets/img/background2.jpg';
  }

  onCancelBooking(bookingId: string) {
    if (confirm('Biztosan lemondja ezt a foglalást?')) {
      this.bookingService.cancelBooking(bookingId).subscribe(success => {
        if (success) {
          this.loadData(); // Reload bookings
        }
      });
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Függőben';
      case 'confirmed': return 'Megerősítve';
      case 'cancelled': return 'Lemondva';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getBookingCount(status: string): number {
    return this.bookings.filter(b => b.status === status).length;
  }
}
