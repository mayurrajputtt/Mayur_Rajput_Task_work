export interface PythonFile {
  name: string;
  path: string;
  language: string;
  content: string;
}

export interface OrderInput {
  symbol: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  quantity: string;
  price: string;
}

export interface OrderResponse {
  orderId: number | string;
  symbol: string;
  side: string;
  type: string;
  status: string;
  executedQty: string;
  avgPrice: string;
  origQty: string;
  price?: string;
  timeInForce?: string;
  clientOrderId?: string;
  updateTime?: number;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system' | 'header';
  text: string;
  timestamp: string;
}

export interface SimulationState {
  balance: number;
  position: {
    symbol: string;
    size: number; // Positive for long, negative for short
    entryPrice: number;
  } | null;
  orders: OrderResponse[];
}
