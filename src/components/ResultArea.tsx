import { keyframes } from '@emotion/react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import type { CalculationResult } from '../types';
import { BOTTLE_LABELS } from '../constants';
import { calcOrderCost, calcRecommendedBottleCounts } from '../utils/calculations';
import { BudgetComparisonBar } from './BudgetComparisonBar';

const blink15 = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`;

interface ResultAreaProps {
  result: CalculationResult | null;
}

export function ResultArea({ result }: ResultAreaProps) {
  if (result === null) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography color="text.secondary" textAlign="center" py={2}>
            月間売り上げ目標を入力してデータ分析を表示します
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { liquorBudget, towerBudget, eventBudget, serviceableGlasses, bottleCounts, usedBudget } = result;

  // 念のため: どんな状態でも「発注合計額 <= お酒仕入代予算」に収めた表示にする
  const safeBottleCounts =
    usedBudget > liquorBudget ? calcRecommendedBottleCounts(liquorBudget) : bottleCounts;
  const safeUsedBudget =
    usedBudget > liquorBudget ? calcOrderCost(safeBottleCounts) : usedBudget;

  const actualCost = safeUsedBudget;
  const savedAmount = eventBudget - actualCost;
  const instagramGradient = 'linear-gradient(90deg, #f58529 0%, #dd2a7b 40%, #8134af 70%, #515bd4 100%)';
  const isNegative = savedAmount < 0;
  const serviceableFromOrder = Math.floor(safeUsedBudget / 350);

  return (
    <Card
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
          データ分析
        </Typography>

        <Box sx={{ mb: 2 }}>
          <BudgetComparisonBar eventBudget={eventBudget} actualCost={actualCost} />
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 12px)' }, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">お酒仕入代予算</Typography>
            <Typography variant="h6" fontWeight="bold">{liquorBudget.toLocaleString()}円</Typography>
          </Box>
          <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 12px)' }, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">タワー平均金額</Typography>
            <Typography variant="h6" fontWeight="bold">{towerBudget.toLocaleString()}円</Typography>
          </Box>
          <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 12px)' }, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">月間想定費用（お酒+タワー）</Typography>
            <Typography variant="h6" fontWeight="bold">{eventBudget.toLocaleString()}円</Typography>
          </Box>
          <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 12px)' }, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">お酒発注額</Typography>
            <Typography variant="h6" fontWeight="bold">{actualCost.toLocaleString()}円</Typography>
          </Box>
          <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 12px)' }, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">サービス可能グラス数</Typography>
            <Typography variant="h6" fontWeight="bold">{serviceableGlasses.toLocaleString()}グラス</Typography>
          </Box>
          <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 12px)' }, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">手残りUP</Typography>
            <Box
              sx={{
                mt: 0.5,
                px: isNegative ? 0 : 1.25,
                py: isNegative ? 0 : 0.75,
                borderRadius: isNegative ? 0 : 2,
                background: isNegative
                  ? 'transparent'
                  : 'linear-gradient(135deg, rgba(245,133,41,0.10) 0%, rgba(221,42,123,0.10) 35%, rgba(129,52,175,0.10) 70%, rgba(81,91,212,0.10) 100%)',
                border: isNegative ? 'none' : '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <Typography
                variant={isNegative ? 'body1' : 'h5'}
                fontWeight={isNegative ? 600 : 950}
                sx={
                  isNegative
                    ? {
                        color: 'text.primary',
                        opacity: 0.55,
                        letterSpacing: '-0.01em',
                      }
                    : {
                        backgroundImage: instagramGradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                      }
                }
              >
                {savedAmount.toLocaleString()}円
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }} color="text.secondary">
          お酒本数（おすすめ組み合わせ）
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ width: { xs: 'calc(50% - 4px)', sm: 'calc(33.33% - 8px)' }, minWidth: 0 }}>
            <Typography variant="body2">{BOTTLE_LABELS.bottle15L}</Typography>
            <Typography
              variant="h6"
              color="error.main"
              fontWeight="bold"
              sx={{ animation: `${blink15} 0.5s ease-in-out 7` }}
            >
              {safeBottleCounts.bottle15L}本
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>※在庫要確認</Typography>
          </Box>
          <Box sx={{ width: { xs: 'calc(50% - 4px)', sm: 'calc(33.33% - 8px)' }, minWidth: 0 }}>
            <Typography variant="body2">{BOTTLE_LABELS.bottle6L}</Typography>
            <Typography variant="h6">{safeBottleCounts.bottle6L}本</Typography>
          </Box>
          <Box sx={{ width: { xs: 'calc(50% - 4px)', sm: 'calc(33.33% - 8px)' }, minWidth: 0 }}>
            <Typography variant="body2">{BOTTLE_LABELS.bottle3L}</Typography>
            <Typography variant="h6">{safeBottleCounts.bottle3L}本</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'baseline' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">発注合計額（自動計算）</Typography>
            <Typography variant="h6" fontWeight="bold">{safeUsedBudget.toLocaleString()}円</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">サービス可能グラス数</Typography>
            <Typography variant="h6" fontWeight="bold">{serviceableFromOrder.toLocaleString()}グラス</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
