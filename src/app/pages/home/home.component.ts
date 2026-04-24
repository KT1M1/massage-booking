import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Service } from '../../models/models';
import { BookingService } from '../../services/booking.service';
import { ICON_PACK } from '../../shared/icon-pack';

type ServiceSortOption =
  | 'name-asc'
  | 'price-asc'
  | 'price-desc'
  | 'duration-asc'
  | 'duration-desc';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  services: Service[] = [];
  searchTerm = '';
  sortBy: ServiceSortOption = 'name-asc';
  icons = ICON_PACK;

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.bookingService.getServices().subscribe((services) => {
      this.services = services;
    });
  }

  get filteredServices(): Service[] {
    const normalizedSearch = this.searchTerm.trim().toLocaleLowerCase('hu-HU');

    const filtered = this.services.filter((service) =>
      service.name.toLocaleLowerCase('hu-HU').includes(normalizedSearch)
    );

    return [...filtered].sort((left, right) => {
      switch (this.sortBy) {
        case 'price-asc':
          return left.priceHuf - right.priceHuf;
        case 'price-desc':
          return right.priceHuf - left.priceHuf;
        case 'duration-asc':
          return left.durationMinutes - right.durationMinutes;
        case 'duration-desc':
          return right.durationMinutes - left.durationMinutes;
        case 'name-asc':
        default:
          return left.name.localeCompare(right.name, 'hu');
      }
    });
  }
}
