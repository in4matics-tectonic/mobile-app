// Registry: category → avatar. A category without its own art uses the placeholder (M7 draws the rest).
// Adding a category: create its folder, add a line here, and map it in categories.ts.

import type { CategoryId } from '../types';
import { Airport, AIRPORT_TOP } from './airport/Airport';
import { Bank, BANK_TOP } from './bank/Bank';
import { Bench, BENCH_TOP } from './bench/Bench';
import { BikeStation, bikeStationTop } from './bike-station/BikeStation';
import { Business, BUSINESS_FLAG, BUSINESS_TOP } from './business/Business';
import { Car, CAR_TOP } from './car/Car';
import { CarShare, CAR_SHARE_TOP } from './car-share/CarShare';
import { CoinTree, COIN_TREE_TOP } from './coin-tree/CoinTree';
import { Energy, ENERGY_TOP } from './energy/Energy';
import { EstateAgency, ESTATE_AGENCY_FLAG, ESTATE_AGENCY_TOP } from './estate-agency/EstateAgency';
import { House, HOUSE_TOP } from './house/House';
import { Household, HOUSEHOLD_TOP } from './household/Household';
import { Island, ISLAND_TOP } from './island/Island';
import { Placeholder, placeholderHeight, placeholderTop } from './placeholder/Placeholder';
import { Shop, SHOP_FLAG, shopTop } from './shop/Shop';
import { StockExchange, STOCK_EXCHANGE_FLAG, stockExchangeTop } from './stock-exchange/StockExchange';
import { TrainStation, TRAIN_STATION_FLAG, TRAIN_STATION_TOP } from './train-station/TrainStation';
import type { AvatarSpec } from './types';

type Spec = (width: number, signs: number) => AvatarSpec;

const SPECS: Partial<Record<CategoryId, Spec>> = {
  house: () => ({ Avatar: House, top: HOUSE_TOP, flag: { x: 60, y: 287 }, attachRight: true }),
  household: (w) => ({ Avatar: Household, top: HOUSEHOLD_TOP, flag: { x: w + 8, y: 420 } }),
  energy: (w) => ({ Avatar: Energy, top: ENERGY_TOP, flag: { x: w / 2 - 22, y: 420 } }),
  'coin-tree': (w) => ({ Avatar: CoinTree, top: COIN_TREE_TOP, flag: { x: w - 12, y: 420 } }),
  bench: (w) => ({ Avatar: Bench, top: BENCH_TOP, flag: { x: w - 4, y: 420 } }),
  car: (w) => ({ Avatar: Car, top: CAR_TOP, flag: { x: w / 2 - 4, y: CAR_TOP + 2 }, stickerY: CAR_TOP + 12 }),
  bank: (w) => ({ Avatar: Bank, top: BANK_TOP, flag: { x: w / 2, y: BANK_TOP + 2 } }),
  shop: (_w, signs) => ({ Avatar: Shop, top: shopTop(signs), flag: SHOP_FLAG }),
  'car-share': (w) => ({ Avatar: CarShare, top: CAR_SHARE_TOP, flag: { x: w - 8, y: 420 } }),
  'estate-agency': () => ({ Avatar: EstateAgency, top: ESTATE_AGENCY_TOP, flag: ESTATE_AGENCY_FLAG }),
  'train-station': () => ({ Avatar: TrainStation, top: TRAIN_STATION_TOP, flag: TRAIN_STATION_FLAG }),
  'stock-exchange': (_w, signs) => ({ Avatar: StockExchange, top: stockExchangeTop(signs), flag: STOCK_EXCHANGE_FLAG }),
  business: () => ({ Avatar: Business, top: BUSINESS_TOP, flag: BUSINESS_FLAG }),
  airport: () => ({ Avatar: Airport, top: AIRPORT_TOP, flag: { x: 30, y: 352 } }),
  island: (w) => ({ Avatar: Island, top: ISLAND_TOP, flag: { x: w * 0.5, y: 414 } }),
  'bike-station': (w, signs) => ({ Avatar: BikeStation, top: bikeStationTop(Math.max(1, signs)), flag: { x: w - 6, y: 420 } }),
};

export function avatarFor(id: CategoryId, width: number, signs: number): AvatarSpec {
  const spec = SPECS[id];
  if (spec) return spec(width, signs);
  // On the roof's right corner, clear of the centred sign.
  return { Avatar: Placeholder, top: placeholderTop(width, signs), flag: { x: width - 16, y: 420 - placeholderHeight(width) - 8 } };
}
