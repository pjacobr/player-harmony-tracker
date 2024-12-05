export interface BoxWhiskerData {
  name: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export interface TransformedBoxWhiskerData {
  name: string;
  min: number;
  bottomWhisker: number;
  bottomBox: number;
  topBox: number;
  topWhisker: number;
  originalData: BoxWhiskerData;
}