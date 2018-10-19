import {Component, OnInit, OnChanges, Input, Output, ViewChild, ElementRef, EventEmitter} from '@angular/core';
import { BaseChart } from './types/base.chart';
import {DataSummaryPackage} from '../../models/analysis-result';
import { ChartFactory } from './chart.factory';
import * as CanvasJS from 'src/scripts/canvasjs.min';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnChanges {
  @Input() data: DataSummaryPackage;
  @Input() chartType: string;
  @Input() xField: string;
  @Input() yField: string;
  @Input() sizeField: string;
  @Input() height = 300;
  @Input() width = 600;
  @ViewChild('chartContainer') chartContainer: ElementRef;
  @Output() elementClick = new EventEmitter<any>();
  chart: BaseChart;
  useNVD3 = true;
  formattedData: any;
  options: any;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.setChartInfo(this.chartType);
  }

  setChartInfo(chartType: string): void {
    const chartInfo = ChartFactory.getAllowableCharts().find(x => x.value === chartType);
    this.useNVD3 = chartInfo.info.library === 'nvd3';
    this.chart = ChartFactory.createChart({type: chartInfo.value, xField: this.xField, yField: this.yField, height: this.height,
                                                     width: this.width, sizeField: this.sizeField, library:  chartInfo.info.library});
    this.formattedData = this.chart.formatData(this.data);
    this.options = this.chart.createOptions();
    this.chart.onElementClick.subscribe((sender, e) => {
      this.elementClick.emit(e);
    });

/*    switch (chartInfo.info.library) {
      case 'cjs':
        if (this.cjsChart) {
          this.cjsChart.options = this.options;
        } else {
          this.cjsChart = new CanvasJS.Chart('chartContainer', this.options);
        }
        this.cjsChart.render();
        this.setCanvasDisplay(false);
        break;
      case 'hcjs':
        Highcharts.chart('chartContainer', this.options);
        console.log(this.options);
        break;
      default:
        this.setCanvasDisplay(true);
        break;
    }*/
  }

/*  setCanvasDisplay(isHidden: boolean)  {
    if (this.chartContainer) {
      const cjs = this.chartContainer.nativeElement.querySelector('.canvasjs-chart-container');
      if (cjs) {
        cjs.style.display = isHidden ? 'none' : 'block';
      }
    }
  }*/

}
