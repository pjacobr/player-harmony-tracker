import { BoxWhiskerData, TransformedBoxWhiskerData } from "../types/chartTypes";

export const transformBoxWhiskerData = (data: BoxWhiskerData[]): TransformedBoxWhiskerData[] => {
  return data.map((item) => ({
    name: item.name,
    min: item.min,
    bottomWhisker: item.q1 - item.min,
    bottomBox: item.median - item.q1,
    topBox: item.q3 - item.median,
    topWhisker: item.max - item.q3,
    originalData: item
  }));
};