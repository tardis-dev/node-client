import { ONE_SEC_IN_MS } from '../handy'
import { BookChange, DerivativeTicker, Liquidation, OptionSummary, BookTicker, Trade } from '../types'
import { AscendexBookChangeMapper, AscendexDerivativeTickerMapper, AscendexBookTickerMapper, AscendexTradesMapper } from './ascendex'
import {
  BinanceBookChangeMapper,
  BinanceFuturesBookChangeMapper,
  BinanceFuturesDerivativeTickerMapper,
  BinanceLiquidationsMapper,
  BinanceBookTickerMapper,
  BinanceTradesMapper
} from './binance'
import { binanceDexBookChangeMapper, binanceDexBookTickerMapper, binanceDexTradesMapper } from './binancedex'
import { BinanceOptionsBookChangeMapper, BinanceOptionsTradesMapper, BinanceOptionSummaryMapper } from './binanceoptions'
import {
  BitfinexBookChangeMapper,
  BitfinexDerivativeTickerMapper,
  BitfinexLiquidationsMapper,
  BitfinexBookTickerMapper,
  BitfinexTradesMapper
} from './bitfinex'
import { BitflyerBookChangeMapper, bitflyerBookTickerMapper, bitflyerTradesMapper } from './bitflyer'
import {
  BitmexBookChangeMapper,
  BitmexDerivativeTickerMapper,
  bitmexLiquidationsMapper,
  bitmexBookTickerMapper,
  bitmexTradesMapper
} from './bitmex'
import { BitstampBookChangeMapper, bitstampTradesMapper } from './bitstamp'
import { BybitBookChangeMapper, BybitDerivativeTickerMapper, BybitLiquidationsMapper, BybitTradesMapper } from './bybit'
import { BybitSpotBookChangeMapper, BybitSpotBookTickerMapper, BybitSpotTradesMapper } from './bybitspot'
import { CoinbaseBookChangMapper, coinbaseBookTickerMapper, coinbaseTradesMapper } from './coinbase'
import { coinflexBookChangeMapper, CoinflexDerivativeTickerMapper, coinflexTradesMapper } from './coinflex'
import { CryptoComBookChangeMapper, CryptoComBookTickerMapper, CryptoComDerivativeTickerMapper, CryptoComTradesMapper } from './cryptocom'
import {
  cryptofacilitiesBookChangeMapper,
  CryptofacilitiesDerivativeTickerMapper,
  cryptofacilitiesLiquidationsMapper,
  cryptofacilitiesBookTickerMapper,
  cryptofacilitiesTradesMapper
} from './cryptofacilities'
import { deltaBookChangeMapper, DeltaDerivativeTickerMapper, DeltaTradesMapper } from './delta'
import {
  deribitBookChangeMapper,
  DeribitDerivativeTickerMapper,
  deribitLiquidationsMapper,
  DeribitOptionSummaryMapper,
  deribitBookTickerMapper,
  deribitTradesMapper
} from './deribit'
import { DummyTradesMapper } from './dummy'
import { DydxBookChangeMapper, DydxDerivativeTickerMapper, DydxTradesMapper } from './dydx'
import { FTXBookChangeMapper, FTXDerivativeTickerMapper, FTXLiquidationsMapper, FTXBookTickerMapper, FTXTradesMapper } from './ftx'
import { GateIOBookChangeMapper, GateIOTradesMapper } from './gateio'
import {
  GateIOFuturesBookChangeMapper,
  GateIOFuturesBookTickerMapper,
  GateIOFuturesDerivativeTickerMapper,
  GateIOFuturesTradesMapper
} from './gateiofutures'
import { geminiBookChangeMapper, geminiTradesMapper } from './gemini'
import { hitBtcBookChangeMapper, hitBtcTradesMapper } from './hitbtc'
import {
  HuobiBookChangeMapper,
  HuobiDerivativeTickerMapper,
  HuobiLiquidationsMapper,
  HuobiMBPBookChangeMapper,
  HuobiOptionsSummaryMapper,
  HuobiBookTickerMapper,
  HuobiTradesMapper
} from './huobi'
import { krakenBookChangeMapper, krakenBookTickerMapper, krakenTradesMapper } from './kraken'
import { KucoinBookChangeMapper, KucoinBookTickerMapper, KucoinTradesMapper } from './kucoin'
import { Mapper } from './mapper'
import {
  OkexBookChangeMapper,
  OkexBookTickerMapper,
  OkexDerivativeTickerMapper,
  OkexLiquidationsMapper,
  OkexOptionSummaryMapper,
  OkexTradesMapper,
  OkexV5BookChangeMapper,
  OkexV5BookTickerMapper,
  OkexV5DerivativeTickerMapper,
  OkexV5LiquidationsMapper,
  OkexV5OptionSummaryMapper,
  OkexV5TradesMapper
} from './okex'
import { phemexBookChangeMapper, PhemexDerivativeTickerMapper, phemexTradesMapper } from './phemex'
import { PoloniexBookChangeMapper, PoloniexTradesMapper, PoloniexV2BookChangeMapper, PoloniexV2TradesMapper } from './poloniex'
import { SerumBookChangeMapper, SerumBookTickerMapper, SerumTradesMapper } from './serum'
import { UpbitBookChangeMapper, UpbitTradesMapper } from './upbit'

export * from './mapper'

const THREE_MINUTES_IN_MS = 3 * 60 * ONE_SEC_IN_MS

const isRealTime = (date: Date) => {
  if (process.env.__NO_REAL_TIME__) {
    return false
  }
  return date.valueOf() + THREE_MINUTES_IN_MS > new Date().valueOf()
}

const OKEX_V5_API_SWITCH_DATE = new Date('2021-12-23T00:00:00.000Z')
const OKEX_V5_TBT_BOOK_TICKER_RELEASE_DATE = new Date('2022-05-06T00:00:00.000Z')
const shouldUseOkexV5Mappers = (localTimestamp: Date) => {
  return isRealTime(localTimestamp) || localTimestamp.valueOf() >= OKEX_V5_API_SWITCH_DATE.valueOf()
}

const canUseOkexTbtBookTicker = (localTimestamp: Date) => {
  return isRealTime(localTimestamp) || localTimestamp.valueOf() >= OKEX_V5_TBT_BOOK_TICKER_RELEASE_DATE.valueOf()
}

const POLONIEX_V2_API_SWITCH_DATE = new Date('2022-08-02T00:00:00.000Z')

const shouldUsePoloniexV2Mappers = (localTimestamp: Date) => {
  return isRealTime(localTimestamp) || localTimestamp.valueOf() >= POLONIEX_V2_API_SWITCH_DATE.valueOf()
}

const shouldIgnoreBookSnapshotOverlap = (date: Date) => {
  if (process.env.IGNORE_BOOK_SNAPSHOT_OVERLAP_ERROR) {
    return true
  }

  return isRealTime(date) === false
}

const tradesMappers = {
  dummy: () => new DummyTradesMapper(),
  bitmex: () => bitmexTradesMapper,
  binance: () => new BinanceTradesMapper('binance'),
  'binance-us': () => new BinanceTradesMapper('binance-us'),
  'binance-jersey': () => new BinanceTradesMapper('binance-jersey'),
  'binance-futures': () => new BinanceTradesMapper('binance-futures'),
  'binance-delivery': () => new BinanceTradesMapper('binance-delivery'),
  'binance-dex': () => binanceDexTradesMapper,
  bitfinex: () => new BitfinexTradesMapper('bitfinex'),
  'bitfinex-derivatives': () => new BitfinexTradesMapper('bitfinex-derivatives'),
  bitflyer: () => bitflyerTradesMapper,
  bitstamp: () => bitstampTradesMapper,
  coinbase: () => coinbaseTradesMapper,
  cryptofacilities: () => cryptofacilitiesTradesMapper,
  deribit: () => deribitTradesMapper,
  ftx: () => new FTXTradesMapper('ftx'),
  'ftx-us': () => new FTXTradesMapper('ftx-us'),
  gemini: () => geminiTradesMapper,
  kraken: () => krakenTradesMapper,
  okex: (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp) ? new OkexV5TradesMapper('okex') : new OkexTradesMapper('okex', 'spot'),

  'okex-futures': (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp) ? new OkexV5TradesMapper('okex-futures') : new OkexTradesMapper('okex-futures', 'futures'),

  'okex-swap': (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp) ? new OkexV5TradesMapper('okex-swap') : new OkexTradesMapper('okex-swap', 'swap'),

  'okex-options': (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp) ? new OkexV5TradesMapper('okex-options') : new OkexTradesMapper('okex-options', 'option'),

  huobi: () => new HuobiTradesMapper('huobi'),
  'huobi-dm': () => new HuobiTradesMapper('huobi-dm'),
  'huobi-dm-swap': () => new HuobiTradesMapper('huobi-dm-swap'),
  'huobi-dm-linear-swap': () => new HuobiTradesMapper('huobi-dm-linear-swap'),
  'huobi-dm-options': () => new HuobiTradesMapper('huobi-dm-options'),
  bybit: () => new BybitTradesMapper('bybit'),
  okcoin: () => new OkexTradesMapper('okcoin', 'spot'),
  hitbtc: () => hitBtcTradesMapper,
  phemex: () => phemexTradesMapper,
  delta: (localTimestamp: Date) => new DeltaTradesMapper(localTimestamp.valueOf() >= new Date('2020-10-14').valueOf()),
  'gate-io': () => new GateIOTradesMapper('gate-io'),
  'gate-io-futures': () => new GateIOFuturesTradesMapper('gate-io-futures'),
  poloniex: (localTimestamp: Date) =>
    shouldUsePoloniexV2Mappers(localTimestamp) ? new PoloniexV2TradesMapper() : new PoloniexTradesMapper(),
  coinflex: () => coinflexTradesMapper,
  'binance-options': () => new BinanceOptionsTradesMapper(),
  upbit: () => new UpbitTradesMapper(),
  ascendex: () => new AscendexTradesMapper(),
  dydx: () => new DydxTradesMapper(),
  serum: () => new SerumTradesMapper('serum'),
  'star-atlas': () => new SerumTradesMapper('star-atlas'),
  mango: () => new SerumTradesMapper('mango'),
  'bybit-spot': () => new BybitSpotTradesMapper('bybit-spot'),
  'crypto-com': () => new CryptoComTradesMapper('crypto-com'),
  'crypto-com-derivatives': () => new CryptoComTradesMapper('crypto-com-derivatives'),
  kucoin: () => new KucoinTradesMapper('kucoin')
}

const bookChangeMappers = {
  bitmex: () => new BitmexBookChangeMapper(),
  binance: (localTimestamp: Date) => new BinanceBookChangeMapper('binance', shouldIgnoreBookSnapshotOverlap(localTimestamp)),
  'binance-us': (localTimestamp: Date) => new BinanceBookChangeMapper('binance-us', shouldIgnoreBookSnapshotOverlap(localTimestamp)),
  'binance-jersey': (localTimestamp: Date) =>
    new BinanceBookChangeMapper('binance-jersey', shouldIgnoreBookSnapshotOverlap(localTimestamp)),
  'binance-futures': (localTimestamp: Date) =>
    new BinanceFuturesBookChangeMapper('binance-futures', shouldIgnoreBookSnapshotOverlap(localTimestamp)),
  'binance-delivery': (localTimestamp: Date) =>
    new BinanceFuturesBookChangeMapper('binance-delivery', shouldIgnoreBookSnapshotOverlap(localTimestamp)),
  'binance-dex': () => binanceDexBookChangeMapper,
  bitfinex: () => new BitfinexBookChangeMapper('bitfinex'),
  'bitfinex-derivatives': () => new BitfinexBookChangeMapper('bitfinex-derivatives'),
  bitflyer: () => new BitflyerBookChangeMapper(),
  bitstamp: () => new BitstampBookChangeMapper(),
  coinbase: () => new CoinbaseBookChangMapper(),
  cryptofacilities: () => cryptofacilitiesBookChangeMapper,
  deribit: () => deribitBookChangeMapper,
  ftx: () => new FTXBookChangeMapper('ftx'),
  'ftx-us': () => new FTXBookChangeMapper('ftx-us'),
  gemini: () => geminiBookChangeMapper,
  kraken: () => krakenBookChangeMapper,
  okex: (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp)
      ? new OkexV5BookChangeMapper('okex', isRealTime(localTimestamp))
      : new OkexBookChangeMapper('okex', 'spot', localTimestamp.valueOf() >= new Date('2020-04-10').valueOf()),
  'okex-futures': (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp)
      ? new OkexV5BookChangeMapper('okex-futures', isRealTime(localTimestamp))
      : new OkexBookChangeMapper('okex-futures', 'futures', localTimestamp.valueOf() >= new Date('2019-12-05').valueOf()),

  'okex-swap': (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp)
      ? new OkexV5BookChangeMapper('okex-swap', isRealTime(localTimestamp))
      : new OkexBookChangeMapper('okex-swap', 'swap', localTimestamp.valueOf() >= new Date('2020-02-08').valueOf()),
  'okex-options': (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp)
      ? new OkexV5BookChangeMapper('okex-options', isRealTime(localTimestamp))
      : new OkexBookChangeMapper('okex-options', 'option', localTimestamp.valueOf() >= new Date('2020-02-08').valueOf()),

  huobi: (localTimestamp: Date) =>
    localTimestamp.valueOf() >= new Date('2020-07-03').valueOf()
      ? new HuobiMBPBookChangeMapper('huobi')
      : new HuobiBookChangeMapper('huobi'),

  'huobi-dm': () => new HuobiBookChangeMapper('huobi-dm'),
  'huobi-dm-swap': () => new HuobiBookChangeMapper('huobi-dm-swap'),
  'huobi-dm-linear-swap': () => new HuobiBookChangeMapper('huobi-dm-linear-swap'),
  'huobi-dm-options': () => new HuobiBookChangeMapper('huobi-dm-options'),
  'bybit-spot': () => new BybitSpotBookChangeMapper('bybit-spot'),
  bybit: () => new BybitBookChangeMapper('bybit', false),
  okcoin: (localTimestamp: Date) =>
    new OkexBookChangeMapper('okcoin', 'spot', localTimestamp.valueOf() >= new Date('2020-02-13').valueOf()),
  hitbtc: () => hitBtcBookChangeMapper,
  phemex: () => phemexBookChangeMapper,
  delta: () => deltaBookChangeMapper,
  'gate-io': () => new GateIOBookChangeMapper('gate-io'),
  'gate-io-futures': () => new GateIOFuturesBookChangeMapper('gate-io-futures'),
  poloniex: (localTimestamp: Date) =>
    shouldUsePoloniexV2Mappers(localTimestamp) ? new PoloniexV2BookChangeMapper() : new PoloniexBookChangeMapper(),
  coinflex: () => coinflexBookChangeMapper,
  'binance-options': () => new BinanceOptionsBookChangeMapper(),
  upbit: () => new UpbitBookChangeMapper(),
  ascendex: () => new AscendexBookChangeMapper(),
  dydx: () => new DydxBookChangeMapper(),
  serum: () => new SerumBookChangeMapper('serum'),
  'star-atlas': () => new SerumBookChangeMapper('star-atlas'),
  mango: () => new SerumBookChangeMapper('mango'),
  'crypto-com': () => new CryptoComBookChangeMapper('crypto-com'),
  'crypto-com-derivatives': () => new CryptoComBookChangeMapper('crypto-com-derivatives'),
  kucoin: (localTimestamp: Date) => new KucoinBookChangeMapper('kucoin', isRealTime(localTimestamp) === false)
}

const derivativeTickersMappers = {
  bitmex: () => new BitmexDerivativeTickerMapper(),
  'binance-futures': () => new BinanceFuturesDerivativeTickerMapper('binance-futures'),
  'binance-delivery': () => new BinanceFuturesDerivativeTickerMapper('binance-delivery'),
  'bitfinex-derivatives': () => new BitfinexDerivativeTickerMapper(),
  cryptofacilities: () => new CryptofacilitiesDerivativeTickerMapper(),
  deribit: () => new DeribitDerivativeTickerMapper(),
  'okex-futures': (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp)
      ? new OkexV5DerivativeTickerMapper('okex-futures')
      : new OkexDerivativeTickerMapper('okex-futures'),

  'okex-swap': (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp) ? new OkexV5DerivativeTickerMapper('okex-swap') : new OkexDerivativeTickerMapper('okex-swap'),

  bybit: () => new BybitDerivativeTickerMapper(),
  phemex: () => new PhemexDerivativeTickerMapper(),
  ftx: () => new FTXDerivativeTickerMapper('ftx'),
  delta: (localTimestamp: Date) => new DeltaDerivativeTickerMapper(localTimestamp.valueOf() >= new Date('2020-10-14').valueOf()),
  'huobi-dm': () => new HuobiDerivativeTickerMapper('huobi-dm'),
  'huobi-dm-swap': () => new HuobiDerivativeTickerMapper('huobi-dm-swap'),
  'huobi-dm-linear-swap': () => new HuobiDerivativeTickerMapper('huobi-dm-linear-swap'),
  'gate-io-futures': () => new GateIOFuturesDerivativeTickerMapper(),
  coinflex: () => new CoinflexDerivativeTickerMapper(),
  ascendex: () => new AscendexDerivativeTickerMapper(),
  dydx: () => new DydxDerivativeTickerMapper(),
  'crypto-com-derivatives': () => new CryptoComDerivativeTickerMapper('crypto-com-derivatives')
}

const optionsSummaryMappers = {
  deribit: () => new DeribitOptionSummaryMapper(),
  'okex-options': (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp) ? new OkexV5OptionSummaryMapper() : new OkexOptionSummaryMapper(),
  'binance-options': () => new BinanceOptionSummaryMapper(),
  'huobi-dm-options': () => new HuobiOptionsSummaryMapper()
}

const liquidationsMappers = {
  ftx: () => new FTXLiquidationsMapper(),
  bitmex: () => bitmexLiquidationsMapper,
  deribit: () => deribitLiquidationsMapper,
  'binance-futures': () => new BinanceLiquidationsMapper('binance-futures'),
  'binance-delivery': () => new BinanceLiquidationsMapper('binance-delivery'),
  'bitfinex-derivatives': () => new BitfinexLiquidationsMapper('bitfinex-derivatives'),
  cryptofacilities: () => cryptofacilitiesLiquidationsMapper,
  'huobi-dm': () => new HuobiLiquidationsMapper('huobi-dm'),
  'huobi-dm-swap': () => new HuobiLiquidationsMapper('huobi-dm-swap'),
  'huobi-dm-linear-swap': () => new HuobiLiquidationsMapper('huobi-dm-linear-swap'),
  bybit: () => new BybitLiquidationsMapper('bybit'),
  'okex-futures': (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp)
      ? new OkexV5LiquidationsMapper('okex-futures')
      : new OkexLiquidationsMapper('okex-futures', 'futures'),
  'okex-swap': (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp) ? new OkexV5LiquidationsMapper('okex-swap') : new OkexLiquidationsMapper('okex-swap', 'swap')
}

const bookTickersMappers = {
  binance: () => new BinanceBookTickerMapper('binance'),
  'binance-futures': () => new BinanceBookTickerMapper('binance-futures'),
  'binance-delivery': () => new BinanceBookTickerMapper('binance-delivery'),
  'binance-us': () => new BinanceBookTickerMapper('binance-us'),
  ascendex: () => new AscendexBookTickerMapper(),
  'binance-dex': () => binanceDexBookTickerMapper,
  bitfinex: () => new BitfinexBookTickerMapper('bitfinex'),
  'bitfinex-derivatives': () => new BitfinexBookTickerMapper('bitfinex-derivatives'),
  bitflyer: () => bitflyerBookTickerMapper,
  bitmex: () => bitmexBookTickerMapper,
  coinbase: () => coinbaseBookTickerMapper,
  cryptofacilities: () => cryptofacilitiesBookTickerMapper,
  deribit: () => deribitBookTickerMapper,
  ftx: () => new FTXBookTickerMapper('ftx'),
  'ftx-us': () => new FTXBookTickerMapper('ftx-us'),
  huobi: () => new HuobiBookTickerMapper('huobi'),
  'huobi-dm': () => new HuobiBookTickerMapper('huobi-dm'),
  'huobi-dm-swap': () => new HuobiBookTickerMapper('huobi-dm-swap'),
  'huobi-dm-linear-swap': () => new HuobiBookTickerMapper('huobi-dm-linear-swap'),
  kraken: () => krakenBookTickerMapper,
  okex: (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp)
      ? new OkexV5BookTickerMapper('okex', canUseOkexTbtBookTicker(localTimestamp))
      : new OkexBookTickerMapper('okex', 'spot'),

  'okex-futures': (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp)
      ? new OkexV5BookTickerMapper('okex-futures', canUseOkexTbtBookTicker(localTimestamp))
      : new OkexBookTickerMapper('okex-futures', 'futures'),

  'okex-swap': (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp)
      ? new OkexV5BookTickerMapper('okex-swap', canUseOkexTbtBookTicker(localTimestamp))
      : new OkexBookTickerMapper('okex-swap', 'swap'),

  'okex-options': (localTimestamp: Date) =>
    shouldUseOkexV5Mappers(localTimestamp)
      ? new OkexV5BookTickerMapper('okex-options', canUseOkexTbtBookTicker(localTimestamp))
      : new OkexBookTickerMapper('okex-options', 'option'),

  okcoin: () => new OkexBookTickerMapper('okcoin', 'spot'),
  serum: () => new SerumBookTickerMapper('serum'),
  'star-atlas': () => new SerumBookTickerMapper('star-atlas'),
  mango: () => new SerumBookTickerMapper('mango'),
  'gate-io-futures': () => new GateIOFuturesBookTickerMapper('gate-io-futures'),
  'bybit-spot': () => new BybitSpotBookTickerMapper('bybit-spot'),
  'crypto-com': () => new CryptoComBookTickerMapper('crypto-com'),
  'crypto-com-derivatives': () => new CryptoComBookTickerMapper('crypto-com-derivatives'),
  kucoin: () => new KucoinBookTickerMapper('kucoin')
}

export const normalizeTrades = <T extends keyof typeof tradesMappers>(exchange: T, localTimestamp: Date): Mapper<T, Trade> => {
  const createTradesMapper = tradesMappers[exchange]

  if (createTradesMapper === undefined) {
    throw new Error(`normalizeTrades: ${exchange} not supported`)
  }

  return createTradesMapper(localTimestamp) as Mapper<T, Trade>
}

export const normalizeBookChanges = <T extends keyof typeof bookChangeMappers>(
  exchange: T,
  localTimestamp: Date
): Mapper<T, BookChange> => {
  const createBookChangesMapper = bookChangeMappers[exchange]

  if (createBookChangesMapper === undefined) {
    throw new Error(`normalizeBookChanges: ${exchange} not supported`)
  }

  return createBookChangesMapper(localTimestamp) as Mapper<T, BookChange>
}

export const normalizeDerivativeTickers = <T extends keyof typeof derivativeTickersMappers>(
  exchange: T,
  localTimestamp: Date
): Mapper<T, DerivativeTicker> => {
  const createDerivativeTickerMapper = derivativeTickersMappers[exchange]

  if (createDerivativeTickerMapper === undefined) {
    throw new Error(`normalizeDerivativeTickers: ${exchange} not supported`)
  }

  return createDerivativeTickerMapper(localTimestamp) as any
}

export const normalizeOptionsSummary = <T extends keyof typeof optionsSummaryMappers>(
  exchange: T,
  localTimestamp: Date
): Mapper<T, OptionSummary> => {
  const createOptionSummaryMapper = optionsSummaryMappers[exchange]

  if (createOptionSummaryMapper === undefined) {
    throw new Error(`normalizeOptionsSummary: ${exchange} not supported`)
  }

  return createOptionSummaryMapper(localTimestamp) as any
}

export const normalizeLiquidations = <T extends keyof typeof liquidationsMappers>(
  exchange: T,
  localTimestamp: Date
): Mapper<T, Liquidation> => {
  const createLiquidationsMapper = liquidationsMappers[exchange]

  if (createLiquidationsMapper === undefined) {
    throw new Error(`normalizeLiquidations: ${exchange} not supported`)
  }

  return createLiquidationsMapper(localTimestamp) as any
}

export const normalizeBookTickers = <T extends keyof typeof bookTickersMappers>(
  exchange: T,
  localTimestamp: Date
): Mapper<T, BookTicker> => {
  const createTickerMapper = bookTickersMappers[exchange]

  if (createTickerMapper === undefined) {
    throw new Error(`normalizeBookTickers: ${exchange} not supported`)
  }

  return createTickerMapper(localTimestamp) as any
}
