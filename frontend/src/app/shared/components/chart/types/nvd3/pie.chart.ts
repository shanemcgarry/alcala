import { BaseChart } from '../base.chart';
import { DataSummaryPackage } from '../../../../models/analysis-result';


export class NVD3PieChart extends BaseChart {
  allowableXFields: string[] = ['time', 'key'];
  allowableYFields: string[] = ['totalAmount', 'transactionCount'];
  allowableSizeFields: string[] = [];
  allowableGroupFields: string[] = [];

  constructor(xField: string, yField: string, height: number, width: number) {
    super(xField, yField, height, width);
  }

  formatData(chartData: DataSummaryPackage) {
    const baseData = [];
    switch (this.xField) {
      case 'category':
      case 'word':
        chartData.data.forEach(x => {
          let valueAmount = 0.0;
          x.timeSeries.forEach(y => {
            switch (this.yField) {
              case 'totalAmount':
                valueAmount += y.totalAmount;
                break;
              case 'transactionCount':
                valueAmount += y.transactionCount;
                break;
              default:
                throw new Error(`${this.yField} is not an allowable value.`);
            }
          });
          baseData.push({'key': x.key, 'value': valueAmount});
        });
        break;
      case 'year':
      case 'monthNum':
        chartData.data.forEach(x => {
          x.timeSeries.forEach( y => {
            const timeElement = baseData.find(t => t.key === y.timeValue);
            let valueAmount = 0;
            switch (this.yField) {
              case 'totalAmount':
                valueAmount = y.totalAmount;
                break;
              case 'transactionCount':
                valueAmount = y.transactionCount;
                break;
              default:
                throw new Error(`${this.yField} is not an allowable value`);
            }
            if (timeElement) {
              timeElement.value += valueAmount;
            } else {
              baseData.push({'key': y.timeValue, 'value': valueAmount});
            }
          });
        });
        break;
    }
    return baseData;
  }
  createOptions(): any {
    const self = this;
    const options = {
      chart: {
        type: 'pieChart',
        height: this.height,
        width: this.width,
        callback: function(chart) {
          chart.pie.dispatch.on('elementClick', function(e) {
            self._onElementClick.dispatch(self, e);
          });
        },
        x: function(d) { return self.formatAxisData(self.xField, d.key); },
        y: function(d) { return self.formatAxisData(self.yField, d.value); },
        showLabels: false,
        duration: 500,
        labelThreshold: 0.01,
        labelSunbeamLayout: true,
        legend: {
          margin: {
            top: 5,
            right: 35,
            bottom: 5,
            left: 0
          }
        }
      }
    };
    return options;
  }
}
