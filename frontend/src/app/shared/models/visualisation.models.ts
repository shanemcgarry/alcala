export class VisFilter {
  yearEnabled: boolean;
  topWordsEnabled: boolean;
  bottomWordsEnabled: boolean;
  keywordsEnabled: boolean;
  categoriesEnabled: boolean;
}

export class VisFeatures {
  searchID: string;
  graphType: string;
  xField: string;
  yField: string;
  sizeField: string;
  groupField: string;
}

export class LabelValue {
  label: string;
  value: string;

  constructor(labelName: string, valueName: string) {
    this.label = labelName;
    this.value = valueName;
  }
}
