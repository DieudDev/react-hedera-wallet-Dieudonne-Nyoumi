import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Loader2, Send } from 'lucide-react';
import { HederaWalletService } from '@/lib/hedera';
import { useToast } from '@/hooks/use-toast';

interface SendMessageProps {
  walletService: HederaWalletService;
}

export const SendMessage = ({ walletService }: SendMessageProps) => {
  const [topicId, setTopicId] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topicId || !message) {
      toast({
        title: 'Missing fields',
        description: 'Please provide both topic ID and message',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await walletService.sendMessage(topicId, message);
      
      if (result.success) {
        toast({
          title: 'Message Sent',
          description: `Successfully sent message to topic ${topicId}`,
        });
        
        setMessage('');
      } else {
        toast({
          title: 'Message Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Send Error',
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
        <CardTitle className="gradient-text">Send Message</CardTitle>
        <CardDescription>
          Send a message to a Hedera consensus topic
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendMessage} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topicId">Topic ID</Label>
            <Input
              id="topicId"
              placeholder="0.0.123456"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-background/50 min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Message will be stored permanently on the Hedera network
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};