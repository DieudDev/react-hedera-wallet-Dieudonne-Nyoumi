import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, Loader2 } from 'lucide-react';
import { HederaWalletService } from '@/lib/hedera';
import { useToast } from '@/hooks/use-toast';

interface AssociateTokenProps {
  walletService: HederaWalletService;
  onSuccess?: () => void;
}

export const AssociateToken = ({ walletService, onSuccess }: AssociateTokenProps) => {
  const [tokenId, setTokenId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAssociate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenId) {
      toast({
        title: 'Missing token ID',
        description: 'Please provide a valid token ID',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await walletService.associateToken(tokenId);
      
      if (result.success) {
        toast({
          title: 'Association Successful',
          description: `Successfully associated with token ${tokenId}`,
        });
        
        setTokenId('');
        onSuccess?.();
      } else {
        toast({
          title: 'Association Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Association Error',
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
          <Link className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="gradient-text">Associate Token</CardTitle>
        <CardDescription>
          Associate your account with an existing token
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAssociate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tokenId">Token ID</Label>
            <Input
              id="tokenId"
              placeholder="0.0.123456"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              You must associate your account with a token before you can receive it
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Associating...' : 'Associate Token'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};