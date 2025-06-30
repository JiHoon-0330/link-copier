interface ActiveTargetData {
  rects: DOMRect[];
  anchorId: string;
  targetAnchor: HTMLAnchorElement;
}

export class ActiveTarget {
  private data: ActiveTargetData | null = null;

  private static instance: ActiveTarget | null = null;

  private constructor() {}

  static getInstance() {
    if (!ActiveTarget.instance) {
      ActiveTarget.instance = new ActiveTarget();
    }
    return ActiveTarget.instance;
  }

  getData() {
    return this.data;
  }

  setData(data: ActiveTargetData) {
    this.data = data;
  }

  removeData() {
    this.data = null;
  }
}
