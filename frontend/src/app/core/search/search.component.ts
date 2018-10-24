import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PageResult} from '../../shared/models/page-result.model';
import { environment } from '../../../environments/environment';
import {UserService} from '../../shared/services/user.service';
import {SearchLogEntry, SearchParams, SearchFeatures} from '../../shared/models/search.model';
import {SearchService} from '../../shared/services/search.service';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchParams: SearchParams = new SearchParams();
  isTile: boolean;
  dataModel: PageResult;
  imageBase: string = environment.imageUrl + 'thumbs/';
  currentIndex: number;
  userID: string;
  currentSearchID: string;
  availableYears = [1774, 1775, 1776, 1777, 1778, 1779, 1781];
  searchHistory: SearchLogEntry[];

  constructor(private route: ActivatedRoute, private searchService: SearchService, private userService: UserService) {
    this.currentSearchID = undefined;
  }

  ngOnInit() {
    const loggedInUser = this.userService.getLoggedInUser();
    if (loggedInUser) {
      this.userID = loggedInUser._id;
      this.searchService.getSearchHistory(this.userID, 'keyword')
        .subscribe(
          data => this.searchHistory = data.slice(0, 4),
          err => console.log(err),
          () => 'Search history loaded'
        );
    }
  }

  getPageArray(): any[] {
    return new Array(this.dataModel.totalPageResults);
  }

  getBeginHits(): number {
    return ((this.dataModel.currentIndex * this.dataModel.resultLimit) - this.dataModel.resultLimit + 1);
  }

  getEndHits(): number {
    return (this.dataModel.currentIndex * this.dataModel.resultLimit);
  }

  onNavClick(index: number) {
    this.currentIndex = index;
    this.searchService.keywordSearch(this.searchParams, index, 20, this.userID, this.currentSearchID)
      .subscribe(
        data => this.dataModel = data,
        error => console.log(error),
      );
  }

  onToggleClick(value: boolean) {
    this.isTile = value;
  }

  checkForValue(value: any): boolean {
    let result = false;
    if (value) {
      if (value.toString() !== '') {
        result = true;
      }
    }

    return result;
  }

  onHistoryClick(searchID: string): void {
    this.currentSearchID = searchID;
    const histObj = this.searchHistory.find(x => x._id === searchID);
    this.currentIndex = 1;
    this.isTile = false;
    this.searchParams = histObj.params;
    this.searchService.keywordSearch(this.searchParams, 1, 20, this.userID, this.currentSearchID)
      .subscribe(
        data => this.dataModel = data,
        err => console.log(err),
        () => console.log('History object loaded')
      );
  }

  onSearchClick(): void {
    if (!this.searchHistory) {
      this.searchHistory = [];
    }
    this.currentIndex = 1;
    this.currentSearchID = undefined;
    this.isTile = false;
    this.searchService.keywordSearch(this.searchParams, 1, 20, this.userID, this.currentSearchID)
      .subscribe(
        data => {
          this.dataModel = data;
          const features = new SearchFeatures();
          features.pageIndex = this.currentIndex;
          features.pageLimit = 20;

          const histObj: SearchLogEntry = {
            _id: data.searchID,
            type: 'keyword',
            userID: this.userID,
            totalHits: data.totalHits,
            params: cloneDeep(this.searchParams),
            features: [features]
          };
          this.currentSearchID = data.searchID;
          if (this.searchHistory.length >= 4) {
            this.searchHistory.shift(); // We only keep 4 items in the recent history so pop out the first element
          }
          this.searchHistory.push(histObj);
        },
        error => console.log(error),
      );
  }

}
