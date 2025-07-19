import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2 } from 'lucide-react';
import { HederaWalletService, TokenBalance } from '@/lib/hedera';
import { useToast } from '@/hooks/use-toast';

interface TransferTokenProps {
  walletService: HederaWalletService;
  tokens: TokenBalance[];
  onSuccess?: () => void;
}

export const TransferToken = ({ walletService, tokens, onSuccess }: TransferTokenProps) => {
  const [recipientId, setRecipientId] = useState('');
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientId || !selectedTokenId || !amount) {
      toast({
        title: 'Missing fields',
        description: 'Please provide recipient account ID, token, and amount',
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
      const result = await walletService.sendToken(recipientId, selectedTokenId, amountNum);
      
      if (result.success) {
        const selectedToken = tokens.find(t => t.tokenId === selectedTokenId);
        toast({
          title: 'Transfer Successful',
          description: `Successfully sent ${amount} ${selectedToken?.symbol || 'tokens'} to ${recipientId}`,
        });
        
        setRecipientId('');
        setSelectedTokenId('');
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

  if (tokens.length === 0) {
    return (
      <Card className="card-gradient max-w-md mx-auto">
        <CardContent className="text-center py-12">
          <Send className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Tokens Available</h3>
          <p className="text-muted-foreground">
            You need to associate with tokens before you can send them.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-gradient max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
          <Send className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="gradient-text">Send Token</CardTitle>
        <CardDescription>
          Transfer tokens to another Hedera account
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
            <Label htmlFor="token">Token</Label>
            <Select value={selectedTokenId} onValueChange={setSelectedTokenId}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select a token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.tokenId} value={token.tokenId}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{token.symbol}</span>
                      <span className="text-muted-foreground text-sm">
                        Balance: {(parseFloat(token.balance) / Math.pow(10, token.decimals)).toFixed(token.decimals)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="10"
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
            {isLoading ? 'Sending...' : 'Send Token'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};