import {IChartOptions} from './i-chart-options';

export class PieOptions implements IChartOptions {
  createOptions(): any {
    const options = {
      chart: {
        type: 'pieChart',
        height: 300,
        x: function(d) { return d.key; },
        y: function(d) { return d3.format('0.2f')(d.value); },
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
