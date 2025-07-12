import { DerivConnection } from '@/services/deriv/DerivConnection';
import { DerivTrading } from '@/services/deriv/DerivTrading';
import type { NextApiRequest, NextApiResponse } from 'next';

interface TradeRequestBody {
  token: string;
  symbol: string;
  trade_type: 'CALL' | 'PUT' | 'MATCH' | 'DIFFER';
  amount: number;
  duration: number;
  duration_unit: 't' | 's' | 'm' | 'h' | 'd';
}

interface TradeResponse {
  success: boolean;
  trade_id?: string;
  message?: string;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<TradeResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { token, symbol, trade_type, amount, duration, duration_unit } = req.body as TradeRequestBody;

  // Validate request body
  if (!token || !symbol || !trade_type || !amount || !duration || !duration_unit) {
    return res.status(400).json({ success: false, error: 'Missing required parameters' });
  }

  try {
    // Initialize Deriv connection
    const derivConnection = new DerivConnection();
    const config = {
      app_id: process.env.DERIV_APP_ID || '1089', // Default to sandbox app_id
      token,
      sandbox: process.env.NODE_ENV !== 'production',
    };

    const connected = await derivConnection.connect(config);
    if (!connected) {
      return res.status(500).json({ success: false, error: 'Failed to connect to Deriv API' });
    }

    // Initialize trading service
    const derivTrading = new DerivTrading(derivConnection);

    // Execute trade
    const tradeResult = await derivTrading.executeTrade({
      symbol,
      trade_type,
      amount,
      duration,
      duration_unit,
    });

    // Respond with success
    res.status(200).json({
      success: true,
      trade_id: tradeResult.contract_id,
      message: 'Trade executed successfully',
    });
  } catch (error: any) {
    console.error('Trade execution error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to execute trade: ${error.message || 'Unknown error'}`,
    });
  } finally {
    // Clean up WebSocket connection if necessary
    if (derivConnection) {
      await derivConnection.disconnect();
    }
  }
}
