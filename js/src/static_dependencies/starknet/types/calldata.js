export var ValidateType;
(function (ValidateType) {
    ValidateType["DEPLOY"] = "DEPLOY";
    ValidateType["CALL"] = "CALL";
    ValidateType["INVOKE"] = "INVOKE";
})(ValidateType || (ValidateType = {}));
export var Uint;
(function (Uint) {
    Uint["u8"] = "core::integer::u8";
    Uint["u16"] = "core::integer::u16";
    Uint["u32"] = "core::integer::u32";
    Uint["u64"] = "core::integer::u64";
    Uint["u128"] = "core::integer::u128";
    Uint["u256"] = "core::integer::u256";
    Uint["u512"] = "core::integer::u512";
})(Uint || (Uint = {}));
export var Literal;
(function (Literal) {
    Literal["ClassHash"] = "core::starknet::class_hash::ClassHash";
    Literal["ContractAddress"] = "core::starknet::contract_address::ContractAddress";
    Literal["Secp256k1Point"] = "core::starknet::secp256k1::Secp256k1Point";
})(Literal || (Literal = {}));
