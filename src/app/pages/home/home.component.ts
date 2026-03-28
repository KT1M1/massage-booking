import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Service } from '../../models/models';
import { BookingService } from '../../services/booking.service';
import { ICON_PACK } from '../../shared/icon-pack';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  services: Service[] = [];
  icons = ICON_PACK;

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.bookingService.getServices().subscribe(services => {
      this.services = services;
    });
  }
}
