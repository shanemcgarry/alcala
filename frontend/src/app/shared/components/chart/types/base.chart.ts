import { DataSummaryPackage } from '../../../models/analysis-result';
import { EventDispatcher } from 'strongly-typed-events';

export interface IBaseChart {
  allowableXFields: string[];
  allowableYFields: string[];
  allowableSizeFields: string[];
  allowableGroupFields: string[];
  selectedData: any[];

  formatAxisData(axis: string, dataValue: any): any;
  getAxisLabel(axis: string): string;
  formatTimeTicks(date_value: number, date_type: string): any;
  createOptions(): any;
  formatData(chartData: DataSummaryPackage): any;
}

export abstract class BaseChart implements IBaseChart {
  abstract allowableXFields: string[];
  abstract allowableYFields: string[];
  abstract allowableSizeFields: string[];
  abstract allowableGroupFields: string[];
  protected _onElementClick = new EventDispatcher<IBaseChart, any>();
  selectedData: any[] = [];

  abstract createOptions(): any;
  abstract formatData(chartData: DataSummaryPackage): any;
  get onElementClick() {
    return this._onElementClick.asEvent();
  }

  protected constructor(public xField: string, public yField: string, public height: number, public width: number, public groupField?: string, public sizeField?: string ) {}

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
        return dataValue;
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
