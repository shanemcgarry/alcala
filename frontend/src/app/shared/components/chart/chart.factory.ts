import { StackedAreaChart } from './types/stacked-area.chart';

export class ChartFactory {
  createChart(type: Object);
  createChart(type: 'stackedArea'): StackedAreaChart;

  public createChart(chartOptions): StackedAreaChart {
    switch (chartOptions.type) {
      case 'stackedArea':
        return new StackedAreaChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width);
      default:
        throw new Error(`${chartOptions.type} is not a valid chart option`);
    }
  }
}
