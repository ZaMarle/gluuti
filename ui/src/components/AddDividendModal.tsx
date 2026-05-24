import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Stack, Typography, FormHelperText,
} from '@mui/material';
import type { Asset } from '../types';

interface FormValues {
  assetId: string;
  date: string;
  amount: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  assets: Asset[];
  onAdd: (div: Omit<import('../types').Dividend, 'id'>) => void;
}

export function AddDividendModal({ open, onClose, assets, onAdd }: Props) {
  const { control, handleSubmit, reset, register, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      assetId: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
    },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = (data: FormValues) => {
    onAdd({ assetId: data.assetId, date: data.date, amount: parseFloat(data.amount) });
    onClose();
  };

  if (assets.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#2f2f2f', border: '1px solid #404040' } }}>
        <DialogTitle>Add Dividend</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#8e8ea0', py: 1 }}>
            Add a transaction first to create an asset before recording dividends.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ color: '#8e8ea0', textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: '#2f2f2f', border: '1px solid #404040' } }}>
      <DialogTitle sx={{ pb: 1 }}>Add Dividend</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>

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
                  </Select>
                  {errors.assetId && <FormHelperText>{errors.assetId.message}</FormHelperText>}
                </FormControl>
              )}
            />

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

            <TextField
              label="Amount received ($)"
              type="number"
              size="small"
              fullWidth
              inputProps={{ min: 0, step: 'any' }}
              error={!!errors.amount}
              helperText={errors.amount?.message}
              {...register('amount', {
                required: 'Required',
                validate: v => parseFloat(v) > 0 || 'Must be > 0',
              })}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ color: '#8e8ea0', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ bgcolor: '#10a37f', '&:hover': { bgcolor: '#0d8f6f' }, textTransform: 'none', fontWeight: 600 }}
          >
            Add Dividend
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
