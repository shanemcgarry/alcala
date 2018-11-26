import { Component, OnInit, Input } from '@angular/core';
import {PageResult} from '../../models/page-result.model';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  @Input() dataModel: PageResult;
  @Input() viewMode: string;
  thumbsBase: string = environment.imageUrl + 'thumbs/';
  imageBase: string = environment.imageUrl;
  displayedColumns = ['title', 'matches', 'description', 'id'];
  constructor() { }

  ngOnInit() {
    if (!this.viewMode) {
      this.viewMode = 'list';
    }
  }

  formatTextSnippet(snippet: string) {
    let result = '<ul>';
    snippet.split('---').forEach(x => {
      result += `<li>${x}</li>`;
    });
    result += '</ul>';
    return result;
  }

}
