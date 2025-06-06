import testSharedMethods from './test.sharedMethods.js';
function testTrade(exchange, skippedProperties, method, entry, symbol, now) {
    const format = {
        'info': {},
        'id': '12345-67890:09876/54321',
        'timestamp': 1502962946216,
        'datetime': '2017-08-17 12:42:48.000',
        'symbol': 'ETH/BTC',
        'order': '12345-67890:09876/54321',
        'side': 'buy',
        'takerOrMaker': 'taker',
        'price': exchange.parseNumber('0.06917684'),
        'amount': exchange.parseNumber('1.5'),
        'cost': exchange.parseNumber('0.10376526'),
        'fees': [],
        'fee': {},
    };
    // todo: add takeOrMaker as mandatory (atm, many exchanges fail)
    // removed side because some public endpoints return trades without side
    const emptyAllowedFor = ['fees', 'fee', 'symbol', 'order', 'id', 'takerOrMaker'];
    testSharedMethods.assertStructure(exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertTimestampAndDatetime(exchange, skippedProperties, method, entry, now);
    testSharedMethods.assertSymbol(exchange, skippedProperties, method, entry, 'symbol', symbol);
    //
    testSharedMethods.assertInArray(exchange, skippedProperties, method, entry, 'side', ['buy', 'sell']);
    testSharedMethods.assertInArray(exchange, skippedProperties, method, entry, 'takerOrMaker', ['taker', 'maker']);
    testSharedMethods.assertFeeStructure(exchange, skippedProperties, method, entry, 'fee');
    if (!('fees' in skippedProperties)) {
        // todo: remove undefined check and probably non-empty array check later
        if (entry['fees'] !== undefined) {
            for (let i = 0; i < entry['fees'].length; i++) {
                testSharedMethods.assertFeeStructure(exchange, skippedProperties, method, entry['fees'], i);
            }
        }
    }
}
export default testTrade;
