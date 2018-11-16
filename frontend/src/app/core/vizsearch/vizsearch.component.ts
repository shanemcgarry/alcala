import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SearchParams, SearchFeatures } from '../../shared/models/search.model';
import { VisualisationService } from '../service/visualisation.service';
import {CategoryData} from '../../shared/models/pivot-data.model';
import { MatCheckboxChange, MatPaginator, MatRadioChange, MatSelectChange, MatTableDataSource, MatTabGroup } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { ChartComponent } from '../../shared/components/chart/chart.component';
import { AnalysisItem, DataSummaryPackage } from '../../shared/models/analysis-result';
import { ChartFactory } from '../../shared/components/chart/chart.factory';
import { LabelValue, VisFilter} from '../../shared/models/visualisation.models';
import canvg from 'canvg';
import {SearchService} from '../../shared/services/search.service';


@Component({
  selector: 'app-vizsearch',
  templateUrl: './vizsearch.component.html',
  styleUrls: ['./vizsearch.component.scss']
})

export class VizsearchComponent implements OnInit, AfterViewInit {
  @ViewChild('appChart') appChart: ChartComponent;
  @ViewChild('drawerContent') drawerContainer: ElementRef;
  @ViewChild('chartContainer') chartContainer: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
  displayColumns: string[] = ['year', 'monthName', 'categories', 'words', 'reales', 'maravedises', 'pageid'];
  searchParams: SearchParams = new SearchParams();
  thumbsBase = environment.imageUrl + 'thumbs/';
  userID: string;
  graphData: DataSummaryPackage;
  graphWidth = 800;
  detailData = new MatTableDataSource<AnalysisItem>();
  categoryData: CategoryData[];
  supportedGraphs: LabelValue[] = ChartFactory.getAllowableCharts();
  supportedGroups: string[] = ['category', 'word'];
  supportedFields: LabelValue[] = [];
  supportedXFields: LabelValue[] = [];
  supportedYFields: LabelValue[] = [];
  supportedSizeFields: LabelValue[] = [];
  filters: VisFilter = new VisFilter();
  features: SearchFeatures = new SearchFeatures();
  enableSizeField = false;
  validYears = [1774, 1775, 1776, 1777, 1778, 1779, 1781];

  constructor(private visService: VisualisationService, private userService: UserService, private searchService: SearchService, private route: ActivatedRoute) {
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
      const baseChart = this.supportedGraphs.find(g => g.value === params['graph']);
      this.features.chartType = baseChart.value;
      this.setValidFields();
      this.setFieldDefaults();
    });
    this.userID = this.userService.getLoggedInUser()._id;
    // set defaults
    this.searchParams.groupBy = this.supportedGroups[0];
    this.onSearch();
    this.detailData.paginator = this.paginator;
  }

  ngAfterViewInit() {
    this.graphWidth = this.chartContainer.nativeElement.offsetWidth;
  }

  saveChartToImage() {
    const renderw = 1000, renderh = 750;
    const hyperLink = <HTMLAnchorElement>document.createElement('a', {is: 'HTMLAnchorElement'});
    const nvd3Element = document.getElementsByTagName('nvd3')[0];
    const svgElement = new XMLSerializer().serializeToString(nvd3Element.firstChild);
    const canvas = <HTMLCanvasElement>document.createElement('canvas', {is: 'HTMLCanvasElement'});

    canvas.id = 'canvas';
    canvas.height = renderh;
    canvas.width = renderw;

    canvg(canvas, svgElement);

    hyperLink.download = `${this.features.chartType}.png`;
    hyperLink.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    hyperLink.click();
  }

  logSearchFeatures(): void {
    this.searchService.logSearchFeatures(this.graphData.searchID, this.features)
      .subscribe(
        err => console.log(err),
        () => console.log('Search Feature Logged')
      );
  }

  setValidFields() {
    this.supportedXFields = this.getAllowableFields('x');
    this.supportedYFields = this.getAllowableFields('y');
    this.supportedSizeFields = this.getAllowableFields('size');
  }

  setChartDetailData(data: AnalysisItem[]) {
    if (data) {
      this.detailData.data = data.sort((a, b) => {
        if (a.year === b.year ) {
          if (a.month < b.month ) { return -1; }
          if (a.month > b.month ) { return 1; }
          return 0;
        } else {
          if (a.year < b.year ) { return - 1; }
          if (a.year > b.year ) { return 1; }
          return 0;
        }
      });
    } else {
      this.detailData.data = [];
    }
  }

  getAllowableFields(fieldType: string, strippedValue?: string): LabelValue[] {
    const results: LabelValue[] = [];
    const chartInfo = ChartFactory.createChart({type: this.features.chartType});
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
    this.features.sizeField = this.supportedSizeFields[0] && this.features.chartType === 'scatter' ? this.supportedSizeFields[0].value : undefined;
    this.enableSizeField = this.features.chartType === 'scatter';
  }

  onGroupChange(e: MatRadioChange) {
    /*const selectedValue = e.value.toString();
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
    this.resetFeatures();*/
  }

  onFieldInfoChange(e: MatSelectChange) {
    this.logSearchFeatures();
    this.tabGroup.selectedIndex = 0;
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
    this.filters.yearEnabled = e.checked;
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
      this.logSearchFeatures();
      this.tabGroup.selectedIndex = 0;
  }

  onSearch(): void {
    this.searchService.visualiseSearch(this.searchParams, this.userID)
      .subscribe(
        data => {
            this.graphData = data;
            this.setChartDetailData(data.rawData);
            this.logSearchFeatures();
          },
        err => console.log(err),
        () => {
          this.resetFeatures();
        }
      );
  }

  onElementClick(e: any) {
    const rdFilters = this.getFiltersForChartData(e);
    let filteredData = this.graphData.rawData;
    rdFilters.forEach( filter => {
      switch (filter.key) {
        case 'categories':
          filteredData = filteredData.filter( x => x.categories.some( c => c === filter.value));
          break;
        case 'words':
          filteredData = filteredData.filter( x => x.words.some( w => w === filter.value));
          break;
        default:
          filteredData = filteredData.filter( x => x[filter.key] === filter.value);
      }
    });

    this.setChartDetailData(filteredData);
    this.tabGroup.selectedIndex = 1;
  }

  getFiltersForChartData(e: any): any[] {
    const rdFilters = [];
    switch (this.features.chartType) {
      case 'multiBar':
        switch (this.features.xField) {
          case 'year':
          case 'monthNum':
            rdFilters.push(this.getFilterForKey(e.data.key));
            break;
          case 'category':
            if (this.searchParams.year) {
              rdFilters.push({'key': 'month', 'value': e.data.key});
            } else {
              rdFilters.push({'key': 'year', 'value': e.data.key });
            }
            break;
        }
        rdFilters.push(this.getFilterForXField(e.data.x));
        break;
      case 'line':
        rdFilters.push(this.getFilterForKey(e.series.key));
        rdFilters.push(this.getFilterForXField(e.point.x));
        break;
      case 'discreteBar':
        rdFilters.push(this.getFilterForXField(e.data.key));
        break;
      case 'pie':
        rdFilters.push(this.getFilterForXField(e.data.key));
        break;
      case 'stackedArea':
        rdFilters.push(this.getFilterForKey(e.series.key));
        rdFilters.push(this.getFilterForXField(e.point.x));
        break;
      default:
        throw new Error(`Click events have not been implemented for the ${this.features.chartType} chart type.`);
    }
    return rdFilters;
  }

  getFilterForKey(keyValue: any): any {
    let filterName;
    switch (this.searchParams.groupBy) {
      case 'category':
        filterName = 'categories';
        break;
      case 'word':
        filterName = 'words';
        break;
      default:
        throw new Error(`${this.searchParams.groupBy} is not an implemented filter for graph data`);
    }

    return {'key': filterName, 'value': keyValue};
  }

  getFilterForXField(xValue: any): any {
    let formattedX, filterName;
    switch (this.features.xField) {
      case 'year':
        switch (this.features.chartType) {
          case 'discreteBar':
          case 'pie':
            filterName = this.features.xField;
            formattedX = xValue;
            break;
          default:
            const yearDate = new Date(xValue);
            filterName = this.features.xField;
            formattedX = yearDate.getFullYear();
            break;
        }
        break;
      case 'monthNum':
        switch (this.features.chartType) {
          case 'discreteBar':
          case 'pie':
            filterName = 'month';
            formattedX = xValue;
            break;
          default:
            const monthDate = new Date(xValue);
            filterName = 'month';
            formattedX = monthDate.getMonth();
            break;
        }
        break;
      case 'category':
        filterName = 'categories';
        formattedX = xValue;
        break;
      default:
        formattedX = xValue;
        filterName = this.features.xField;
    }

    return {'key': filterName, 'value': formattedX };
  }

}
