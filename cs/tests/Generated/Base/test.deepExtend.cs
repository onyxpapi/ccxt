using ccxt;
namespace Tests;

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

public partial class BaseTest
{
        public object testDeepExtend()
        {
            var exchange = new ccxt.Exchange(new Dictionary<string, object>() {
                { "id", "sampleexchange" },
            });
            Assert(isEqual(exchange.parseToNumeric("1"), 1));
            return true;  // dummy for now
        }
}