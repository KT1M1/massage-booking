import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Booking, Professional, Service } from '../../models/models';
import { BookingService } from '../../services/booking.service';
import { SupabaseService } from '../../services/supabase.service';
import { ICON_PACK } from '../../shared/icon-pack';

interface ProfileRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'client' | 'admin';
  is_active: boolean;
}

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

  profile: ProfileRow | null = null;
  userName = '';
  errorMessage = '';
  isLoading = true;

  icons = ICON_PACK;

  constructor(
    private bookingService: BookingService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadCurrentProfile();
  }

  private async loadCurrentProfile() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const supabase = this.supabaseService.getClient();

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        await this.router.navigate(['/login']);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, phone, role, is_active')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        this.errorMessage = 'Nem sikerült betölteni a profiladatokat.';
        console.error(profileError);
        return;
      }

      if (!profile.is_active) {
        this.errorMessage = 'Ez a felhasználói fiók jelenleg inaktív.';
        return;
      }

      this.profile = profile as ProfileRow;
      this.userName = `${this.profile.last_name} ${this.profile.first_name}`;
      this.loadData();
    } catch (error) {
      this.errorMessage = 'Váratlan hiba történt a profil betöltése közben.';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  loadData() {
    this.bookingService.getUserBookings().subscribe((bookings) => {
      this.bookings = bookings;
    });

    this.bookingService.getServices().subscribe((services) => {
      this.services = services;
    });

    this.bookingService.getProfessionals().subscribe((professionals) => {
      this.professionals = professionals;
    });
  }

  getServiceName(serviceId: string): string {
    const service = this.services.find((item) => item.id === serviceId);
    return service ? service.name : serviceId;
  }

  getProfessionalName(adminId: string): string {
    const professional = this.professionals.find((item) => item.id === adminId);
    return professional ? `${professional.lastName} ${professional.firstName}` : adminId;
  }

  getServiceImage(serviceId: string): string {
    const service = this.services.find((item) => item.id === serviceId);
    return service?.image || '/assets/img/massage1.jpg';
  }

  onCancelBooking(bookingId: string) {
    if (confirm('Biztosan lemondja ezt a foglalást?')) {
      this.bookingService.cancelBooking(bookingId).subscribe((success) => {
        if (success) {
          this.loadData();
        }
      });
    }
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getBookingCount(status: string): number {
    return this.bookings.filter((booking) => booking.status === status).length;
  }
}
