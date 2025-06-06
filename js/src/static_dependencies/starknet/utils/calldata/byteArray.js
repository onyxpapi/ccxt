import { toHex } from '../num.js';
import { decodeShortString, encodeShortString, splitLongString } from '../shortString.js';
/**
 * convert a Cairo ByteArray to a JS string
 * @param myByteArray Cairo representation of a LongString
 * @returns a JS string
 * @example
 * ```typescript
 * const myByteArray = {
 *    data: [],
 *    pending_word: '0x414243444546474849',
 *    pending_word_len: 9
 * }
 * const result: String = stringFromByteArray(myByteArray); // ABCDEFGHI
 * ```
 */
export function stringFromByteArray(myByteArray) {
    const pending_word = BigInt(myByteArray.pending_word) === 0n
        ? ''
        : decodeShortString(toHex(myByteArray.pending_word));
    return (myByteArray.data.reduce((cumuledString, encodedString) => {
        const add = BigInt(encodedString) === 0n ? '' : decodeShortString(toHex(encodedString));
        return cumuledString + add;
    }, '') + pending_word);
}
/**
 * convert a JS string to a Cairo ByteArray
 * @param targetString a JS string
 * @returns Cairo representation of a LongString
 * @example
 * ```typescript
 * const myByteArray: ByteArray = byteArrayFromString("ABCDEFGHI");
 * ```
 * Result is :
 * {
 *    data: [],
 *    pending_word: '0x414243444546474849',
 *    pending_word_len: 9
 * }
 */
export function byteArrayFromString(targetString) {
    const shortStrings = splitLongString(targetString);
    const remainder = shortStrings[shortStrings.length - 1];
    const shortStringsEncoded = shortStrings.map(encodeShortString);
    const [pendingWord, pendingWordLength] = remainder === undefined || remainder.length === 31
        ? ['0x00', 0]
        : [shortStringsEncoded.pop(), remainder.length];
    return {
        data: shortStringsEncoded.length === 0 ? [] : shortStringsEncoded,
        pending_word: pendingWord,
        pending_word_len: pendingWordLength,
    };
}
