---
layout: post
title:  "比特币 RPC 命令剖析 \"fundrawtransaction\""
date:   2018-07-17 22:21:44 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli fundrawtransaction "hexstring" includeWatching
---
## 1. 帮助内容

```shell
$ bitcoin-cli help fundrawtransaction
fundrawtransaction "hexstring" includeWatching

添加输入到一笔交易，直到它有足够的值来满足其输出。
这不会修改现有的输入，并将添加一个找零输出到其输出集。
注意，已签名的输入可能需要在完成后重签，因为输入/输出已被添加。
已添加的输入将不会被签名，使用 signrawtransaction。
注意，所有现有的输入必须有它们的上一笔输出交易在钱包中。
注意，所选的所有输入必须是标准格式，且 P2SH 脚本必须在钱包中使用 importaddress 或 addmultisigaddress（用来计算交易费）。
对于 watch-only 目前只支持 P2PK，多签和 P2SH 版本。

参数：
1. "hexstring"    （字符串，必备）原始交易的 16 进制字符串
2. includeWatching（布尔型，可选，默认为 false）也可选择 watch only 的输入

结果：
{
  "hex":       "value",（字符串）生成的原始交易（16 进制编码的字符串）
  "fee":       n,      （数字）交易支付产生的费用
  "changepos": n       （数字）已添加的找零输出的位置，或为 -1
}
"hex"

例子：

创建一笔没有输入的交易
> bitcoin-cli createrawtransaction "[]" "{\"myaddress\":0.01}"

添加充足的未签名的输入用以满足输出金额
> bitcoin-cli fundrawtransaction "rawtransactionhex"

签名该交易
> bitcoin-cli signrawtransaction "fundedtransactionhex"

发送该交易
> bitcoin-cli sendrawtransaction "signedtransactionhex"
```

## 2. 源码剖析

`fundrawtransaction` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue fundrawtransaction(const UniValue& params, bool fHelp);
```

实现在文件 `wallet/rpcwallet.cpp` 中。

```cpp
UniValue fundrawtransaction(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;

    if (fHelp || params.size() < 1 || params.size() > 2)
        throw runtime_error(
                            "fundrawtransaction \"hexstring\" includeWatching\n"
                            "\nAdd inputs to a transaction until it has enough in value to meet its out value.\n"
                            "This will not modify existing inputs, and will add one change output to the outputs.\n"
                            "Note that inputs which were signed may need to be resigned after completion since in/outputs have been added.\n"
                            "The inputs added will not be signed, use signrawtransaction for that.\n"
                            "Note that all existing inputs must have their previous output transaction be in the wallet.\n"
                            "Note that all inputs selected must be of standard form and P2SH scripts must be"
                            "in the wallet using importaddress or addmultisigaddress (to calculate fees).\n"
                            "Only pay-to-pubkey, multisig, and P2SH versions thereof are currently supported for watch-only\n"
                            "\nArguments:\n"
                            "1. \"hexstring\"     (string, required) The hex string of the raw transaction\n"
                            "2. includeWatching (boolean, optional, default false) Also select inputs which are watch only\n"
                            "\nResult:\n"
                            "{\n"
                            "  \"hex\":       \"value\", (string)  The resulting raw transaction (hex-encoded string)\n"
                            "  \"fee\":       n,         (numeric) Fee the resulting transaction pays\n"
                            "  \"changepos\": n          (numeric) The position of the added change output, or -1\n"
                            "}\n"
                            "\"hex\"             \n"
                            "\nExamples:\n"
                            "\nCreate a transaction with no inputs\n"
                            + HelpExampleCli("createrawtransaction", "\"[]\" \"{\\\"myaddress\\\":0.01}\"") +
                            "\nAdd sufficient unsigned inputs to meet the output value\n"
                            + HelpExampleCli("fundrawtransaction", "\"rawtransactionhex\"") +
                            "\nSign the transaction\n"
                            + HelpExampleCli("signrawtransaction", "\"fundedtransactionhex\"") +
                            "\nSend the transaction\n"
                            + HelpExampleCli("sendrawtransaction", "\"signedtransactionhex\"")
                            ); // 2. 帮助内容

    RPCTypeCheck(params, boost::assign::list_of(UniValue::VSTR)(UniValue::VBOOL)); // 3. RPC 类型检测

    // parse hex string from parameter
    CTransaction origTx;
    if (!DecodeHexTx(origTx, params[0].get_str())) // 4. 从参数解析 16 进制的字符串
        throw JSONRPCError(RPC_DESERIALIZATION_ERROR, "TX decode failed");

    if (origTx.vout.size() == 0) // 交易至少要有一个输出
        throw JSONRPCError(RPC_INVALID_PARAMETER, "TX must have at least one output");

    bool includeWatching = false;
    if (params.size() > 1)
        includeWatching = params[1].get_bool();

    CMutableTransaction tx(origTx);
    CAmount nFee;
    string strFailReason;
    int nChangePos = -1;
    if(!pwalletMain->FundTransaction(tx, nFee, nChangePos, strFailReason, includeWatching)) // 5. 资助交易
        throw JSONRPCError(RPC_INTERNAL_ERROR, strFailReason);

    UniValue result(UniValue::VOBJ); // 6. 构建结果对象并返回
    result.push_back(Pair("hex", EncodeHexTx(tx)));
    result.push_back(Pair("changepos", nChangePos));
    result.push_back(Pair("fee", ValueFromAmount(nFee)));

    return result;
}
```

### 2.1. 确保钱包可用

确保钱包可用函数 `EnsureWalletIsAvailable(fHelp)` 实现在文件 `rpcwallet.cpp` 中。

```cpp
bool EnsureWalletIsAvailable(bool avoidException)
{
    if (!pwalletMain)
    {
        if (!avoidException)
            throw JSONRPCError(RPC_METHOD_NOT_FOUND, "Method not found (disabled)");
        else
            return false;
    }
    return true;
}
```

### 2.2. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.5. 资助交易

函数 `pwalletMain->FundTransaction(tx, nFee, nChangePos, strFailReason, includeWatching)` 声明在文件 `wallet/wallet.h` 的钱包类 `CWallet` 中。

`CWallet` 是密钥库的扩展，它还维护一组交易和余额，并提供创建新交易的能力。

```cpp
/** 
 * A CWallet is an extension of a keystore, which also maintains a set of transactions and balances,
 * and provides the ability to create new transactions.
 */
class CWallet : public CCryptoKeyStore, public CValidationInterface
{
    ...
    /**
     * Insert additional inputs into the transaction by
     * calling CreateTransaction();
     */
    bool FundTransaction(CMutableTransaction& tx, CAmount& nFeeRet, int& nChangePosRet, std::string& strFailReason, bool includeWatching); // 通过调用 CreateTransaction() 插入额外的输入到交易中；
    ...
};
```

实现在文件 `wallet/wallet.cpp` 中。

```cpp
bool CWallet::FundTransaction(CMutableTransaction& tx, CAmount &nFeeRet, int& nChangePosRet, std::string& strFailReason, bool includeWatching)
{
    vector<CRecipient> vecSend;

    // Turn the txout set into a CRecipient vector
    BOOST_FOREACH(const CTxOut& txOut, tx.vout) // 把交易输出集转换到一个 CRecipient vector
    {
        CRecipient recipient = {txOut.scriptPubKey, txOut.nValue, false};
        vecSend.push_back(recipient);
    }

    CCoinControl coinControl;
    coinControl.fAllowOtherInputs = true;
    coinControl.fAllowWatchOnly = includeWatching;
    BOOST_FOREACH(const CTxIn& txin, tx.vin)
        coinControl.Select(txin.prevout);

    CReserveKey reservekey(this);
    CWalletTx wtx;
    if (!CreateTransaction(vecSend, wtx, reservekey, nFeeRet, nChangePosRet, strFailReason, &coinControl, false)) // 创建交易
        return false;

    if (nChangePosRet != -1)
        tx.vout.insert(tx.vout.begin() + nChangePosRet, wtx.vout[nChangePosRet]);

    // Add new txins (keeping original txin scriptSig/order)
    BOOST_FOREACH(const CTxIn& txin, wtx.vin) // 添加新的交易输入（保留原来的交易输入脚本签名/顺序）
    {
        bool found = false;
        BOOST_FOREACH(const CTxIn& origTxIn, tx.vin)
        {
            if (txin.prevout.hash == origTxIn.prevout.hash && txin.prevout.n == origTxIn.prevout.n)
            {
                found = true;
                break;
            }
        }
        if (!found)
            tx.vin.push_back(txin);
    }

    return true;
}
```

函数 `CreateTransaction(vecSend, wtx, reservekey, nFeeRet, nChangePosRet, strFailReason, &coinControl, false)` 详见[比特币 RPC 命令剖析 "sendtoaddress"](/blog/2018/09/bitcoin-rpc-command-sendtoaddress.html)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/wallet.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.h){:target="_blank"}
* [bitcoin/wallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.cpp){:target="_blank"}
