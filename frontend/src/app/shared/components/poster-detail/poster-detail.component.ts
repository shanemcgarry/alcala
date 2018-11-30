import {Component, OnInit, ViewChild} from '@angular/core';
import {PosterModel, PosterSection} from '../../models/poster-model';
import {ActivatedRoute} from '@angular/router';
import {DashboardService} from '../../services/dashboard.service';
import {BoundaryObject} from '../../models/custom-dashboard.model';
import {UserService} from '../../services/user.service';
import * as html2canvas from 'html2canvas';

@Component({
  selector: 'app-poster-detail',
  templateUrl: './poster-detail.component.html',
  styleUrls: ['./poster-detail.component.scss']
})
export class PosterDetailComponent implements OnInit {
  dataModel: PosterModel;
  showSpinner: boolean;
  boundaryObjects: BoundaryObject[];
  @ViewChild('posterContent') posterContent;

  constructor(private route: ActivatedRoute, private dashboardService: DashboardService, private userService: UserService) {
    this.dashboardService.getBoundaryObjects(this.userService.getLoggedInUser()._id)
      .subscribe(
        data => this.boundaryObjects = data,
        err => console.log(err)
      );
  }

  ngOnInit() {
    this.showSpinner = true;
    this.route.params.subscribe(p => {
      const poster_id = p['id'];
      this.dashboardService.getUserPosterByID(poster_id)
        .subscribe(
          data => {
            this.dataModel = data;
            console.log(this.dataModel);
            this.showSpinner = false;
          },
          err => {
            console.log(err);
            this.showSpinner = false;
          }
        );
    });
  }

  getBoundaryObject(id: string): BoundaryObject {
    return this.boundaryObjects.find(x => x._id === id);
  }

  printPoster(): void {
    html2canvas(this.posterContent.nativeElement).then( canvas => {
      const hyperLink = <HTMLAnchorElement>document.createElement('a', {is: 'HTMLAnchorElement'});
      hyperLink.download = `${this.dataModel.title}.png`;
      hyperLink.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      hyperLink.click();
    });
  }

  getLeftColumnItems(): PosterSection[] {
    const results: PosterSection[] = [];
    for (let i = 1; i <= this.dataModel.sections.length; i++) {
      if (i % 2 !== 0) {
        results.push(this.dataModel.sections[i - 1]);
      }
    }
    return results;
  }

  getRightColumnItems(): PosterSection[] {
    const results: PosterSection[] = [];
    for (let i = 1; i <= this.dataModel.sections.length; i++) {
      if (i % 2 === 0) {
        results.push(this.dataModel.sections[i - 1]);
      }
    }
    return results;
  }


}
