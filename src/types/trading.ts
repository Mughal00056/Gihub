export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: 'forex' | 'crypto' | 'commodities' | 'stocks';
  group: string;
  payout: number; // e.g. 92%
  change24h: number; // e.g. 0.16
  changeAmount: number;
  basePrice: number;
  currentPrice: number;
  precision: number;
  isFavorite?: boolean;
  isOpen: boolean;
  flag1: string;
  flag2?: string;
  minInvestment: number;
  maxInvestment: number;
  durations: string[];
}

export type TradeDirection = 'HIGHER' | 'LOWER';

export interface ActiveTrade {
  id: string;
  assetId: string;
  assetName: string;
  direction: TradeDirection;
  openPrice: number;
  amount: number;
  payoutRate: number; // e.g. 0.92
  expectedPayout: number;
  openTime: number;
  durationSeconds: number;
  expireTime: number;
  status: 'active' | 'won' | 'lost';
  closePrice?: number;
  actualPayout?: number;
}

export interface PendingOrder {
  id: string;
  assetId: string;
  assetName: string;
  mode: 'PRICE' | 'TIME';
  targetPrice?: number;
  targetTime?: number;
  direction: TradeDirection;
  amount: number;
  durationSeconds: number;
  status: 'pending' | 'triggered' | 'cancelled';
  createdAt: number;
}

export interface LeaderboardTrader {
  rank: number;
  name: string;
  profit: string;
  numericProfit: number;
  avatar?: string;
  tradesToday: number;
  country: string;
}

export interface DepositMethod {
  id: string;
  name: string;
  icon: string;
  tag?: string;
  isRecommended?: boolean;
  isMaintenance?: boolean;
  speed: string;
  minAmount: number;
}
