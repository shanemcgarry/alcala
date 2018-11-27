import {Component, OnInit, ViewChild, ElementRef, AfterContentChecked, Input} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

import { AlcalaPage } from '../../shared/models/alcala-page.model';
import { PageService } from '../service/page.service';
import {BoundaryObject, BoundaryObjectType} from '../../shared/models/custom-dashboard.model';
import {BoundaryobjectDialogComponent} from '../../shared/components/boundaryobject-dialog/boundaryobject-dialog.component';
import {UserService} from '../../shared/services/user.service';
import {SiteUser} from '../../shared/models/site-user.model';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit, AfterContentChecked {
  @Input() pageid: string;
  @Input() hideActions: boolean;
  currentUser: SiteUser;
  imageIndex: string;
  imageBase: string;
  imageUrl: string;
  dataModel: AlcalaPage;
  viewerWidth: number;
  showSpinner: boolean;

  @ViewChild('imageViewerParent') ipViewer: ElementRef;

  constructor(private route: ActivatedRoute, private pageService: PageService, private userService: UserService, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        if (!this.pageid) {
          this.pageid = params['id'];
        }
      }
    });
    this.getPage();
    this.imageBase = environment.imageUrl;
    this.imageIndex = this.pageid + '.jpg';
    this.imageUrl = this.imageBase + this.imageIndex;
    this.currentUser = this.userService.getLoggedInUser();
  }
  ngAfterContentChecked() {
    if (this.ipViewer) {
      this.viewerWidth = this.ipViewer.nativeElement.offsetWidth;
    }
  }

  createBoundaryObject(): void {
    const boundaryObject: BoundaryObject = {
      _id: null,
      userID: this.currentUser._id,
      title: null,
      description: null,
      type: BoundaryObjectType.Page,
      features: null,
      params: null,
      totalItems: 1,
      pageID: this.pageid,
      dateCreated: new Date()
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


  getPage(): void {
    this.showSpinner = true;
    this.pageService.getPage(this.pageid)
      .subscribe(
        data => {
          this.dataModel = data;
          this.showSpinner = false;
          },
        err => {
          console.error(err);
          this.showSpinner = false;
        },
        () => console.log('page data loaded.')
        );
  }

}
