import {BaseChart} from '../base.chart';
import {DataSummaryPackage, TimeSeriesData} from '../../../../models/analysis-result';

export class HCJSDiscreteBar extends BaseChart {
  allowableXFields: string[] = ['time', 'key'];
  allowableYFields: string[] = ['totalAmount', 'transactionCount'];
  allowableSizeFields: string[] = [];
  allowableGroupFields: string[] = [];
  formattedData: any[];
  origData: DataSummaryPackage;

  constructor(xField: string, yField: string, height: number, width: number) {
    super(xField, yField, height, width);
  }

  formatData(chartData: DataSummaryPackage): any[] {
    this.origData = chartData;
    const results = [];
    switch (this.xField ) {
      case 'category':
      case 'word':
        chartData.data.forEach(x => {
          const timeData = [];
          x.timeSeries.forEach( y => {
            timeData.push(this.getYValue(y));
          });
          results.push({name: x.key, data: timeData});
        });
        break;
      case 'year':
      case 'monthNum':
        const xAxis = this.getXAxisValues();
        chartData.data.forEach(x => {
          x.timeSeries.forEach(y => {
            const timeObj = results.find(t => t.name === y.timeValue);
            if (!timeObj) {
              results.push({name: y.timeValue, data: [this.getYValue(y)]});
            } else {
              const yPoint = xAxis.findIndex(yp => yp === x.key);
              if (yPoint < timeObj.data.length) {
                timeObj.data[yPoint] += this.getYValue(y);
              } else {
                timeObj.data.push(this.getYValue(y));
              }
            }
          });
        });
        break;
    }
    this.formattedData = results;
    return results;
  }

  createOptions(): any {
    const options = {
      chart: {
        type: 'column'
      },
      title: {
        text: `Accounts by ${this.xField}`
      },
      xAxis: {
        categories: this.getXAxisValues(),
        crosshair: true
      },
      yAxis: {
        min: 0,
        title: {
          text: this.getAxisLabel(this.yField)
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      series: this.formattedData
    };
    return options;
  }

  private getYValue(timeData: TimeSeriesData): number {
    switch(this.yField) {
      case 'transactionCount':
        return timeData.transactionCount;
      case 'totalAmount':
        return timeData.totalAmount;
      default:
        throw new Error(`${this.yField} is not a valid field for the y-axis.`);
    }
  }

  private getXAxisValues(): any[] {
    let results = [];
    switch (this.xField) {
      case 'year':
        results = [1774, 1775, 1776, 1777, 1778, 1779, 1781];
        break;
      case 'monthNum':
        results = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        break;
      case 'category':
      case 'word':
        this.origData.data.forEach(x => {
          results.push(x.key);
        });
        break;
    }
    return results;
  }
}
