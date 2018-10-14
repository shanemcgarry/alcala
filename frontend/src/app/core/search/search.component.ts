import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PageService} from '../service/page.service';
import {PageResult} from '../../shared/models/page-result.model';
import { environment } from '../../../environments/environment';
import {UserService} from '../../shared/services/user.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchPhrase: string;
  isTile: boolean;
  dataModel: PageResult;
  imageBase: string = environment.imageUrl + 'thumbs/';
  currentIndex: number;
  userID: string;

  constructor(private route: ActivatedRoute, private pageService: PageService, private userService: UserService) { }

  ngOnInit() {
    const loggedInUser = this.userService.getLoggedInUser();
    if (loggedInUser) {
      this.userID = loggedInUser._id;
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
    this.pageService.search(this.searchPhrase, index, 20, this.userID)
      .subscribe(
        data => this.dataModel = data,
        error => console.log(error),
      );
  }

  onToggleClick(value: boolean) {
    this.isTile = value;
    console.log('isTile: ' + this.isTile.toString());
  }

  onSearchClick() {
    this.currentIndex = 1;
    this.isTile = false;
    this.pageService.search(this.searchPhrase, 1, 20, this.userID)
      .subscribe(
        data => this.dataModel = data,
        error => console.log(error),
      );
  }

}
