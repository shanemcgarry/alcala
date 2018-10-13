import {LabelValue} from '../../models/visualisation.models';
import { StackedAreaChart } from './types/stacked-area.chart';
import { DiscreteBarChart } from './types/discrete-bar.chart';
import { PieChart } from './types/pie.chart';
import { MultiBarChart } from './types/multi-bar.chart';
import {LineChart} from './types/line.chart';

export class ChartFactory {
  static getAllowableCharts(): LabelValue[];
  static getAllowableCharts(): LabelValue[] {
    const results: LabelValue[] = [];
    results.push(new LabelValue('Stacked Area Chart', 'stackedArea'));
    results.push(new LabelValue('Discrete Bar Chart', 'discreteBar'));
    results.push(new LabelValue('Pie Chart', 'pie'));
    results.push(new LabelValue('MultiBar Chart', 'multiBar'));
    results.push(new LabelValue('Line Chart', 'line'));
    return results.sort((a, b): number => {
      if (a.value < b.value) { return -1; }
      if (a.value > b.value) { return 1; }
      return 0;
    });
  }

  static createChart(type: Object);
  static createChart(type: 'stackedArea'): StackedAreaChart;
  static createChart(type: 'discreteBar'): DiscreteBarChart;
  static createChart(type: 'pie'): PieChart;
  static createChart(type: 'multiBar'): MultiBarChart;
  static createChart(type: 'line'): LineChart;

  static createChart(chartOptions): StackedAreaChart | DiscreteBarChart | PieChart | MultiBarChart {
    switch (chartOptions.type) {
      case 'stackedArea':
        return new StackedAreaChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width);
      case 'discreteBar':
        return new DiscreteBarChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width);
      case 'pie':
        return new PieChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width);
      case 'multiBar':
        return new MultiBarChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width, 'key');
      case 'line':
        return new LineChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width);
      default:
        throw new Error(`${chartOptions.type} is not a valid chart option`);
    }
  }
}
