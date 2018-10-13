export class VisFilter {
  yearEnabled: boolean;
  topWordsEnabled: boolean;
  bottomWordsEnabled: boolean;
  keywordsEnabled: boolean;
  categoriesEnabled: boolean;
}

export class VisFeatures {
  graphType: string;
  xField: string;
  yField: string;
  sizeField: string;
}

export class LabelValue {
  label: string;
  value: string;

  constructor(labelName: string, valueName: string) {
    this.label = labelName;
    this.value = valueName;
  }
}
