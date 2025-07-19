import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  Coins, 
  Send, 
  Plus, 
  Link, 
  MessageSquare, 
  Activity,
  TrendingUp,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { HederaWalletService, AccountData } from '@/lib/hedera';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TransferHbar } from './TransferHbar';
import { CreateToken } from './CreateToken';
import { AssociateToken } from './AssociateToken';
import { TransferToken } from './TransferToken';
import { CreateTopic } from './CreateTopic';
import { SendMessage } from './SendMessage';

interface DashboardProps {
  walletService: HederaWalletService;
}

export const Dashboard = ({ walletService }: DashboardProps) => {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  const loadAccountData = async () => {
    try {
      setIsLoading(true);
      const data = await walletService.getAccountInfo();
      setAccountData(data);
      setLastUpdated(new Date());
    } catch (error) {
      toast({
        title: 'Error loading account data',
        description: `${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccountData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAccountData, 30000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: text,
    });
  };

  const formatHbar = (hbar: string) => {
    const num = parseFloat(hbar);
    return num.toFixed(8);
  };

  const formatTokenBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance) / Math.pow(10, decimals);
    return num.toFixed(decimals);
  };

  if (isLoading && !accountData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="card-gradient">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse w-24 mb-2"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Account Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Hedera Wallet Dashboard</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          onClick={loadAccountData} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
          className="hover:bg-primary/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-gradient hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account ID</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountData?.accountId}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(accountData?.accountId || '')}
              className="text-xs text-muted-foreground hover:text-primary p-0 h-auto"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy ID
            </Button>
          </CardContent>
        </Card>

        <Card className="card-gradient hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HBAR Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {accountData ? formatHbar(accountData.balance) : '0'} ℏ
            </div>
            <p className="text-xs text-muted-foreground">
              Hedera Network
            </p>
          </CardContent>
        </Card>

        <Card className="card-gradient hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountData?.tokens.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Associated Tokens
            </p>
          </CardContent>
        </Card>

        <Card className="card-gradient hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              Online
            </div>
            <p className="text-xs text-muted-foreground">
              Hedera Testnet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7 bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="associate">Associate</TabsTrigger>
          <TabsTrigger value="token-transfer">Send Token</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Account Info */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {accountData?.accountInfo && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Account ID:</span>
                      <span className="text-sm font-mono">{accountData.accountId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Balance:</span>
                      <span className="text-sm font-mono">{formatHbar(accountData.balance)} ℏ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Key:</span>
                      <span className="text-sm font-mono truncate max-w-32">
                        {accountData.accountInfo.key?.toString().substring(0, 20)}...
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Token Balances */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Token Balances
                </CardTitle>
              </CardHeader>
              <CardContent>
                {accountData?.tokens.length ? (
                  <div className="space-y-3">
                    {accountData.tokens.map((token) => (
                      <div key={token.tokenId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{token.symbol}</Badge>
                            <span className="text-sm font-medium">{token.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">{token.tokenId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            {formatTokenBalance(token.balance, token.decimals)}
                          </p>
                          <p className="text-xs text-muted-foreground">{token.symbol}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No tokens associated with this account
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transfer">
          <TransferHbar walletService={walletService} onSuccess={loadAccountData} />
        </TabsContent>

        <TabsContent value="tokens">
          <CreateToken walletService={walletService} onSuccess={loadAccountData} />
        </TabsContent>

        <TabsContent value="associate">
          <AssociateToken walletService={walletService} onSuccess={loadAccountData} />
        </TabsContent>

        <TabsContent value="token-transfer">
          <TransferToken walletService={walletService} tokens={accountData?.tokens || []} onSuccess={loadAccountData} />
        </TabsContent>

        <TabsContent value="topics">
          <CreateTopic walletService={walletService} />
        </TabsContent>

        <TabsContent value="messages">
          <SendMessage walletService={walletService} />
        </TabsContent>
      </Tabs>
    </div>
  );
};