import { CairoUint256 } from '../cairoDataTypes/uint256.js';
import { CairoUint512 } from '../cairoDataTypes/uint512.js';
import { getArrayType, isCairo1Type, isLen, isTypeArray, isTypeByteArray, isTypeEnum, isTypeEthAddress, isTypeOption, isTypeResult, isTypeSecp256k1Point, isTypeStruct, isTypeTuple, } from './cairo.js';
import { CairoCustomEnum, CairoOption, CairoOptionVariant, CairoResult, CairoResultVariant, } from './enum/index.js';
import extractTupleMemberTypes from './tuple.js';
import { isString } from '../shortString.js';
function errorU256(key) {
    return Error(`Your object includes the property : ${key}, containing an Uint256 object without the 'low' and 'high' keys.`);
}
function errorU512(key) {
    return Error(`Your object includes the property : ${key}, containing an Uint512 object without the 'limb0' to 'limb3' keys.`);
}
export default function orderPropsByAbi(unorderedObject, abiOfObject, structs, enums) {
    const orderInput = (unorderedItem, abiType) => {
        if (isTypeArray(abiType)) {
            return orderArray(unorderedItem, abiType);
        }
        if (isTypeEnum(abiType, enums)) {
            const abiObj = enums[abiType];
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return orderEnum(unorderedItem, abiObj);
        }
        if (isTypeTuple(abiType)) {
            return orderTuple(unorderedItem, abiType);
        }
        if (isTypeEthAddress(abiType)) {
            return unorderedItem;
        }
        if (isTypeByteArray(abiType)) {
            return unorderedItem;
        }
        if (isTypeSecp256k1Point(abiType)) {
            return unorderedItem;
        }
        if (CairoUint256.isAbiType(abiType)) {
            const u256 = unorderedItem;
            if (typeof u256 !== 'object') {
                // BigNumberish --> just copy
                return u256;
            }
            if (!('low' in u256 && 'high' in u256)) {
                throw errorU256(abiType);
            }
            return { low: u256.low, high: u256.high };
        }
        if (CairoUint512.isAbiType(abiType)) {
            const u512 = unorderedItem;
            if (typeof u512 !== 'object') {
                // BigNumberish --> just copy
                return u512;
            }
            if (!['limb0', 'limb1', 'limb2', 'limb3'].every((key) => key in u512)) {
                throw errorU512(abiType);
            }
            return { limb0: u512.limb0, limb1: u512.limb1, limb2: u512.limb2, limb3: u512.limb3 };
        }
        if (isTypeStruct(abiType, structs)) {
            const abiOfStruct = structs[abiType].members;
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return orderStruct(unorderedItem, abiOfStruct);
        }
        // literals
        return unorderedItem;
    };
    const orderStruct = (unorderedObject2, abiObject) => {
        const orderedObject2 = abiObject.reduce((orderedObject, abiParam) => {
            const setProperty = (value) => Object.defineProperty(orderedObject, abiParam.name, {
                enumerable: true,
                value: value ?? unorderedObject2[abiParam.name],
            });
            if (unorderedObject2[abiParam.name] === 'undefined') {
                if (isCairo1Type(abiParam.type) || !isLen(abiParam.name)) {
                    throw Error(`Your object needs a property with key : ${abiParam.name} .`);
                }
            }
            setProperty(orderInput(unorderedObject2[abiParam.name], abiParam.type));
            return orderedObject;
        }, {});
        return orderedObject2;
    };
    function orderArray(myArray, abiParam) {
        const typeInArray = getArrayType(abiParam);
        if (isString(myArray)) {
            return myArray; // longstring
        }
        return myArray.map((myElem) => orderInput(myElem, typeInArray));
    }
    function orderTuple(unorderedObject2, abiParam) {
        const typeList = extractTupleMemberTypes(abiParam);
        const orderedObject2 = typeList.reduce((orderedObject, abiTypeCairoX, index) => {
            const myObjKeys = Object.keys(unorderedObject2);
            const setProperty = (value) => Object.defineProperty(orderedObject, index.toString(), {
                enumerable: true,
                value: value ?? unorderedObject2[myObjKeys[index]],
            });
            const abiType = abiTypeCairoX?.type ? abiTypeCairoX.type : abiTypeCairoX; // Named tuple, or tuple
            setProperty(orderInput(unorderedObject2[myObjKeys[index]], abiType));
            return orderedObject;
        }, {});
        return orderedObject2;
    }
    const orderEnum = (unorderedObject2, abiObject) => {
        if (isTypeResult(abiObject.name)) {
            const unorderedResult = unorderedObject2;
            const resultOkType = abiObject.name.substring(abiObject.name.indexOf('<') + 1, abiObject.name.lastIndexOf(','));
            const resultErrType = abiObject.name.substring(abiObject.name.indexOf(',') + 1, abiObject.name.lastIndexOf('>'));
            if (unorderedResult.isOk()) {
                return new CairoResult(CairoResultVariant.Ok, orderInput(unorderedObject2.unwrap(), resultOkType));
            }
            return new CairoResult(CairoResultVariant.Err, orderInput(unorderedObject2.unwrap(), resultErrType));
        }
        if (isTypeOption(abiObject.name)) {
            const unorderedOption = unorderedObject2;
            const resultSomeType = abiObject.name.substring(abiObject.name.indexOf('<') + 1, abiObject.name.lastIndexOf('>'));
            if (unorderedOption.isSome()) {
                return new CairoOption(CairoOptionVariant.Some, orderInput(unorderedOption.unwrap(), resultSomeType));
            }
            // none(())
            return new CairoOption(CairoOptionVariant.None, {});
        }
        // custom Enum
        const unorderedCustomEnum = unorderedObject2;
        const variants = Object.entries(unorderedCustomEnum.variant);
        const newEntries = variants.map((variant) => {
            if (typeof variant[1] === 'undefined') {
                return variant;
            }
            const variantType = abiObject.type.substring(abiObject.type.lastIndexOf('<') + 1, abiObject.type.lastIndexOf('>'));
            if (variantType === '()') {
                return variant;
            }
            return [variant[0], orderInput(unorderedCustomEnum.unwrap(), variantType)];
        });
        return new CairoCustomEnum(Object.fromEntries(newEntries));
    };
    // Order Call Parameters
    const finalOrderedObject = abiOfObject.reduce((orderedObject, abiParam) => {
        const setProperty = (value) => Object.defineProperty(orderedObject, abiParam.name, {
            enumerable: true,
            value,
        });
        if (isLen(abiParam.name) && !isCairo1Type(abiParam.type)) {
            return orderedObject;
        }
        setProperty(orderInput(unorderedObject[abiParam.name], abiParam.type));
        return orderedObject;
    }, {});
    return finalOrderedObject;
}
