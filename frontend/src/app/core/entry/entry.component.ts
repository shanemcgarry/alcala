import { Component, OnInit, Input } from '@angular/core';
import { AlcalaEntry } from '../../shared/models/alcala-entry.model';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss']
})
export class EntryComponent implements OnInit {
 @Input() dataModel: AlcalaEntry;
 @Input() currentLang: string;
  constructor() { }

  ngOnInit() {
  }

}
