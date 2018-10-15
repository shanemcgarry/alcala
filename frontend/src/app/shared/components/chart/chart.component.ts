import {Component, OnInit, OnChanges, Input, Output, EventEmitter} from '@angular/core';
import { BaseChart } from './types/base.chart';
import {DataSummaryPackage} from '../../models/analysis-result';
import {ChartFactory} from './chart.factory';

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
  @Output() elementDbClick = new EventEmitter<any>();
  chartInfo: BaseChart;
  formattedData: any;
  options: any;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.setChartInfo(this.chartType);
  }

  setChartInfo(chartType: string): void {
    this.chartInfo = ChartFactory.createChart({type: chartType, xField: this.xField, yField: this.yField, height: this.height,
                                                     width: this.width, sizeField: this.sizeField});
    this.options = this.chartInfo.createOptions();
    this.formattedData = this.chartInfo.formatData(this.data);
    this.chartInfo.onElementDblClick.subscribe((sender, e) => {
      this.elementDbClick.emit(e);
    });
  }

}
