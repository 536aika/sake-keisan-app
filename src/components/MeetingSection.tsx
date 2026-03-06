import { useRef, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DownloadIcon from '@mui/icons-material/Download';
import { BOTTLE_LABELS, VIP_BUDGET_THRESHOLD, EXTRA_GLASS_PRICE } from '../constants';
import type { BottleCounts } from '../types';
import { calcOrderCostWithVip, calcTotalCapacityL, calcRecommendedBottleCounts } from '../utils/calculations';
import { exportResultToPng } from '../utils/exportToPng';

interface MeetingSectionProps {
  /** データ分析の酒仕入代予算（初期値・同期用） */
  defaultLiquorBudget: number;
  liquorBudgetInput: string;
  onLiquorBudgetChange: (value: string) => void;
  bottleCounts: BottleCounts;
  onBottleCountsChange: (next: BottleCounts) => void;
  glassCountInput: string;
  onGlassCountChange: (value: string) => void;
  vipChecked: boolean;
  onVipChange: (checked: boolean) => void;
}

function parseNonNegativeInt(v: string): number {
  const s = v.replace(/\D/g, '');
  if (s === '') return 0;
  const n = Math.floor(Number(s));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function MeetingSection({
  defaultLiquorBudget,
  liquorBudgetInput,
  onLiquorBudgetChange,
  bottleCounts,
  onBottleCountsChange,
  glassCountInput,
  onGlassCountChange,
  vipChecked,
  onVipChange,
}: MeetingSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [taxIncluded, setTaxIncluded] = useState(false);

  const liquorBudgetNum = liquorBudgetInput === '' ? defaultLiquorBudget : parseNonNegativeInt(liquorBudgetInput) || 0;
  const showVip = liquorBudgetNum >= VIP_BUDGET_THRESHOLD;
  const orderCost = calcOrderCostWithVip(bottleCounts, vipChecked && showVip);
  const serviceableGlasses = Math.floor(orderCost / 350);
  const totalCapacityL = calcTotalCapacityL(bottleCounts);
  const glassCount = parseNonNegativeInt(glassCountInput);
  const extraGlassFee = glassCount * EXTRA_GLASS_PRICE;
  const combinedTotal = orderCost + extraGlassFee;
  const baselineTowerCost = serviceableGlasses * 200;
  const extraGlassFeeWithTax = taxIncluded ? Math.round(extraGlassFee * 1.1) : extraGlassFee;
  const combinedTotalWithTax = taxIncluded ? Math.round(combinedTotal * 1.1) : combinedTotal;


  const handleLiquorBudgetBlur = () => {
    if (liquorBudgetInput === '') return;
    const num = parseNonNegativeInt(liquorBudgetInput);
    if (num > 0) onBottleCountsChange(calcRecommendedBottleCounts(num));
  };

  const handleResetRecommendation = () => {
    const num = liquorBudgetNum || defaultLiquorBudget;
    if (num > 0) onBottleCountsChange(calcRecommendedBottleCounts(num));
  };

  const handleField = (key: keyof BottleCounts) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = parseNonNegativeInt(e.target.value);
    onBottleCountsChange({ ...bottleCounts, [key]: nextVal });
  };

  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      // ボタン文言などの非表示をDOMに反映してからキャプチャする
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await exportResultToPng(cardRef.current);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card
      ref={cardRef}
      variant="outlined"
      sx={{
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          height: 4,
          backgroundImage:
            'linear-gradient(90deg, #f58529 0%, #dd2a7b 40%, #8134af 70%, #515bd4 100%)',
        },
      }}
    >
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Typography variant="h6" gutterBottom color="text.secondary">
          お打ち合わせ内容
        </Typography>

        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            お酒代（手入力）
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              type="number"
              value={liquorBudgetInput !== '' ? liquorBudgetInput : (defaultLiquorBudget > 0 ? String(defaultLiquorBudget) : '')}
              onChange={(e) => onLiquorBudgetChange(e.target.value.replace(/\D/g, ''))}
              onBlur={handleLiquorBudgetBlur}
              inputProps={{ min: 0, step: 1000 }}
              size="small"
              sx={{ width: 140 }}
            />
            <Typography component="span" variant="body2">円</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mt: 2, mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            お酒本数（おすすめ組み合わせ）
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>
            総容量 {totalCapacityL}L
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <TextField
              label={BOTTLE_LABELS.bottle15L}
              type="number"
              value={bottleCounts.bottle15L === 0 ? '' : bottleCounts.bottle15L}
              onChange={handleField('bottle15L')}
              inputProps={{ min: 0, step: 1 }}
              size="small"
              sx={{ width: 80 }}
            />
            <TextField
              label={BOTTLE_LABELS.bottle6L}
              type="number"
              value={bottleCounts.bottle6L === 0 ? '' : bottleCounts.bottle6L}
              onChange={handleField('bottle6L')}
              inputProps={{ min: 0, step: 1 }}
              size="small"
              sx={{ width: 80 }}
            />
            <TextField
              label={BOTTLE_LABELS.bottle3L}
              type="number"
              value={bottleCounts.bottle3L === 0 ? '' : bottleCounts.bottle3L}
              onChange={handleField('bottle3L')}
              inputProps={{ min: 0, step: 1 }}
              size="small"
              sx={{ width: 80 }}
            />
          </Box>
          <Button size="small" variant="text" startIcon={<RestartAltIcon />} onClick={handleResetRecommendation}>
            おすすめに戻す
          </Button>
        </Box>

        <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">発注合計額（自動計算）</Typography>
            <Typography variant="h6" fontWeight="bold">{orderCost.toLocaleString()}円</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">サービス可能グラス数</Typography>
            <Typography variant="h6" fontWeight="bold">{serviceableGlasses.toLocaleString()}グラス</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">グラス数（手入力）</Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            <TextField
              type="number"
              value={glassCountInput}
              onChange={(e) => onGlassCountChange(e.target.value.replace(/\D/g, ''))}
              inputProps={{ min: 0, step: 1 }}
              size="small"
              sx={{ width: 100 }}
            />
            <Typography variant="caption" color="text.secondary">追加グラス代</Typography>
            <Typography variant="h6" fontWeight="bold">
              {extraGlassFeeWithTax.toLocaleString()}円{taxIncluded ? '（税込）' : ''}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            普通にタワー発注するより（{baselineTowerCost.toLocaleString()}円）安くなりました！
          </Typography>
        </Box>

        {showVip && (
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={vipChecked}
                  onChange={(_, c) => onVipChange(c)}
                  color="primary"
                />
              }
              label="VIP価格"
            />
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">合計額（発注合計額＋追加グラス代）</Typography>
          <Typography variant="h6" sx={{ mt: 0.5, color: 'text.secondary' }}>
            {combinedTotalWithTax.toLocaleString()}円{taxIncluded ? '（税込）' : ''}
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={taxIncluded}
                onChange={(_, c) => setTaxIncluded(c)}
                color="primary"
              />
            }
            label="税込"
          />
        </Box>

        <Box sx={{ mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={isExporting}
            fullWidth
            sx={{
              background: 'linear-gradient(90deg, #f58529 0%, #dd2a7b 40%, #8134af 70%, #515bd4 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(90deg, #e07620 0%, #c9246a 40%, #6b2b92 70%, #4548c4 100%)',
              },
            }}
          >
            {isExporting ? '' : 'お打ち合わせ内容を保存'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
