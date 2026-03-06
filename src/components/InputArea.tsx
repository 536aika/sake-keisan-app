import {
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { STORE_TYPE_LABELS } from '../constants';
import type { StoreType } from '../types';

interface InputAreaProps {
  storeType: StoreType;
  monthlySalesTarget: string;
  onStoreTypeChange: (value: StoreType) => void;
  onMonthlySalesTargetChange: (value: string) => void;
}

export function InputArea({
  storeType,
  monthlySalesTarget,
  onStoreTypeChange,
  onMonthlySalesTargetChange,
}: InputAreaProps) {
  const handleSalesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '');
    onMonthlySalesTargetChange(v);
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="text.secondary">
          入力
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 0.5 }}>
              店舗種別
            </FormLabel>
            <RadioGroup
              row
              value={storeType}
              onChange={(_, v) => onStoreTypeChange(v as StoreType)}
            >
              <FormControlLabel value="host" control={<Radio />} label={STORE_TYPE_LABELS.host} />
              <FormControlLabel value="cabaret" control={<Radio />} label={STORE_TYPE_LABELS.cabaret} />
            </RadioGroup>
          </FormControl>
          <TextField
            label="イベント売り上げ目標（円）"
            type="text"
            inputMode="numeric"
            value={monthlySalesTarget === '' ? '' : Number(monthlySalesTarget).toLocaleString()}
            onChange={handleSalesChange}
            placeholder="例: 5000000"
            fullWidth
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
