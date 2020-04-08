---
layout: post
title:  "比特币 RPC 命令剖析 \"settxfee\""
date:   2018-09-20 20:22:10 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli settxfee amount
---
## 提示说明

```shell
settxfee amount # 设置每 kB 的交易费。覆盖 paytxfee 参数的值
```

参数：
1. amount（数字或字符串，必备）以 BTC/kB 为单位的交易费。

结果：（布尔型）如果成功返回 true。

## 用法示例

### 比特币核心客户端

通过 [getinfo](/blog/2018/06/bitcoin-rpc-command-getinfo.html) 调用反馈中的 paytxfee 字段查看当前交易费。

```shell
$ bitcoin-cli getinfo | grep paytxfee
  "paytxfee": 0.00000000,
$ bitcoin-cli settxfee 0.00001
true
$ bitcoin-cli getinfo | grep paytxfee
  "paytxfee": 0.00001000,
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "settxfee", "params": [0.00001] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":true,"error":null,"id":"curltest"}
```

## 源码剖析
settxfee 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue settxfee(const UniValue& params, bool fHelp); // 设置交易费
```

实现在“rpcwallet.cpp”文件中。

```cpp
UniValue settxfee(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保当前钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 1 || params.size() > 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "settxfee amount\n"
            "\nSet the transaction fee per kB. Overwrites the paytxfee parameter.\n"
            "\nArguments:\n"
            "1. amount         (numeric or sting, required) The transaction fee in " + CURRENCY_UNIT + "/kB\n"
            "\nResult\n"
            "true|false        (boolean) Returns true if successful\n"
            "\nExamples:\n"
            + HelpExampleCli("settxfee", "0.00001")
            + HelpExampleRpc("settxfee", "0.00001")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    // Amount
    CAmount nAmount = AmountFromValue(params[0]); // 获取指定交易费，包含范围检查

    payTxFee = CFeeRate(nAmount, 1000); // 设置交易费
    return true; // 设置成功返回 true
}
```

基本流程：<br>
1.确保钱包当前可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取指定交易费。<br>
5.设置交易费。

第四步，调用函数 AmountFromValue(params[0]) 获取指定金额作为交易费，该函数定义在“rpcserver.cpp”文件中。

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

类型 CAmount 是 int64_t 共 8bytes，定义在“amount.h”文件中。

```cpp
typedef int64_t CAmount; // 金额，64 位
```

函数 MoneyRange(amount) 检测设置金额的范围，定义在“amount.h”文件中。

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
inline bool MoneyRange(const CAmount& nValue) { return (nValue >= 0 && nValue <= MAX_MONEY); } // 金额范围检测
```

第五步，调用 CFeeRate 类的有参构造函数 CFeeRate(nAmount, 1000)，该类定义在“amount.h”文件中。

```cpp
/** Type-safe wrapper class for fee rates
 * (how much to pay based on transaction size)
 */ // 费率的安全包装类（基于交易的大小需要支付多少交易费）
class CFeeRate
{
private:
    CAmount nSatoshisPerK; // unit is satoshis-per-1,000-bytes
public:
    ...
    CFeeRate(const CAmount& nFeePaid, size_t nSize);
    ...
};
```

该有参构造函数实现在“amount.cpp”文件中。

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

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#settxfee){:target="_blank"}
