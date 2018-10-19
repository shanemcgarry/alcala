import {BaseChart} from '../base.chart';
import {DataSummaryPackage} from '../../../../models/analysis-result';

export class CJSDiscreteBarChart extends BaseChart {
  allowableXFields: string[] = ['time', 'key'];
  allowableYFields: string[] = ['totalAmount', 'transactionCount'];
  allowableSizeFields: string[] = [];
  allowableGroupFields: string[] = [];
  formatedData: any[];

  constructor(xField: string, yField: string, height: number, width: number) {
    super(xField, yField, height, width);
  }

  formatData(chartData: DataSummaryPackage): any[] {
    const results = [];
    switch (this.xField) {
      case 'category':
      case 'word':
        chartData.data.forEach(x => {
          let yValue = 0.0;
          x.timeSeries.forEach(y => {
            switch (this.yField) {
              case 'totalAmount':
                yValue += y.totalAmount;
                break;
              case 'transactionCount':
                yValue += y.transactionCount;
                break;
              default:
                throw new Error(`${this.yField} is not an allowable value for the y-axis`);
            }
          });
          results.push({'y': yValue, 'label': x.key});
        });
        break;
      case 'year':
      case 'monthNum':
        chartData.data.forEach(x => {
          x.timeSeries.forEach(y => {
            let yValue = 0.0;
            switch (this.yField) {
              case 'totalAmount':
                yValue = y.totalAmount;
                break;
              case 'transactionCount':
                yValue = y.transactionCount;
                break;
              default:
                throw new Error(`${this.yField} is not an allowable value for the y-axis`);
            }
            const labelElem = results.find(l => l.label === y.timeValue);
            if (!labelElem) {
              results.push({'y': yValue, 'label': y.timeValue});
            } else {
              labelElem.y += yValue;
            }
          });
        });
        break;
      default:
        throw new Error(`${this.xField} is not an allowable value for the x-axis`);
    }
    this.formatedData = results;
    return results;
  }

  createOptions(): any {
    const options = {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: `Accounts by ${this.xField}`
      },
      data: [{
        type: 'column',
        dataPoints: this.formatedData
      }]
    };
    return options;
  }
}
