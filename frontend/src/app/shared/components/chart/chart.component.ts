import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import {CumulativeLineOptions} from './options/cumulative-line-options';
import {LineOptions} from './options/line-options';
import {MultiBarOptions} from './options/multi-bar-options';
import {StackedAreaOptions} from './options/stacked-area-options';
import {PieOptions} from './options/pie-options';
import {DiscreteBarOptions} from './options/discrete-bar-options';
import {ScatterOptions} from './options/scatter-options';
import { BaseChart } from './types/base.chart';
import {StackedAreaChart} from './types/stacked-area.chart';
import {DataSummaryPackage} from '../../models/analysis-result';

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
  @Input() height: number = 300;
  @Input() width: number = 600;
  @Input() dateFormat: string;
  chartInfo: BaseChart;
  options: any;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.chartType.currentValue !== changes.chartType.previousValue) {
      this.setChartInfo(changes.chartType.currentValue);
    }
    this.chartInfo.xField = changes.xField.currentValue;
    this.chartInfo.yField = changes.yField.currentValue;
    this.chartInfo.sizeField = changes.sizeField.currentValue;
  }

  setChartInfo(chartType: string): void {
    switch (chartType) {
      case 'stackedArea':
        this.chartInfo = new StackedAreaChart(this.xField, this.yField, this.height, this.width);
        break;
    }
  }

  /*createOptions() {
    switch (this.chartType) {
      case 'cumulativeLine':
        const cumOptions = new CumulativeLineOptions();
        this.options = cumOptions.createOptions(this.dateFormat);
        break;
      case 'line':
        const lineOptions = new LineOptions();
        this.options = lineOptions.createOptions(this.dateFormat);
        break;
      case 'multiBar':
        const multiBarOptions = new MultiBarOptions();
        this.options = multiBarOptions.createOptions(this.dateFormat);
        break;
      case 'stackedArea':
        const stackedAreaOptions = new StackedAreaOptions();
        this.options = stackedAreaOptions.createOptions(this.dateFormat);
        break;
      case 'pie':
        const pieOptions = new PieOptions();
        this.options = pieOptions.createOptions();
        break;
      case 'discreteBar':
        const discreteBarOptions = new DiscreteBarOptions();
        this.options = discreteBarOptions.createOptions();
        break;
      case 'scatter':
        const scatterOptions = new ScatterOptions();
        this.options = scatterOptions.createOptions(this.dateFormat);
        break;
    }
  }*/

}
