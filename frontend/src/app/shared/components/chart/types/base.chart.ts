import { DataSummaryPackage } from '../../../models/analysis-result';

export abstract class BaseChart {
  abstract allowableXFields: string[];
  abstract allowableYFields: string[];
  abstract allowableSizeFields: string[];
  abstract createOptions(dateFormat: string): void;
  abstract formatData(chartData: DataSummaryPackage): any;
  protected constructor(public xField: string, public yField: string, public height: number, public width: number, public sizeField?: string, ) {}

  formatAxisData(axis: string, dataValue: any) {
    switch (axis) {
      case 'year':
      case 'month':
        const timeFormat = axis === 'year' ? '%Y' :  '%m';
        return d3.time.format(timeFormat)(new Date(dataValue));
      case 'totalAmount':
        return d3.format('0f')(dataValue);
      case 'transactionCount':
        return d3.format('d')(dataValue);
      default:
        return d3.format('')(dataValue);
    }
  }

  getAxisLabel(axis: string) {
    let result = axis;
    switch (axis) {
      case 'totalAmount': result = 'Total Spent'; break;
      case 'transactionCount': result = '# of Occurrences'; break;
      case 'year': result = 'Years'; break;
      case 'month': result = 'Months'; break;
      case 'category': result = 'Categories'; break;
      case 'word': result = 'Words'; break;
    }

    return result;
  }

  formatTimeTicks(date_value: number, date_type: string): any {
    if (date_type === 'm') {
      return new Date(1781, date_value - 1, 1).getTime();
    } else if (date_type === 'y') {
      return new Date(date_value,  0, 1).getTime();
    } else {
      throw new Error(`${date_type} is not a valid date_type argument. Current valid options are 'm' and 'y'.`);
    }
  }
}
