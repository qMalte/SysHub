import { Component, OnInit } from '@angular/core';
import { ApiModule, InfoService, Configuration, VisitorInfoResponseDto } from '../api';
import { firstValueFrom } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [ApiModule, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  info?: VisitorInfoResponseDto;

  constructor(private infoService: InfoService) {
    //
  }

  async ngOnInit() {
    this.info = await firstValueFrom(
      this.infoService.visitorControllerGetVisitorInfo(),
    );
  }
}
