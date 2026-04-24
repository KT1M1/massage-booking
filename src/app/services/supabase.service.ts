import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export type UserRole = 'client' | 'admin';

export interface SignUpPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private readonly platformId = inject(PLATFORM_ID);
  private supabase: SupabaseClient;

  constructor() {
    const isBrowser = isPlatformBrowser(this.platformId);

    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          persistSession: isBrowser,
          autoRefreshToken: isBrowser,
          detectSessionInUrl: isBrowser
        }
      }
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Auth methods
  async signUp(payload: SignUpPayload) {
    return this.supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          first_name: payload.firstName,
          last_name: payload.lastName,
          phone: payload.phone ?? null,
          role: payload.role ?? 'client'
        }
      }
    });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getCurrentSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  // Generic CRUD helpers
  async select(table: string, options?: any) {
    return this.supabase.from(table).select('*', options);
  }

  async insert(table: string, data: any) {
    return this.supabase.from(table).insert(data);
  }

  async update(table: string, data: any, match: any) {
    return this.supabase.from(table).update(data).match(match);
  }

  async delete(table: string, match: any) {
    return this.supabase.from(table).delete().match(match);
  }
}
