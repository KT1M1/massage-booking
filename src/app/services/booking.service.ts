import { Injectable } from '@angular/core';
import { Observable, from, map, of, catchError } from 'rxjs';
import { Booking, Professional, Service, TimeOffEntry, TimeSlot } from '../models/models';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

interface ServiceRow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  duration_minutes: number;
  price_huf: number;
  is_active: boolean;
}

interface ProfileRow {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  is_active?: boolean;
}

interface ProfileNameRow {
  id: string;
  first_name: string;
  last_name: string;
}

interface AdminIdRow {
  id: string;
}

interface AdminRow {
  id: string;
  profile_id: string;
  bio: string | null;
  experience_years: number;
  is_accepting_bookings: boolean;
  profile_image_url: string | null;
  profiles: ProfileRow | ProfileRow[] | null;
}

interface AdminServiceRow {
  admin_id: string;
  service_id: string;
  custom_price_huf: number | null;
  custom_duration_minutes: number | null;
  is_active: boolean;
}

interface WorkingHoursRow {
  admin_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working_day: boolean;
}

interface TimeRangeRow {
  start_at: string;
  end_at: string;
}

interface TimeOffRow {
  id: string;
  admin_id: string;
  type: string;
  title: string;
  reason: string | null;
  start_at: string;
  end_at: string;
  created_at: string;
  updated_at: string;
}

interface BookingRow {
  id: string;
  client_id: string;
  admin_id: string;
  service_id: string;
  status: Booking['status'];
  created_at: string;
  starts_at: string;
  ends_at: string;
  client_note: string | null;
  admin_note: string | null;
  booked_price_huf: number;
  booked_duration_minutes: number;
}

const DEFAULT_IMAGE = '/assets/img/massage1.jpg';
@Injectable({
  providedIn: 'root'
})
export class BookingService {
  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  getServices(): Observable<Service[]> {
    return from(this.fetchServices()).pipe(
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  getServiceById(id: string): Observable<Service | undefined> {
    return this.getServices().pipe(
      map((services) => services.find((service) => service.id === id))
    );
  }

  getProfessionals(serviceId?: string): Observable<Professional[]> {
    return from(this.fetchProfessionals(serviceId)).pipe(
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  getProfessionalById(id: string): Observable<Professional | undefined> {
    return this.getProfessionals().pipe(
      map((professionals) => professionals.find((professional) => professional.id === id))
    );
  }

  getTimeSlots(adminId?: string, date?: Date, serviceId?: string): Observable<TimeSlot[]> {
    if (!adminId || !date || !serviceId) {
      return of([]);
    }

    return from(this.fetchAvailableTimeSlots(adminId, date, serviceId)).pipe(
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  getUserBookings(): Observable<Booking[]> {
    return from(this.fetchUserBookings()).pipe(
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  getAdminBookings(): Observable<Booking[]> {
    return from(this.fetchAdminBookings()).pipe(
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  getProfileDisplayNames(profileIds: string[]): Observable<Record<string, string>> {
    if (!profileIds.length) {
      return of({});
    }

    return from(this.fetchProfileDisplayNames(profileIds)).pipe(
      catchError((error) => {
        console.error(error);
        return of({});
      })
    );
  }

  getAdminTimeOffEntries(): Observable<TimeOffEntry[]> {
    return from(this.fetchAdminTimeOffEntries()).pipe(
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  createAdminTimeOffEntry(payload: {
    type: string;
    title: string;
    reason?: string;
    startAt: Date;
    endAt: Date;
  }): Observable<boolean> {
    return from(this.createAdminTimeOffEntryInternal(payload)).pipe(
      catchError((error) => {
        console.error(error);
        return of(false);
      })
    );
  }

  createBooking(
    serviceId: string,
    adminId: string,
    date: Date,
    timeSlotId: string,
    notes?: string
  ): Observable<boolean> {
    return from(this.createBookingInternal(serviceId, adminId, date, timeSlotId, notes)).pipe(
      catchError((error) => {
        console.error(error);
        return of(false);
      })
    );
  }

  cancelBooking(bookingId: string): Observable<boolean> {
    return from(this.cancelBookingInternal(bookingId)).pipe(
      catchError((error) => {
        console.error(error);
        return of(false);
      })
    );
  }

  updateBookingStatus(bookingId: string, status: Booking['status']): Observable<boolean> {
    return from(this.updateBookingStatusInternal(bookingId, status)).pipe(
      catchError((error) => {
        console.error(error);
        return of(false);
      })
    );
  }

  private async fetchServices(): Promise<Service[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('services')
      .select('id, name, description, category, duration_minutes, price_huf, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw error;
    }

    return (data as ServiceRow[] | null ?? []).map((row) => this.mapService(row));
  }

  private async fetchProfessionals(serviceId?: string): Promise<Professional[]> {
    const supabase = this.supabaseService.getClient();

    const [{ data: adminsData, error: adminsError }, { data: adminServicesData, error: adminServicesError }] =
      await Promise.all([
        supabase
          .from('admins')
          .select(`
            id,
            profile_id,
            bio,
            experience_years,
            is_accepting_bookings,
            profile_image_url,
            profiles!inner (
              id,
              email,
              first_name,
              last_name,
              phone,
              is_active
            )
          `)
          .eq('is_accepting_bookings', true),
        supabase
          .from('admin_services')
          .select('admin_id, service_id, custom_price_huf, custom_duration_minutes, is_active')
          .eq('is_active', true)
      ]);

    if (adminsError) {
      throw adminsError;
    }

    if (adminServicesError) {
      throw adminServicesError;
    }

    const activeServiceLinks = (adminServicesData as AdminServiceRow[] | null ?? []);
    const allowedAdminIds = new Set(
      activeServiceLinks
        .filter((row) => !serviceId || row.service_id === serviceId)
        .map((row) => row.admin_id)
    );

    return (adminsData as AdminRow[] | null ?? [])
      .filter((row) => {
        const profile = this.unwrapProfile(row.profiles);
        return Boolean(profile?.is_active) && allowedAdminIds.has(row.id);
      })
      .map((row) => this.mapProfessional(row))
      .sort((left, right) => left.lastName.localeCompare(right.lastName, 'hu'));
  }

  private async fetchUserBookings(): Promise<Booking[]> {
    await this.authService.waitUntilReady();
    const user = this.authService.currentUser;

    if (!user) {
      return [];
    }

    await this.markPastConfirmedBookingsAsCompletedForClient(user.id);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('bookings')
      .select(`
        id,
        client_id,
        admin_id,
        service_id,
        status,
        created_at,
        starts_at,
        ends_at,
        client_note,
        admin_note,
        booked_price_huf,
        booked_duration_minutes
      `)
      .eq('client_id', user.id)
      .order('starts_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data as BookingRow[] | null ?? []).map((row) => this.mapBooking(row));
  }

  private async fetchAdminBookings(): Promise<Booking[]> {
    await this.authService.waitUntilReady();
    const user = this.authService.currentUser;

    if (!user || user.role !== 'admin') {
      return [];
    }

    const adminIds = await this.resolveCurrentAdminBookingIds(user.id);
    if (!adminIds.length) {
      return [];
    }

    await this.markPastConfirmedBookingsAsCompletedForAdmins(adminIds);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('bookings')
      .select(`
        id,
        client_id,
        admin_id,
        service_id,
        status,
        created_at,
        starts_at,
        ends_at,
        client_note,
        admin_note,
        booked_price_huf,
        booked_duration_minutes
      `)
      .in('admin_id', adminIds)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data as BookingRow[] | null ?? []).map((row) => this.mapBooking(row));
  }

  private async fetchAdminTimeOffEntries(): Promise<TimeOffEntry[]> {
    await this.authService.waitUntilReady();
    const user = this.authService.currentUser;

    if (!user || user.role !== 'admin') {
      return [];
    }

    const adminId = await this.resolveCurrentAdminId(user.id);
    if (!adminId) {
      return [];
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('time_off')
      .select('id, admin_id, type, title, reason, start_at, end_at, created_at, updated_at')
      .eq('admin_id', adminId)
      .order('start_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (data as TimeOffRow[] | null ?? []).map((row) => this.mapTimeOffEntry(row));
  }

  private async fetchAvailableTimeSlots(adminId: string, date: Date, serviceId: string): Promise<TimeSlot[]> {
    const supabase = this.supabaseService.getClient();
    const normalizedDate = this.atLocalMidnight(date);
    const dayStart = normalizedDate;
    const dayEnd = new Date(normalizedDate);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayOfWeek = normalizedDate.getDay();

    const [
      { data: serviceData, error: serviceError },
      { data: adminServiceData, error: adminServiceError },
      { data: workingHoursData, error: workingHoursError },
      { data: timeOffData, error: timeOffError },
      { data: blockedSlotsData, error: blockedSlotsError },
      { data: bookingsData, error: bookingsError }
    ] = await Promise.all([
      supabase
        .from('services')
        .select('id, name, description, category, duration_minutes, price_huf, is_active')
        .eq('id', serviceId)
        .eq('is_active', true)
        .maybeSingle(),
      supabase
        .from('admin_services')
        .select('admin_id, service_id, custom_price_huf, custom_duration_minutes, is_active')
        .eq('admin_id', adminId)
        .eq('service_id', serviceId)
        .eq('is_active', true)
        .maybeSingle(),
      supabase
        .from('working_hours')
        .select('admin_id, day_of_week, start_time, end_time, is_working_day')
        .eq('admin_id', adminId)
        .eq('day_of_week', dayOfWeek)
        .maybeSingle(),
      supabase
        .from('time_off')
        .select('start_at, end_at')
        .eq('admin_id', adminId)
        .lt('start_at', dayEnd.toISOString())
        .gt('end_at', dayStart.toISOString()),
      supabase
        .from('blocked_slots')
        .select('start_at, end_at')
        .eq('admin_id', adminId)
        .lt('start_at', dayEnd.toISOString())
        .gt('end_at', dayStart.toISOString()),
      supabase
        .from('bookings')
        .select('start_at:starts_at, end_at:ends_at')
        .eq('admin_id', adminId)
        .in('status', ['pending', 'confirmed'])
        .lt('starts_at', dayEnd.toISOString())
        .gt('ends_at', dayStart.toISOString())
    ]);

    if (serviceError) {
      throw serviceError;
    }

    if (adminServiceError) {
      throw adminServiceError;
    }

    if (workingHoursError) {
      throw workingHoursError;
    }

    if (timeOffError) {
      throw timeOffError;
    }

    if (blockedSlotsError) {
      throw blockedSlotsError;
    }

    if (bookingsError) {
      throw bookingsError;
    }

    if (!serviceData || !adminServiceData || !workingHoursData || !workingHoursData.is_working_day) {
      return [];
    }

    const service = serviceData as ServiceRow;
    const adminService = adminServiceData as AdminServiceRow;
    const workingHours = workingHoursData as WorkingHoursRow;
    const durationMinutes = adminService.custom_duration_minutes ?? service.duration_minutes;
    const workStart = this.combineDateAndTime(normalizedDate, workingHours.start_time);
    const workEnd = this.combineDateAndTime(normalizedDate, workingHours.end_time);

    if (workEnd.getTime() <= workStart.getTime()) {
      return [];
    }

    const blockedRanges = [
      ...(timeOffData as TimeRangeRow[] | null ?? []),
      ...(blockedSlotsData as TimeRangeRow[] | null ?? []),
      ...(bookingsData as TimeRangeRow[] | null ?? [])
    ].map((range) => ({
      start: new Date(range.start_at),
      end: new Date(range.end_at)
    }));

    const slotStepMinutes = 30;
    const latestSlotStart = new Date(workEnd.getTime() - durationMinutes * 60_000);
    const slots: TimeSlot[] = [];

    for (
      let cursor = new Date(workStart);
      cursor.getTime() <= latestSlotStart.getTime();
      cursor = new Date(cursor.getTime() + slotStepMinutes * 60_000)
    ) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + durationMinutes * 60_000);

      const overlaps = blockedRanges.some((range) => this.rangesOverlap(slotStart, slotEnd, range.start, range.end));
      if (overlaps) {
        continue;
      }

      slots.push({
        id: slotStart.toISOString(),
        adminId,
        date: new Date(normalizedDate),
        startTime: this.formatTime(slotStart),
        endTime: this.formatTime(slotEnd),
        startsAt: slotStart,
        endsAt: slotEnd,
        available: true
      });
    }

    return slots;
  }

  private async createBookingInternal(
    serviceId: string,
    adminId: string,
    date: Date,
    timeSlotId: string,
    notes?: string
  ): Promise<boolean> {
    await this.authService.waitUntilReady();
    const user = this.authService.currentUser;

    if (!user) {
      return false;
    }

    const [slots, service, adminService] = await Promise.all([
      this.fetchAvailableTimeSlots(adminId, date, serviceId),
      this.fetchServiceRow(serviceId),
      this.fetchAdminServiceRow(adminId, serviceId)
    ]);

    const selectedSlot = slots.find((slot) => slot.id === timeSlotId);
    if (!selectedSlot || !service || !adminService) {
      return false;
    }

    const { error } = await this.supabaseService.getClient().from('bookings').insert({
      client_id: user.id,
      admin_id: adminId,
      service_id: serviceId,
      status: 'pending',
      starts_at: selectedSlot.startsAt.toISOString(),
      ends_at: selectedSlot.endsAt.toISOString(),
      client_note: notes?.trim() ? notes.trim() : null,
      booked_price_huf: adminService.custom_price_huf ?? service.price_huf,
      booked_duration_minutes: adminService.custom_duration_minutes ?? service.duration_minutes
    });

    return !error;
  }

  private async createAdminTimeOffEntryInternal(payload: {
    type: string;
    title: string;
    reason?: string;
    startAt: Date;
    endAt: Date;
  }): Promise<boolean> {
    await this.authService.waitUntilReady();
    const user = this.authService.currentUser;

    if (!user || user.role !== 'admin') {
      return false;
    }

    const adminId = await this.resolveCurrentAdminId(user.id);
    if (!adminId) {
      return false;
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('time_off')
      .insert({
        admin_id: adminId,
        type: payload.type,
        title: payload.title.trim(),
        reason: payload.reason?.trim() ? payload.reason.trim() : null,
        start_at: payload.startAt.toISOString(),
        end_at: payload.endAt.toISOString()
      });

    return !error;
  }

  private async cancelBookingInternal(bookingId: string): Promise<boolean> {
    return this.updateBookingStatusInternal(bookingId, 'cancelled');
  }

  private async updateBookingStatusInternal(bookingId: string, status: Booking['status']): Promise<boolean> {
    const { error } = await this.supabaseService
      .getClient()
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    return !error;
  }

  private async markPastConfirmedBookingsAsCompletedForClient(clientId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('bookings')
      .update({ status: 'completed' })
      .eq('client_id', clientId)
      .eq('status', 'confirmed')
      .lt('ends_at', new Date().toISOString());

    if (error) {
      throw error;
    }
  }

  private async markPastConfirmedBookingsAsCompletedForAdmins(adminIds: string[]): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('bookings')
      .update({ status: 'completed' })
      .in('admin_id', adminIds)
      .eq('status', 'confirmed')
      .lt('ends_at', new Date().toISOString());

    if (error) {
      throw error;
    }
  }

  private async fetchServiceRow(serviceId: string): Promise<ServiceRow | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('services')
      .select('id, name, description, category, duration_minutes, price_huf, is_active')
      .eq('id', serviceId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as ServiceRow | null) ?? null;
  }

  private async fetchAdminServiceRow(adminId: string, serviceId: string): Promise<AdminServiceRow | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('admin_services')
      .select('admin_id, service_id, custom_price_huf, custom_duration_minutes, is_active')
      .eq('admin_id', adminId)
      .eq('service_id', serviceId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as AdminServiceRow | null) ?? null;
  }

  private mapService(row: ServiceRow): Service {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      priceHuf: row.price_huf,
      durationMinutes: row.duration_minutes,
      category: row.category,
      image: this.getServiceImage(row),
      isActive: row.is_active
    };
  }

  private mapProfessional(row: AdminRow): Professional {
    const profile = this.unwrapProfile(row.profiles);

    return {
      id: row.id,
      profileId: row.profile_id,
      firstName: profile?.first_name ?? '',
      lastName: profile?.last_name ?? '',
      email: profile?.email ?? '',
      phone: profile?.phone ?? undefined,
      specialties: [],
      bio: row.bio ?? undefined,
      image: row.profile_image_url ?? '/assets/img/background2.jpg',
      experienceYears: row.experience_years,
      isAcceptingBookings: row.is_accepting_bookings
    };
  }

  private mapBooking(row: BookingRow): Booking {
    return {
      id: row.id,
      clientId: row.client_id,
      adminId: row.admin_id,
      serviceId: row.service_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      startsAt: new Date(row.starts_at),
      endsAt: new Date(row.ends_at),
      clientNote: row.client_note ?? undefined,
      adminNote: row.admin_note ?? undefined,
      bookedPriceHuf: row.booked_price_huf,
      bookedDurationMinutes: row.booked_duration_minutes
    };
  }

  private mapTimeOffEntry(row: TimeOffRow): TimeOffEntry {
    return {
      id: row.id,
      adminId: row.admin_id,
      type: row.type,
      title: row.title,
      reason: row.reason ?? undefined,
      startAt: new Date(row.start_at),
      endAt: new Date(row.end_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private async fetchProfileDisplayNames(profileIds: string[]): Promise<Record<string, string>> {
    const uniqueIds = [...new Set(profileIds.filter(Boolean))];
    if (!uniqueIds.length) {
      return {};
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', uniqueIds);

    if (error) {
      throw error;
    }

    return (data as ProfileNameRow[] | null ?? []).reduce<Record<string, string>>((acc, row) => {
      acc[row.id] = `${row.last_name} ${row.first_name}`.trim();
      return acc;
    }, {});
  }

  private async resolveCurrentAdminBookingIds(profileId: string): Promise<string[]> {
    const adminIds = new Set<string>([profileId]);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('admins')
      .select('id')
      .eq('profile_id', profileId);

    if (error) {
      throw error;
    }

    (data as AdminIdRow[] | null ?? []).forEach((row) => {
      adminIds.add(row.id);
    });

    return [...adminIds];
  }

  private async resolveCurrentAdminId(profileId: string): Promise<string | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('admins')
      .select('id')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as AdminIdRow | null)?.id ?? null;
  }

  private unwrapProfile(profile: ProfileRow | ProfileRow[] | null): ProfileRow | null {
    if (Array.isArray(profile)) {
      return profile[0] ?? null;
    }

    return profile;
  }

  private getServiceImage(service: Pick<ServiceRow, 'name' | 'category'>): string {
    const category = service.category.toLowerCase();
    const name = service.name.toLowerCase();

    if (name.includes('aromaterápiás') || name.includes('aromaterapias')) {
      return '/assets/img/aroma.jpg';
    }

    if (name.includes('lávaköves') || name.includes('lavakoves')) {
      return '/assets/img/blackstone.jpg';
    }

    if (name.includes('nyak-váll-hát') || name.includes('nyak-vall-hat')) {
      return '/assets/img/neckmassage.jpg';
    }

    if (category.includes('sports') || name.includes('sport')) {
      return '/assets/img/sportsmassage.jpg';
    }

    if (
      category.includes('therapeutic') ||
      name.includes('talp') ||
      name.includes('reflex') ||
      name.includes('mélyszöveti') ||
      name.includes('melyszoveti')
    ) {
      return '/assets/img/footmassage.jpg';
    }

    return DEFAULT_IMAGE;
  }

  private atLocalMidnight(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  private combineDateAndTime(date: Date, timeValue: string): Date {
    const [hours, minutes] = timeValue.split(':').map((part) => Number(part));
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes,
      0,
      0
    );
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('hu-HU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  private rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
    return startA < endB && endA > startB;
  }
}
