import { useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Typography, Box } from '@mui/material';
import { InputArea } from './components/InputArea';
import { ResultArea } from './components/ResultArea';
import { MeetingSection } from './components/MeetingSection';
import { calculate } from './utils/calculations';
import type { StoreType } from './types';
import type { BottleCounts } from './types';

const theme = createTheme({
  palette: {
    primary: { main: '#8134af' },
    secondary: { main: '#dd2a7b' },
    background: { default: '#f5f7fa', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Noto Sans JP", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
});

function App() {
  const [storeType, setStoreType] = useState<StoreType>('host');
  const [monthlySalesTarget, setMonthlySalesTarget] = useState('');
  const result = useMemo(() => {
    const num = monthlySalesTarget === '' ? 0 : Number(monthlySalesTarget);
    return calculate(num, storeType);
  }, [monthlySalesTarget, storeType]);

  const [meetingLiquorBudget, setMeetingLiquorBudget] = useState('');
  const [meetingBottleCounts, setMeetingBottleCounts] = useState<BottleCounts>({
    bottle15L: 0,
    bottle6L: 0,
    bottle3L: 0,
  });
  const [meetingGlassCount, setMeetingGlassCount] = useState('');
  const [vipChecked, setVipChecked] = useState(false);

  useEffect(() => {
    if (!result) return;
    setMeetingBottleCounts(result.bottleCounts);
    setMeetingLiquorBudget('');
  }, [result?.liquorBudget, result?.bottleCounts, storeType]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          py: { xs: 2, sm: 3 },
          px: 1,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 800,
              backgroundImage:
                'linear-gradient(90deg, #f58529 0%, #dd2a7b 40%, #8134af 70%, #515bd4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            酒代・タワー見積
          </Typography>
          <Typography
            variant="caption"
            align="center"
            color="text.secondary"
            sx={{ display: 'block', mt: -1, mb: 1.5, letterSpacing: '0.08em' }}
          >
            〜 Estimate Cloud by Gotham 〜
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
            30,000件超の納品実績データに基づき、<br />
            イベント売上目標から酒仕入予算とオリシャン本数を高精度で計算します。
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <InputArea
              storeType={storeType}
              monthlySalesTarget={monthlySalesTarget}
              onStoreTypeChange={setStoreType}
              onMonthlySalesTargetChange={setMonthlySalesTarget}
            />
            <ResultArea result={result} />
            <MeetingSection
              defaultLiquorBudget={result?.liquorBudget ?? 0}
              liquorBudgetInput={meetingLiquorBudget}
              onLiquorBudgetChange={setMeetingLiquorBudget}
              bottleCounts={meetingBottleCounts}
              onBottleCountsChange={setMeetingBottleCounts}
              glassCountInput={meetingGlassCount}
              onGlassCountChange={setMeetingGlassCount}
              vipChecked={vipChecked}
              onVipChange={setVipChecked}
            />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
