import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { Booking, Professional, Service, TimeOffEntry } from '../../models/models';
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
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'hu-HU' }],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  bookings: Booking[] = [];
  services: Service[] = [];
  professionals: Professional[] = [];
  adminTimeOffEntries: TimeOffEntry[] = [];

  profile: ProfileRow | null = null;
  userName = '';
  errorMessage = '';
  isLoading = true;
  isAdmin = false;

  adminFormError = '';
  adminFormSuccess = '';
  isSavingTimeOff = false;
  timeOffTitle = 'Szabadság';
  timeOffReason = 'Előre tervezett szabadság';
  timeOffStartDate: Date | null = null;
  timeOffEndDate: Date | null = null;
  timeOffStartTime = '08:00';
  timeOffEndTime = '17:00';

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
      this.isAdmin = this.profile.role === 'admin';
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
    if (this.isAdmin) {
      this.bookings = [];
      this.services = [];
      this.professionals = [];
      this.loadAdminTimeOffEntries();
      return;
    }

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

  getBookingCount(status: string): number {
    return this.bookings.filter((booking) => booking.status === status).length;
  }

  formatDateTime(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day}. ${hours}:${minutes}`;
  }

  onSubmitTimeOff() {
    this.adminFormError = '';
    this.adminFormSuccess = '';

    if (
      !this.timeOffTitle.trim() ||
      !this.timeOffStartDate ||
      !this.timeOffEndDate ||
      !this.timeOffStartTime ||
      !this.timeOffEndTime
    ) {
      this.adminFormError = 'Kérjük, töltse ki a kötelező mezőket.';
      return;
    }

    const startAt = this.combineDateAndTime(this.timeOffStartDate, this.timeOffStartTime);
    const endAt = this.combineDateAndTime(this.timeOffEndDate, this.timeOffEndTime);

    if (!startAt || !endAt) {
      this.adminFormError = 'Érvénytelen dátum vagy időpont.';
      return;
    }

    if (endAt.getTime() <= startAt.getTime()) {
      this.adminFormError = 'A záró időpontnak későbbinek kell lennie, mint a kezdő időpont.';
      return;
    }

    this.isSavingTimeOff = true;

    this.bookingService.createAdminTimeOffEntry({
      type: 'vacation',
      title: this.timeOffTitle,
      reason: this.timeOffReason,
      startAt,
      endAt
    }).subscribe((success) => {
      this.isSavingTimeOff = false;

      if (!success) {
        this.adminFormError = 'Nem sikerült elmenteni a szabadságot.';
        return;
      }

      this.adminFormSuccess = 'A szabadság sikeresen rögzítve lett.';
      this.timeOffTitle = 'Szabadság';
      this.timeOffReason = 'Előre tervezett szabadság';
      this.timeOffStartDate = null;
      this.timeOffEndDate = null;
      this.timeOffStartTime = '08:00';
      this.timeOffEndTime = '17:00';
      this.loadAdminTimeOffEntries();
    });
  }

  private loadAdminTimeOffEntries() {
    this.bookingService.getAdminTimeOffEntries().subscribe((entries) => {
      this.adminTimeOffEntries = entries;
    });
  }

  private combineDateAndTime(date: Date, timeValue: string): Date | null {
    const [hoursRaw, minutesRaw] = timeValue.split(':');
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return null;
    }

    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  }
}
