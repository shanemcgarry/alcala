import { Component, OnInit } from '@angular/core';
import { VisSearchParams } from '../../shared/models/vis-search-model';
import {VisualisationService} from '../service/visualisation.service';
import {CategoryData} from '../../shared/models/pivot-data.model';
import {MatCheckboxChange} from '@angular/material';

export class VisFilter {
  yearEnabled: boolean;
  topWordsEnabled: boolean;
  bottomWordsEnabled: boolean;
  keywordsEnabled: boolean;
  categoriesEnabled: boolean;
}

@Component({
  selector: 'app-vizsearch',
  templateUrl: './vizsearch.component.html',
  styleUrls: ['./vizsearch.component.scss']
})
export class VizsearchComponent implements OnInit {
  dataModel: VisSearchParams = new VisSearchParams();
  categoryData: CategoryData[];
  filters: VisFilter = new VisFilter();

  constructor(private visService: VisualisationService) { }

  ngOnInit() {
    this.visService.getCategoryData()
      .subscribe(
        data => this.categoryData = data,
        err => console.log(err),
        () => console.log(this.categoryData)
      );
  }

  onEnableCategories(e: MatCheckboxChange): void {
    if (!e.checked) {
      this.dataModel.filteredCategories = [];
    }
}

  onSearch(): void {

  }

  onCategoryCheck(category: string): void {
    const catIndex = this.dataModel.filteredCategories.indexOf(category);
    if ( catIndex > -1) {
      this.dataModel.filteredCategories.splice(catIndex, 1);
    } else {
      this.dataModel.filteredCategories.push(category);
    }
    console.log(this.dataModel.filteredCategories);
  }

}
