import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Loader2 } from 'lucide-react';
import { HederaWalletService } from '@/lib/hedera';
import { useToast } from '@/hooks/use-toast';

interface CreateTopicProps {
  walletService: HederaWalletService;
}

export const CreateTopic = ({ walletService }: CreateTopicProps) => {
  const [memo, setMemo] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memo) {
      toast({
        title: 'Missing memo',
        description: 'Please provide a topic description',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await walletService.createTopic(memo, isPrivate);
      
      if (result.success) {
        toast({
          title: 'Topic Created',
          description: result.message,
        });
        
        setMemo('');
        setIsPrivate(false);
      } else {
        toast({
          title: 'Topic Creation Failed',
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
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="gradient-text">Create Topic</CardTitle>
        <CardDescription>
          Create a new topic for consensus messaging
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateTopic} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="memo">Topic Memo</Label>
            <Input
              id="memo"
              placeholder="Describe your topic..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
            <Label htmlFor="private" className="text-sm">
              Private Topic
            </Label>
          </div>
          {isPrivate && (
            <p className="text-xs text-muted-foreground">
              Private topics require a submit key to send messages
            </p>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Creating...' : 'Create Topic'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};