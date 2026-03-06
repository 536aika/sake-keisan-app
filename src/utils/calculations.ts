import {
  PURCHASE_RATES,
  COST_PER_GLASS,
  BOTTLE_PRICES,
  GLASSES_PER_BOTTLE,
  MAX_RECOMMEND_OVER,
  BUDGET_THRESHOLD_6L_3L_ONLY,
} from '../constants';
import { BOTTLE_PRICES_VIP } from '../constants';
import type { StoreType } from '../types';
import type { BottleCounts, CalculationResult } from '../types';

/**
 * 酒仕入代予算 = 月間売上目標 × 仕入率
 */
function calcLiquorBudget(monthlySalesTarget: number, storeType: StoreType): number {
  // 参照表の端数（例: 1,000,000×(1/6)=166,666.66… → 166,667）に合わせて四捨五入
  return Math.round(monthlySalesTarget * PURCHASE_RATES[storeType]);
}

/**
 * サービス可能グラス数 = 酒仕入代予算 ÷ 1グラスあたり原価目安（四捨五入・参照表に合わせる）
 */
function calcServiceableGlasses(liquorBudget: number, storeType: StoreType): number {
  const costPerGlass = COST_PER_GLASS[storeType];
  if (costPerGlass <= 0) return 0;
  return Math.round(liquorBudget / costPerGlass);
}

/**
 * おすすめ本数（自動）:
 * - 予算を5万以上超えない（超過は5万未満）
 * - 予算16万以下: 6Lと3Lのみで組み合わせ
 * - それ以外: 15Lを優先して組み合わせ
 */
export function calcRecommendedBottleCounts(liquorBudget: number): BottleCounts {
  const p15 = BOTTLE_PRICES.bottle15L;
  const p6 = BOTTLE_PRICES.bottle6L;
  const p3 = BOTTLE_PRICES.bottle3L;

  const max6 = Math.ceil(liquorBudget / p6);
  const underBudget = (cost: number) => cost >= liquorBudget;
  const withinOver = (over: number) => over < MAX_RECOMMEND_OVER;

  if (liquorBudget <= BUDGET_THRESHOLD_6L_3L_ONLY) {
    // 16万以下: 15L=0、6Lと3Lのみ。超過5万未満のうち超過最小、同点なら6L多め→3L少なめ
    let best: BottleCounts | null = null;
    let bestOver = Number.POSITIVE_INFINITY;
    for (let bottle6L = max6; bottle6L >= 0; bottle6L--) {
      const remaining = liquorBudget - bottle6L * p6;
      const bottle3L = remaining <= 0 ? 0 : Math.ceil(remaining / p3);
      const cost = bottle6L * p6 + bottle3L * p3;
      if (!underBudget(cost)) continue;
      const over = cost - liquorBudget;
      if (!withinOver(over)) continue;
      if (best === null || over < bestOver || (over === bestOver && bottle6L > best!.bottle6L)) {
        best = { bottle15L: 0, bottle6L, bottle3L };
        bestOver = over;
      }
    }
    if (best) return best;
    const bottle3L = Math.max(1, Math.ceil(liquorBudget / p3));
    return { bottle15L: 0, bottle6L: 0, bottle3L };
  }

  // 16万超: 15L優先。超過5万未満に収まる組み合わせのうち 15L多め→6L多め→超過少なめ→3L少なめ
  const max15 = Math.ceil(liquorBudget / p15);
  let best: BottleCounts | null = null;
  let bestOver = Number.POSITIVE_INFINITY;

  const isBetter = (
    c: BottleCounts,
    over: number,
    b: BottleCounts | null,
    bOver: number
  ): boolean => {
    if (b === null) return true;
    if (c.bottle15L !== b.bottle15L) return c.bottle15L > b.bottle15L;
    if (c.bottle6L !== b.bottle6L) return c.bottle6L > b.bottle6L;
    if (over !== bOver) return over < bOver;
    return c.bottle3L < b.bottle3L;
  };

  for (let bottle15L = max15; bottle15L >= 0; bottle15L--) {
    for (let bottle6L = max6; bottle6L >= 0; bottle6L--) {
      const baseCost = bottle15L * p15 + bottle6L * p6;
      const remaining = liquorBudget - baseCost;
      const bottle3L = remaining <= 0 ? 0 : Math.ceil(remaining / p3);
      const cost = baseCost + bottle3L * p3;
      if (!underBudget(cost)) continue;
      const over = cost - liquorBudget;
      if (!withinOver(over)) continue;
      if (isBetter({ bottle15L, bottle6L, bottle3L }, over, best, bestOver)) {
        best = { bottle15L, bottle6L, bottle3L };
        bestOver = over;
      }
    }
  }

  if (!best) {
    const bottle3L = Math.max(1, Math.ceil(liquorBudget / p3));
    return { bottle15L: 0, bottle6L: 0, bottle3L };
  }
  return best;
}

/**
 * 発注本数から賄えるグラス数を計算
 */
export function calcGlassesFromCounts(counts: BottleCounts): number {
  return (
    counts.bottle15L * GLASSES_PER_BOTTLE.bottle15L +
    counts.bottle6L * GLASSES_PER_BOTTLE.bottle6L +
    counts.bottle3L * GLASSES_PER_BOTTLE.bottle3L
  );
}

/**
 * 発注合計額（通常価格）
 */
export function calcOrderCost(counts: BottleCounts): number {
  return (
    counts.bottle15L * BOTTLE_PRICES.bottle15L +
    counts.bottle6L * BOTTLE_PRICES.bottle6L +
    counts.bottle3L * BOTTLE_PRICES.bottle3L
  );
}

/**
 * 発注合計額（VIP価格 or 通常価格）
 */
export function calcOrderCostWithVip(counts: BottleCounts, vip: boolean): number {
  const p = vip ? BOTTLE_PRICES_VIP : BOTTLE_PRICES;
  return (
    counts.bottle15L * p.bottle15L +
    counts.bottle6L * p.bottle6L +
    counts.bottle3L * p.bottle3L
  );
}

/**
 * 総容量（L）。15L×本数 + 6L×本数 + 3L×本数
 */
export function calcTotalCapacityL(counts: BottleCounts): number {
  return counts.bottle15L * 15 + counts.bottle6L * 6 + counts.bottle3L * 3;
}

/**
 * 一括計算
 */
export function calculate(
  monthlySalesTarget: number,
  storeType: StoreType
): CalculationResult | null {
  if (monthlySalesTarget <= 0) return null;

  const liquorBudget = calcLiquorBudget(monthlySalesTarget, storeType);
  // タワー台（参照表: 酒仕入代の50%）
  // キャバクラ(1/6)のように循環小数だと「酒仕入代を丸めてから半分」を取るとズレやすいので、
  // 売上から直接「(仕入率×0.5)」で四捨五入して表の数値に揃える。
  const towerBudget = Math.round(monthlySalesTarget * PURCHASE_RATES[storeType] * 0.5);
  const eventBudget = liquorBudget + towerBudget; // 酒 + タワー台 = イベント想定費用
  const serviceableGlasses = calcServiceableGlasses(liquorBudget, storeType);
  const bottleCounts = calcRecommendedBottleCounts(liquorBudget);
  const usedBudget = calcOrderCost(bottleCounts);
  // お酒発注で「タワー台が浮く」前提の比較: (酒+タワー) と 実費(お酒発注額)
  const remainingBudget = eventBudget - usedBudget;
  const savedAmount = remainingBudget;

  return {
    liquorBudget,
    towerBudget,
    eventBudget,
    serviceableGlasses,
    bottleCounts,
    usedBudget,
    remainingBudget,
    savedAmount,
  };
}
