import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ICON_PACK } from '../../shared/icon-pack';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  icons = ICON_PACK;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Kérjük, töltse ki az összes mezőt!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage = 'Hibás e-mail vagy jelszó!';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Hiba történt a bejelentkezés során!';
      }
    });
  }
}
