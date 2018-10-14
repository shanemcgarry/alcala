import {Component, ElementRef, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import { VisSearchParams } from '../../shared/models/vis-search-model';
import {VisualisationService} from '../service/visualisation.service';
import {CategoryData} from '../../shared/models/pivot-data.model';
import {MatCheckboxChange, MatDrawerContent, MatRadioChange, MatSelectChange} from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import {UserService} from '../../shared/services/user.service';
import {ChartComponent} from '../../shared/components/chart/chart.component';
import {DataSummaryPackage} from '../../shared/models/analysis-result';
import { ChartFactory } from '../../shared/components/chart/chart.factory';
import { VisFeatures, LabelValue, VisFilter} from '../../shared/models/visualisation.models';


@Component({
  selector: 'app-vizsearch',
  templateUrl: './vizsearch.component.html',
  styleUrls: ['./vizsearch.component.scss']
})

export class VizsearchComponent implements OnInit, AfterViewInit {
  @ViewChild('appChart') appChart: ChartComponent;
  @ViewChild('drawerContent') drawerContainer: ElementRef;
  searchParams: VisSearchParams = new VisSearchParams();
  graphData: DataSummaryPackage;
  graphWidth = 800;
  categoryData: CategoryData[];
  supportedGraphs: LabelValue[] = ChartFactory.getAllowableCharts();
  supportedGroups: string[] = ['category', 'word'];
  supportedFields: LabelValue[] = [];
  supportedXFields: LabelValue[] = [];
  supportedYFields: LabelValue[] = [];
  supportedSizeFields: LabelValue[] = [];
  filters: VisFilter = new VisFilter();
  features: VisFeatures = new VisFeatures();
  enableSizeField = false;
  validYears = [1774, 1775, 1776, 1777, 1778, 1779, 1781];

  constructor(private visService: VisualisationService, private userService: UserService, private route: ActivatedRoute) {
    this.supportedFields.push(new LabelValue('Total Spent', 'totalAmount'));
    this.supportedFields.push(new LabelValue('# of Occurrences', 'transactionCount'));
    this.supportedFields.push(new LabelValue('Year', 'year'));
    this.supportedFields.push(new LabelValue('Month', 'monthNum'));
    this.supportedGroups.forEach(x => {
      this.supportedFields.push(new LabelValue(x.charAt(0).toUpperCase() + x.slice(1), x));
    });
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
      this.setValidFields();
      this.setFieldDefaults();
    });
    this.searchParams.userID = this.userService.getLoggedInUser()._id;
    // set defaults
    this.searchParams.groupBy = this.supportedGroups[0];
    this.onSearch();
  }

  ngAfterViewInit() {
    this.graphWidth = this.drawerContainer.nativeElement ? this.drawerContainer.nativeElement.width : this.graphWidth;
  }

  setValidFields() {
    this.supportedXFields = [];
    this.supportedYFields = [];
    this.supportedSizeFields = [];
    this.supportedXFields = this.getAllowableFields('x');
    this.supportedYFields = this.getAllowableFields('y');
    this.supportedSizeFields = this.getAllowableFields('size');
  }

  getAllowableFields(fieldType: string, strippedValue?: string): LabelValue[] {
    const results: LabelValue[] = [];
    const chartInfo = ChartFactory.createChart({type: this.features.graphType});
    switch (fieldType) {
      case 'x':
        chartInfo.allowableXFields.forEach(x => {
          results.push(this.getLabelValueItem(x));
        });
        break;
      case 'y':
        chartInfo.allowableYFields.forEach(x => {
          results.push(this.getLabelValueItem(x));
        });
        break;
      case 'size':
        chartInfo.allowableSizeFields.forEach(x => {
          results.push(this.getLabelValueItem(x));
        });
    }

    if (strippedValue) {
      const removeIndex = results.findIndex(x => x.value === strippedValue);
      if (removeIndex > -1) {
        results.splice(removeIndex, 1);
      }
    }
    return results;
  }

  getLabelValueItem(fieldName: string): LabelValue {
    let lv: LabelValue;
    switch (fieldName) {
      case 'time':
        lv = this.getValidTimeField();
        break;
      case 'key':
        if (this.searchParams.groupBy) {
          lv = this.supportedFields.find( y => y.value === this.searchParams.groupBy);
        } else {
          lv = this.supportedFields.find( y => y.value === this.supportedGroups[0]);
        }
        break;
      default:
        lv = this.supportedFields.find( y => y.value === fieldName);
        break;
    }
    return lv;
  }

  resetFeatures(): void {
    this.setValidFields();
    this.setFieldDefaults();
  }

  setFieldDefaults() {
    this.features.xField = this.supportedXFields[0] ? this.supportedXFields[0].value : undefined;
    this.features.yField = this.supportedYFields[0] ? this.supportedYFields[0].value : undefined;
    this.features.sizeField = this.supportedSizeFields[0] && this.features.graphType === 'scatter' ? this.supportedSizeFields[0].value : undefined;
    this.enableSizeField = this.features.graphType === 'scatter';
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

  onXFieldChange(e: MatSelectChange): void {
    this.supportedYFields = this.getAllowableFields('y', e.value);
  }

  onYFieldChange(e: MatSelectChange): void {
    this.supportedXFields = this.getAllowableFields('x', e.value);
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
      this.searchParams.year = undefined;
    }
  }

  getValidTimeField(): LabelValue {
    let result;
    if (this.filters.yearEnabled) {
      result =  this.supportedFields.find(x => x.value === 'monthNum');
    } else {
      result =  this.supportedFields.find(x => x.value === 'year');
    }
    return result;
  }

  onEnableCategories(e: MatCheckboxChange): void {
    if (!e.checked) {
      this.searchParams.filteredCategories = [];
    }
  }

  onGraphTypeChange(e: MatSelectChange) {
      this.enableSizeField = e.value === 'scatter';
      this.setValidFields();
  }

  onSearch(): void {
    this.visService.generateSearch(this.searchParams)
      .subscribe(
        data => this.graphData = data,
        err => console.log(err),
        () => console.log('Graph Data loaded')
      );
  }

  onCategoryCheck(category: string): void {
    const catIndex = this.searchParams.filteredCategories.indexOf(category);
    if ( catIndex > -1) {
      this.searchParams.filteredCategories.splice(catIndex, 1);
    } else {
      this.searchParams.filteredCategories.push(category);
    }
  }

}
