/** 店舗種別 */
export type StoreType = 'host' | 'cabaret';

/** 計算結果（お酒本数・15L/6L/3Lのみ） */
export interface BottleCounts {
  bottle15L: number;
  bottle6L: number;
  bottle3L: number;
}

/** 計算結果全体 */
export interface CalculationResult {
  /** 酒仕入代予算 */
  liquorBudget: number;
  /** タワー平均金額（酒仕入代予算の50％） */
  towerBudget: number;
  /** 月間想定費用（酒 + タワー台） */
  eventBudget: number;
  /** サービス可能グラス数 */
  serviceableGlasses: number;
  /** 必要本数 */
  bottleCounts: BottleCounts;
  /** 使用仕入総額 */
  usedBudget: number;
  /** 残予算 */
  remainingBudget: number;
  /** 予算との差（コストカット額） */
  savedAmount: number;
}

/** 入力フォーム用 */
export interface FormInput {
  storeType: StoreType;
  monthlySalesTarget: number;
}
