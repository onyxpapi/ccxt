import testSharedMethods from './base/test.sharedMethods.js';
import testTrade from './base/test.trade.js';
async function testFetchMyTrades(exchange, skippedProperties, symbol) {
    const method = 'fetchMyTrades';
    const trades = await exchange.fetchMyTrades(symbol);
    testSharedMethods.assertNonEmtpyArray(exchange, skippedProperties, method, trades, symbol);
    const now = exchange.milliseconds();
    for (let i = 0; i < trades.length; i++) {
        testTrade(exchange, skippedProperties, method, trades[i], symbol, now);
    }
    testSharedMethods.assertTimestampOrder(exchange, method, symbol, trades);
    return true;
}
export default testFetchMyTrades;
