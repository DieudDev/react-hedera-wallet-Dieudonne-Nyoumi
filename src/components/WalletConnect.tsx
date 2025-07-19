import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Key, Network, Eye, EyeOff } from 'lucide-react';
import { HederaConfig, saveCredentials, loadCredentials } from '@/lib/hedera';
import { useToast } from '@/hooks/use-toast';

interface WalletConnectProps {
  onConnect: (config: HederaConfig) => void;
  isConnected: boolean;
}

export const WalletConnect = ({ onConnect, isConnected }: WalletConnectProps) => {
  const [accountId, setAccountId] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved credentials on mount
    const saved = loadCredentials();
    if (saved) {
      setAccountId(saved.accountId);
      setPrivateKey(saved.privateKey);
      setNetwork(saved.network);
    }
  }, []);

  const handleConnect = async () => {
    if (!accountId || !privateKey) {
      toast({
        title: 'Missing credentials',
        description: 'Please provide both Account ID and Private Key',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const config: HederaConfig = { accountId, privateKey, network };
      
      // Save credentials
      saveCredentials(config);
      
      // Connect to wallet
      onConnect(config);

      toast({
        title: 'Wallet Connected',
        description: `Successfully connected to Hedera ${network}`,
      });
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: `Failed to connect to wallet: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return (
      <Card className="card-gradient animate-fade-in">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center animate-glow">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="gradient-text">Wallet Connected</CardTitle>
          <CardDescription>
            Connected to {network} network
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Account: {accountId}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-gradient animate-fade-in max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="gradient-text">Connect to Hedera</CardTitle>
        <CardDescription>
          Enter your Hedera account credentials to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="network" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Network
          </Label>
          <Select value={network} onValueChange={(value: 'testnet' | 'mainnet') => setNetwork(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="testnet">Testnet</SelectItem>
              <SelectItem value="mainnet">Mainnet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountId" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Account ID
          </Label>
          <Input
            id="accountId"
            placeholder="0.0.123456"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="privateKey" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Private Key
          </Label>
          <div className="relative">
            <Input
              id="privateKey"
              type={showPrivateKey ? 'text' : 'password'}
              placeholder="302e020100300506032b657004220420..."
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="bg-background/50 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
            >
              {showPrivateKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Button 
          onClick={handleConnect} 
          disabled={isLoading}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          <p>Your credentials are stored locally and never shared.</p>
          <p>Use testnet for development and testing.</p>
        </div>
      </CardContent>
    </Card>
  );
};