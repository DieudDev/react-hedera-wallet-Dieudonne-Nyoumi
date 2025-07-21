import {
  Client,
  AccountId,
  PrivateKey,
  Hbar,
  TransferTransaction,
  AccountBalanceQuery,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenAssociateTransaction,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicInfoQuery,
  TransactionResponse,
  Status,
  AccountInfoQuery,
  TokenInfo,
  TokenInfoQuery,
  TopicInfo,
  TopicId,
  TokenId,
  AccountInfo
} from "@hashgraph/sdk";

export interface HederaConfig {
  accountId: string;
  privateKey: string;
  network: 'testnet' | 'mainnet';
}

export interface AccountData {
  accountId: string;
  balance: string;
  tokens: TokenBalance[];
  accountInfo: AccountInfo;
}

export interface TokenBalance {
  tokenId: string;
  balance: string;
  decimals: number;
  name: string;
  symbol: string;
}

export interface TransactionResult {
  success: boolean;
  transactionId: string;
  status: string;
  message: string;
  receipt?: any;
}

export interface TopicMessage {
  consensusTimestamp: string;
  message: string;
  sequenceNumber: number;
  runningHash: string;
}

export class HederaWalletService {
  private client: Client;
  private accountId: AccountId;
  private privateKey: PrivateKey;

  constructor(config: HederaConfig) {
    this.accountId = AccountId.fromString(config.accountId);
    this.privateKey = PrivateKey.fromString(config.privateKey);

    if (config.network === 'testnet') {
      this.client = Client.forTestnet();
    } else {
      this.client = Client.forMainnet();
    }

    this.client.setOperator(this.accountId, this.privateKey);
  }

  async getAccountInfo(): Promise<AccountData> {
    try {
      // Get account balance
      const balance = await new AccountBalanceQuery()
        .setAccountId(this.accountId)
        .execute(this.client);

      // Get account info
      const accountInfo = await new AccountInfoQuery()
        .setAccountId(this.accountId)
        .execute(this.client);

      // Get token balances
      const tokens: TokenBalance[] = [];
      for (const [tokenId, tokenBalance] of balance.tokens) {
        try {
          const tokenInfo = await new TokenInfoQuery()
            .setTokenId(tokenId)
            .execute(this.client);
          
          tokens.push({
            tokenId: tokenId.toString(),
            balance: tokenBalance.toString(),
            decimals: tokenInfo.decimals,
            name: tokenInfo.name,
            symbol: tokenInfo.symbol
          });
        } catch (error) {
          console.warn(`Failed to get info for token ${tokenId}:`, error);
        }
      }
      // Affichier AccountInfor dans la console sous forme JSON
      console.log('Account Info:', JSON.stringify(accountInfo, null, 2));

      return {
        accountId: this.accountId.toString(),
        balance: balance.hbars.toString(),
        tokens,
        accountInfo
      };
    } catch (error) {
      console.error('Error getting account info:', error);
      throw new Error(`Failed to get account info: ${error}`);
    }
  }

  async sendHbar(recipientId: string, amount: number): Promise<TransactionResult> {
    try {
      const transaction = new TransferTransaction()
        .addHbarTransfer(this.accountId, Hbar.fromTinybars(-amount * 100000000))
        .addHbarTransfer(recipientId, Hbar.fromTinybars(amount * 100000000))
        .freezeWith(this.client);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        success: receipt.status === Status.Success,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
        message: receipt.status === Status.Success ? 'HBAR transfer successful' : 'HBAR transfer failed',
        receipt
      };
    } catch (error) {
      console.error('Error sending HBAR:', error);
      return {
        success: false,
        transactionId: '',
        status: 'FAILED',
        message: `Failed to send HBAR: ${error}`
      };
    }
  }

  async createToken(name: string, symbol: string, initialSupply: number): Promise<TransactionResult> {
    try {
      const transaction = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setInitialSupply(initialSupply * 100)
        .setTreasuryAccountId(this.accountId)
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(this.privateKey)
        .setAdminKey(this.privateKey)
        .freezeWith(this.client);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        success: receipt.status === Status.Success,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
        message: receipt.status === Status.Success ? 
          `Token created successfully. Token ID: ${receipt.tokenId}` : 
          'Token creation failed',
        receipt
      };
    } catch (error) {
      console.error('Error creating token:', error);
      return {
        success: false,
        transactionId: '',
        status: 'FAILED',
        message: `Failed to create token: ${error}`
      };
    }
  }

  async associateToken(tokenId: string): Promise<TransactionResult> {
    try {
      const transaction = new TokenAssociateTransaction()
        .setAccountId(this.accountId)
        .setTokenIds([TokenId.fromString(tokenId)])
        .freezeWith(this.client);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        success: receipt.status === Status.Success,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
        message: receipt.status === Status.Success ? 
          'Token association successful' : 
          'Token association failed',
        receipt
      };
    } catch (error) {
      console.error('Error associating token:', error);
      return {
        success: false,
        transactionId: '',
        status: 'FAILED',
        message: `Failed to associate token: ${error}`
      };
    }
  }

  async sendToken(recipientId: string, tokenId: string, amount: number): Promise<TransactionResult> {
    try {
      const transaction = new TransferTransaction()
        .addTokenTransfer(TokenId.fromString(tokenId), this.accountId, -amount * 100)
        .addTokenTransfer(TokenId.fromString(tokenId), recipientId, amount * 100)
        .freezeWith(this.client);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        success: receipt.status === Status.Success,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
        message: receipt.status === Status.Success ? 'Token transfer successful' : 'Token transfer failed',
        receipt
      };
    } catch (error) {
      console.error('Error sending token:', error);
      return {
        success: false,
        transactionId: '',
        status: 'FAILED',
        message: `Failed to send token: ${error}`
      };
    }
  }

  async createTopic(memo: string, isPrivate: boolean = false): Promise<TransactionResult> {
    try {
      let transaction = new TopicCreateTransaction()
        .setTopicMemo(memo);

      if (!isPrivate) {
        transaction = transaction.setSubmitKey(this.privateKey);
      }

      transaction = transaction.freezeWith(this.client);
      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        success: receipt.status === Status.Success,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
        message: receipt.status === Status.Success ? 
          `Topic created successfully. Topic ID: ${receipt.topicId}` : 
          'Topic creation failed',
        receipt
      };
    } catch (error) {
      console.error('Error creating topic:', error);
      return {
        success: false,
        transactionId: '',
        status: 'FAILED',
        message: `Failed to create topic: ${error}`
      };
    }
  }

  async sendMessage(topicId: string, message: string): Promise<TransactionResult> {
    try {
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(topicId))
        .setMessage(message)
        .freezeWith(this.client);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        success: receipt.status === Status.Success,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
        message: receipt.status === Status.Success ? 'Message sent successfully' : 'Message send failed',
        receipt
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        transactionId: '',
        status: 'FAILED',
        message: `Failed to send message: ${error}`
      };
    }
  }

  async getTopicInfo(topicId: string): Promise<TopicInfo | null> {
    try {
      const topicInfo = await new TopicInfoQuery()
        .setTopicId(TopicId.fromString(topicId))
        .execute(this.client);
      return topicInfo;
    } catch (error) {
      console.error('Error getting topic info:', error);
      return null;
    }
  }

  disconnect() {
    this.client.close();
  }
}

// Storage utilities
export const saveCredentials = (config: HederaConfig) => {
  localStorage.setItem('hedera_credentials', JSON.stringify(config));
};

export const loadCredentials = (): HederaConfig | null => {
  const stored = localStorage.getItem('hedera_credentials');
  return stored ? JSON.parse(stored) : null;
};

export const clearCredentials = () => {
  localStorage.removeItem('hedera_credentials');
};