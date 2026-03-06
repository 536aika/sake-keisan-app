import {
  PURCHASE_RATES,
  COST_PER_GLASS,
  BOTTLE_PRICES,
  GLASSES_PER_BOTTLE,
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
 * - 15L・6L・3L のみ（750ml含まず）
 * - グラス数は考慮しない（酒仕入代予算ベース）
 * - 「酒仕入代予算と同額、または“ちょい上”」になるように
 * - 超過額が最小になる組み合わせ（同超過なら 15L→6L→3L を優先）
 */
export function calcRecommendedBottleCounts(liquorBudget: number): BottleCounts {
  const p15 = BOTTLE_PRICES.bottle15L;
  const p6 = BOTTLE_PRICES.bottle6L;
  const p3 = BOTTLE_PRICES.bottle3L;

  // 探索範囲（予算ベースで上限 + 余裕）
  const max15 = Math.ceil(liquorBudget / p15) + 2;
  const max6 = Math.ceil(liquorBudget / p6) + 4;

  let best: BottleCounts | null = null;
  let bestOver = Number.POSITIVE_INFINITY;

  for (let bottle15L = max15; bottle15L >= 0; bottle15L--) {
    for (let bottle6L = max6; bottle6L >= 0; bottle6L--) {
      const baseCost = bottle15L * p15 + bottle6L * p6;
      const remaining = Math.max(0, liquorBudget - baseCost);
      const bottle3L = Math.ceil(remaining / p3); // 予算到達に必要な最小3L

      const candidate: BottleCounts = { bottle15L, bottle6L, bottle3L };
      const cost = baseCost + bottle3L * p3;
      if (cost < liquorBudget) continue; // 念のため

      const over = cost - liquorBudget;

      if (over < bestOver) {
        best = candidate;
        bestOver = over;
        continue;
      }

      if (over === bestOver && best) {
        // 同超過なら大きいサイズを優先（15L多い→6L多い→3L少ない）
        if (
          bottle15L > best.bottle15L ||
          (bottle15L === best.bottle15L && bottle6L > best.bottle6L) ||
          (bottle15L === best.bottle15L &&
            bottle6L === best.bottle6L &&
            bottle3L < best.bottle3L)
        ) {
          best = candidate;
        }
      }
    }
  }

  // 保険：予算が極端に小さい場合でも最低1本は出す
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
  // オリシャン発注で「タワー台が浮く」前提の比較: (酒+タワー) と 実費(オリシャン発注額)
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
