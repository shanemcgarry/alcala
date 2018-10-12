import { StackedAreaChart } from './types/stacked-area.chart';
import {DiscreteBarChart} from './types/discrete-bar.chart';

export class ChartFactory {
  createChart(type: Object);
  createChart(type: 'stackedArea'): StackedAreaChart;
  createChart(type: 'discreteBar'): DiscreteBarChart;

  public createChart(chartOptions): StackedAreaChart | DiscreteBarChart {
    switch (chartOptions.type) {
      case 'stackedArea':
        return new StackedAreaChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width);
      case 'discreteBar':
        return new DiscreteBarChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width);
      default:
        throw new Error(`${chartOptions.type} is not a valid chart option`);
    }
  }
}
