import {BaseChart} from './base.chart';
import {DataSummaryPackage} from '../../../models/analysis-result';

export class StackedAreaChart extends BaseChart {
  allowableXFields: string[] = ['time'];
  allowableYFields: string[] = ['totalAmount', 'transactionCount'];
  allowableSizeFields: string[] = [];
  allowableGroupFields: string[] = [];

  constructor(xField: string, yField: string, height: number, width: number) {
    super(xField, yField, height, width);
  }

  formatData(chartData: DataSummaryPackage): any {
    const results = [];
    const self = this;
    chartData.data.forEach(x => {
      const plot_values = [];
      x.timeSeries.forEach(y => {
        const timeDataValues = [];
        timeDataValues.push(self.formatTimeTicks(y.timeValue, y.timeType));
        switch (self.yField) {
          case 'totalAmount':
            timeDataValues.push(y.totalAmount);
            break;
          case 'transactionCount':
            timeDataValues.push(y.transactionCount);
            break;
          default:
            throw new Error(`The stacked area chart does not allow ${self.yField} for the yAxis.`);
        }
        plot_values.push(timeDataValues);
      });
      results.push({'key': x.key, 'values': plot_values});
    });
    return results;
  }

  createOptions(): any {
    const self = this;
    const options = {
      chart: {
        type: 'stackedAreaChart',
        height: this.height,
        showLegend: false,
        margin: {
          top: 20,
          right: 20,
          bottom: 40,
          left: 60
        },
        x: function(d) { return d[0]; },
        y: function(d) { return d[1]; },
        useVoronoi: false,
        clipEdge: true,
        duration: 100,
        useInteractiveGuideline: true,
        xAxis: {
          axisLabel: super.getAxisLabel(this.xField),
          showMaxMin: false,
          tickFormat: function(x) {
            return self.formatAxisData(self.xField, x);
          }
        },
        yAxis: {
          axisLabel: super.getAxisLabel(this.yField),
          tickFormat: function(y) {
            self.formatAxisData(self.yField, y);
          },
          zoom: {
            enabled: true,
            scaleExtent: [1, 10],
            useFixedDomain: false,
            useNiceScale: false,
            horizontalOff: false,
            verticalOff: true,
            unzoomEventType: 'dblclick.zoom'
          }
        }
      }
    };
    return options;
  }
}
