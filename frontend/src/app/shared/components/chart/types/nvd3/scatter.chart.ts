import {BaseChart} from '../base.chart';
import {DataSummaryPackage, TimeSeriesData} from '../../../../models/analysis-result';

export class NVD3ScatterChart extends BaseChart {
  allowableXFields: string[] = ['totalAmount', 'transactionCount'];
  allowableYFields: string[] = ['totalAmount', 'transactionCount'];
  allowableSizeFields: string[] = ['totalAmount', 'transactionCount'];
  allowableGroupFields: string[] = [];

  constructor(xField: string, yField: string, height: number, width: number, sizeField: string) {
    super(xField, yField, height, width, undefined, sizeField);
  }

  formatData(chartData: DataSummaryPackage): any {
    const results = [];
    const sizeTotals = this.calculateSizeTotals(chartData);
    chartData.data.forEach(x => {
      const plot_data = [];
      x.timeSeries.forEach(y => {
        plot_data.push({'x': this.calculateX(y), 'y': this.calculateY(y), 'size': this.calculateSize(sizeTotals, x.key, y)});
      });
      results.push({'key': x.key, 'values': plot_data});
    });
    return results;
  }

  createOptions(): any {
    const self = this;
    const options = {
      chart: {
        type: 'scatterChart',
        height: this.height,
        width: this.width,
        scatter: {
          onlyCircles: false
        },
        showDistX: true,
        showDistY: true,
      },
      duration: 350,
      xAxis: {
        axisLabel: this.getAxisLabel(this.xField),
        tickFormat: function(d) {
          return self.formatAxisData(self.xField, d);
        }
      },
      yAxis: {
        axisLabel: this.getAxisLabel(this.yField),
        tickFormat: function(d) {
          return self.formatAxisData(self.yField, d);
        },
        axisLabelDistance: -5
      },
      zoom: {
        enabled: true,
        scaleExtent: [1, 10],
        useFixedDomain: false,
        useNiceScale: false,
        horizontalOff: false,
        verticalOff: false,
        unzoomEventType: 'dblclick.zoom'
      }
    };
    return options;
  }

  formatAxisData(axis: string, dataValue: any) {
    switch (axis) {
      case 'year':
      case 'monthNum':
        return dataValue;
      case 'totalAmount':
        return d3.format('0f')(dataValue);
      case 'transactionCount':
        return d3.format('d')(dataValue);
      default:
        return d3.format('')(dataValue);
    }
  }

  private calculateSizeTotals(chartData: DataSummaryPackage): any[] {
    const results = [];
    chartData.data.forEach(x =>  {
      let totalAmount = 0, transactionCount = 0;
      x.timeSeries.forEach(y => {
        totalAmount += y.totalAmount;
        transactionCount += y.transactionCount;
      });
      results.push({'key': x.key, 'totalAmount': totalAmount, 'transactionCount': transactionCount});
    });
    return results;
  }

  private calculateX(d: TimeSeriesData): number {
    let x;
    switch (this.xField) {
      case 'year':
      case 'monthNum':
        x = d.timeValue;
        break;
      case 'totalAmount':
        x = d.totalAmount;
        break;
      case 'transactionCount':
        x = d.transactionCount;
        break;
      default:
        throw new Error(`${this.xField} is not an allowable field for the x-axis`);
    }
    return x;
  }

  private calculateY(d: TimeSeriesData): number {
    let y;
    switch (this.yField) {
      case 'year':
      case 'monthNum':
        y = this.formatTimeTicks(d.timeValue, d.timeType);
        break;
      case 'totalAmount':
        y = d.totalAmount;
        break;
      case 'transactionCount':
        y = d.transactionCount;
        break;
      default:
        throw new Error(`${this.yField} is not an allowable field for the y-axis`);
    }
    return y;
  }

  private calculateSize(sizeTotals: any[], key: string,  d: TimeSeriesData): number {
    let size;
    const timeSeriesTotal = sizeTotals.find(x => x.key === key);
    switch (this.sizeField) {
      case 'totalAmount':
        size = d.totalAmount / timeSeriesTotal.totalAmount;
        break;
      case 'transactionCount':
        size = d.transactionCount / timeSeriesTotal.transactionCount;
        break;
      default:
        throw new Error(`${this.sizeField} is not an allowable size field.`);
    }
    return size;
  }
}
