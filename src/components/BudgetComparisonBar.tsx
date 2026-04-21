import { Box, Typography } from '@mui/material';

interface BudgetComparisonBarProps {
  eventBudget: number;
  actualCost: number;
  maskAmount?: boolean;
}

export function BudgetComparisonBar({ eventBudget, actualCost, maskAmount }: BudgetComparisonBarProps) {
  const isUnderBudget = actualCost <= eventBudget;
  const ratio = eventBudget > 0 ? Math.min(actualCost / eventBudget, 1) : 0;
  const percent = Math.round(ratio * 100);
  const saved = eventBudget - actualCost;
  const isNegative = saved < 0;

  const instagramGradient = 'linear-gradient(90deg, #f58529 0%, #dd2a7b 40%, #8134af 70%, #515bd4 100%)';
  const gradientTextSx = {
    backgroundImage: instagramGradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as const;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {isUnderBudget ? '予算内に収まりました' : '予算超過'}
        </Typography>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary">
            {isUnderBudget ? 'カット' : '超過'}
          </Typography>
          <Typography
            variant={isNegative ? 'body1' : 'h6'}
            fontWeight={isNegative ? 700 : 900}
            sx={
              isUnderBudget
                ? gradientTextSx
                : { color: 'text.primary', opacity: 0.55 }
            }
          >
            {maskAmount ? '' : (isUnderBudget ? `${saved.toLocaleString()}円` : `${Math.abs(saved).toLocaleString()}円`)}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          height: 14,
          borderRadius: 999,
          bgcolor: 'grey.200',
          overflow: 'hidden',
          position: 'relative',
          border: isUnderBudget ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(211,47,47,0.35)',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${percent}%`,
            backgroundImage: isUnderBudget ? instagramGradient : 'linear-gradient(90deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.35) 100%)',
            transition: 'width 180ms ease-out',
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          実費（お酒） {actualCost.toLocaleString()}円
        </Typography>
        <Typography variant="caption" color="text.secondary">
          イベント想定費用（お酒+タワー） {eventBudget.toLocaleString()}円 ({percent}%)
        </Typography>
      </Box>
    </Box>
  );
}
