export class VisFilter {
  yearEnabled: boolean;
  topWordsEnabled: boolean;
  bottomWordsEnabled: boolean;
  keywordsEnabled: boolean;
  categoriesEnabled: boolean;
}

export class VisFeatures {
  searchID: string;
  chartType: string;
  xField: string;
  yField: string;
  sizeField: string;
  groupField: string;
}

export class LabelValue {
  label: string;
  value: string;
  info: any;

  constructor(labelName: string, valueName: string, infoData?: any) {
    this.label = labelName;
    this.value = valueName;
    this.info = infoData;
  }
}
