import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/models';
import { MockDataService } from './mock-data.service';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private mockDataService: MockDataService) {
    // Check if user is logged in (from localStorage in production)
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      const user = this.mockDataService.getUserByEmail(email);
      if (user && user.password === password) {
        this.currentUserSubject.next(user);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        observer.next(true);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  isCustomer(): boolean {
    return this.currentUser?.role === 'customer';
  }

  isProfessional(): boolean {
    return this.currentUser?.role === 'professional';
  }
}