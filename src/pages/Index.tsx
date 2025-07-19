import { useState } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { Dashboard } from '@/components/Dashboard';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { HederaWalletService, HederaConfig, clearCredentials } from '@/lib/hedera';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [walletService, setWalletService] = useState<HederaWalletService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const handleConnect = (config: HederaConfig) => {
    try {
      const service = new HederaWalletService(config);
      setWalletService(service);
      setIsConnected(true);
    } catch (error) {
      toast({
        title: 'Connection Error',
        description: `Failed to connect: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = () => {
    if (walletService) {
      walletService.disconnect();
    }
    clearCredentials();
    setWalletService(null);
    setIsConnected(false);
    toast({
      title: 'Disconnected',
      description: 'Wallet disconnected successfully',
    });
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg"></div>
                <h1 className="text-xl font-bold gradient-text">Hedera Wallet</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto py-8 px-4">
          {!isConnected ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-4">
                  Hedera Wallet Dashboard
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  A professional wallet for managing your Hedera assets, tokens, and consensus messages
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <h3 className="font-semibold">Manage Assets</h3>
                    <p className="text-sm text-muted-foreground">Send and receive HBAR and HTS tokens</p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-gradient-accent rounded-lg mx-auto flex items-center justify-center">
                      <span className="text-2xl">🏷️</span>
                    </div>
                    <h3 className="font-semibold">Create Tokens</h3>
                    <p className="text-sm text-muted-foreground">Issue new fungible tokens on Hedera</p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-lg mx-auto flex items-center justify-center">
                      <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="font-semibold">Consensus Messages</h3>
                    <p className="text-sm text-muted-foreground">Create topics and send messages</p>
                  </div>
                </div>
              </div>
              
              <WalletConnect onConnect={handleConnect} isConnected={isConnected} />
            </div>
          ) : (
            walletService && <Dashboard walletService={walletService} />
          )}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
