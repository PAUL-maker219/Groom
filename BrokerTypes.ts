export interface BrokerConfig {
  app_id?: string;
  token: string;
  sandbox: boolean;
}

export interface DerivAccountInfo {
  balance: number;
  currency: string;
  email: string;
  loginid: string;
  country: string;
}