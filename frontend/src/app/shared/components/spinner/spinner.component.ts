import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit, OnDestroy {
  @Input() name: string;
  @Input() group: string;
  @Input() loadingImage: string;

  private isShowing = false;
  @Input()
  get show(): boolean {
    return this.isShowing;
  }

  @Output() showChange = new EventEmitter();
  set show(val: boolean) {
    this.isShowing = val;
    this.showChange.emit(this.isShowing);
  }

  constructor(private spinnerService: SpinnerService) { }
  ngOnInit(): void {
    if (!this.name) {
      throw new Error('Spinner must have a value for name.');
    }
    if (!this.loadingImage) {
      this.loadingImage = 'assets/ajax-loader.gif';
    }
    this.spinnerService._register(this);
  }
  ngOnDestroy(): void {
    this.spinnerService._unregister(this);
  }

}
