// AUTO_TRANSPILE_ENABLED
import assert from 'assert';
import ccxt from '../../../ccxt.js';
import { ROUND_DOWN, ROUND_UP } from '../../base/functions/number.js';
function testDatetime() {
    const exchange = new ccxt.Exchange({
        'id': 'regirock',
    });
    assert(exchange.iso8601(514862627000) === '1986-04-26T01:23:47.000Z');
    assert(exchange.iso8601(514862627559) === '1986-04-26T01:23:47.559Z');
    assert(exchange.iso8601(514862627062) === '1986-04-26T01:23:47.062Z');
    assert(exchange.iso8601(0) === '1970-01-01T00:00:00.000Z');
    assert(exchange.iso8601(-1) === undefined);
    // assert (exchange.iso8601 () === undefined);
    // todo: assert (exchange.iso8601 () === undefined);
    assert(exchange.iso8601(undefined) === undefined);
    assert(exchange.iso8601('') === undefined);
    assert(exchange.iso8601('a') === undefined);
    assert(exchange.iso8601({}) === undefined);
    // ----------------------------------------------------------------------------
    assert(exchange.parse8601('1986-04-26T01:23:47.000Z') === 514862627000);
    assert(exchange.parse8601('1986-04-26T01:23:47.559Z') === 514862627559);
    assert(exchange.parse8601('1986-04-26T01:23:47.062Z') === 514862627062);
    assert(exchange.parse8601('1986-04-26T01:23:47.06Z') === 514862627060);
    assert(exchange.parse8601('1986-04-26T01:23:47.6Z') === 514862627600);
    assert(exchange.parse8601('1977-13-13T00:00:00.000Z') === undefined);
    assert(exchange.parse8601('1986-04-26T25:71:47.000Z') === undefined);
    assert(exchange.parse8601('3333') === undefined);
    assert(exchange.parse8601('Sr90') === undefined);
    assert(exchange.parse8601('') === undefined);
    // assert (exchange.parse8601 () === undefined);
    // todo: assert (exchange.parse8601 () === undefined);
    assert(exchange.parse8601(undefined) === undefined);
    assert(exchange.parse8601({}) === undefined);
    assert(exchange.parse8601(33) === undefined);
    // ----------------------------------------------------------------------------
    assert(exchange.parseDate('1986-04-26 00:00:00') === 514857600000);
    assert(exchange.parseDate('1986-04-26T01:23:47.000Z') === 514862627000);
    assert(exchange.parseDate('1986-13-13 00:00:00') === undefined);
    // GMT formats (todo: bugs in php)
    // assert (exchange.parseDate ('Mon, 29 Apr 2024 14:00:17 GMT') === 1714399217000);
    // assert (exchange.parseDate ('Mon, 29 Apr 2024 14:09:17 GMT') === 1714399757000);
    // assert (exchange.parseDate ('Sun, 29 Dec 2024 01:01:10 GMT') === 1735434070000);
    // assert (exchange.parseDate ('Sun, 29 Dec 2024 02:11:10 GMT') === 1735438270000);
    // assert (exchange.parseDate ('Sun, 08 Dec 2024 02:03:04 GMT') === 1733623384000);
    assert(exchange.roundTimeframe('5m', exchange.parse8601('2019-08-12 13:22:08'), ROUND_DOWN) === exchange.parse8601('2019-08-12 13:20:00'));
    assert(exchange.roundTimeframe('10m', exchange.parse8601('2019-08-12 13:22:08'), ROUND_DOWN) === exchange.parse8601('2019-08-12 13:20:00'));
    assert(exchange.roundTimeframe('30m', exchange.parse8601('2019-08-12 13:22:08'), ROUND_DOWN) === exchange.parse8601('2019-08-12 13:00:00'));
    assert(exchange.roundTimeframe('1d', exchange.parse8601('2019-08-12 13:22:08'), ROUND_DOWN) === exchange.parse8601('2019-08-12 00:00:00'));
    assert(exchange.roundTimeframe('5m', exchange.parse8601('2019-08-12 13:22:08'), ROUND_UP) === exchange.parse8601('2019-08-12 13:25:00'));
    assert(exchange.roundTimeframe('10m', exchange.parse8601('2019-08-12 13:22:08'), ROUND_UP) === exchange.parse8601('2019-08-12 13:30:00'));
    assert(exchange.roundTimeframe('30m', exchange.parse8601('2019-08-12 13:22:08'), ROUND_UP) === exchange.parse8601('2019-08-12 13:30:00'));
    assert(exchange.roundTimeframe('1h', exchange.parse8601('2019-08-12 13:22:08'), ROUND_UP) === exchange.parse8601('2019-08-12 14:00:00'));
    assert(exchange.roundTimeframe('1d', exchange.parse8601('2019-08-12 13:22:08'), ROUND_UP) === exchange.parse8601('2019-08-13 00:00:00'));
    // todo:
    // $this->assertSame(null, Exchange::iso8601(null));
    // $this->assertSame(null, Exchange::iso8601(false));
    // $this->assertSame(null, Exchange::iso8601([]));
    // $this->assertSame(null, Exchange::iso8601('abracadabra'));
    // $this->assertSame(null, Exchange::iso8601('1.2'));
    // $this->assertSame(null, Exchange::iso8601(-1));
    // $this->assertSame(null, Exchange::iso8601('-1'));
    // $this->assertSame('1970-01-01T00:00:00.000+00:00', Exchange::iso8601(0));
    // $this->assertSame('1970-01-01T00:00:00.000+00:00', Exchange::iso8601('0'));
    // $this->assertSame('1986-04-25T21:23:47.000+00:00', Exchange::iso8601(514848227000));
    // $this->assertSame('1986-04-25T21:23:47.000+00:00', Exchange::iso8601('514848227000'));
    // $this->assertSame(null, Exchange::parse_date(null));
    // $this->assertSame(null, Exchange::parse_date(0));
    // $this->assertSame(null, Exchange::parse_date('0'));
    // $this->assertSame(null, Exchange::parse_date('+1 day'));
    // $this->assertSame(null, Exchange::parse_date('1986-04-25T21:23:47+00:00 + 1 week'));
    // $this->assertSame(null, Exchange::parse_date('1 february'));
    // $this->assertSame(null, Exchange::parse_date('1986-04-26'));
    // $this->assertSame(0, Exchange::parse_date('1970-01-01T00:00:00.000+00:00'));
    // $this->assertSame(514848227000, Exchange::parse_date('1986-04-25T21:23:47+00:00'));
    // $this->assertSame(514848227000, Exchange::parse_date('1986-04-26T01:23:47+04:00'));
    // $this->assertSame(514848227000, Exchange::parse_date('25 Apr 1986 21:23:47 GMT'));
    // $this->assertSame(514862627000, Exchange::parse_date('1986-04-26T01:23:47.000Z'));
    // $this->assertSame(514862627123, Exchange::parse_date('1986-04-26T01:23:47.123Z'));
}
export default testDatetime;
