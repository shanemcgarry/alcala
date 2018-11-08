import {BaseChart} from '../base.chart';
import {DataSummaryPackage} from '../../../../models/analysis-result';

export class NVD3DiscreteBarChart extends BaseChart {
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
    const dataLabel = `${this.xField.charAt(0).toUpperCase() + this.xField.slice(1)} Breakdown`;
    const results = [];
    results.push({'key': dataLabel, 'values': baseData});
    return results;
  }

  createOptions(): any {
    const self = this;
    const options = {
      chart: {
        type: 'discreteBarChart',
        height: this.height,
        width: this.width,
        margin: {
          top: 20,
          right: 20,
          bottom: 50,
          left: 55
        },
        callback: function(chart) {
          chart.discretebar.dispatch.on('elementClick', function(e) {
            self._onElementClick.dispatch(self, e);
          });
        },
        x: function(d) { return d.key; },
        y: function(d) { return d.value; },
        showValues: true,
        valueFormat: function(d) {
          return self.formatAxisData(self.yField, d);
        },
        duration: 500,
        xAxis: {
          axisLabel: this.getAxisLabel(this.xField),
          tickFormat: function(d) {
            return self.formatAxisData(self.xField, d);
          }
        },
        yAxis: {
          axisLabel: this.getAxisLabel(this.yField),
          axisLabelDistance: -10,
          tickFormat: function(d) {
            return self.formatAxisData(self.yField, d);
          }
        }
      }
    };
    return options;
  }
}
