'use strict';

var upbit$1 = require('./abstract/upbit.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha512 = require('./static_dependencies/noble-hashes/sha512.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var rsa = require('./base/functions/rsa.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class upbit
 * @augments Exchange
 */
class upbit extends upbit$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'upbit',
            'name': 'Upbit',
            'countries': ['KR'],
            'version': 'v1',
            'rateLimit': 50,
            'pro': true,
            // new metainfo interface
            'has': {
                'CORS': true,
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchOrders': false,
                'fetchPositionMode': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1s': 'seconds',
                '1m': 'minutes',
                '3m': 'minutes',
                '5m': 'minutes',
                '10m': 'minutes',
                '15m': 'minutes',
                '30m': 'minutes',
                '1h': 'minutes',
                '4h': 'minutes',
                '1d': 'days',
                '1w': 'weeks',
                '1M': 'months',
                '1y': 'years',
            },
            'hostname': 'api.upbit.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/49245610-eeaabe00-f423-11e8-9cba-4b0aed794799.jpg',
                'api': {
                    'public': 'https://{hostname}',
                    'private': 'https://{hostname}',
                },
                'www': 'https://upbit.com',
                'doc': 'https://docs.upbit.com/docs/%EC%9A%94%EC%B2%AD-%EC%88%98-%EC%A0%9C%ED%95%9C',
                'fees': 'https://upbit.com/service_center/guide',
            },
            'api': {
                // 'endpoint','API Cost'
                // cost = 1000 / (rateLimit * RPS)
                'public': {
                    'get': {
                        'market/all': 2,
                        'candles/{timeframe}': 2,
                        'candles/{timeframe}/{unit}': 2,
                        'candles/seconds': 2,
                        'candles/minutes/{unit}': 2,
                        'candles/minutes/1': 2,
                        'candles/minutes/3': 2,
                        'candles/minutes/5': 2,
                        'candles/minutes/10': 2,
                        'candles/minutes/15': 2,
                        'candles/minutes/30': 2,
                        'candles/minutes/60': 2,
                        'candles/minutes/240': 2,
                        'candles/days': 2,
                        'candles/weeks': 2,
                        'candles/months': 2,
                        'candles/years': 2,
                        'trades/ticks': 2,
                        'ticker': 2,
                        'ticker/all': 2,
                        'orderbook': 2,
                        'orderbook/supported_levels': 2, // Upbit KR only
                    },
                },
                'private': {
                    'get': {
                        'accounts': 0.67,
                        'orders/chance': 0.67,
                        'order': 0.67,
                        'orders/closed': 0.67,
                        'orders/open': 0.67,
                        'orders/uuids': 0.67,
                        'withdraws': 0.67,
                        'withdraw': 0.67,
                        'withdraws/chance': 0.67,
                        'withdraws/coin_addresses': 0.67,
                        'deposits': 0.67,
                        'deposits/chance/coin': 0.67,
                        'deposit': 0.67,
                        'deposits/coin_addresses': 0.67,
                        'deposits/coin_address': 0.67,
                        'travel_rule/vasps': 0.67,
                        'status/wallet': 0.67,
                        'api_keys': 0.67, // Upbit KR only
                    },
                    'post': {
                        'orders': 2.5,
                        'orders/cancel_and_new': 2.5,
                        'withdraws/coin': 0.67,
                        'withdraws/krw': 0.67,
                        'deposits/krw': 0.67,
                        'deposits/generate_coin_address': 0.67,
                        'travel_rule/deposit/uuid': 0.67,
                        'travel_rule/deposit/txid': 0.67, // RPS: 30, but each deposit can only be queried once every 10 minutes
                    },
                    'delete': {
                        'order': 0.67,
                        'orders/open': 40,
                        'orders/uuids': 0.67,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber('0.0025'),
                    'taker': this.parseNumber('0.0025'),
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': undefined,
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': true,
                        'limit': 100,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': 100000,
                        'daysBackCanceled': 1,
                        'untilDays': 7,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 200,
                    },
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'exact': {
                    'This key has expired.': errors.AuthenticationError,
                    'Missing request parameter error. Check the required parameters!': errors.BadRequest,
                    'side is missing, side does not have a valid value': errors.InvalidOrder,
                },
                'broad': {
                    'thirdparty_agreement_required': errors.PermissionDenied,
                    'out_of_scope': errors.PermissionDenied,
                    'order_not_found': errors.OrderNotFound,
                    'insufficient_funds': errors.InsufficientFunds,
                    'invalid_access_key': errors.AuthenticationError,
                    'jwt_verification': errors.AuthenticationError,
                    'create_ask_error': errors.ExchangeError,
                    'create_bid_error': errors.ExchangeError,
                    'volume_too_large': errors.InvalidOrder,
                    'invalid_funds': errors.InvalidOrder,
                },
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'fetchTickersMaxLength': 4096,
                'fetchOrderBooksMaxLength': 4096,
                'tradingFeesByQuoteCurrency': {
                    'KRW': 0.0005,
                },
            },
            'commonCurrencies': {
                'TON': 'Tokamak Network',
            },
        });
    }
    async fetchCurrency(code, params = {}) {
        // this method is for retrieving funding fees and limits per currency
        // it requires private access and API keys properly set up
        await this.loadMarkets();
        const currency = this.currency(code);
        return await this.fetchCurrencyById(currency['id'], params);
    }
    async fetchCurrencyById(id, params = {}) {
        // this method is for retrieving funding fees and limits per currency
        // it requires private access and API keys properly set up
        const request = {
            'currency': id,
        };
        const response = await this.privateGetWithdrawsChance(this.extend(request, params));
        //
        //     {
        //         "member_level": {
        //             "security_level": 3,
        //             "fee_level": 0,
        //             "email_verified": true,
        //             "identity_auth_verified": true,
        //             "bank_account_verified": true,
        //             "kakao_pay_auth_verified": false,
        //             "locked": false,
        //             "wallet_locked": false
        //         },
        //         "currency": {
        //             "code": "BTC",
        //             "withdraw_fee": "0.0005",
        //             "is_coin": true,
        //             "wallet_state": "working",
        //             "wallet_support": [ "deposit", "withdraw" ]
        //         },
        //         "account": {
        //             "currency": "BTC",
        //             "balance": "10.0",
        //             "locked": "0.0",
        //             "avg_krw_buy_price": "8042000",
        //             "modified": false
        //         },
        //         "withdraw_limit": {
        //             "currency": "BTC",
        //             "minimum": null,
        //             "onetime": null,
        //             "daily": "10.0",
        //             "remaining_daily": "10.0",
        //             "remaining_daily_krw": "0.0",
        //             "fixed": null,
        //             "can_withdraw": true
        //         }
        //     }
        //
        const memberInfo = this.safeValue(response, 'member_level', {});
        const currencyInfo = this.safeValue(response, 'currency', {});
        const withdrawLimits = this.safeValue(response, 'withdraw_limit', {});
        const canWithdraw = this.safeValue(withdrawLimits, 'can_withdraw');
        const walletState = this.safeString(currencyInfo, 'wallet_state');
        const walletLocked = this.safeValue(memberInfo, 'wallet_locked');
        const locked = this.safeValue(memberInfo, 'locked');
        let active = true;
        if ((canWithdraw !== undefined) && !canWithdraw) {
            active = false;
        }
        else if (walletState !== 'working') {
            active = false;
        }
        else if ((walletLocked !== undefined) && walletLocked) {
            active = false;
        }
        else if ((locked !== undefined) && locked) {
            active = false;
        }
        const maxOnetimeWithdrawal = this.safeString(withdrawLimits, 'onetime');
        const maxDailyWithdrawal = this.safeString(withdrawLimits, 'daily', maxOnetimeWithdrawal);
        const remainingDailyWithdrawal = this.safeString(withdrawLimits, 'remaining_daily', maxDailyWithdrawal);
        let maxWithdrawLimit = undefined;
        if (Precise["default"].stringGt(remainingDailyWithdrawal, '0')) {
            maxWithdrawLimit = remainingDailyWithdrawal;
        }
        else {
            maxWithdrawLimit = maxDailyWithdrawal;
        }
        const currencyId = this.safeString(currencyInfo, 'code');
        const code = this.safeCurrencyCode(currencyId);
        return {
            'info': response,
            'id': currencyId,
            'code': code,
            'name': code,
            'active': active,
            'fee': this.safeNumber(currencyInfo, 'withdraw_fee'),
            'precision': undefined,
            'limits': {
                'withdraw': {
                    'min': this.safeNumber(withdrawLimits, 'minimum'),
                    'max': this.parseNumber(maxWithdrawLimit),
                },
            },
        };
    }
    async fetchMarket(symbol, params = {}) {
        // this method is for retrieving trading fees and limits per market
        // it requires private access and API keys properly set up
        await this.loadMarkets();
        const market = this.market(symbol);
        return await this.fetchMarketById(market['id'], params);
    }
    async fetchMarketById(id, params = {}) {
        // this method is for retrieving trading fees and limits per market
        // it requires private access and API keys properly set up
        const request = {
            'market': id,
        };
        const response = await this.privateGetOrdersChance(this.extend(request, params));
        //
        //     {
        //         "bid_fee": "0.0015",
        //         "ask_fee": "0.0015",
        //         "market": {
        //             "id": "KRW-BTC",
        //             "name": "BTC/KRW",
        //             "order_types": [ "limit" ],
        //             "order_sides": [ "ask", "bid" ],
        //             "bid": { "currency": "KRW", "price_unit": null, "min_total": 1000 },
        //             "ask": { "currency": "BTC", "price_unit": null, "min_total": 1000 },
        //             "max_total": "100000000.0",
        //             "state": "active",
        //         },
        //         "bid_account": {
        //             "currency": "KRW",
        //             "balance": "0.0",
        //             "locked": "0.0",
        //             "avg_buy_price": "0",
        //             "avg_buy_price_modified": false,
        //             "unit_currency": "KRW",
        //         },
        //         "ask_account": {
        //             "currency": "BTC",
        //             "balance": "10.0",
        //             "locked": "0.0",
        //             "avg_buy_price": "8042000",
        //             "avg_buy_price_modified": false,
        //             "unit_currency": "KRW",
        //         }
        //     }
        //
        const marketInfo = this.safeValue(response, 'market');
        const bid = this.safeValue(marketInfo, 'bid');
        const ask = this.safeValue(marketInfo, 'ask');
        const marketId = this.safeString(marketInfo, 'id');
        const baseId = this.safeString(ask, 'currency');
        const quoteId = this.safeString(bid, 'currency');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const state = this.safeString(marketInfo, 'state');
        const bidFee = this.safeString(response, 'bid_fee');
        const askFee = this.safeString(response, 'ask_fee');
        const fee = this.parseNumber(Precise["default"].stringMax(bidFee, askFee));
        return this.safeMarketStructure({
            'id': marketId,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': (state === 'active'),
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'taker': fee,
            'maker': fee,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber('1e-8'),
                'price': this.parseNumber('1e-8'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(ask, 'min_total'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber(bid, 'min_total'),
                    'max': this.safeNumber(marketInfo, 'max_total'),
                },
                'info': response,
            },
        });
    }
    /**
     * @method
     * @name upbit#fetchMarkets
     * @see https://docs.upbit.com/reference/%EB%A7%88%EC%BC%93-%EC%BD%94%EB%93%9C-%EC%A1%B0%ED%9A%8C
     * @description retrieves data on all markets for upbit
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.publicGetMarketAll(params);
        //
        //    [
        //        {
        //            "market": "KRW-BTC",
        //            "korean_name": "비트코인",
        //            "english_name": "Bitcoin"
        //        },
        //        ...,
        //    ]
        //
        return this.parseMarkets(response);
    }
    parseMarket(market) {
        const id = this.safeString(market, 'market');
        const [quoteId, baseId] = id.split('-');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        return this.safeMarketStructure({
            'id': id,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': true,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'taker': this.safeNumber(this.options['tradingFeesByQuoteCurrency'], quote, this.fees['trading']['taker']),
            'maker': this.safeNumber(this.options['tradingFeesByQuoteCurrency'], quote, this.fees['trading']['maker']),
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'price': this.parseNumber('1e-8'),
                'amount': this.parseNumber('1e-8'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        });
    }
    parseBalance(response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString(balance, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(balance, 'balance');
            account['used'] = this.safeString(balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name upbit#fetchBalance
     * @see https://docs.upbit.com/reference/%EC%A0%84%EC%B2%B4-%EA%B3%84%EC%A2%8C-%EC%A1%B0%ED%9A%8C
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetAccounts(params);
        //
        //     [ {          currency: "BTC",
        //                   "balance": "0.005",
        //                    "locked": "0.0",
        //         "avg_krw_buy_price": "7446000",
        //                  "modified":  false     },
        //       {          currency: "ETH",
        //                   "balance": "0.1",
        //                    "locked": "0.0",
        //         "avg_krw_buy_price": "250000",
        //                  "modified":  false    }   ]
        //
        return this.parseBalance(response);
    }
    /**
     * @method
     * @name upbit#fetchOrderBooks
     * @see https://docs.upbit.com/reference/%ED%98%B8%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
     * @param {string[]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
     * @param {int} [limit] not used by upbit fetchOrderBooks ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
     */
    async fetchOrderBooks(symbols = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let ids = undefined;
        if (symbols === undefined) {
            ids = this.ids.join(',');
            // max URL length is 2083 symbols, including http schema, hostname, tld, etc...
            if (ids.length > this.options['fetchOrderBooksMaxLength']) {
                const numIds = this.ids.length;
                throw new errors.ExchangeError(this.id + ' fetchOrderBooks() has ' + numIds.toString() + ' symbols (' + ids.length.toString() + ' characters) exceeding max URL length (' + this.options['fetchOrderBooksMaxLength'].toString() + ' characters), you are required to specify a list of symbols in the first argument to fetchOrderBooks');
            }
        }
        else {
            ids = this.marketIds(symbols);
            ids = ids.join(',');
        }
        const request = {
            'markets': ids,
        };
        const response = await this.publicGetOrderbook(this.extend(request, params));
        //
        //     [ {          market:   "BTC-ETH",
        //               "timestamp":    1542899030043,
        //          "total_ask_size":    109.57065201,
        //          "total_bid_size":    125.74430631,
        //         "orderbook_units": [ { ask_price: 0.02926679,
        //                              "bid_price": 0.02919904,
        //                               "ask_size": 4.20293961,
        //                               "bid_size": 11.65043576 },
        //                            ...,
        //                            { ask_price: 0.02938209,
        //                              "bid_price": 0.0291231,
        //                               "ask_size": 0.05135782,
        //                               "bid_size": 13.5595     }   ] },
        //       {          market:   "KRW-BTC",
        //               "timestamp":    1542899034662,
        //          "total_ask_size":    12.89790974,
        //          "total_bid_size":    4.88395783,
        //         "orderbook_units": [ { ask_price: 5164000,
        //                              "bid_price": 5162000,
        //                               "ask_size": 2.57606495,
        //                               "bid_size": 0.214       },
        //                            ...,
        //                            { ask_price: 5176000,
        //                              "bid_price": 5152000,
        //                               "ask_size": 2.752,
        //                               "bid_size": 0.4650305 }    ] }   ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const orderbook = response[i];
            const marketId = this.safeString(orderbook, 'market');
            const symbol = this.safeSymbol(marketId, undefined, '-');
            const timestamp = this.safeInteger(orderbook, 'timestamp');
            result[symbol] = {
                'symbol': symbol,
                'bids': this.sortBy(this.parseBidsAsks(orderbook['orderbook_units'], 'bid_price', 'bid_size'), 0, true),
                'asks': this.sortBy(this.parseBidsAsks(orderbook['orderbook_units'], 'ask_price', 'ask_size'), 0),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'nonce': undefined,
            };
        }
        return result;
    }
    /**
     * @method
     * @name upbit#fetchOrderBook
     * @see https://docs.upbit.com/reference/%ED%98%B8%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        const orderbooks = await this.fetchOrderBooks([symbol], limit, params);
        return this.safeValue(orderbooks, symbol);
    }
    parseTicker(ticker, market = undefined) {
        //
        //       {                market: "BTC-ETH",
        //                    "trade_date": "20181122",
        //                    "trade_time": "104543",
        //                "trade_date_kst": "20181122",
        //                "trade_time_kst": "194543",
        //               "trade_timestamp":  1542883543096,
        //                 "opening_price":  0.02976455,
        //                    "high_price":  0.02992577,
        //                     "low_price":  0.02934283,
        //                   "trade_price":  0.02947773,
        //            "prev_closing_price":  0.02966,
        //                        "change": "FALL",
        //                  "change_price":  0.00018227,
        //                   "change_rate":  0.0061453136,
        //           "signed_change_price":  -0.00018227,
        //            "signed_change_rate":  -0.0061453136,
        //                  "trade_volume":  1.00000005,
        //               "acc_trade_price":  100.95825586,
        //           "acc_trade_price_24h":  289.58650166,
        //              "acc_trade_volume":  3409.85311036,
        //          "acc_trade_volume_24h":  9754.40510513,
        //         "highest_52_week_price":  0.12345678,
        //          "highest_52_week_date": "2018-02-01",
        //          "lowest_52_week_price":  0.023936,
        //           "lowest_52_week_date": "2017-12-08",
        //                     "timestamp":  1542883543813  }
        //
        const timestamp = this.safeInteger(ticker, 'trade_timestamp');
        const marketId = this.safeString2(ticker, 'market', 'code');
        market = this.safeMarket(marketId, market, '-');
        const last = this.safeString(ticker, 'trade_price');
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high_price'),
            'low': this.safeString(ticker, 'low_price'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString(ticker, 'opening_price'),
            'close': last,
            'last': last,
            'previousClose': this.safeString(ticker, 'prev_closing_price'),
            'change': this.safeString(ticker, 'signed_change_price'),
            'percentage': this.safeString(ticker, 'signed_change_rate'),
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'acc_trade_volume_24h'),
            'quoteVolume': this.safeString(ticker, 'acc_trade_price_24h'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name upbit#fetchTickers
     * @see https://docs.upbit.com/reference/ticker%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        let ids = undefined;
        if (symbols === undefined) {
            ids = this.ids.join(',');
            // max URL length is 2083 symbols, including http schema, hostname, tld, etc...
            if (ids.length > this.options['fetchTickersMaxLength']) {
                const numIds = this.ids.length;
                throw new errors.ExchangeError(this.id + ' fetchTickers() has ' + numIds.toString() + ' symbols exceeding max URL length, you are required to specify a list of symbols in the first argument to fetchTickers');
            }
        }
        else {
            ids = this.marketIds(symbols);
            ids = ids.join(',');
        }
        const request = {
            'markets': ids,
        };
        const response = await this.publicGetTicker(this.extend(request, params));
        //
        //     [ {                market: "BTC-ETH",
        //                    "trade_date": "20181122",
        //                    "trade_time": "104543",
        //                "trade_date_kst": "20181122",
        //                "trade_time_kst": "194543",
        //               "trade_timestamp":  1542883543097,
        //                 "opening_price":  0.02976455,
        //                    "high_price":  0.02992577,
        //                     "low_price":  0.02934283,
        //                   "trade_price":  0.02947773,
        //            "prev_closing_price":  0.02966,
        //                        "change": "FALL",
        //                  "change_price":  0.00018227,
        //                   "change_rate":  0.0061453136,
        //           "signed_change_price":  -0.00018227,
        //            "signed_change_rate":  -0.0061453136,
        //                  "trade_volume":  1.00000005,
        //               "acc_trade_price":  100.95825586,
        //           "acc_trade_price_24h":  289.58650166,
        //              "acc_trade_volume":  3409.85311036,
        //          "acc_trade_volume_24h":  9754.40510513,
        //         "highest_52_week_price":  0.12345678,
        //          "highest_52_week_date": "2018-02-01",
        //          "lowest_52_week_price":  0.023936,
        //           "lowest_52_week_date": "2017-12-08",
        //                     "timestamp":  1542883543813  } ]
        //
        const result = {};
        for (let t = 0; t < response.length; t++) {
            const ticker = this.parseTicker(response[t]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    /**
     * @method
     * @name upbit#fetchTicker
     * @see https://docs.upbit.com/reference/ticker%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        const tickers = await this.fetchTickers([symbol], params);
        return this.safeValue(tickers, symbol);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades
        //
        //       {             market: "BTC-ETH",
        //             "trade_date_utc": "2018-11-22",
        //             "trade_time_utc": "13:55:24",
        //                  "timestamp":  1542894924397,
        //                "trade_price":  0.02914289,
        //               "trade_volume":  0.20074397,
        //         "prev_closing_price":  0.02966,
        //               "change_price":  -0.00051711,
        //                    "ask_bid": "ASK",
        //              "sequential_id":  15428949259430000 }
        //
        // fetchOrder trades
        //
        //         {
        //             "market": "KRW-BTC",
        //             "uuid": "78162304-1a4d-4524-b9e6-c9a9e14d76c3",
        //             "price": "101000.0",
        //             "volume": "0.77368323",
        //             "funds": "78142.00623",
        //             "ask_fee": "117.213009345",
        //             "bid_fee": "117.213009345",
        //             "created_at": "2018-04-05T14:09:15+09:00",
        //             "side": "bid",
        //         }
        //
        const id = this.safeString2(trade, 'sequential_id', 'uuid');
        const orderId = undefined;
        let timestamp = this.safeInteger(trade, 'timestamp');
        if (timestamp === undefined) {
            timestamp = this.parse8601(this.safeString(trade, 'created_at'));
        }
        let side = undefined;
        const askOrBid = this.safeStringLower2(trade, 'ask_bid', 'side');
        if (askOrBid === 'ask') {
            side = 'sell';
        }
        else if (askOrBid === 'bid') {
            side = 'buy';
        }
        const cost = this.safeString(trade, 'funds');
        const price = this.safeString2(trade, 'trade_price', 'price');
        const amount = this.safeString2(trade, 'trade_volume', 'volume');
        const marketId = this.safeString2(trade, 'market', 'code');
        market = this.safeMarket(marketId, market, '-');
        let fee = undefined;
        const feeCost = this.safeString(trade, askOrBid + '_fee');
        if (feeCost !== undefined) {
            fee = {
                'currency': market['quote'],
                'cost': feeCost,
            };
        }
        return this.safeTrade({
            'id': id,
            'info': trade,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name upbit#fetchTrades
     * @see https://docs.upbit.com/reference/%EC%B5%9C%EA%B7%BC-%EC%B2%B4%EA%B2%B0-%EB%82%B4%EC%97%AD
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (limit === undefined) {
            limit = 200;
        }
        const request = {
            'market': market['id'],
            'count': limit,
        };
        const response = await this.publicGetTradesTicks(this.extend(request, params));
        //
        //     [ {             market: "BTC-ETH",
        //             "trade_date_utc": "2018-11-22",
        //             "trade_time_utc": "13:55:24",
        //                  "timestamp":  1542894924397,
        //                "trade_price":  0.02914289,
        //               "trade_volume":  0.20074397,
        //         "prev_closing_price":  0.02966,
        //               "change_price":  -0.00051711,
        //                    "ask_bid": "ASK",
        //              "sequential_id":  15428949259430000 },
        //       {             market: "BTC-ETH",
        //             "trade_date_utc": "2018-11-22",
        //             "trade_time_utc": "13:03:10",
        //                  "timestamp":  1542891790123,
        //                "trade_price":  0.02917,
        //               "trade_volume":  7.392,
        //         "prev_closing_price":  0.02966,
        //               "change_price":  -0.00049,
        //                    "ask_bid": "ASK",
        //              "sequential_id":  15428917910540000 }  ]
        //
        return this.parseTrades(response, market, since, limit);
    }
    /**
     * @method
     * @name upbit#fetchTradingFee
     * @see https://docs.upbit.com/reference/%EC%A3%BC%EB%AC%B8-%EA%B0%80%EB%8A%A5-%EC%A0%95%EB%B3%B4
     * @description fetch the trading fees for a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.privateGetOrdersChance(this.extend(request, params));
        //
        //     {
        //         "bid_fee": "0.0005",
        //         "ask_fee": "0.0005",
        //         "maker_bid_fee": "0.0005",
        //         "maker_ask_fee": "0.0005",
        //         "market": {
        //             "id": "KRW-BTC",
        //             "name": "BTC/KRW",
        //             "order_types": [ "limit" ],
        //             "order_sides": [ "ask", "bid" ],
        //             "bid": { "currency": "KRW", "price_unit": null, "min_total": 5000 },
        //             "ask": { "currency": "BTC", "price_unit": null, "min_total": 5000 },
        //             "max_total": "1000000000.0",
        //             "state": "active"
        //         },
        //         "bid_account": {
        //             "currency": "KRW",
        //             "balance": "0.34202414",
        //             "locked": "4999.99999922",
        //             "avg_buy_price": "0",
        //             "avg_buy_price_modified": true,
        //             "unit_currency": "KRW"
        //         },
        //         "ask_account": {
        //             "currency": "BTC",
        //             "balance": "0.00048",
        //             "locked": "0.0",
        //             "avg_buy_price": "20870000",
        //             "avg_buy_price_modified": false,
        //             "unit_currency": "KRW"
        //         }
        //     }
        //
        const askFee = this.safeString(response, 'ask_fee');
        const bidFee = this.safeString(response, 'bid_fee');
        const taker = Precise["default"].stringMax(askFee, bidFee);
        const makerAskFee = this.safeString(response, 'maker_ask_fee');
        const makerBidFee = this.safeString(response, 'maker_bid_fee');
        const maker = Precise["default"].stringMax(makerAskFee, makerBidFee);
        return {
            'info': response,
            'symbol': symbol,
            'maker': this.parseNumber(maker),
            'taker': this.parseNumber(taker),
            'percentage': true,
            'tierBased': false,
        };
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         "market": "BTC-ETH",
        //         "candle_date_time_utc": "2018-11-22T13:47:00",
        //         "candle_date_time_kst": "2018-11-22T22:47:00",
        //         "opening_price": 0.02915963,
        //         "high_price": 0.02915963,
        //         "low_price": 0.02915448,
        //         "trade_price": 0.02915448,
        //         "timestamp": 1542894473674,
        //         "candle_acc_trade_price": 0.0981629437535248,
        //         "candle_acc_trade_volume": 3.36693173,
        //         "unit": 1
        //     }
        //
        return [
            this.parse8601(this.safeString(ohlcv, 'candle_date_time_utc')),
            this.safeNumber(ohlcv, 'opening_price'),
            this.safeNumber(ohlcv, 'high_price'),
            this.safeNumber(ohlcv, 'low_price'),
            this.safeNumber(ohlcv, 'trade_price'),
            this.safeNumber(ohlcv, 'candle_acc_trade_volume'), // base volume
        ];
    }
    /**
     * @method
     * @name upbit#fetchOHLCV
     * @see https://docs.upbit.com/reference/%EB%B6%84minute-%EC%BA%94%EB%93%A4-1
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const timeframePeriod = this.parseTimeframe(timeframe);
        const timeframeValue = this.safeString(this.timeframes, timeframe, timeframe);
        if (limit === undefined) {
            limit = 200;
        }
        const request = {
            'market': market['id'],
            'timeframe': timeframeValue,
            'count': limit,
        };
        let response = undefined;
        if (since !== undefined) {
            // convert `since` to `to` value
            request['to'] = this.iso8601(this.sum(since, timeframePeriod * limit * 1000));
        }
        if (timeframeValue === 'minutes') {
            const numMinutes = Math.round(timeframePeriod / 60);
            request['unit'] = numMinutes;
            response = await this.publicGetCandlesTimeframeUnit(this.extend(request, params));
        }
        else {
            response = await this.publicGetCandlesTimeframe(this.extend(request, params));
        }
        //
        //     [
        //         {
        //             "market": "BTC-ETH",
        //             "candle_date_time_utc": "2018-11-22T13:47:00",
        //             "candle_date_time_kst": "2018-11-22T22:47:00",
        //             "opening_price": 0.02915963,
        //             "high_price": 0.02915963,
        //             "low_price": 0.02915448,
        //             "trade_price": 0.02915448,
        //             "timestamp": 1542894473674,
        //             "candle_acc_trade_price": 0.0981629437535248,
        //             "candle_acc_trade_volume": 3.36693173,
        //             "unit": 1
        //         },
        //         {
        //             "market": "BTC-ETH",
        //             "candle_date_time_utc": "2018-11-22T10:06:00",
        //             "candle_date_time_kst": "2018-11-22T19:06:00",
        //             "opening_price": 0.0294,
        //             "high_price": 0.02940882,
        //             "low_price": 0.02934283,
        //             "trade_price": 0.02937354,
        //             "timestamp": 1542881219276,
        //             "candle_acc_trade_price": 0.0762597110943884,
        //             "candle_acc_trade_volume": 2.5949617,
        //             "unit": 1
        //         }
        //     ]
        //
        return this.parseOHLCVs(response, market, timeframe, since, limit);
    }
    /**
     * @method
     * @name upbit#createOrder
     * @description create a trade order
     * @see https://docs.upbit.com/reference/%EC%A3%BC%EB%AC%B8%ED%95%98%EA%B8%B0
     * @see https://global-docs.upbit.com/reference/order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] for market buy orders, the quote quantity that can be used as an alternative for the amount
     * @param {string} [params.timeInForce] 'IOC' or 'FOK'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let orderSide = undefined;
        if (side === 'buy') {
            orderSide = 'bid';
        }
        else if (side === 'sell') {
            orderSide = 'ask';
        }
        else {
            throw new errors.InvalidOrder(this.id + ' createOrder() allows buy or sell side only!');
        }
        const request = {
            'market': market['id'],
            'side': orderSide,
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        if ((type === 'market') && (side === 'buy')) {
            // for market buy it requires the amount of quote currency to spend
            let quoteAmount = undefined;
            let createMarketBuyOrderRequiresPrice = true;
            [createMarketBuyOrderRequiresPrice, params] = this.handleOptionAndParams(params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
            const cost = this.safeNumber(params, 'cost');
            params = this.omit(params, 'cost');
            if (cost !== undefined) {
                quoteAmount = this.costToPrecision(symbol, cost);
            }
            else if (createMarketBuyOrderRequiresPrice) {
                if (price === undefined) {
                    throw new errors.InvalidOrder(this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend (quote quantity) in the amount argument');
                }
                else {
                    const amountString = this.numberToString(amount);
                    const priceString = this.numberToString(price);
                    const costRequest = Precise["default"].stringMul(amountString, priceString);
                    quoteAmount = this.costToPrecision(symbol, costRequest);
                }
            }
            else {
                quoteAmount = this.costToPrecision(symbol, amount);
            }
            request['ord_type'] = 'price';
            request['price'] = quoteAmount;
        }
        else {
            request['ord_type'] = type;
            request['volume'] = this.amountToPrecision(symbol, amount);
        }
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'identifier');
        if (clientOrderId !== undefined) {
            request['identifier'] = clientOrderId;
        }
        if (type !== 'market') {
            const timeInForce = this.safeStringLower2(params, 'timeInForce', 'time_in_force');
            params = this.omit(params, 'timeInForce');
            if (timeInForce !== undefined) {
                request['time_in_force'] = timeInForce;
            }
        }
        params = this.omit(params, ['clientOrderId', 'identifier']);
        const response = await this.privatePostOrders(this.extend(request, params));
        //
        //     {
        //         "uuid": "cdd92199-2897-4e14-9448-f923320408ad",
        //         "side": "bid",
        //         "ord_type": "limit",
        //         "price": "100.0",
        //         "avg_price": "0.0",
        //         "state": "wait",
        //         "market": "KRW-BTC",
        //         "created_at": "2018-04-10T15:42:23+09:00",
        //         "volume": "0.01",
        //         "remaining_volume": "0.01",
        //         "reserved_fee": "0.0015",
        //         "remaining_fee": "0.0015",
        //         "paid_fee": "0.0",
        //         "locked": "1.0015",
        //         "executed_volume": "0.0",
        //         "trades_count": 0
        //     }
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name upbit#cancelOrder
     * @see https://docs.upbit.com/reference/%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol not used by upbit cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'uuid': id,
        };
        const response = await this.privateDeleteOrder(this.extend(request, params));
        //
        //     {
        //         "uuid": "cdd92199-2897-4e14-9448-f923320408ad",
        //         "side": "bid",
        //         "ord_type": "limit",
        //         "price": "100.0",
        //         "state": "wait",
        //         "market": "KRW-BTC",
        //         "created_at": "2018-04-10T15:42:23+09:00",
        //         "volume": "0.01",
        //         "remaining_volume": "0.01",
        //         "reserved_fee": "0.0015",
        //         "remaining_fee": "0.0015",
        //         "paid_fee": "0.0",
        //         "locked": "1.0015",
        //         "executed_volume": "0.0",
        //         "trades_count": 0
        //     }
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name upbit#fetchDeposits
     * @see https://docs.upbit.com/reference/%EC%9E%85%EA%B8%88-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @description fetch all deposits made to an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
        // 'page': 1,
        // 'order_by': 'asc', // 'desc'
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default is 100
        }
        const response = await this.privateGetDeposits(this.extend(request, params));
        //
        //     [
        //         {
        //             "type": "deposit",
        //             "uuid": "94332e99-3a87-4a35-ad98-28b0c969f830",
        //             "currency": "KRW",
        //             "txid": "9e37c537-6849-4c8b-a134-57313f5dfc5a",
        //             "state": "ACCEPTED",
        //             "created_at": "2017-12-08T15:38:02+09:00",
        //             "done_at": "2017-12-08T15:38:02+09:00",
        //             "amount": "100000.0",
        //             "fee": "0.0"
        //         },
        //         ...,
        //     ]
        //
        return this.parseTransactions(response, currency, since, limit);
    }
    /**
     * @method
     * @name upbit#fetchDeposit
     * @description fetch information on a deposit
     * @see https://global-docs.upbit.com/reference/individual-deposit-inquiry
     * @param {string} id the unique id for the deposit
     * @param {string} [code] unified currency code of the currency deposited
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.txid] withdrawal transaction id, the id argument is reserved for uuid
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposit(id, code = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'uuid': id,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        const response = await this.privateGetDeposit(this.extend(request, params));
        //
        //     {
        //         "type": "deposit",
        //         "uuid": "7f54527e-2eee-4268-860e-fd8b9d7fe3c7",
        //         "currency": "ADA",
        //         "net_type": "ADA",
        //         "txid": "99795bbfeca91eaa071068bb659b33eeb65d8aaff2551fdf7c78f345d188952b",
        //         "state": "ACCEPTED",
        //         "created_at": "2023-12-12T04:58:41Z",
        //         "done_at": "2023-12-12T05:31:50Z",
        //         "amount": "35.72344",
        //         "fee": "0.0",
        //         "transaction_type": "default"
        //     }
        //
        return this.parseTransaction(response, currency);
    }
    /**
     * @method
     * @name upbit#fetchWithdrawals
     * @see https://docs.upbit.com/reference/%EC%A0%84%EC%B2%B4-%EC%B6%9C%EA%B8%88-%EC%A1%B0%ED%9A%8C
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
        // 'state': 'submitting', // 'submitted', 'almost_accepted', 'rejected', 'accepted', 'processing', 'done', 'canceled'
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default is 100
        }
        const response = await this.privateGetWithdraws(this.extend(request, params));
        //
        //     [
        //         {
        //             "type": "withdraw",
        //             "uuid": "9f432943-54e0-40b7-825f-b6fec8b42b79",
        //             "currency": "BTC",
        //             "txid": null,
        //             "state": "processing",
        //             "created_at": "2018-04-13T11:24:01+09:00",
        //             "done_at": null,
        //             "amount": "0.01",
        //             "fee": "0.0",
        //             "krw_amount": "80420.0"
        //         },
        //         ...,
        //     ]
        //
        return this.parseTransactions(response, currency, since, limit);
    }
    /**
     * @method
     * @name upbit#fetchWithdrawal
     * @description fetch data on a currency withdrawal via the withdrawal id
     * @see https://global-docs.upbit.com/reference/individual-withdrawal-inquiry
     * @param {string} id the unique id for the withdrawal
     * @param {string} [code] unified currency code of the currency withdrawn
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.txid] withdrawal transaction id, the id argument is reserved for uuid
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawal(id, code = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'uuid': id,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        const response = await this.privateGetWithdraw(this.extend(request, params));
        //
        //     {
        //         "type": "withdraw",
        //         "uuid": "95ef274b-23a6-4de4-95b0-5cbef4ca658f",
        //         "currency": "ADA",
        //         "net_type": "ADA",
        //         "txid": "b1528f149297a71671b86636f731f8fdb0ff53da0f1d8c19093d59df96f34583",
        //         "state": "DONE",
        //         "created_at": "2023-12-14T02:46:52Z",
        //         "done_at": "2023-12-14T03:10:11Z",
        //         "amount": "35.22344",
        //         "fee": "0.5",
        //         "transaction_type": "default"
        //     }
        //
        return this.parseTransaction(response, currency);
    }
    parseTransactionStatus(status) {
        const statuses = {
            'submitting': 'pending',
            'submitted': 'pending',
            'almost_accepted': 'pending',
            'rejected': 'failed',
            'accepted': 'ok',
            'processing': 'pending',
            'done': 'ok',
            'canceled': 'canceled', // 취소됨
        };
        return this.safeString(statuses, status, status);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits, fetchDeposit
        //
        //     {
        //         "type": "deposit",
        //         "uuid": "94332e99-3a87-4a35-ad98-28b0c969f830",
        //         "currency": "KRW",
        //         "txid": "9e37c537-6849-4c8b-a134-57313f5dfc5a",
        //         "state": "ACCEPTED",
        //         "created_at": "2017-12-08T15:38:02+09:00",
        //         "done_at": "2017-12-08T15:38:02+09:00",
        //         "amount": "100000.0",
        //         "fee": "0.0"
        //     }
        //
        // fetchWithdrawals, fetchWithdrawal
        //
        //     {
        //         "type": "withdraw",
        //         "uuid": "9f432943-54e0-40b7-825f-b6fec8b42b79",
        //         "currency": "BTC",
        //         "txid": "cd81e9b45df8da29f936836e58c907a106057e454a45767a7b06fcb19b966bba",
        //         "state": "processing",
        //         "created_at": "2018-04-13T11:24:01+09:00",
        //         "done_at": null,
        //         "amount": "0.01",
        //         "fee": "0.0",
        //         "krw_amount": "80420.0"
        //     }
        //
        const address = undefined; // not present in the data structure received from the exchange
        const tag = undefined; // not present in the data structure received from the exchange
        const updatedRaw = this.safeString(transaction, 'done_at');
        const timestamp = this.parse8601(this.safeString(transaction, 'created_at', updatedRaw));
        let type = this.safeString(transaction, 'type');
        if (type === 'withdraw') {
            type = 'withdrawal';
        }
        const currencyId = this.safeString(transaction, 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        return {
            'info': transaction,
            'id': this.safeString(transaction, 'uuid'),
            'currency': code,
            'amount': this.safeNumber(transaction, 'amount'),
            'network': undefined,
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'tagFrom': undefined,
            'status': this.parseTransactionStatus(this.safeStringLower(transaction, 'state')),
            'type': type,
            'updated': this.parse8601(updatedRaw),
            'txid': this.safeString(transaction, 'txid'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'internal': undefined,
            'comment': undefined,
            'fee': {
                'currency': code,
                'cost': this.safeNumber(transaction, 'fee'),
            },
        };
    }
    parseOrderStatus(status) {
        const statuses = {
            'wait': 'open',
            'done': 'closed',
            'cancel': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        //     {
        //         "uuid": "a08f09b1-1718-42e2-9358-f0e5e083d3ee",
        //         "side": "bid",
        //         "ord_type": "limit",
        //         "price": "17417000.0",
        //         "state": "done",
        //         "market": "KRW-BTC",
        //         "created_at": "2018-04-05T14:09:14+09:00",
        //         "volume": "1.0",
        //         "remaining_volume": "0.0",
        //         "reserved_fee": "26125.5",
        //         "remaining_fee": "25974.0",
        //         "paid_fee": "151.5",
        //         "locked": "17341974.0",
        //         "executed_volume": "1.0",
        //         "trades_count": 2,
        //         "trades": [
        //             {
        //                 "market": "KRW-BTC",
        //                 "uuid": "78162304-1a4d-4524-b9e6-c9a9e14d76c3",
        //                 "price": "101000.0",
        //                 "volume": "0.77368323",
        //                 "funds": "78142.00623",
        //                 "ask_fee": "117.213009345",
        //                 "bid_fee": "117.213009345",
        //                 "created_at": "2018-04-05T14:09:15+09:00",
        //                 "side": "bid",
        //             },
        //             {
        //                 "market": "KRW-BTC",
        //                 "uuid": "f73da467-c42f-407d-92fa-e10d86450a20",
        //                 "price": "101000.0",
        //                 "volume": "0.22631677",
        //                 "funds": "22857.99377",
        //                 "ask_fee": "34.286990655", // missing in market orders
        //                 "bid_fee": "34.286990655", // missing in market orders
        //                 "created_at": "2018-04-05T14:09:15+09:00", // missing in market orders
        //                 "side": "bid",
        //             },
        //         ],
        //     }
        //
        // fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders
        //
        //     {
        //         "uuid": "637fd66-d019-4d77-bee6-8e0cff28edd9",
        //         "side": "ask",
        //         "ord_type": "limit",
        //         "price": "1.5",
        //         "state": "wait",
        //         "market": "SGD-XRP",
        //         "created_at": "2024-06-05T09:37:10Z",
        //         "volume": "10",
        //         "remaining_volume": "10",
        //         "reserved_fee": "0",
        //         "remaining_fee": "0",
        //         "paid_fee": "0",
        //         "locked": "10",
        //         "executed_volume": "0",
        //         "executed_funds": "0",
        //         "trades_count": 0,
        //         "time_in_force": "ioc"
        //     }
        //
        const id = this.safeString(order, 'uuid');
        let side = this.safeString(order, 'side');
        if (side === 'bid') {
            side = 'buy';
        }
        else {
            side = 'sell';
        }
        let type = this.safeString(order, 'ord_type');
        const timestamp = this.parse8601(this.safeString(order, 'created_at'));
        const status = this.parseOrderStatus(this.safeString(order, 'state'));
        let lastTradeTimestamp = undefined;
        let price = this.safeString(order, 'price');
        const amount = this.safeString(order, 'volume');
        const remaining = this.safeString(order, 'remaining_volume');
        const filled = this.safeString(order, 'executed_volume');
        let cost = undefined;
        if (type === 'price') {
            type = 'market';
            cost = price;
            price = undefined;
        }
        let average = undefined;
        let fee = undefined;
        let feeCost = this.safeString(order, 'paid_fee');
        const marketId = this.safeString(order, 'market');
        market = this.safeMarket(marketId, market);
        let trades = this.safeValue(order, 'trades', []);
        trades = this.parseTrades(trades, market, undefined, undefined, {
            'order': id,
            'type': type,
        });
        const numTrades = trades.length;
        if (numTrades > 0) {
            // the timestamp in fetchOrder trades is missing
            lastTradeTimestamp = trades[numTrades - 1]['timestamp'];
            let getFeesFromTrades = false;
            if (feeCost === undefined) {
                getFeesFromTrades = true;
                feeCost = '0';
            }
            cost = '0';
            for (let i = 0; i < numTrades; i++) {
                const trade = trades[i];
                cost = Precise["default"].stringAdd(cost, this.safeString(trade, 'cost'));
                if (getFeesFromTrades) {
                    const tradeFee = this.safeValue(trades[i], 'fee', {});
                    const tradeFeeCost = this.safeString(tradeFee, 'cost');
                    if (tradeFeeCost !== undefined) {
                        feeCost = Precise["default"].stringAdd(feeCost, tradeFeeCost);
                    }
                }
            }
            average = Precise["default"].stringDiv(cost, filled);
        }
        if (feeCost !== undefined) {
            fee = {
                'currency': market['quote'],
                'cost': feeCost,
            };
        }
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': this.safeStringUpper(order, 'time_in_force'),
            'postOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'cost': this.parseNumber(cost),
            'average': this.parseNumber(average),
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        });
    }
    /**
     * @method
     * @name upbit#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://global-docs.upbit.com/reference/open-order
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.state] default is 'wait', set to 'watch' for stop limit orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrdersOpen(this.extend(request, params));
        //
        //     [
        //         {
        //             "uuid": "637fd66-d019-4d77-bee6-8e0cff28edd9",
        //             "side": "ask",
        //             "ord_type": "limit",
        //             "price": "1.5",
        //             "state": "wait",
        //             "market": "SGD-XRP",
        //             "created_at": "2024-06-05T09:37:10Z",
        //             "volume": "10",
        //             "remaining_volume": "10",
        //             "reserved_fee": "0",
        //             "remaining_fee": "0",
        //             "paid_fee": "0",
        //             "locked": "10",
        //             "executed_volume": "0",
        //             "executed_funds": "0",
        //             "trades_count": 0
        //         }
        //     ]
        //
        return this.parseOrders(response, market, since, limit);
    }
    /**
     * @method
     * @name upbit#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://global-docs.upbit.com/reference/closed-order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest order
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let request = {
            'state': 'done',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [request, params] = this.handleUntilOption('end_time', request, params);
        const response = await this.privateGetOrdersClosed(this.extend(request, params));
        //
        //     [
        //         {
        //             "uuid": "637fd66-d019-4d77-bee6-8e0cff28edd9",
        //             "side": "ask",
        //             "ord_type": "limit",
        //             "price": "1.5",
        //             "state": "done",
        //             "market": "SGD-XRP",
        //             "created_at": "2024-06-05T09:37:10Z",
        //             "volume": "10",
        //             "remaining_volume": "10",
        //             "reserved_fee": "0",
        //             "remaining_fee": "0",
        //             "paid_fee": "0",
        //             "locked": "10",
        //             "executed_volume": "0",
        //             "executed_funds": "0",
        //             "trades_count": 0,
        //             "time_in_force": "ioc"
        //         }
        //     ]
        //
        return this.parseOrders(response, market, since, limit);
    }
    /**
     * @method
     * @name upbit#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://global-docs.upbit.com/reference/closed-order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] max number of orders to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest order
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let request = {
            'state': 'cancel',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [request, params] = this.handleUntilOption('end_time', request, params);
        const response = await this.privateGetOrdersClosed(this.extend(request, params));
        //
        //     [
        //         {
        //             "uuid": "637fd66-d019-4d77-bee6-8e0cff28edd9",
        //             "side": "ask",
        //             "ord_type": "limit",
        //             "price": "1.5",
        //             "state": "cancel",
        //             "market": "SGD-XRP",
        //             "created_at": "2024-06-05T09:37:10Z",
        //             "volume": "10",
        //             "remaining_volume": "10",
        //             "reserved_fee": "0",
        //             "remaining_fee": "0",
        //             "paid_fee": "0",
        //             "locked": "10",
        //             "executed_volume": "0",
        //             "executed_funds": "0",
        //             "trades_count": 0,
        //             "time_in_force": "ioc"
        //         }
        //     ]
        //
        return this.parseOrders(response, market, since, limit);
    }
    /**
     * @method
     * @name upbit#fetchOrder
     * @see https://docs.upbit.com/reference/%EA%B0%9C%EB%B3%84-%EC%A3%BC%EB%AC%B8-%EC%A1%B0%ED%9A%8C
     * @description fetches information on an order made by the user
     * @param {string} id order id
     * @param {string} symbol not used by upbit fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'uuid': id,
        };
        const response = await this.privateGetOrder(this.extend(request, params));
        //
        //     {
        //         "uuid": "a08f09b1-1718-42e2-9358-f0e5e083d3ee",
        //         "side": "bid",
        //         "ord_type": "limit",
        //         "price": "17417000.0",
        //         "state": "done",
        //         "market": "KRW-BTC",
        //         "created_at": "2018-04-05T14:09:14+09:00",
        //         "volume": "1.0",
        //         "remaining_volume": "0.0",
        //         "reserved_fee": "26125.5",
        //         "remaining_fee": "25974.0",
        //         "paid_fee": "151.5",
        //         "locked": "17341974.0",
        //         "executed_volume": "1.0",
        //         "trades_count": 2,
        //         "trades": [
        //             {
        //                 "market": "KRW-BTC",
        //                 "uuid": "78162304-1a4d-4524-b9e6-c9a9e14d76c3",
        //                 "price": "101000.0",
        //                 "volume": "0.77368323",
        //                 "funds": "78142.00623",
        //                 "ask_fee": "117.213009345",
        //                 "bid_fee": "117.213009345",
        //                 "created_at": "2018-04-05T14:09:15+09:00",
        //                 "side": "bid"
        //             },
        //             {
        //                 "market": "KRW-BTC",
        //                 "uuid": "f73da467-c42f-407d-92fa-e10d86450a20",
        //                 "price": "101000.0",
        //                 "volume": "0.22631677",
        //                 "funds": "22857.99377",
        //                 "ask_fee": "34.286990655",
        //                 "bid_fee": "34.286990655",
        //                 "created_at": "2018-04-05T14:09:15+09:00",
        //                 "side": "bid"
        //             }
        //         ]
        //     }
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name upbit#fetchDepositAddresses
     * @see https://docs.upbit.com/reference/%EC%A0%84%EC%B2%B4-%EC%9E%85%EA%B8%88-%EC%A3%BC%EC%86%8C-%EC%A1%B0%ED%9A%8C
     * @description fetch deposit addresses for multiple currencies and chain types
     * @param {string[]|undefined} codes list of unified currency codes, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddresses(codes = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetDepositsCoinAddresses(params);
        //
        //     [
        //         {
        //             "currency": "BTC",
        //             "deposit_address": "3EusRwybuZUhVDeHL7gh3HSLmbhLcy7NqD",
        //             "secondary_address": null
        //         },
        //         {
        //             "currency": "ETH",
        //             "deposit_address": "0x0d73e0a482b8cf568976d2e8688f4a899d29301c",
        //             "secondary_address": null
        //         },
        //         {
        //             "currency": "XRP",
        //             "deposit_address": "rN9qNpgnBaZwqCg8CvUZRPqCcPPY7wfWep",
        //             "secondary_address": "3057887915"
        //         }
        //     ]
        //
        return this.parseDepositAddresses(response, codes);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //    {
        //        currency: 'XRP',
        //        net_type: 'XRP',
        //        deposit_address: 'raQwCVAJVqjrVm1Nj5SFRcX8i22BhdC9WA',
        //        secondary_address: '167029435'
        //    }
        //
        const address = this.safeString(depositAddress, 'deposit_address');
        const tag = this.safeString(depositAddress, 'secondary_address');
        const currencyId = this.safeString(depositAddress, 'currency');
        const code = this.safeCurrencyCode(currencyId);
        const networkId = this.safeString(depositAddress, 'net_type');
        this.checkAddress(address);
        return {
            'info': depositAddress,
            'currency': code,
            'network': this.networkIdToCode(networkId),
            'address': address,
            'tag': tag,
        };
    }
    /**
     * @method
     * @name upbit#fetchDepositAddress
     * @see https://docs.upbit.com/reference/%EC%A0%84%EC%B2%B4-%EC%9E%85%EA%B8%88-%EC%A3%BC%EC%86%8C-%EC%A1%B0%ED%9A%8C
     * @description fetch the deposit address for a currency associated with this account
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.network deposit chain, can view all chains via this.publicGetWalletAssets, default is eth, unless the currency has a default chain within this.options['networks']
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchDepositAddress requires params["network"]');
        }
        const response = await this.privateGetDepositsCoinAddress(this.extend({
            'currency': currency['id'],
            'net_type': this.networkCodeToId(networkCode, currency['code']),
        }, params));
        //
        //    {
        //        currency: 'XRP',
        //        net_type: 'XRP',
        //        deposit_address: 'raQwCVAJVqjrVm1Nj5SFRcX8i22BhdC9WA',
        //        secondary_address: '167029435'
        //    }
        //
        return this.parseDepositAddress(response);
    }
    /**
     * @method
     * @name upbit#createDepositAddress
     * @see https://docs.upbit.com/reference/%EC%9E%85%EA%B8%88-%EC%A3%BC%EC%86%8C-%EC%83%9D%EC%84%B1-%EC%9A%94%EC%B2%AD
     * @description create a currency deposit address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async createDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        // https://github.com/ccxt/ccxt/issues/6452
        const response = await this.privatePostDepositsGenerateCoinAddress(this.extend(request, params));
        //
        // https://docs.upbit.com/v1.0/reference#%EC%9E%85%EA%B8%88-%EC%A3%BC%EC%86%8C-%EC%83%9D%EC%84%B1-%EC%9A%94%EC%B2%AD
        // can be any of the two responses:
        //
        //     {
        //         "success" : true,
        //         "message" : "Creating BTC deposit address."
        //     }
        //
        //     {
        //         "currency": "BTC",
        //         "deposit_address": "3EusRwybuZUhVDeHL7gh3HSLmbhLcy7NqD",
        //         "secondary_address": null
        //     }
        //
        const message = this.safeString(response, 'message');
        if (message !== undefined) {
            throw new errors.AddressPending(this.id + ' is generating ' + code + ' deposit address, call fetchDepositAddress or createDepositAddress one more time later to retrieve the generated address');
        }
        return this.parseDepositAddress(response);
    }
    /**
     * @method
     * @name upbit#withdraw
     * @see https://docs.upbit.com/reference/디지털자산-출금하기
     * @see https://docs.upbit.com/reference/%EC%9B%90%ED%99%94-%EC%B6%9C%EA%B8%88%ED%95%98%EA%B8%B0
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'amount': amount,
        };
        let response = undefined;
        if (code !== 'KRW') {
            this.checkAddress(address);
            // 2023-05-23 Change to required parameters for digital assets
            const network = this.safeStringUpper2(params, 'network', 'net_type');
            if (network === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' withdraw() requires a network argument');
            }
            params = this.omit(params, ['network']);
            request['net_type'] = network;
            request['currency'] = currency['id'];
            request['address'] = address;
            if (tag !== undefined) {
                request['secondary_address'] = tag;
            }
            params = this.omit(params, 'network');
            response = await this.privatePostWithdrawsCoin(this.extend(request, params));
        }
        else {
            response = await this.privatePostWithdrawsKrw(this.extend(request, params));
        }
        //
        //     {
        //         "type": "withdraw",
        //         "uuid": "9f432943-54e0-40b7-825f-b6fec8b42b79",
        //         "currency": "BTC",
        //         "txid": "ebe6937b-130e-4066-8ac6-4b0e67f28adc",
        //         "state": "processing",
        //         "created_at": "2018-04-13T11:24:01+09:00",
        //         "done_at": null,
        //         "amount": "0.01",
        //         "fee": "0.0",
        //         "krw_amount": "80420.0"
        //     }
        //
        return this.parseTransaction(response);
    }
    nonce() {
        return this.milliseconds();
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams(this.urls['api'][api], {
            'hostname': this.hostname,
        });
        url += '/' + this.version + '/' + this.implodeParams(path, params);
        const query = this.omit(params, this.extractParams(path));
        if (method !== 'POST') {
            if (Object.keys(query).length) {
                url += '?' + this.urlencode(query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials();
            headers = {};
            const nonce = this.uuid();
            const request = {
                'access_key': this.apiKey,
                'nonce': nonce,
            };
            const hasQuery = Object.keys(query).length;
            let auth = undefined;
            if ((method !== 'GET') && (method !== 'DELETE')) {
                body = this.json(params);
                headers['Content-Type'] = 'application/json';
            }
            if (hasQuery) {
                auth = this.rawencode(query);
            }
            if (auth !== undefined) {
                const hash = this.hash(this.encode(auth), sha512.sha512);
                request['query_hash'] = hash;
                request['query_hash_alg'] = 'SHA512';
            }
            const token = rsa.jwt(request, this.encode(this.secret), sha256.sha256);
            headers['Authorization'] = 'Bearer ' + token;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //   { 'error': { 'message': "Missing request parameter error. Check the required parameters!", 'name': 400 } },
        //   { 'error': { 'message': "side is missing, side does not have a valid value", 'name': "validation_error" } },
        //   { 'error': { 'message': "개인정보 제 3자 제공 동의가 필요합니다.", 'name': "thirdparty_agreement_required" } },
        //   { 'error': { 'message': "권한이 부족합니다.", 'name': "out_of_scope" } },
        //   { 'error': { 'message': "주문을 찾지 못했습니다.", 'name': "order_not_found" } },
        //   { 'error': { 'message': "주문가능한 금액(ETH)이 부족합니다.", 'name': "insufficient_funds_ask" } },
        //   { 'error': { 'message': "주문가능한 금액(BTC)이 부족합니다.", 'name': "insufficient_funds_bid" } },
        //   { 'error': { 'message': "잘못된 엑세스 키입니다.", 'name': "invalid_access_key" } },
        //   { 'error': { 'message': "Jwt 토큰 검증에 실패했습니다.", 'name': "jwt_verification" } }
        //
        const error = this.safeValue(response, 'error');
        if (error !== undefined) {
            const message = this.safeString(error, 'message');
            const name = this.safeString(error, 'name');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], message, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], name, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], name, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
}

module.exports = upbit;
