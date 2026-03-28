import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ICON_PACK } from '../../shared/icon-pack';

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

  constructor(private router: Router) {}

  onSubmit() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Basic validation
    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword) {
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

    // Mock registration - in production, this would call an API
    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = 'Sikeres regisztráció! Most már bejelentkezhet.';
      // In a real app, you would redirect to login or auto-login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }, 1000);
  }
}
