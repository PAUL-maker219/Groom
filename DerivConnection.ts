import { BrokerConfig, DerivAccountInfo } from '../types/BrokerTypes';

export class DerivConnection {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private accountInfo: DerivAccountInfo | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  async connect(config: BrokerConfig): Promise<boolean> {
    try {
      const wsUrl = config.sandbox
        ? 'wss://ws.binaryws.com/websockets/v3?app_id=1089'
        : 'wss://ws.binaryws.com/websockets/v3?app_id=1089';

      this.ws = new WebSocket(wsUrl);

      return new Promise((resolve) => {
        if (!this.ws) {
          console.error('WebSocket initialization failed');
          resolve(false);
          return;
        }

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.ws?.send(JSON.stringify({ authorize: config.token }));
          console.log('Connected to Deriv WebSocket');
          resolve(true);
        };

        this.ws.onerror = () => {
          this.isConnected = false;
          console.error('WebSocket error');
          resolve(false);
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.authorize) {
            this.accountInfo = {
              balance: data.authorize.balance,
              currency: data.authorize.currency,
              email: data.authorize.email,
              loginid: data.authorize.loginid,
              country: data.authorize.country,
            };
          }
        };
      });
    } catch (error) {
      console.error('Deriv connection error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.isConnected = false;
      this.ws = null;
    }
  }

  getAccountInfo(): DerivAccountInfo | null {
    return this.accountInfo;
  }

  async getAvailableSymbols(): Promise<string[]> {
    return ['R_10', 'R_25', 'R_50', 'R_75', 'R_100']; // Mock for simplicity
  }
}