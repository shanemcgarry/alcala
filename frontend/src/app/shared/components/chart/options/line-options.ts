import {IChartOptions} from './i-chart-options';

export class LineOptions implements IChartOptions {
  createOptions(dateFormat?: string): any {
    const options = {
      chart: {
        type: 'lineChart',
        height: 300,
        showLegend: false,
        margin: {
          top: 20,
          right: 20,
          bottom: 40,
          left: 55
        },
        x: function(d) { return d[0]; },
        y: function(d) { return d[1]; },
        useInteractiveGuideline: true,
        dispatch: {
          stateChange: function(e) { console.log('stateChange'); },
          changeState: function(e) { console.log('changeState'); },
          tooltipShow: function(e) { console.log('tooltipShow'); },
          tooltipHide: function(e) { console.log('tooltipHide'); }
        },
        xAxis: {
          axisLabel: dateFormat === '%Y' ? 'Years' : 'Months',
          tickFormat: function (d) {
            return d3.time.format(dateFormat)(new Date(d));
          }
        },
        yAxis: {
          axisLabel: 'Reales',
          tickFormat: function(d) {
            return d3.format('0f')(d);
          },
          axisLabelDistance: -10
        }
      }
    };
    return options;
  }
}
