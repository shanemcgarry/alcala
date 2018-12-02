import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PageResult, PageResultDetail} from '../../shared/models/page-result.model';
import { environment } from '../../../environments/environment';
import {UserService} from '../../shared/services/user.service';
import {SearchLogEntry, SearchParams, SearchFeatures} from '../../shared/models/search.model';
import {SearchService} from '../../shared/services/search.service';
import { cloneDeep } from 'lodash';
import {SiteUser} from '../../shared/models/site-user.model';
import {MatDialog, MatPaginator, MatSelectChange, MatTableDataSource, PageEvent} from '@angular/material';
import {BoundaryObject, BoundaryObjectType} from '../../shared/models/custom-dashboard.model';
import {BoundaryobjectDialogComponent} from '../../shared/components/boundaryobject-dialog/boundaryobject-dialog.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchParams: SearchParams = new SearchParams();
  isTile: boolean;
  dataModel: PageResult;
  thumbsBase: string = environment.imageUrl + 'thumbs/';
  imageBase: string = environment.imageUrl;
  currentIndex: number;
  currentUser: SiteUser;
  currentSearchID: string;
  availableYears = [1774, 1775, 1776, 1777, 1778, 1779, 1781];
  pageOptions = [5, 10, 15, 25, 50, 100];
  searchHistory: SearchLogEntry[];
  showSpinner = false;
  pageSize = 25;
  searchResults: MatTableDataSource<PageResultDetail>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private route: ActivatedRoute, private searchService: SearchService, private userService: UserService, public dialog: MatDialog) {
    this.currentSearchID = undefined;
  }

  ngOnInit() {
    const loggedInUser = this.userService.getLoggedInUser();
    if (loggedInUser) {
      this.currentUser = loggedInUser;
      this.searchService.getSearchHistory(this.currentUser._id, 'keyword')
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
    let result = 0;
    if ( this.dataModel.totalHits > 0 ) {
      result = ((this.dataModel.currentIndex * this.dataModel.resultLimit) - this.dataModel.resultLimit + 1);
    }
    return result;
  }

  getEndHits(): number {
    let result = 0;
    if (this.dataModel.totalHits > 0) {
      if ((this.dataModel.currentIndex * this.dataModel.resultLimit) > this.dataModel.totalHits) {
        result = this.dataModel.totalHits;
      } else {
        result = (this.dataModel.currentIndex * this.dataModel.resultLimit);
      }
    }
    return result;
  }

  onPageSizeChanged(e: MatSelectChange): void {
    this.runSearch(false);
  }

  onNavClick(index: number) {
    this.currentIndex = index;
    this.runSearch(false);
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

  createBoundaryObject(): void {
    const features = new SearchFeatures();
    features.pageIndex = this.currentIndex;
    features.pageLimit = 20;

    const boundaryObject: BoundaryObject = {
      _id: null,
      userID: this.currentUser._id,
      title: null,
      description: null,
      type: BoundaryObjectType.SearchResult,
      features: features,
      params: this.searchParams,
      totalItems: this.dataModel.totalHits,
      pageID: null,
      dateCreated: new Date(),
      isSelected: false
    };
    const dialogRef = this.dialog.open(BoundaryobjectDialogComponent, { data: boundaryObject});
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Boundary Object created: ' + result._id);
      } else {
        console.log('Boundary Object canceled');
      }
    });
  }

  onHistoryClick(searchID: string): void {
    this.showSpinner = true;
    this.currentSearchID = searchID;
    const histObj = this.searchHistory.find(x => x._id === searchID);
    this.currentIndex = histObj.features[0].pageIndex;
    this.pageSize = histObj.features[0].pageLimit;
    this.isTile = false;
    this.searchParams = histObj.params;
    this.runSearch(false);
  }

  runSearch(logSearch: boolean = false): void {
    this.searchService.keywordSearch(this.searchParams, this.currentIndex, this.pageSize, this.currentUser._id, this.currentSearchID)
      .subscribe(
        data => {
          if (data) {
            this.dataModel = data;
            this.searchResults = new MatTableDataSource<PageResultDetail>(data.pages);
            this.searchResults.paginator = this.paginator;
            console.log('Total hits: ' + this.dataModel.totalHits);

            if (logSearch) {
              const features = new SearchFeatures();
              features.pageIndex = this.currentIndex;
              features.pageLimit = this.pageSize;

              const histObj: SearchLogEntry = {
                _id: data.searchID,
                type: 'keyword',
                userID: this.currentUser._id,
                totalHits: data.totalHits,
                params: cloneDeep(this.searchParams),
                features: [features]
              };
              this.currentSearchID = data.searchID;
              if (this.searchHistory.length >= 4) {
                this.searchHistory.shift(); // We only keep 4 items in the recent history so pop out the first element
              }
              this.searchHistory.push(histObj);
            }
            this.showSpinner = false;
          }
        },
        error => {
          console.log(error);
          this.showSpinner = false;
        }
      );
  }

  onSearchClick(): void {
    this.showSpinner = true;
    if (!this.searchHistory) {
      this.searchHistory = [];
    }
    this.currentIndex = 1;
    this.currentSearchID = undefined;
    this.isTile = false;
    this.runSearch(true);
  }

}
