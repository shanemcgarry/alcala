import { LabelValue } from '../../models/visualisation.models';
import { NVD3StackedAreaChart } from './types/nvd3/stacked-area.chart';
import { NVD3DiscreteBarChart } from './types/nvd3/discrete-bar.chart';
import { NVD3PieChart } from './types/nvd3/pie.chart';
import { NVD3MultiBarChart } from './types/nvd3/multi-bar.chart';
import {NVD3LineChart} from './types/nvd3/line.chart';
import { NVD3ScatterChart } from './types/nvd3/scatter.chart';
import {CJSDiscreteBarChart} from './types/cjs/discrete-bar.chart';

export class ChartFactory {
  static getAllowableCharts(): LabelValue[];
  static getAllowableCharts(): LabelValue[] {
    const results: LabelValue[] = [];
    results.push(new LabelValue('Stacked Area Chart', 'stackedArea', {library: 'nvd3'}));
    results.push(new LabelValue('Discrete Bar Chart', 'discreteBar', {library: 'nvd3'}));
    results.push(new LabelValue('Pie Chart', 'pie', {library: 'nvd3'}));
    results.push(new LabelValue('MultiBar Chart', 'multiBar', {library: 'nvd3'}));
    results.push(new LabelValue('Line Chart', 'line', {library: 'nvd3'}));
    //results.push(new LabelValue('Discrete Bar Chart (CJS)', 'cjsDiscreteBar', {library: 'cjs'}));
    // results.push(new LabelValue('Scatter Chart', 'scatter'));
    return results.sort((a, b): number => {
      if (a.value < b.value) { return -1; }
      if (a.value > b.value) { return 1; }
      return 0;
    });
  }

  static createChart(type: Object);
  static createChart(type: 'stackedArea'): NVD3StackedAreaChart;
  static createChart(type: 'discreteBar'): NVD3DiscreteBarChart;
  static createChart(type: 'pie'): NVD3PieChart;
  static createChart(type: 'multiBar'): NVD3MultiBarChart;
  static createChart(type: 'line'): NVD3LineChart;
  static createChart(type: 'scatter'): NVD3ScatterChart;
  static createChart(type: 'cjsDiscreteBar'): CJSDiscreteBarChart;

  static createChart(chartOptions): NVD3StackedAreaChart | NVD3DiscreteBarChart | NVD3PieChart | NVD3MultiBarChart | NVD3LineChart |
                                    NVD3ScatterChart | CJSDiscreteBarChart {
    switch (chartOptions.type) {
      case 'stackedArea':
        return new NVD3StackedAreaChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width);
      case 'discreteBar':
        return new NVD3DiscreteBarChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width);
      case 'pie':
        return new NVD3PieChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width);
      case 'multiBar':
        return new NVD3MultiBarChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width, 'key');
      case 'line':
        return new NVD3LineChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width);
      case 'scatter':
        return new NVD3ScatterChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width, chartOptions.sizeField);
      case 'cjsDiscreteBar':
        return new CJSDiscreteBarChart(chartOptions.xField, chartOptions.yField, chartOptions.height, chartOptions.width);
      default:
        throw new Error(`${chartOptions.type} is not a valid chart option for the ${chartOptions.library} library`);
    }
  }
}
