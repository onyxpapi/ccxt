var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FixedNumber_instances, _FixedNumber_format, _FixedNumber_val, _FixedNumber_tens, _FixedNumber_checkFormat, _FixedNumber_checkValue, _FixedNumber_add, _FixedNumber_sub, _FixedNumber_mul, _FixedNumber_div;
/**
 *  The **FixedNumber** class permits using values with decimal places,
 *  using fixed-pont math.
 *
 *  Fixed-point math is still based on integers under-the-hood, but uses an
 *  internal offset to store fractional components below, and each operation
 *  corrects for this after each operation.
 *
 *  @_section: api/utils/fixed-point-math:Fixed-Point Maths  [about-fixed-point-math]
 */
import { getBytes } from "./data.js";
import { assert, assertArgument, assertPrivate } from "./errors.js";
import { getBigInt, getNumber, fromTwos, mask, toBigInt } from "./maths.js";
import { defineProperties } from "./properties.js";
const BN_N1 = BigInt(-1);
const BN_0 = BigInt(0);
const BN_1 = BigInt(1);
const BN_5 = BigInt(5);
const _guard = {};
// Constant to pull zeros from for multipliers
let Zeros = "0000";
while (Zeros.length < 80) {
    Zeros += Zeros;
}
// Returns a string "1" followed by decimal "0"s
function getTens(decimals) {
    let result = Zeros;
    while (result.length < decimals) {
        result += result;
    }
    return BigInt("1" + result.substring(0, decimals));
}
function checkValue(val, format, safeOp) {
    const width = BigInt(format.width);
    if (format.signed) {
        const limit = (BN_1 << (width - BN_1));
        assert(safeOp == null || (val >= -limit && val < limit), "overflow", "NUMERIC_FAULT", {
            operation: safeOp, fault: "overflow", value: val
        });
        if (val > BN_0) {
            val = fromTwos(mask(val, width), width);
        }
        else {
            val = -fromTwos(mask(-val, width), width);
        }
    }
    else {
        const limit = (BN_1 << width);
        assert(safeOp == null || (val >= 0 && val < limit), "overflow", "NUMERIC_FAULT", {
            operation: safeOp, fault: "overflow", value: val
        });
        val = (((val % limit) + limit) % limit) & (limit - BN_1);
    }
    return val;
}
function getFormat(value) {
    if (typeof (value) === "number") {
        value = `fixed128x${value}`;
    }
    let signed = true;
    let width = 128;
    let decimals = 18;
    if (typeof (value) === "string") {
        // Parse the format string
        if (value === "fixed") {
            // defaults...
        }
        else if (value === "ufixed") {
            signed = false;
        }
        else {
            const match = value.match(/^(u?)fixed([0-9]+)x([0-9]+)$/);
            assertArgument(match, "invalid fixed format", "format", value);
            signed = (match[1] !== "u");
            width = parseInt(match[2]);
            decimals = parseInt(match[3]);
        }
    }
    else if (value) {
        // Extract the values from the object
        const v = value;
        const check = (key, type, defaultValue) => {
            if (v[key] == null) {
                return defaultValue;
            }
            assertArgument(typeof (v[key]) === type, "invalid fixed format (" + key + " not " + type + ")", "format." + key, v[key]);
            return v[key];
        };
        signed = check("signed", "boolean", signed);
        width = check("width", "number", width);
        decimals = check("decimals", "number", decimals);
    }
    assertArgument((width % 8) === 0, "invalid FixedNumber width (not byte aligned)", "format.width", width);
    assertArgument(decimals <= 80, "invalid FixedNumber decimals (too large)", "format.decimals", decimals);
    const name = (signed ? "" : "u") + "fixed" + String(width) + "x" + String(decimals);
    return { signed, width, decimals, name };
}
function toString(val, decimals) {
    let negative = "";
    if (val < BN_0) {
        negative = "-";
        val *= BN_N1;
    }
    let str = val.toString();
    // No decimal point for whole values
    if (decimals === 0) {
        return (negative + str);
    }
    // Pad out to the whole component (including a whole digit)
    while (str.length <= decimals) {
        str = Zeros + str;
    }
    // Insert the decimal point
    const index = str.length - decimals;
    str = str.substring(0, index) + "." + str.substring(index);
    // Trim the whole component (leaving at least one 0)
    while (str[0] === "0" && str[1] !== ".") {
        str = str.substring(1);
    }
    // Trim the decimal component (leaving at least one 0)
    while (str[str.length - 1] === "0" && str[str.length - 2] !== ".") {
        str = str.substring(0, str.length - 1);
    }
    return (negative + str);
}
/**
 *  A FixedNumber represents a value over its [[FixedFormat]]
 *  arithmetic field.
 *
 *  A FixedNumber can be used to perform math, losslessly, on
 *  values which have decmial places.
 *
 *  A FixedNumber has a fixed bit-width to store values in, and stores all
 *  values internally by multiplying the value by 10 raised to the power of
 *  %%decimals%%.
 *
 *  If operations are performed that cause a value to grow too high (close to
 *  positive infinity) or too low (close to negative infinity), the value
 *  is said to //overflow//.
 *
 *  For example, an 8-bit signed value, with 0 decimals may only be within
 *  the range ``-128`` to ``127``; so ``-128 - 1`` will overflow and become
 *  ``127``. Likewise, ``127 + 1`` will overflow and become ``-127``.
 *
 *  Many operation have a normal and //unsafe// variant. The normal variant
 *  will throw a [[NumericFaultError]] on any overflow, while the //unsafe//
 *  variant will silently allow overflow, corrupting its value value.
 *
 *  If operations are performed that cause a value to become too small
 *  (close to zero), the value loses precison and is said to //underflow//.
 *
 *  For example, an value with 1 decimal place may store a number as small
 *  as ``0.1``, but the value of ``0.1 / 2`` is ``0.05``, which cannot fit
 *  into 1 decimal place, so underflow occurs which means precision is lost
 *  and the value becomes ``0``.
 *
 *  Some operations have a normal and //signalling// variant. The normal
 *  variant will silently ignore underflow, while the //signalling// variant
 *  will thow a [[NumericFaultError]] on underflow.
 */
export class FixedNumber {
    // Use this when changing this file to get some typing info,
    // but then switch to any to mask the internal type
    //constructor(guard: any, value: bigint, format: _FixedFormat) {
    /**
     *  @private
     */
    constructor(guard, value, format) {
        _FixedNumber_instances.add(this);
        _FixedNumber_format.set(this, void 0);
        // The actual value (accounting for decimals)
        _FixedNumber_val.set(this, void 0);
        // A base-10 value to multiple values by to maintain the magnitude
        _FixedNumber_tens.set(this, void 0);
        assertPrivate(guard, _guard, "FixedNumber");
        __classPrivateFieldSet(this, _FixedNumber_val, value, "f");
        __classPrivateFieldSet(this, _FixedNumber_format, format, "f");
        const _value = toString(value, format.decimals);
        defineProperties(this, { format: format.name, _value });
        __classPrivateFieldSet(this, _FixedNumber_tens, getTens(format.decimals), "f");
    }
    /**
     *  If true, negative values are permitted, otherwise only
     *  positive values and zero are allowed.
     */
    get signed() { return __classPrivateFieldGet(this, _FixedNumber_format, "f").signed; }
    /**
     *  The number of bits available to store the value.
     */
    get width() { return __classPrivateFieldGet(this, _FixedNumber_format, "f").width; }
    /**
     *  The number of decimal places in the fixed-point arithment field.
     */
    get decimals() { return __classPrivateFieldGet(this, _FixedNumber_format, "f").decimals; }
    /**
     *  The value as an integer, based on the smallest unit the
     *  [[decimals]] allow.
     */
    get value() { return __classPrivateFieldGet(this, _FixedNumber_val, "f"); }
    /**
     *  Returns a new [[FixedNumber]] with the result of %%this%% added
     *  to %%other%%, ignoring overflow.
     */
    addUnsafe(other) { return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_add).call(this, other); }
    /**
     *  Returns a new [[FixedNumber]] with the result of %%this%% added
     *  to %%other%%. A [[NumericFaultError]] is thrown if overflow
     *  occurs.
     */
    add(other) { return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_add).call(this, other, "add"); }
    /**
     *  Returns a new [[FixedNumber]] with the result of %%other%% subtracted
     *  from %%this%%, ignoring overflow.
     */
    subUnsafe(other) { return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_sub).call(this, other); }
    /**
     *  Returns a new [[FixedNumber]] with the result of %%other%% subtracted
     *  from %%this%%. A [[NumericFaultError]] is thrown if overflow
     *  occurs.
     */
    sub(other) { return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_sub).call(this, other, "sub"); }
    /**
     *  Returns a new [[FixedNumber]] with the result of %%this%% multiplied
     *  by %%other%%, ignoring overflow and underflow (precision loss).
     */
    mulUnsafe(other) { return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_mul).call(this, other); }
    /**
     *  Returns a new [[FixedNumber]] with the result of %%this%% multiplied
     *  by %%other%%. A [[NumericFaultError]] is thrown if overflow
     *  occurs.
     */
    mul(other) { return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_mul).call(this, other, "mul"); }
    /**
     *  Returns a new [[FixedNumber]] with the result of %%this%% multiplied
     *  by %%other%%. A [[NumericFaultError]] is thrown if overflow
     *  occurs or if underflow (precision loss) occurs.
     */
    mulSignal(other) {
        __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_checkFormat).call(this, other);
        const value = __classPrivateFieldGet(this, _FixedNumber_val, "f") * __classPrivateFieldGet(other, _FixedNumber_val, "f");
        assert((value % __classPrivateFieldGet(this, _FixedNumber_tens, "f")) === BN_0, "precision lost during signalling mul", "NUMERIC_FAULT", {
            operation: "mulSignal", fault: "underflow", value: this
        });
        return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_checkValue).call(this, value / __classPrivateFieldGet(this, _FixedNumber_tens, "f"), "mulSignal");
    }
    /**
     *  Returns a new [[FixedNumber]] with the result of %%this%% divided
     *  by %%other%%, ignoring underflow (precision loss). A
     *  [[NumericFaultError]] is thrown if overflow occurs.
     */
    divUnsafe(other) { return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_div).call(this, other); }
    /**
     *  Returns a new [[FixedNumber]] with the result of %%this%% divided
     *  by %%other%%, ignoring underflow (precision loss). A
     *  [[NumericFaultError]] is thrown if overflow occurs.
     */
    div(other) { return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_div).call(this, other, "div"); }
    /**
     *  Returns a new [[FixedNumber]] with the result of %%this%% divided
     *  by %%other%%. A [[NumericFaultError]] is thrown if underflow
     *  (precision loss) occurs.
     */
    divSignal(other) {
        assert(__classPrivateFieldGet(other, _FixedNumber_val, "f") !== BN_0, "division by zero", "NUMERIC_FAULT", {
            operation: "div", fault: "divide-by-zero", value: this
        });
        __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_checkFormat).call(this, other);
        const value = (__classPrivateFieldGet(this, _FixedNumber_val, "f") * __classPrivateFieldGet(this, _FixedNumber_tens, "f"));
        assert((value % __classPrivateFieldGet(other, _FixedNumber_val, "f")) === BN_0, "precision lost during signalling div", "NUMERIC_FAULT", {
            operation: "divSignal", fault: "underflow", value: this
        });
        return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_checkValue).call(this, value / __classPrivateFieldGet(other, _FixedNumber_val, "f"), "divSignal");
    }
    /**
     *  Returns a comparison result between %%this%% and %%other%%.
     *
     *  This is suitable for use in sorting, where ``-1`` implies %%this%%
     *  is smaller, ``1`` implies %%this%% is larger and ``0`` implies
     *  both are equal.
     */
    cmp(other) {
        let a = this.value, b = other.value;
        // Coerce a and b to the same magnitude
        const delta = this.decimals - other.decimals;
        if (delta > 0) {
            b *= getTens(delta);
        }
        else if (delta < 0) {
            a *= getTens(-delta);
        }
        // Comnpare
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    }
    /**
     *  Returns true if %%other%% is equal to %%this%%.
     */
    eq(other) { return this.cmp(other) === 0; }
    /**
     *  Returns true if %%other%% is less than to %%this%%.
     */
    lt(other) { return this.cmp(other) < 0; }
    /**
     *  Returns true if %%other%% is less than or equal to %%this%%.
     */
    lte(other) { return this.cmp(other) <= 0; }
    /**
     *  Returns true if %%other%% is greater than to %%this%%.
     */
    gt(other) { return this.cmp(other) > 0; }
    /**
     *  Returns true if %%other%% is greater than or equal to %%this%%.
     */
    gte(other) { return this.cmp(other) >= 0; }
    /**
     *  Returns a new [[FixedNumber]] which is the largest **integer**
     *  that is less than or equal to %%this%%.
     *
     *  The decimal component of the result will always be ``0``.
     */
    floor() {
        let val = __classPrivateFieldGet(this, _FixedNumber_val, "f");
        if (__classPrivateFieldGet(this, _FixedNumber_val, "f") < BN_0) {
            val -= __classPrivateFieldGet(this, _FixedNumber_tens, "f") - BN_1;
        }
        val = (__classPrivateFieldGet(this, _FixedNumber_val, "f") / __classPrivateFieldGet(this, _FixedNumber_tens, "f")) * __classPrivateFieldGet(this, _FixedNumber_tens, "f");
        return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_checkValue).call(this, val, "floor");
    }
    /**
     *  Returns a new [[FixedNumber]] which is the smallest **integer**
     *  that is greater than or equal to %%this%%.
     *
     *  The decimal component of the result will always be ``0``.
     */
    ceiling() {
        let val = __classPrivateFieldGet(this, _FixedNumber_val, "f");
        if (__classPrivateFieldGet(this, _FixedNumber_val, "f") > BN_0) {
            val += __classPrivateFieldGet(this, _FixedNumber_tens, "f") - BN_1;
        }
        val = (__classPrivateFieldGet(this, _FixedNumber_val, "f") / __classPrivateFieldGet(this, _FixedNumber_tens, "f")) * __classPrivateFieldGet(this, _FixedNumber_tens, "f");
        return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_checkValue).call(this, val, "ceiling");
    }
    /**
     *  Returns a new [[FixedNumber]] with the decimal component
     *  rounded up on ties at %%decimals%% places.
     */
    round(decimals) {
        if (decimals == null) {
            decimals = 0;
        }
        // Not enough precision to not already be rounded
        if (decimals >= this.decimals) {
            return this;
        }
        const delta = this.decimals - decimals;
        const bump = BN_5 * getTens(delta - 1);
        let value = this.value + bump;
        const tens = getTens(delta);
        value = (value / tens) * tens;
        checkValue(value, __classPrivateFieldGet(this, _FixedNumber_format, "f"), "round");
        return new FixedNumber(_guard, value, __classPrivateFieldGet(this, _FixedNumber_format, "f"));
    }
    /**
     *  Returns true if %%this%% is equal to ``0``.
     */
    isZero() { return (__classPrivateFieldGet(this, _FixedNumber_val, "f") === BN_0); }
    /**
     *  Returns true if %%this%% is less than ``0``.
     */
    isNegative() { return (__classPrivateFieldGet(this, _FixedNumber_val, "f") < BN_0); }
    /**
     *  Returns the string representation of %%this%%.
     */
    toString() { return this._value; }
    /**
     *  Returns a float approximation.
     *
     *  Due to IEEE 754 precission (or lack thereof), this function
     *  can only return an approximation and most values will contain
     *  rounding errors.
     */
    toUnsafeFloat() { return parseFloat(this.toString()); }
    /**
     *  Return a new [[FixedNumber]] with the same value but has had
     *  its field set to %%format%%.
     *
     *  This will throw if the value cannot fit into %%format%%.
     */
    toFormat(format) {
        return FixedNumber.fromString(this.toString(), format);
    }
    /**
     *  Creates a new [[FixedNumber]] for %%value%% divided by
     *  %%decimal%% places with %%format%%.
     *
     *  This will throw a [[NumericFaultError]] if %%value%% (once adjusted
     *  for %%decimals%%) cannot fit in %%format%%, either due to overflow
     *  or underflow (precision loss).
     */
    static fromValue(_value, _decimals, _format) {
        const decimals = (_decimals == null) ? 0 : getNumber(_decimals);
        const format = getFormat(_format);
        let value = getBigInt(_value, "value");
        const delta = decimals - format.decimals;
        if (delta > 0) {
            const tens = getTens(delta);
            assert((value % tens) === BN_0, "value loses precision for format", "NUMERIC_FAULT", {
                operation: "fromValue", fault: "underflow", value: _value
            });
            value /= tens;
        }
        else if (delta < 0) {
            value *= getTens(-delta);
        }
        checkValue(value, format, "fromValue");
        return new FixedNumber(_guard, value, format);
    }
    /**
     *  Creates a new [[FixedNumber]] for %%value%% with %%format%%.
     *
     *  This will throw a [[NumericFaultError]] if %%value%% cannot fit
     *  in %%format%%, either due to overflow or underflow (precision loss).
     */
    static fromString(_value, _format) {
        const match = _value.match(/^(-?)([0-9]*)\.?([0-9]*)$/);
        assertArgument(match && (match[2].length + match[3].length) > 0, "invalid FixedNumber string value", "value", _value);
        const format = getFormat(_format);
        let whole = (match[2] || "0"), decimal = (match[3] || "");
        // Pad out the decimals
        while (decimal.length < format.decimals) {
            decimal += Zeros;
        }
        // Check precision is safe
        assert(decimal.substring(format.decimals).match(/^0*$/), "too many decimals for format", "NUMERIC_FAULT", {
            operation: "fromString", fault: "underflow", value: _value
        });
        // Remove extra padding
        decimal = decimal.substring(0, format.decimals);
        const value = BigInt(match[1] + whole + decimal);
        checkValue(value, format, "fromString");
        return new FixedNumber(_guard, value, format);
    }
    /**
     *  Creates a new [[FixedNumber]] with the big-endian representation
     *  %%value%% with %%format%%.
     *
     *  This will throw a [[NumericFaultError]] if %%value%% cannot fit
     *  in %%format%% due to overflow.
     */
    static fromBytes(_value, _format) {
        let value = toBigInt(getBytes(_value, "value"));
        const format = getFormat(_format);
        if (format.signed) {
            value = fromTwos(value, format.width);
        }
        checkValue(value, format, "fromBytes");
        return new FixedNumber(_guard, value, format);
    }
}
_FixedNumber_format = new WeakMap(), _FixedNumber_val = new WeakMap(), _FixedNumber_tens = new WeakMap(), _FixedNumber_instances = new WeakSet(), _FixedNumber_checkFormat = function _FixedNumber_checkFormat(other) {
    assertArgument(this.format === other.format, "incompatible format; use fixedNumber.toFormat", "other", other);
}, _FixedNumber_checkValue = function _FixedNumber_checkValue(val, safeOp) {
    /*
            const width = BigInt(this.width);
            if (this.signed) {
                const limit = (BN_1 << (width - BN_1));
                assert(safeOp == null || (val >= -limit  && val < limit), "overflow", "NUMERIC_FAULT", {
                    operation: <string>safeOp, fault: "overflow", value: val
                });
    
                if (val > BN_0) {
                    val = fromTwos(mask(val, width), width);
                } else {
                    val = -fromTwos(mask(-val, width), width);
                }
    
            } else {
                const masked = mask(val, width);
                assert(safeOp == null || (val >= 0 && val === masked), "overflow", "NUMERIC_FAULT", {
                    operation: <string>safeOp, fault: "overflow", value: val
                });
                val = masked;
            }
    */
    val = checkValue(val, __classPrivateFieldGet(this, _FixedNumber_format, "f"), safeOp);
    return new FixedNumber(_guard, val, __classPrivateFieldGet(this, _FixedNumber_format, "f"));
}, _FixedNumber_add = function _FixedNumber_add(o, safeOp) {
    __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_checkFormat).call(this, o);
    return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_checkValue).call(this, __classPrivateFieldGet(this, _FixedNumber_val, "f") + __classPrivateFieldGet(o, _FixedNumber_val, "f"), safeOp);
}, _FixedNumber_sub = function _FixedNumber_sub(o, safeOp) {
    __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_checkFormat).call(this, o);
    return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_checkValue).call(this, __classPrivateFieldGet(this, _FixedNumber_val, "f") - __classPrivateFieldGet(o, _FixedNumber_val, "f"), safeOp);
}, _FixedNumber_mul = function _FixedNumber_mul(o, safeOp) {
    __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_checkFormat).call(this, o);
    return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_checkValue).call(this, (__classPrivateFieldGet(this, _FixedNumber_val, "f") * __classPrivateFieldGet(o, _FixedNumber_val, "f")) / __classPrivateFieldGet(this, _FixedNumber_tens, "f"), safeOp);
}, _FixedNumber_div = function _FixedNumber_div(o, safeOp) {
    assert(__classPrivateFieldGet(o, _FixedNumber_val, "f") !== BN_0, "division by zero", "NUMERIC_FAULT", {
        operation: "div", fault: "divide-by-zero", value: this
    });
    __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_checkFormat).call(this, o);
    return __classPrivateFieldGet(this, _FixedNumber_instances, "m", _FixedNumber_checkValue).call(this, (__classPrivateFieldGet(this, _FixedNumber_val, "f") * __classPrivateFieldGet(this, _FixedNumber_tens, "f")) / __classPrivateFieldGet(o, _FixedNumber_val, "f"), safeOp);
};
//const f1 = FixedNumber.fromString("12.56", "fixed16x2");
//const f2 = FixedNumber.fromString("0.3", "fixed16x2");
//console.log(f1.divSignal(f2));
//const BUMP = FixedNumber.from("0.5");
