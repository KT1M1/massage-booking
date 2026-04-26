import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Booking, Service } from '../../models/models';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { ICON_PACK } from '../../shared/icon-pack';

type ServiceSortOption =
  | 'name-asc'
  | 'price-asc'
  | 'price-desc'
  | 'duration-asc'
  | 'duration-desc';

type AdminBookingFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  services: Service[] = [];
  adminBookings: Booking[] = [];
  clientDisplayNames: Record<string, string> = {};
  searchTerm = '';
  sortBy: ServiceSortOption = 'name-asc';
  adminStatusFilter: AdminBookingFilter = 'all';
  isLoggedIn = false;
  isAdmin = false;
  icons = ICON_PACK;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
      this.loadDashboard();
    });
  }

  private loadDashboard() {
    if (this.isAdmin) {
      this.searchTerm = '';
      this.adminStatusFilter = 'all';
      this.loadAdminBookings();
      this.bookingService.getServices().subscribe((services) => {
        this.services = services;
      });
      return;
    }

    this.adminBookings = [];
    this.clientDisplayNames = {};
    this.bookingService.getServices().subscribe((services) => {
      this.services = services;
    });
  }

  private loadAdminBookings() {
    this.bookingService.getAdminBookings().subscribe((bookings) => {
      this.adminBookings = bookings;
      const clientIds = bookings.map((booking) => booking.clientId);
      this.bookingService.getProfileDisplayNames(clientIds).subscribe((displayNames) => {
        this.clientDisplayNames = displayNames;
      });
    });
  }

  get filteredServices(): Service[] {
    const normalizedSearch = this.searchTerm.trim().toLocaleLowerCase('hu-HU');

    const filtered = this.services.filter((service) =>
      service.name.toLocaleLowerCase('hu-HU').includes(normalizedSearch)
    );

    return [...filtered].sort((left, right) => {
      switch (this.sortBy) {
        case 'price-asc':
          return left.priceHuf - right.priceHuf;
        case 'price-desc':
          return right.priceHuf - left.priceHuf;
        case 'duration-asc':
          return left.durationMinutes - right.durationMinutes;
        case 'duration-desc':
          return right.durationMinutes - left.durationMinutes;
        case 'name-asc':
        default:
          return left.name.localeCompare(right.name, 'hu');
      }
    });
  }

  getServiceName(serviceId: string): string {
    const service = this.services.find((item) => item.id === serviceId);
    return service ? service.name : serviceId;
  }

  getServiceImage(serviceId: string): string {
    const service = this.services.find((item) => item.id === serviceId);
    return service?.image || '/assets/img/massage1.jpg';
  }

  getClientName(clientId: string): string {
    return this.clientDisplayNames[clientId] || 'Ismeretlen vendég';
  }

  get filteredAdminBookings(): Booking[] {
    if (this.adminStatusFilter === 'all') {
      return this.adminBookings;
    }

    return this.adminBookings.filter((booking) => booking.status === this.adminStatusFilter);
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Függőben';
      case 'confirmed':
        return 'Megerősítve';
      case 'completed':
        return 'Befejezve';
      case 'cancelled':
        return 'Lemondva';
      default:
        return status;
    }
  }

  getBookingCount(status: string): number {
    return this.adminBookings.filter((booking) => booking.status === status).length;
  }

  onUpdateBookingStatus(bookingId: string, status: Booking['status']) {
    const confirmationText = status === 'confirmed'
      ? 'Biztosan megerősíted ezt a foglalást?'
      : 'Biztosan elutasítod ezt a foglalást?';

    if (!confirm(confirmationText)) {
      return;
    }

    this.bookingService.updateBookingStatus(bookingId, status).subscribe((success) => {
      if (success) {
        this.loadAdminBookings();
      }
    });
  }
}
