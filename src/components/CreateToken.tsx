import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { HederaWalletService } from '@/lib/hedera';
import { useToast } from '@/hooks/use-toast';

interface CreateTokenProps {
  walletService: HederaWalletService;
  onSuccess?: () => void;
}

export const CreateToken = ({ walletService, onSuccess }: CreateTokenProps) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [initialSupply, setInitialSupply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenName || !tokenSymbol || !initialSupply) {
      toast({
        title: 'Missing fields',
        description: 'Please provide token name, symbol, and initial supply',
        variant: 'destructive',
      });
      return;
    }

    const supplyNum = parseFloat(initialSupply);
    if (isNaN(supplyNum) || supplyNum <= 0) {
      toast({
        title: 'Invalid supply',
        description: 'Please enter a valid positive initial supply',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await walletService.createToken(tokenName, tokenSymbol, supplyNum);
      
      if (result.success) {
        toast({
          title: 'Token Created',
          description: result.message,
        });
        
        setTokenName('');
        setTokenSymbol('');
        setInitialSupply('');
        onSuccess?.();
      } else {
        toast({
          title: 'Token Creation Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Creation Error',
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
          <Plus className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="gradient-text">Create Token</CardTitle>
        <CardDescription>
          Create a new fungible token on Hedera
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateToken} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tokenName">Token Name</Label>
            <Input
              id="tokenName"
              placeholder="My Awesome Token"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenSymbol">Token Symbol</Label>
            <Input
              id="tokenSymbol"
              placeholder="MAT"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
              className="bg-background/50"
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialSupply">Initial Supply</Label>
            <Input
              id="initialSupply"
              type="number"
              min="1"
              placeholder="1000"
              value={initialSupply}
              onChange={(e) => setInitialSupply(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Creating...' : 'Create Token'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};