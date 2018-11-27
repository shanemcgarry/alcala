import {Component, Input, OnInit} from '@angular/core';
import {BoundaryObject, BoundaryObjectType} from '../../models/custom-dashboard.model';
import {DataSummaryPackage} from '../../models/analysis-result';
import {PageResult} from '../../models/page-result.model';
import {SearchService} from '../../services/search.service';
import {MatDialog} from '@angular/material';
import {BoundaryobjectDialogComponent} from '../boundaryobject-dialog/boundaryobject-dialog.component';
import {DashboardService} from '../../services/dashboard.service';
import {ActivatedRoute} from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-boundary-object',
  templateUrl: './boundary-object.component.html',
  styleUrls: ['./boundary-object.component.scss'],
  animations: [
    trigger('flipState', [
      state('active', style({
        transform: 'rotateY(179deg)'
      })),
      state('inactive', style({
        transform: 'rotateY(0)'
      })),
      transition('active => inactive', animate('500ms ease-out')),
      transition('inactive => active', animate('500ms ease-in'))
    ])
  ]
})
export class BoundaryObjectComponent implements OnInit {
  @Input() data: BoundaryObject;
  objectID: string;
  chartData: DataSummaryPackage;
  searchResults: PageResult;
  showSpinner: boolean;
  boundaryObjectType = BoundaryObjectType;
  showActions = true;
  @Input() expandedView: boolean;
  flip = 'inactive';

  constructor(private searchService: SearchService, private dialog: MatDialog,
              private dashboardService: DashboardService, private route: ActivatedRoute) {
    if (this.route && this.route.params) {
      this.route.params.subscribe(params => {
        this.objectID = params['id'];
      });
    }

    if (this.objectID) {
      this.showActions = false;
      this.expandedView = true;
    }
  }

  ngOnInit() {
    this.showSpinner = true;

    if (this.objectID) {
      this.dashboardService.getBoundaryObjectByID(this.objectID)
        .subscribe(
          data => {
            this.data = data;
            this.loadData();
          },
          err => {
            console.log(err);
            this.showSpinner = false;
          }
        );
    } else {
      this.loadData();
    }
  }

  toggleFlip() {
    this.flip = (this.flip === 'inactive') ? 'active' : 'inactive';
  }

  loadData(): void {
    switch (this.data.type) {
      case BoundaryObjectType.SearchResult:
        this.searchService.keywordSearch(this.data.params, this.data.features.pageIndex, this.data.features.pageLimit, null, null, false)
          .subscribe(
            data => {
              this.searchResults = data;
              this.showSpinner = false;
            },
            err => {
              console.log(err);
              this.showSpinner = false;
            }
          );
        break;
      case BoundaryObjectType.Chart:
        this.searchService.visualiseSearch(this.data.params, null, false)
          .subscribe(
            data => {
              this.chartData = data;
              this.showSpinner = false;
            },
            err => {
              console.log(err);
              this.showSpinner = false;
            }
          );
        break;
      default:
        this.showSpinner = false;
        break;
    }
  }

  editBoundaryObject(): void {
    this.toggleFlip();
    const dialogRef = this.dialog.open(BoundaryobjectDialogComponent, {data: this.data});
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Boundary object saved');
      } else {
        console.log('Boundary object canceled');
      }
    });
  }

  viewBoundaryObject(): void {

  }
}
