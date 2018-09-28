import { Injectable } from '@angular/core';
import { SpinnerComponent } from '../components/spinner/spinner.component';

@Injectable()
export class SpinnerService {
  private spinnerCache = new Set<SpinnerComponent>();
  _register(spinner: SpinnerComponent): void {
    this.spinnerCache.add(spinner);
  }
  show(spinnerName: string): void {
    this.spinnerCache.forEach(spinner => {
      if (spinner.name === spinnerName) {
        spinner.show = true;
      }
    });
  }
  hide(spinnerName: string): void {
    this.spinnerCache.forEach(spinner => {
      if (spinner.name === spinnerName) {
        spinner.show = false;
      }
    });
  }
  showGroup(groupName: string): void {
    this.spinnerCache.forEach(spinner => {
      if (spinner.group === groupName) {
        spinner.show = true;
      }
    });
  }
  hideGroup(groupName: string): void {
    this.spinnerCache.forEach(spinner => {
      if (spinner.group === groupName) {
        spinner.show = false;
      }
    });
  }
  hideAll(): void {
    this.spinnerCache.forEach( spinner => spinner.show = false);
  }
  isShowing(spinnerName: string): boolean | undefined {
    let showing = undefined;
    this.spinnerCache.forEach( spinner => {
      if (spinner.name === spinnerName) {
        showing = spinner.show;
      }
    });
    return showing;
  }
  _unregister(spinnerToRemove: SpinnerComponent): void {
    this.spinnerCache.forEach( spinner => {
      if (spinner === spinnerToRemove) {
        this.spinnerCache.delete(spinner);
      }
    });
  }
}
