import type { StoreType } from '../types';

/** 仕入率（固定） */
export const PURCHASE_RATES: Record<StoreType, number> = {
  host: 0.08,
  // 参照表の数値（1,000,000 → 166,667）に合わせる: 1/6 ≒ 16.666...%
  cabaret: 1 / 6,
} as const;

/** 1グラスあたり原価目安（円）※店舗種別ごと（参照表に合わせて350円） */
export const COST_PER_GLASS: Record<StoreType, number> = {
  host: 350,
  cabaret: 350,
} as const;

/** オリシャン単価（円）通常 */
export const BOTTLE_PRICES = {
  bottle3L: 18900,
  bottle6L: 51100,
  bottle15L: 157500,
} as const;

/** オリシャン単価（円）VIP（酒代予算20万以上で選択可） */
export const BOTTLE_PRICES_VIP = {
  bottle3L: 14800,
  bottle6L: 39800,
  bottle15L: 98000,
} as const;

/** VIP価格を表示する酒代予算の閾値（円） */
export const VIP_BUDGET_THRESHOLD = 200000;

/** 追加グラス単価（円） */
export const EXTRA_GLASS_PRICE = 150;

/** 1本あたりグラス数（50ml/グラス想定） */
export const GLASSES_PER_BOTTLE = {
  bottle15L: 300,
  bottle6L: 120,
  bottle3L: 60,
} as const;

/** サイズ表示ラベル（15L/6L/3Lのみ） */
export const BOTTLE_LABELS = {
  bottle15L: '15L',
  bottle6L: '6L',
  bottle3L: '3L',
} as const;

/** 店舗種別表示名 */
export const STORE_TYPE_LABELS: Record<StoreType, string> = {
  host: 'ホストさん',
  cabaret: 'キャバクラさん',
};
