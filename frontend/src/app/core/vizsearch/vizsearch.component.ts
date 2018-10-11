import { Component, OnInit } from '@angular/core';
import { VisSearchParams } from '../../shared/models/vis-search-model';
import {VisualisationService} from '../service/visualisation.service';
import {CategoryData} from '../../shared/models/pivot-data.model';
import {MatCheckboxChange, MatRadioChange, MatSelectChange} from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import {UserService} from '../../shared/services/user.service';

export class VisFilter {
  yearEnabled: boolean;
  topWordsEnabled: boolean;
  bottomWordsEnabled: boolean;
  keywordsEnabled: boolean;
  categoriesEnabled: boolean;
}

export class VisFeatures {
  graphType: string;
  xField: string;
  yField: string;
  sizeField: string;
}

export class LabelValue {
  label: string;
  value: string;

  constructor(labelName: string, valueName: string) {
    this.label = labelName;
    this.value = valueName;
  }
}

@Component({
  selector: 'app-vizsearch',
  templateUrl: './vizsearch.component.html',
  styleUrls: ['./vizsearch.component.scss']
})

export class VizsearchComponent implements OnInit {
  dataModel: VisSearchParams = new VisSearchParams();
  graphData: any;
  categoryData: CategoryData[];
  supportedGraphs: string[] = ['line', 'multiBar', 'stackedArea', 'pie', 'discreteBar', 'scatter'];
  supportedGroups: string[] = ['category', 'word'];
  supportedFields: LabelValue[] = [];
  filters: VisFilter = new VisFilter();
  features: VisFeatures = new VisFeatures();
  enableSizeField = false;
  validYears = [1774, 1775, 1776, 1777, 1778, 1779, 1781];

  constructor(private visService: VisualisationService, private userService: UserService, private route: ActivatedRoute) {
    this.supportedFields.push(new LabelValue('Total Spent', 'totalAmount'));
    this.supportedFields.push(new LabelValue('# of Occurrences', 'transactionCount'));
    this.supportedFields.push(new LabelValue('Year', 'year'));
  }

  ngOnInit() {
    this.visService.getCategoryData()
      .subscribe(
        data => this.categoryData = data,
        err => console.log(err),
        () => console.log('Categories loaded')
      );
    this.route.params.subscribe(params => {
      this.features.graphType = params['graph'];
      this.features.xField = 'year';
      this.features.yField = 'totalAmount';
      this.features.sizeField = this.features.graphType === 'scatter' ? 'transactionCount' : undefined;
      this.enableSizeField = this.features.graphType === 'scatter';
    });
    this.dataModel.userID = this.userService.getLoggedInUser()._id;
    // set defaults
    const defaultGroup = this.supportedGroups[0];
    this.dataModel.groupBy = defaultGroup;
    this.supportedFields.push(new LabelValue(defaultGroup.charAt(0).toUpperCase() + defaultGroup.slice(1), defaultGroup));
  }

  resetFeatures(): void {
    this.features.sizeField = undefined;
    this.features.xField = undefined;
    this.features.yField = undefined;
  }

  onGroupChange(e: MatRadioChange) {
    const selectedValue = e.value.toString();
    const self = this;
    const unavailableOptions: string[] = this.supportedGroups.filter(x => x !== selectedValue);
    const newValue = new LabelValue(selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1), selectedValue);
    unavailableOptions.forEach(x => {
      const index = self.supportedFields.findIndex(y => y.value === x);
      if (index !== -1) {
        self.supportedFields.splice(index, 1);
      }
    });
    this.supportedFields.push(newValue);
    this.resetFeatures();
  }

  onYearChecked(e: MatCheckboxChange) {
    if (e.checked) {
      const yearIndex = this.supportedFields.findIndex(x => x.value === 'year');
      this.supportedFields.splice(yearIndex, 1);
      this.supportedFields.push(new LabelValue('Month', 'monthNum'));
    } else {
      const monthIndex = this.supportedFields.findIndex(x => x.value === 'monthNum');
      this.supportedFields.splice(monthIndex, 1);
      this.supportedFields.push(new LabelValue('Year', 'year'));
      this.dataModel.year = undefined;
    }
  }

  onEnableCategories(e: MatCheckboxChange): void {
    if (!e.checked) {
      this.dataModel.filteredCategories = [];
    }
}

onGraphTypeChange(e: MatSelectChange) {
    this.enableSizeField = e.value === 'scatter';
}

  onSearch(): void {
    console.log(JSON.stringify(this.dataModel));
    this.visService.generateSearch(this.dataModel)
      .subscribe(
        data => this.graphData = data,
        err => console.log(err),
        () => console.log(this.graphData)
      );
  }

  onRefresh(): void {

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
