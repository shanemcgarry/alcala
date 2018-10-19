import {Component, OnInit, OnChanges, Input, Output, ViewChild, ElementRef, EventEmitter} from '@angular/core';
import { BaseChart } from './types/base.chart';
import {DataSummaryPackage} from '../../models/analysis-result';
import { ChartFactory } from './chart.factory';
import * as CanvasJS from 'src/scripts/canvasjs.min';

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
  cjsChart: any;
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
    console.log(`useNVD3 is ${this.useNVD3}`);
    this.chart = ChartFactory.createChart({type: chartInfo.value, xField: this.xField, yField: this.yField, height: this.height,
                                                     width: this.width, sizeField: this.sizeField, library:  chartInfo.info.library});
    this.formattedData = this.chart.formatData(this.data);
    this.options = this.chart.createOptions();
    this.chart.onElementClick.subscribe((sender, e) => {
      this.elementClick.emit(e);
    });

    if (chartInfo.info.library === 'cjs') {
      if (this.cjsChart) {
        this.cjsChart.options = this.options;
      } else {
        this.cjsChart = new CanvasJS.Chart('chartContainer', this.options);
      }
      this.cjsChart.render();
      this.setCanvasDisplay(false);
    } else {
      this.setCanvasDisplay(true);
    }
  }

  setCanvasDisplay(isHidden: boolean)  {
    if (this.chartContainer) {
      const cjs = this.chartContainer.nativeElement.querySelector('.canvasjs-chart-container');
      if (cjs) {
        cjs.style.display = isHidden ? 'none' : 'block';
      }
    }
  }

}
