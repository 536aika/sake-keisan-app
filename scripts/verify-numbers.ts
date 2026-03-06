/**
 * 参照表との一致確認用スクリプト
 * 実行: npx tsx scripts/verify-numbers.ts
 */
import { calculate } from '../src/utils/calculations';

console.log('=== ホスト様（8%）参照表との照合 ===\n');
console.log('月間売上(円) | 酒仕入代(8%) | タワー予算(50%) | サービス可能グラス数(350円/グラス)');
console.log('-------------|--------------|-----------------|-------------------------------------');

const hostSales = [1_000_000, 2_000_000, 5_000_000, 10_000_000, 30_000_000];
for (const sales of hostSales) {
  const r = calculate(sales, 'host');
  if (r) {
    const expectedLiquor = sales * 0.08;
    const expectedTower = Math.floor(expectedLiquor * 0.5);
    const expectedGlasses = Math.round(expectedLiquor / 350);
    console.log(
      `${String(sales / 1_000_000).padStart(10)}万 | ${String(r.liquorBudget).padStart(10)} | ${String(r.towerBudget).padStart(13)} | ${String(r.serviceableGlasses).padStart(35)}`
    );
  }
}

console.log('\n参照表の期待値（ホスト）:');
console.log('  100万 → 酒仕入代 80,000, タワー予算 40,000, グラス数 229');
console.log('  560万 → 酒仕入代 448,000, タワー予算 224,000, グラス数 1,600');

const r1 = calculate(1_000_000, 'host');
const r56 = calculate(5_600_000, 'host');
if (r1) console.log('\nアプリ計算（100万）:', { 酒仕入代: r1.liquorBudget, タワー予算: r1.towerBudget, グラス数: r1.serviceableGlasses });
if (r56) console.log('アプリ計算（560万）:', { 酒仕入代: r56.liquorBudget, タワー予算: r56.towerBudget, グラス数: r56.serviceableGlasses });

console.log('\n=== キャバクラ様（16%）===');
const cabaretSales = [1_000_000, 10_000_000];
for (const sales of cabaretSales) {
  const r = calculate(sales, 'cabaret');
  if (r) {
    console.log(`月間売上 ${sales / 1_000_000}万 → 酒仕入代 ${r.liquorBudget.toLocaleString()}円, グラス数 ${r.serviceableGlasses}`);
  }
}
console.log('参照: 100万×16%=160,000円 → 160,000/350 ≒ 457グラス（四捨五入）\n');
