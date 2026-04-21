import {
  PURCHASE_RATES,
  COST_PER_GLASS,
  BOTTLE_PRICES,
  GLASSES_PER_BOTTLE,
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
 * - 発注合計額（自動計算）は「お酒仕入代予算」を超えない（合計 <= 予算）
 * - 本数は 15L → 6L → 3L の順で、入れられるだけ入れる（残り予算で順に割り当て）
 * - 予算16万以下は 15L を使わず、6L → 3L のみ
 */
export function calcRecommendedBottleCounts(liquorBudget: number): BottleCounts {
  const p15 = BOTTLE_PRICES.bottle15L;
  const p6 = BOTTLE_PRICES.bottle6L;
  const p3 = BOTTLE_PRICES.bottle3L;

  if (liquorBudget <= 0) return { bottle15L: 0, bottle6L: 0, bottle3L: 0 };

  const clampToBudget = (counts: BottleCounts): BottleCounts => {
    let c: BottleCounts = {
      bottle15L: Math.max(0, Math.floor(counts.bottle15L)),
      bottle6L: Math.max(0, Math.floor(counts.bottle6L)),
      bottle3L: Math.max(0, Math.floor(counts.bottle3L)),
    };
    const cost = (x: BottleCounts) => x.bottle15L * p15 + x.bottle6L * p6 + x.bottle3L * p3;
    // 予算超えしていたら、優先順を崩さないように小さいサイズから減らす
    while (cost(c) > liquorBudget && (c.bottle3L > 0 || c.bottle6L > 0 || c.bottle15L > 0)) {
      if (c.bottle3L > 0) c = { ...c, bottle3L: c.bottle3L - 1 };
      else if (c.bottle6L > 0) c = { ...c, bottle6L: c.bottle6L - 1 };
      else c = { ...c, bottle15L: c.bottle15L - 1 };
    }
    return c;
  };

  // 16万以下: 15Lは使わず 6L→3L の順で割り当て（合計 <= 予算）
  if (liquorBudget <= BUDGET_THRESHOLD_6L_3L_ONLY) {
    const bottle6L = Math.max(0, Math.floor(liquorBudget / p6));
    const remAfter6 = Math.max(0, liquorBudget - bottle6L * p6);
    const bottle3L = Math.max(0, Math.floor(remAfter6 / p3));
    return clampToBudget({ bottle15L: 0, bottle6L, bottle3L });
  }

  // 16万超: 15L→6L→3L の順で、残り予算に収まるだけ割り当て（合計 <= 予算）
  const bottle15L = Math.max(0, Math.floor(liquorBudget / p15));
  const remAfter15 = Math.max(0, liquorBudget - bottle15L * p15);
  const bottle6L = Math.max(0, Math.floor(remAfter15 / p6));
  const remAfter6 = Math.max(0, remAfter15 - bottle6L * p6);
  const bottle3L = Math.max(0, Math.floor(remAfter6 / p3));

  return clampToBudget({ bottle15L, bottle6L, bottle3L });
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
  let bottleCounts = calcRecommendedBottleCounts(liquorBudget);
  let usedBudget = calcOrderCost(bottleCounts);
  // 念のため: どんな状況でも「発注合計額 <= お酒仕入代予算」に収める
  while (usedBudget > liquorBudget && (bottleCounts.bottle3L > 0 || bottleCounts.bottle6L > 0 || bottleCounts.bottle15L > 0)) {
    if (bottleCounts.bottle3L > 0) bottleCounts = { ...bottleCounts, bottle3L: bottleCounts.bottle3L - 1 };
    else if (bottleCounts.bottle6L > 0) bottleCounts = { ...bottleCounts, bottle6L: bottleCounts.bottle6L - 1 };
    else bottleCounts = { ...bottleCounts, bottle15L: bottleCounts.bottle15L - 1 };
    usedBudget = calcOrderCost(bottleCounts);
  }
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
