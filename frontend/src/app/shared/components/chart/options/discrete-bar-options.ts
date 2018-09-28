import {IChartOptions} from './i-chart-options';

export class DiscreteBarOptions implements IChartOptions {
  createOptions(): any {
    const options = {
      chart: {
        type: 'discreteBarChart',
        height: 300,
        margin: {
          top: 20,
          right: 20,
          bottom: 50,
          left: 55
        },
        x: function(d) { return d.key; },
        y: function(d) { return d.value; },
        showValues: true,
        valueFormat: function(d) {
          return d3.format('0f')(d);
        },
        duration: 500,
        xAxis: {
          axisLabel: 'Category'
        },
        yAxis: {
          axisLabel: 'Reales',
          axisLabelDistance: -10
        }
      }
    };
    return options;
  }
}
