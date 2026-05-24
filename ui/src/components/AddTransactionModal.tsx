import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Stack, Typography, Box, FormHelperText,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import type { Asset, TransactionType } from '../types';

interface FormValues {
  assetId: string;
  newTicker: string;
  type: TransactionType;
  date: string;
  quantity: string;
  pricePerUnit: string;
  fees: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  assets: Asset[];
  onAdd: (tx: Omit<import('../types').Transaction, 'id'>) => void;
  onCreateAsset: (ticker: string, name: string) => Asset;
}

export function AddTransactionModal({ open, onClose, assets, onAdd, onCreateAsset }: Props) {
  const noAssets = assets.length === 0;

  const { control, handleSubmit, watch, reset, register, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      assetId: '',
      newTicker: '',
      type: 'buy',
      date: new Date().toISOString().split('T')[0],
      quantity: '',
      pricePerUnit: '',
      fees: '0',
    },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const isNewMode = watch('assetId') === '__new__' || noAssets;
  const quantity = watch('quantity');
  const price = watch('pricePerUnit');
  const type = watch('type');

  const total =
    quantity && price && !isNaN(parseFloat(quantity)) && !isNaN(parseFloat(price))
      ? (parseFloat(quantity) * parseFloat(price)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : null;

  const onSubmit = (data: FormValues) => {
    let finalAssetId = data.assetId;

    if (isNewMode) {
      if (!data.newTicker.trim()) return;
      const asset = onCreateAsset(data.newTicker, '');
      finalAssetId = asset.id;
    }

    onAdd({
      assetId: finalAssetId,
      type: data.type,
      date: data.date,
      quantity: parseFloat(data.quantity),
      pricePerUnit: parseFloat(data.pricePerUnit),
      fees: parseFloat(data.fees) || 0,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: '#2f2f2f', border: '1px solid #404040' } }}>
      <DialogTitle sx={{ pb: 1 }}>Add Transaction</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>

            {/* Buy / Sell toggle */}
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup
                  value={field.value}
                  exclusive
                  onChange={(_, v) => v && field.onChange(v)}
                  fullWidth
                  size="small"
                >
                  <ToggleButton value="buy" sx={{ fontWeight: 700, '&.Mui-selected': { color: '#22c55e', borderColor: '#22c55e', bgcolor: 'rgba(34,197,94,0.1)' } }}>
                    Buy
                  </ToggleButton>
                  <ToggleButton value="sell" sx={{ fontWeight: 700, '&.Mui-selected': { color: '#ef4444', borderColor: '#ef4444', bgcolor: 'rgba(239,68,68,0.1)' } }}>
                    Sell
                  </ToggleButton>
                </ToggleButtonGroup>
              )}
            />

            {/* Asset selector */}
            {!noAssets ? (
              <Controller
                name="assetId"
                control={control}
                rules={{ required: 'Select an asset' }}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.assetId}>
                    <InputLabel>Asset</InputLabel>
                    <Select {...field} label="Asset">
                      {assets.map(a => (
                        <MenuItem key={a.id} value={a.id}>
                          <strong>{a.ticker}</strong>
                          {a.name && (
                            <Typography component="span" variant="body2" sx={{ color: '#8e8ea0', ml: 1 }}>
                              {a.name}
                            </Typography>
                          )}
                        </MenuItem>
                      ))}
                      <MenuItem value="__new__" sx={{ color: '#10a37f', fontWeight: 600 }}>
                        + New asset
                      </MenuItem>
                    </Select>
                    {errors.assetId && <FormHelperText>{errors.assetId.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            ) : null}

            {/* Ticker input for new asset */}
            {isNewMode && (
              <TextField
                label="Ticker"
                size="small"
                autoFocus={noAssets}
                placeholder="e.g. AAPL"
                error={!!errors.newTicker}
                helperText={errors.newTicker?.message}
                {...register('newTicker', { required: 'Ticker is required' })}
              />
            )}

            {/* Date */}
            <TextField
              label="Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.date}
              helperText={errors.date?.message}
              {...register('date', { required: 'Date is required' })}
            />

            {/* Quantity + Price */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Quantity"
                type="number"
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 'any' }}
                error={!!errors.quantity}
                helperText={errors.quantity?.message}
                {...register('quantity', {
                  required: 'Required',
                  validate: v => parseFloat(v) > 0 || 'Must be > 0',
                })}
              />
              <TextField
                label="Price per share"
                type="number"
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 'any' }}
                error={!!errors.pricePerUnit}
                helperText={errors.pricePerUnit?.message}
                {...register('pricePerUnit', {
                  required: 'Required',
                  validate: v => parseFloat(v) > 0 || 'Must be > 0',
                })}
              />
            </Stack>

            {/* Fees */}
            <TextField
              label="Fees"
              type="number"
              size="small"
              fullWidth
              inputProps={{ min: 0, step: 'any' }}
              {...register('fees')}
            />

            {/* Total preview */}
            {total && (
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 1, px: 2, py: 1 }}>
                <Typography variant="body2" sx={{ color: '#8e8ea0' }}>
                  Total: <strong style={{ color: '#ececec' }}>${total}</strong>
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ color: '#8e8ea0', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ bgcolor: type === 'buy' ? '#10a37f' : '#ef4444', '&:hover': { bgcolor: type === 'buy' ? '#0d8f6f' : '#dc2626' }, textTransform: 'none', fontWeight: 600 }}
          >
            {type === 'buy' ? 'Buy' : 'Sell'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
