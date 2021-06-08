---
layout: post
title:  "比特币 RPC 命令「settxfee」"
date:   2018-09-20 20:22:10 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
excerpt: $ bitcoin-cli settxfee amount
---
## 1. 帮助内容

```shell
$ bitcoin-cli help settxfee
settxfee amount

设置每 kB 的交易费。覆盖 paytxfee 参数。

参数：
1. amount（数字或字符串，必备）以 BTC/kB 为单位的交易费

结果：
true|false（布尔型）如果成功返回 true

例子：
> bitcoin-cli settxfee 0.00001
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "settxfee", "params": [0.00001] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`settxfee` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue settxfee(const UniValue& params, bool fHelp);
```

实现在文件 `rpcwallet.cpp` 中。

```cpp
UniValue settxfee(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 1 || params.size() > 1)
        throw runtime_error(
            "settxfee amount\n"
            "\nSet the transaction fee per kB. Overwrites the paytxfee parameter.\n"
            "\nArguments:\n"
            "1. amount         (numeric or sting, required) The transaction fee in " + CURRENCY_UNIT + "/kB\n"
            "\nResult\n"
            "true|false        (boolean) Returns true if successful\n"
            "\nExamples:\n"
            + HelpExampleCli("settxfee", "0.00001")
            + HelpExampleRpc("settxfee", "0.00001")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    // Amount
    CAmount nAmount = AmountFromValue(params[0]);

    payTxFee = CFeeRate(nAmount, 1000); // 3. 设置交易费
    return true;
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令「fundrawtransaction」2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#21-帮助内容)。

### 2.3. 设置交易费

函数 `AmountFromValue(params[0])` 定义在文件 `rpcserver.cpp` 中。

```cpp
CAmount AmountFromValue(const UniValue& value)
{
    if (!value.isNum() && !value.isStr()) // 该值必须为数字或字符串类型
        throw JSONRPCError(RPC_TYPE_ERROR, "Amount is not a number or string");
    CAmount amount; // int64_t
    if (!ParseFixedPoint(value.getValStr(), 8, &amount)) // 解析并初始化金额
        throw JSONRPCError(RPC_TYPE_ERROR, "Invalid amount");
    if (!MoneyRange(amount)) // 检测金额范围
        throw JSONRPCError(RPC_TYPE_ERROR, "Amount out of range");
    return amount; // 返回该金额
}
```

金额类型 `CAmount` 定义在文件 `amount.h` 中。

```cpp
typedef int64_t CAmount;
```

检测金额范围函数 `MoneyRange(amount)` 定义在文件 `amount.h` 中。

```cpp
/** No amount larger than this (in satoshi) is valid.
 *
 * Note that this constant is *not* the total money supply, which in Bitcoin
 * currently happens to be less than 21,000,000 BTC for various reasons, but
 * rather a sanity check. As this sanity check is used by consensus-critical
 * validation code, the exact value of the MAX_MONEY constant is consensus
 * critical; in unusual circumstances like a(nother) overflow bug that allowed
 * for the creation of coins out of thin air modification could lead to a fork.
 * */
static const CAmount MAX_MONEY = 21000000 * COIN; // 最大金额 2100 BTC
inline bool MoneyRange(const CAmount& nValue) { return (nValue >= 0 && nValue <= MAX_MONEY); }
```

费率类 `CFeeRate` 的有参构造函数 `CFeeRate(nAmount, 1000)` 定义在文件 `amount.h` 中。

```cpp
/** Type-safe wrapper class for fee rates
 * (how much to pay based on transaction size)
 */
class CFeeRate // 费率的安全包装类（基于交易的大小需要支付的交易费）
{
private:
    CAmount nSatoshisPerK; // unit is satoshis-per-1,000-bytes
public:
    ...
    CFeeRate(const CAmount& nFeePaid, size_t nSize);
    ...
};
```

参构造函数实现文件 `amount.cpp` 中。

```cpp
CFeeRate::CFeeRate(const CAmount& nFeePaid, size_t nSize)
{
    if (nSize > 0)
        nSatoshisPerK = nFeePaid*1000/nSize;
    else
        nSatoshisPerK = 0;
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
* [bitcoin/amount.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/amount.h){:target="_blank"}
* [bitcoin/amount.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/amount.cpp){:target="_blank"}
