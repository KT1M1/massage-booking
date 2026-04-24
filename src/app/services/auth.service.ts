import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { User } from '../models/models';
import { SupabaseService } from './supabase.service';

interface ProfileRow {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'client' | 'admin';
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();
  private readonly initializationPromise: Promise<void>;

  constructor(private supabaseService: SupabaseService) {
    this.initializationPromise = this.isBrowser
      ? this.refreshCurrentUser()
      : Promise.resolve();

    if (this.isBrowser) {
      this.supabaseService.getClient().auth.onAuthStateChange(() => {
        void this.refreshCurrentUser();
      });
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  waitUntilReady(): Promise<void> {
    return this.initializationPromise;
  }

  login(email: string, password: string): Observable<boolean> {
    return from(this.loginInternal(email, password));
  }

  async logout(): Promise<void> {
    await this.supabaseService.signOut();
    this.currentUserSubject.next(null);
  }

  async isLoggedIn(): Promise<boolean> {
    await this.waitUntilReady();
    return this.currentUser !== null;
  }

  isCustomer(): boolean {
    return this.currentUser?.role === 'client';
  }

  isProfessional(): boolean {
    return this.currentUser?.role === 'admin';
  }

  private async loginInternal(email: string, password: string): Promise<boolean> {
    const { error } = await this.supabaseService.signIn(email, password);
    if (error) {
      return false;
    }

    await this.refreshCurrentUser();
    return this.currentUser !== null;
  }

  private async refreshCurrentUser(): Promise<void> {
    if (!this.isBrowser) {
      this.currentUserSubject.next(null);
      return;
    }

    const supabase = this.supabaseService.getClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      this.currentUserSubject.next(null);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, phone, role, is_active')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile || !profile.is_active) {
      this.currentUserSubject.next(null);
      return;
    }

    this.currentUserSubject.next(this.mapProfileToUser(profile as ProfileRow));
  }

  private mapProfileToUser(profile: ProfileRow): User {
    return {
      id: profile.id,
      email: profile.email ?? '',
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone ?? undefined,
      role: profile.role,
      isActive: profile.is_active
    };
  }
}
