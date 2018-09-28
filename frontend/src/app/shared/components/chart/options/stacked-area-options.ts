import {IChartOptions} from './i-chart-options';

export class StackedAreaOptions implements IChartOptions {
  createOptions(dateFormat?: string): any {
    const options = {
      chart: {
        type: 'stackedAreaChart',
        height: 300,
        showLegend: false,
        margin: {
          top: 20,
          right: 20,
          bottom: 40,
          left: 60
        },
        x: function(d) { return d[0]; },
        y: function(d) { return d[1]; },
        useVoronoi: false,
        clipEdge: true,
        duration: 100,
        useInteractiveGuideline: true,
        xAxis: {
          axisLabel: dateFormat === '%Y' ? 'Years' : 'Months',
          showMaxMin: false,
          tickFormat: function(d) {
            return d3.time.format(dateFormat)(new Date(d));
          }
        },
        yAxis: {
          axisLabel: 'Reales',
          tickFormat: function(d) {
            return d3.format('0f')(d);
          },
          zoom: {
            enabled: true,
            scaleExtent: [1, 10],
            useFixedDomain: false,
            useNiceScale: false,
            horizontalOff: false,
            verticalOff: true,
            unzoomEventType: 'dblclick.zoom'
          }
        }
      }
    };
    return options;
  }
}
