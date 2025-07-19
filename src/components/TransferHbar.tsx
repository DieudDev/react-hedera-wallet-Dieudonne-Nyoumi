import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import { HederaWalletService } from '@/lib/hedera';
import { useToast } from '@/hooks/use-toast';

interface TransferHbarProps {
  walletService: HederaWalletService;
  onSuccess?: () => void;
}

export const TransferHbar = ({ walletService, onSuccess }: TransferHbarProps) => {
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientId || !amount) {
      toast({
        title: 'Missing fields',
        description: 'Please provide recipient account ID and amount',
        variant: 'destructive',
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid positive amount',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await walletService.sendHbar(recipientId, amountNum);
      
      if (result.success) {
        toast({
          title: 'Transfer Successful',
          description: `Successfully sent ${amount} HBAR to ${recipientId}`,
        });
        
        setRecipientId('');
        setAmount('');
        onSuccess?.();
      } else {
        toast({
          title: 'Transfer Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Transfer Error',
        description: `Unexpected error: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="card-gradient max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
          <Send className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="gradient-text">Send HBAR</CardTitle>
        <CardDescription>
          Transfer HBAR to another Hedera account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Account ID</Label>
            <Input
              id="recipient"
              placeholder="0.0.123456"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (HBAR)</Label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              min="0"
              placeholder="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Sending...' : 'Send HBAR'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};