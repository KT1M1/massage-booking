import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ICON_PACK } from '../../shared/icon-pack';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  phone = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  icons = ICON_PACK;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    const firstName = this.firstName.trim();
    const lastName = this.lastName.trim();
    const email = this.email.trim().toLowerCase();
    const phone = this.phone.trim();

    if (!firstName || !lastName || !email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Kérjük, töltse ki az összes kötelező mezőt!';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'A jelszavak nem egyeznek!';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'A jelszónak legalább 6 karakter hosszúnak kell lennie!';
      return;
    }

    this.isLoading = true;

    try {
      const { error } = await this.supabaseService.signUp({
        email,
        password: this.password,
        firstName,
        lastName,
        phone,
        role: 'client'
      });

      if (error) {
        this.errorMessage = this.mapAuthError(error.message);
        return;
      }

      this.successMessage = 'Sikeres regisztráció! Kérjük, ellenőrizze az e-mail-fiókját.';

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error) {
      this.errorMessage = 'Váratlan hiba történt a regisztráció során.';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  private mapAuthError(message: string): string {
    if (message.includes('User already registered')) {
      return 'Ezzel az e-mail-címmel már létezik fiók.';
    }

    if (message.includes('Password should be at least')) {
      return 'A jelszó túl rövid.';
    }

    if (message.includes('Invalid email')) {
      return 'Érvénytelen e-mail-cím.';
    }

    return message;
  }
}
