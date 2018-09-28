import {IChartOptions} from './i-chart-options';

export class MultiBarOptions implements IChartOptions {
  createOptions(dateFormat?: string) {
    const options = {
      chart: {
        type: 'multiBarChart',
        height: 300,
        showLegend: false,
        margin: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 60
        },
        x: function(d) { return d[0]; },
        y: function(d) { return d[1]; },
        clipEdge: true,
        duration: 500,
        stacked: true,
        xAxis: {
          axisLabel: dateFormat === '%Y' ? 'Years' : 'Months',
          axisLabelDistance: 10,
          tickFormat: function (d) {
            return d3.time.format(dateFormat)(new Date(d));
          },
          showMaxMin: false,
          staggerLabels: true
        },
        yAxis: {
          axisLabel: 'Reales',
          tickFormat: function(d) {
            return d3.format('0f')(d);
          }
        }
      }
    };
    return options;
  }
}
