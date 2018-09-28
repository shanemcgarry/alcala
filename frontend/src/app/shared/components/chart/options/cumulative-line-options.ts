import { IChartOptions } from './i-chart-options';

export class CumulativeLineOptions implements IChartOptions {
  createOptions(dateFormat: string): any {
    const options = {
      chart: {
        type: 'cumulativeLineChart',
        height: 300,
        margin: {
          top: 20,
          right: 20,
          bottom: 50,
          left: 65
        },
        x: function(d) { return d[0]; },
        y: function(d) { return d[1] / 100; },
        average: function(d) { return d.mean; },
        color: d3.scale.category10().range(),
        duration: 300,
        useInteractiveGuideline: true,
        clipVoronoi: false,
        showLegend: false,
        xAxis: {
          axisLabel: 'X Axis',
          tickFormat: function (d) {
            return d3.time.format(dateFormat)(new Date(d));
          },
          showMaxMin: false,
          staggerLabels: true
        },
        yAxis: {
          axisLabel: 'Y Axis',
          tickFormat: function(d) {
            return d3.format('0.1%')(d);
          },
          axisLabelDistance: 0
        }
      }
    };
    return options;
  }
}
