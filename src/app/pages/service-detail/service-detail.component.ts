import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Service } from '../../models/models';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { ICON_PACK } from '../../shared/icon-pack';

@Component({
  selector: 'app-service-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.scss'
})
export class ServiceDetailComponent implements OnInit {
  service: Service | null = null;
  isLoggedIn = false;
  icons = ICON_PACK;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bookingService.getServiceById(id).subscribe(service => {
        this.service = service || null;
      });
    }
  }

  onBookService() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.service) {
      // Navigate to booking page with service ID
      this.router.navigate(['/booking'], {
        queryParams: { serviceId: this.service.id }
      });
    }
  }
}
