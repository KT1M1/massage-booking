import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { Service, Professional, TimeSlot } from '../../models/models';
import { BookingService } from '../../services/booking.service';
import { ICON_PACK } from '../../shared/icon-pack';

@Component({
  selector: 'app-booking',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'hu-HU' }],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit {
  icons = ICON_PACK;
  service: Service | null = null;
  professionals: Professional[] = [];
  selectedProfessional: string = '';
  selectedDate: Date | null = null;
  minDate: Date = this.getMinDate();
  availableTimeSlots: TimeSlot[] = [];
  selectedTimeSlot: string = '';
  notes: string = '';
  isLoading = false;
  typedDateValue = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    const serviceId = this.route.snapshot.queryParamMap.get('serviceId');
    if (serviceId) {
      this.bookingService.getServiceById(serviceId).subscribe(service => {
        this.service = service || null;
      });
    }

    this.bookingService.getProfessionals().subscribe(professionals => {
      this.professionals = professionals;
    });
  }

  onProfessionalChange() {
    if (this.selectedProfessional && this.selectedDate) {
      this.loadTimeSlots();
    }
  }

  onDateChange() {
    if (this.typedDateValue.trim()) {
      const parsedTypedDate = this.parseTypedDate(this.typedDateValue);
      if (!parsedTypedDate) {
        this.selectedDate = null;
        this.selectedTimeSlot = '';
        this.availableTimeSlots = [];
        return;
      }

      this.selectedDate = parsedTypedDate;
    }

    if (!this.selectedDate || !this.isAllowedBookingDate(this.selectedDate)) {
      this.selectedDate = null;
      this.selectedTimeSlot = '';
      this.availableTimeSlots = [];
      return;
    }

    this.selectedTimeSlot = '';
    if (this.selectedProfessional && this.selectedDate) {
      this.loadTimeSlots();
    }
  }

  onDateTextInput(value: string) {
    this.typedDateValue = value.trim();
    if (!this.typedDateValue) {
      this.selectedDate = null;
      this.selectedTimeSlot = '';
      this.availableTimeSlots = [];
    }
  }

  loadTimeSlots() {
    if (!this.selectedDate) {
      this.availableTimeSlots = [];
      return;
    }

    this.bookingService.getTimeSlots(this.selectedProfessional, this.selectedDate).subscribe(slots => {
      this.availableTimeSlots = slots.filter(slot => slot.available);
    });
  }

  onSubmit() {
    if (this.typedDateValue.trim()) {
      const parsedTypedDate = this.parseTypedDate(this.typedDateValue);
      if (!parsedTypedDate) {
        alert('Érvénytelen dátum formátum. Példa: 2026.04.15.');
        this.selectedDate = null;
        this.selectedTimeSlot = '';
        this.availableTimeSlots = [];
        return;
      }

      this.selectedDate = parsedTypedDate;
    }

    if (!this.service || !this.selectedProfessional || !this.selectedDate || !this.selectedTimeSlot) {
      alert('Kérjük, töltsd ki az összes mezőt.');
      return;
    }

    if (!this.isAllowedBookingDate(this.selectedDate)) {
      alert('Csak holnaptól kezdődő dátumra foglalhatsz.');
      this.selectedDate = null;
      this.selectedTimeSlot = '';
      this.availableTimeSlots = [];
      return;
    }

    this.isLoading = true;

    this.bookingService.createBooking(
      this.service.id,
      this.selectedProfessional,
      this.selectedDate,
      this.selectedTimeSlot,
      this.notes
    ).subscribe(success => {
      this.isLoading = false;
      if (success) {
        alert('Foglalás sikeresen létrehozva.');
        this.router.navigate(['/profile']);
      } else {
        alert('Hiba történt a foglalás során.');
      }
    });
  }

  getMinDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 1);
    return today;
  }

  isAllowedBookingDate = (date: Date | null): boolean => {
    if (!date || Number.isNaN(date.getTime())) {
      return false;
    }

    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);

    const min = new Date(this.minDate);
    min.setHours(0, 0, 0, 0);

    return selected >= min;
  };

  private parseTypedDate(rawValue: string): Date | null {
    const value = rawValue.trim();
    if (!value) {
      return null;
    }

    const yearFirst = value.match(/^(\d{4})[.\-/\s](\d{1,2})[.\-/\s](\d{1,2})\.?$/);
    if (yearFirst) {
      const year = Number(yearFirst[1]);
      const month = Number(yearFirst[2]);
      const day = Number(yearFirst[3]);
      return this.createSafeDate(year, month, day);
    }

    const monthFirst = value.match(/^(\d{1,2})[.\-/\s](\d{1,2})[.\-/\s](\d{4})\.?$/);
    if (monthFirst) {
      const month = Number(monthFirst[1]);
      const day = Number(monthFirst[2]);
      const year = Number(monthFirst[3]);
      return this.createSafeDate(year, month, day);
    }

    const fallback = new Date(value);
    if (Number.isNaN(fallback.getTime())) {
      return null;
    }

    fallback.setHours(0, 0, 0, 0);
    return fallback;
  }

  private createSafeDate(year: number, month: number, day: number): Date | null {
    const parsedDate = new Date(year, month - 1, day);
    parsedDate.setHours(0, 0, 0, 0);

    if (
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      return null;
    }

    return parsedDate;
  }

  formatDate(dateValue: Date | null): string {
    if (!dateValue) {
      return '-';
    }

    return dateValue.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getProfessionalImage(professionalId: string): string {
    const prof = this.professionals.find(p => p.id === professionalId);
    return prof?.image || '/assets/img/background2.jpg';
  }

  getProfessionalName(professionalId: string): string {
    const prof = this.professionals.find(p => p.id === professionalId);
    return prof ? `${prof.lastName} ${prof.firstName}` : 'Ismeretlen terapeuta';
  }

  formatProfessionalFullName(lastName: string, firstName: string): string {
    return `${lastName} ${firstName}`.trim();
  }

  getSelectedTimeSlotText(): string {
    const slot = this.availableTimeSlots.find(s => s.id === this.selectedTimeSlot);
    return slot ? `${slot.startTime} - ${slot.endTime}` : this.selectedTimeSlot;
  }
}
