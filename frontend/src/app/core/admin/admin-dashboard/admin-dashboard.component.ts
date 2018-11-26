import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  showCuration: boolean;
  showUsers: boolean;
  constructor() { }

  ngOnInit() {
    this.showUsers = true;
  }

  setView(mode: string): void {
    switch (mode) {
      case 'curation':
        this.showCuration = true;
        this.showUsers = false;
        break;
      case 'users':
        this.showUsers = true;
        this.showCuration = false;
        break;
    }
  }
}
