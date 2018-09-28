import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss']
})
export class InfoBoxComponent implements OnInit {
  @Input() bgClass: string;
  @Input() icon: string;
  @Input() count: number;
  @Input() label: string;
  @Input() data: any;
  constructor() { }

  ngOnInit() {
  }

  formatCount(): string {
    if (this.count) {
      const reales = Math.floor(this.count);
      const maravedises = Math.floor((this.count % 1) * 100);
      return `${reales}r ${maravedises}m`;
    }
  }

}
