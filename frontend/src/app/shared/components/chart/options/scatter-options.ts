import {IChartOptions} from './i-chart-options';

export class ScatterOptions implements IChartOptions {
  createOptions(dateFormat: string): any {
    const options = {
      chart: {
        type: 'scatterChart',
        height: 300,
        color: d3.scale.categoryData().range(),
        scatter: {
          onlyCircles: false
        },
        showDistX: true,
        showDistY: true,
      },
      duration: 350,
      xAxis: {
        axisLabel: dateFormat === '%Y' ? 'Years' : 'Months',
        tickFormat: function(d) {
          return d3.time.format(dateFormat)(new Date(d));
        }
      },
      yAxis: {
        axisLabel: 'Total Reales',
        tickFormat: function(d) {
          return d3.format('0f')(d);
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
}
