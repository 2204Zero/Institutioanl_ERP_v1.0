import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useRecordPayment, formatCurrency, parseAmount, type StudentFee, type Receipt } from '../hooks/queries/useFinance';
import { formatLocalDate } from '../lib/utils';

const paymentRequestSchema = z.object({
  amount: z.string().min(1, 'Payment amount must be greater than zero'),
  paymentMethod: z.enum(['CASH', 'CHEQUE', 'BANK_TRANSFER', 'ONLINE', 'UPI', 'DD']),
  referenceNumber: z.string().optional(),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof paymentRequestSchema>;

interface RecordPaymentDialogProps {
  fee: StudentFee;
  trigger?: React.ReactNode;
  onSuccess?: (receipt: Receipt) => void;
}

export function RecordPaymentDialog({ fee, trigger, onSuccess }: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<Receipt | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => crypto.randomUUID());
  const recordPaymentMutation = useRecordPayment();

  const outstanding = parseAmount(fee.outstandingAmount);

  const form = useForm<FormValues, any, FormValues>({
    resolver: zodResolver(paymentRequestSchema),
    defaultValues: {
      amount: outstanding > 0 ? String(outstanding) : '',
      paymentMethod: 'ONLINE',
      referenceNumber: '',
      remarks: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const receipt = await recordPaymentMutation.mutateAsync({
        studentFeeId: fee.id,
        payment: {
          amount: Number(values.amount),
          paymentDate: formatLocalDate(),
          paymentMethod: values.paymentMethod,
          referenceNumber: values.referenceNumber?.trim() || undefined,
          remarks: values.remarks?.trim() || undefined,
          idempotencyKey,
        },
      });

      setCompletedReceipt(receipt);
      toast.success(`Payment recorded successfully! Receipt: ${receipt.receiptNumber}`);
      onSuccess?.(receipt);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to record payment';
      toast.error(msg);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCompletedReceipt(null);
    setIdempotencyKey(crypto.randomUUID());
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 px-2 font-semibold border-slate-300 hover:bg-slate-50"
            disabled={outstanding <= 0}
          >
            <CreditCard className="w-3.5 h-3.5 mr-1" />
            Record Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        {completedReceipt ? (
          <div className="space-y-4 py-2">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-2" />
              <h3 className="text-lg font-bold text-slate-900">Payment Processed</h3>
              <p className="text-xs text-slate-500">Official Institutional Fee Receipt</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Receipt Number</span>
                <span className="font-mono font-bold text-slate-900">{completedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Payment ID</span>
                <span className="font-mono text-slate-900">{completedReceipt.paymentId || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Amount Paid</span>
                <span className="font-bold text-emerald-700">{formatCurrency(completedReceipt.amount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Method</span>
                <span className="font-semibold text-slate-800">{completedReceipt.paymentMethod}</span>
              </div>
              {completedReceipt.referenceNumber && (
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Reference No.</span>
                  <span className="font-mono text-slate-700">{completedReceipt.referenceNumber}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="font-bold text-emerald-600">{completedReceipt.status}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleClose} size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-lg font-bold text-slate-900">
                <CreditCard className="w-5 h-5 mr-2 text-slate-700" />
                Record Fee Payment
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Record a collection against Fee Record #{fee.id}. Current balance: {formatCurrency(outstanding)}.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <FormField<FormValues>
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          max={outstanding}
                          className="text-sm bg-slate-50 border-slate-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />

                <FormField<FormValues>
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Payment Method</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="text-sm bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ONLINE">Online Portal / Gateway</SelectItem>
                          <SelectItem value="UPI">UPI / QR Code</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Direct Bank Transfer / NEFT</SelectItem>
                          <SelectItem value="CASH">Cash Counter</SelectItem>
                          <SelectItem value="CHEQUE">Bank Cheque</SelectItem>
                          <SelectItem value="DD">Demand Draft</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />

                <FormField<FormValues>
                  control={form.control}
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Transaction Reference / UTR</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. TXN98721456"
                          className="text-sm bg-slate-50 border-slate-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />

                <FormField<FormValues>
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Remarks (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Term fee installment"
                          className="text-sm bg-slate-50 border-slate-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />

                <div className="pt-2 flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClose}
                    disabled={recordPaymentMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                    disabled={recordPaymentMutation.isPending}
                  >
                    {recordPaymentMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    )}
                    {recordPaymentMutation.isPending ? 'Processing...' : 'Confirm Payment'}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
