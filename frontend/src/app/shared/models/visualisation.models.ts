export class VisFilter {
  yearEnabled: boolean;
  topWordsEnabled: boolean;
  bottomWordsEnabled: boolean;
  keywordsEnabled: boolean;
  categoriesEnabled: boolean;

  constructor() { }
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
