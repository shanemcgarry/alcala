import {Component, OnInit, ViewChild, ElementRef, AfterContentChecked} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

import { AlcalaPage } from '../../shared/models/alcala-page.model';
import { PageService } from '../service/page.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit, AfterContentChecked {
  pageid: string;
  imageIndex: string;
  imageBase: string;
  imageUrl: string;
  dataModel: AlcalaPage;
  viewerWidth: number;

  @ViewChild('imageViewerParent') ipViewer: ElementRef;

  constructor(private route: ActivatedRoute, private pageService: PageService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.pageid = params['id'];
    });
    this.getPage();
    this.imageBase = environment.imageUrl;
    this.imageIndex = this.pageid + '.jpg';
    this.imageUrl = this.imageBase + this.imageIndex;
  }
  ngAfterContentChecked() {
    if (this.ipViewer) {
      this.viewerWidth = this.ipViewer.nativeElement.offsetWidth;
    }
  }



  getPage(): void {
    this.pageService.getPage(this.pageid)
      .subscribe(
        data => { this.dataModel = data; console.log(this.dataModel); },
        err => console.error(err),
        () => console.log('page data loaded.')
        );
  }

}
