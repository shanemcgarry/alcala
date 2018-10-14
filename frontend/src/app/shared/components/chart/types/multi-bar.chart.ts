import { BaseChart } from './base.chart';
import {DataSummaryPackage} from '../../../models/analysis-result';

export class MultiBarChart extends BaseChart {
  allowableXFields: string[] = ['time', 'key'];
  allowableYFields: string[] = ['totalAmount', 'transactionCount'];
  allowableSizeFields: string[] = [];
  allowableGroupFields: string[] = ['time', 'key'];

  constructor(xField: string, yField: string, height: number, width: number, groupField: string) {
    super(xField, yField, height, width, groupField);
}

  formatData(chartData: DataSummaryPackage): any {
    switch (this.groupField) {
      case 'key':
        return this.formatDataForKey(chartData);
      default:
        throw new Error(`${this.groupField} is not an allowable group option.`);
    }
  }

  private formatDataForKey(chartData: DataSummaryPackage): any {
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
            throw new Error(`${this.xField} is not an allowable field for the x axis`);
        }
        switch (this.yField) {
          case 'totalAmount':
            yValue = y.totalAmount;
            break;
          case 'transactionCount':
            yValue = y.transactionCount;
            break;
          default:
            throw new Error(`${this.yField} is not an allowable field for the y axis`);
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
        type: 'multiBarChart',
        height: this.height,
        showLegend: false,
        margin: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 60
        },
        callback: function(chart) {
          chart.multibar.dispatch.on('elementClick', function(e) {
            self.selectedData = e;
            self._onElementDblClick.dispatch(self, e);
          });
        },
        x: function(d) { return d.x; },
        y: function(d) { return d.y; },
        clipEdge: true,
        duration: 500,
        stacked: true,
        xAxis: {
          axisLabel: this.getAxisLabel(this.xField),
          axisLabelDistance: 10,
          tickFormat: function (d) {
            return self.formatAxisData(self.xField, d);
          },
          showMaxMin: false,
          staggerLabels: true
        },
        yAxis: {
          axisLabel: this.getAxisLabel(this.yField),
          tickFormat: function(d) {
            return self.formatAxisData(self.yField, d);
          }
        }
      }
    };
    return options;
  }
}
