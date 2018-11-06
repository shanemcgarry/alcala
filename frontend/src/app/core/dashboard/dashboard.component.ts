import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  showSamples = false;
  showCustomDash = true;
  showStories = false;
  constructor() {}
  ngOnInit() {

  }

  setView(view: string) {
    switch (view) {
      case 'samples':
        this.showSamples = true;
        this.showCustomDash = false;
        this.showStories = false;
        break;
      case 'custom':
        this.showCustomDash = true;
        this.showSamples = false;
        this.showStories = false;
        break;
      case 'stories':
        this.showStories = true;
        this.showSamples = false;
        this.showCustomDash = false;
        break;
    }
  }

}
