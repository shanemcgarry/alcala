import {BaseChart} from './base.chart';
import {DataSummaryPackage} from '../../../models/analysis-result';

export class LineChart extends BaseChart {
  allowableXFields: string[] = ['time'];
  allowableYFields: string[] = ['totalAmount', 'transactionCount'];
  allowableSizeFields: string[] = [];
  allowableGroupFields: string[] = [];

  constructor(xField: string, yField: string, height: number, width: number) {
    super(xField, yField, height, width);
  }

  formatData(chartData: DataSummaryPackage): any {
    const results = [];
    chartData.data.forEach(x => {
      const timeData = [];
      x.timeSeries.forEach(y => {
        let xValue, yValue;
        switch (this.xField) {
          case 'year':
          case 'monthNum':
            xValue = this.formatTimeTicks(y.timeValue, y.timeType);
            break;
          default:
            throw new Error(`${this.xField} is not an allowable x axis value`);
        }
        switch (this.yField) {
          case 'totalAmount':
            yValue = y.totalAmount;
            break;
          case 'transactionCount':
            yValue = y.transactionCount;
            break;
          default:
            throw new Error(`${this.yField} is not an allowable y axis value`);
        }
        timeData.push({'x': xValue, 'y': yValue});
      });
      results.push({'key': x.key, 'values': timeData});
    });
    return results;
  }

  createOptions(): any {
    const self = this;
    const options = {
      chart: {
        type: 'lineChart',
        height: this.height,
        showLegend: false,
        margin: {
          top: 20,
          right: 20,
          bottom: 40,
          left: 55
        },
        x: function(d) { return d.x; },
        y: function(d) { return d.y; },
        useInteractiveGuideline: true,
        dispatch: {
          stateChange: function(e) { console.log('stateChange'); },
          changeState: function(e) { console.log('changeState'); },
          tooltipShow: function(e) { console.log('tooltipShow'); },
          tooltipHide: function(e) { console.log('tooltipHide'); },
        },
        xAxis: {
          axisLabel: this.getAxisLabel(this.xField),
          tickFormat: function (d) {
            return self.formatAxisData(self.xField, d);
          }
        },
        yAxis: {
          axisLabel: this.getAxisLabel(this.yField),
          tickFormat: function(d) {
            return self.formatAxisData(self.yField, d);
          },
          axisLabelDistance: -10
        }
      }
    };
    return options;
  }
}
