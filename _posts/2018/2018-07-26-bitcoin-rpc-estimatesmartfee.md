---
layout: post
title:  "比特币 RPC 命令「estimatesmartfee」"
date:   2018-07-26 20:25:15 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help estimatesmartfee
estimatesmartfee nblocks

警告：这个接口不稳定并且可能消失或改变！

估算交易在第 nblocks 个区块开始确认所需的每千字节的大致费用，如果可能则返回有效估算的区块号。

参数：
1. nblocks（数字）

结果：
{
  "feerate" : x.x,（数字）估算每千字节的费用（以 BTC 为单位）
  "blocks" : n    （数字）找到估值的区块号
}

如果没有观察足够的交易和区块来做估算任意数量的区块则返回一个负值。
但是它不会返回一个低于内存池拒绝的费用值。

例子：
> bitcoin-cli estimatesmartfee 6
</pre>

## 源码剖析

`estimatesmartfee` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue estimatesmartfee(const UniValue& params, bool fHelp);
```

实现在文件 `rpcmining.cpp` 中。

```cpp
UniValue estimatesmartfee(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1)
        throw runtime_error(
            "estimatesmartfee nblocks\n"
            "\nWARNING: This interface is unstable and may disappear or change!\n"
            "\nEstimates the approximate fee per kilobyte needed for a transaction to begin\n"
            "confirmation within nblocks blocks if possible and return the number of blocks\n"
            "for which the estimate is valid.\n"
            "\nArguments:\n"
            "1. nblocks     (numeric)\n"
            "\nResult:\n"
            "{\n"
            "  \"feerate\" : x.x,     (numeric) estimate fee-per-kilobyte (in BTC)\n"
            "  \"blocks\" : n         (numeric) block number where estimate was found\n"
            "}\n"
            "\n"
            "A negative value is returned if not enough transactions and blocks\n"
            "have been observed to make an estimate for any number of blocks.\n"
            "However it will not return a value below the mempool reject fee.\n"
            "\nExample:\n"
            + HelpExampleCli("estimatesmartfee", "6")
            ); // 1. 帮助内容

    RPCTypeCheck(params, boost::assign::list_of(UniValue::VNUM)); // 2. RPC 类型检测

    int nBlocks = params[0].get_int();

    UniValue result(UniValue::VOBJ);
    int answerFound;
    CFeeRate feeRate = mempool.estimateSmartFee(nBlocks, &answerFound); // 3. 估算精确的费用并返回
    result.push_back(Pair("feerate", feeRate == CFeeRate(0) ? -1.0 : ValueFromAmount(feeRate.GetFeePerK())));
    result.push_back(Pair("blocks", answerFound));
    return result;
}
```

### 1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcmining.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcmining.cpp){:target="_blank"}
