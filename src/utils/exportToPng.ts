import { toPng } from 'html-to-image';

/**
 * 結果表示エリアをPNGで保存する
 * ファイル名: tower-estimate-MMDD-HHmm.png
 */
export async function exportResultToPng(element: HTMLElement): Promise<void> {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const filename = `tower-estimate-${mm}${dd}-${hh}${min}.png`;

  const dataUrl = await toPng(element, {
    quality: 1,
    pixelRatio: 2,
    backgroundColor: '#fff',
    cacheBust: true,
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
