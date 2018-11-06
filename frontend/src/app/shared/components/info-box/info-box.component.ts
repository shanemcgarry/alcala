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
  @Input() dataType: string;
  constructor() { }

  ngOnInit() {
  }

  formatCount(): string {
    let result = '';
    if (this.count) {
      switch (this.dataType) {
        case 'transactionCount':
          result = `Total Transactions: ${this.count}`;
          break;
        case 'frequency':
          result = `Word Frequency: ${this.count}`;
          break;
        case 'totalAmount':
        default:
          const reales = Math.floor(this.count);
          const maravedises = Math.floor((this.count % 1) * 100);
          result = `Total Amount: ${reales}r ${maravedises}m`;
          break;
      }
    }
    return result;
  }

}
