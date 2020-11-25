---
layout: post
title:  "比特币 RPC 命令剖析 \"getbalance\""
date:   2018-08-14 21:42:32 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getbalance ( "account" minconf includeWatchonly )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getbalance
getbalance ( "account" minconf includeWatchonly )

如果未指定账户，则返回服务器的总可用余额。
如果指定了账户（已过时），则返回账户的余额。
注意账户 "" 与无参数不同。
服务器总余额可能与默认 "" 账户余额不同。

参数：
1. "account"       （字符串，可选）已过时。选择的账户，或 "*" 表示整个钱包。它可能是使用 "" 的默认账户。
2. minconf         （数字，可选，默认为 1）只包括至少确认这么多次的交易。
3. includeWatchonly（布尔型，可选，默认为 false）也包括 watchonly 地址中的余额（查看 'importaddress'）

结果：
amount（数字）这个账户收到 BTC 的总金额。

例子：

钱包的总金额
> bitcoin-cli getbalance

钱包内至少有 5 个区块确认的总金额
> bitcoin-cli getbalance "*" 6

作为一个 json rpc 调用
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getbalance", "params": ["*", 6] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getbalance` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getbalance(const UniValue& params, bool fHelp);
```

实现在文件 `rpcwallet.cpp` 中。

```cpp
UniValue getbalance(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 3)
        throw runtime_error(
            "getbalance ( \"account\" minconf includeWatchonly )\n"
            "\nIf account is not specified, returns the server's total available balance.\n"
            "If account is specified (DEPRECATED), returns the balance in the account.\n"
            "Note that the account \"\" is not the same as leaving the parameter out.\n"
            "The server total may be different to the balance in the default \"\" account.\n"
            "\nArguments:\n"
            "1. \"account\"      (string, optional) DEPRECATED. The selected account, or \"*\" for entire wallet. It may be the default account using \"\".\n"
            "2. minconf          (numeric, optional, default=1) Only include transactions confirmed at least this many times.\n"
            "3. includeWatchonly (bool, optional, default=false) Also include balance in watchonly addresses (see 'importaddress')\n"
            "\nResult:\n"
            "amount              (numeric) The total amount in " + CURRENCY_UNIT + " received for this account.\n"
            "\nExamples:\n"
            "\nThe total amount in the wallet\n"
            + HelpExampleCli("getbalance", "") +
            "\nThe total amount in the wallet at least 5 blocks confirmed\n"
            + HelpExampleCli("getbalance", "\"*\" 6") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("getbalance", "\"*\", 6")
        ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    if (params.size() == 0)
        return  ValueFromAmount(pwalletMain->GetBalance()); // 直接返回当前整个钱包的余额

    int nMinDepth = 1; // 最小深度，默认为 1
    if (params.size() > 1)
        nMinDepth = params[1].get_int(); // 获取最小深度
    isminefilter filter = ISMINE_SPENDABLE; // ismine 过滤器
    if(params.size() > 2)
        if(params[2].get_bool())
            filter = filter | ISMINE_WATCH_ONLY; // 获取 watchonly

    if (params[0].get_str() == "*") { // 若指定账户名为 "*"
        // Calculate total balance a different way from GetBalance() // 以不同于 GetBalance() 的方式计算总余额
        // (GetBalance() sums up all unspent TxOuts) // （GetBalance() 总计全部未花费的输出）
        // getbalance and "getbalance * 1 true" should return the same number // getbalance 和 "getbalance * 1 true" 应该返回相同的数字
        CAmount nBalance = 0;
        for (map<uint256, CWalletTx>::iterator it = pwalletMain->mapWallet.begin(); it != pwalletMain->mapWallet.end(); ++it)
        { // 遍历钱包交易映射列表
            const CWalletTx& wtx = (*it).second; // 获取钱包交易
            if (!CheckFinalTx(wtx) || wtx.GetBlocksToMaturity() > 0 || wtx.GetDepthInMainChain() < 0) // 检测是否为最终交易 或 未成熟 或 所在链深度小于 0
                continue; // 跳过

            CAmount allFee;
            string strSentAccount;
            list<COutputEntry> listReceived; // 接收列表
            list<COutputEntry> listSent; // 发送列表
            wtx.GetAmounts(listReceived, listSent, allFee, strSentAccount, filter); // 获取相应的金额
            if (wtx.GetDepthInMainChain() >= nMinDepth) // 该交易在链上的深度大于等于最小深度
            {
                BOOST_FOREACH(const COutputEntry& r, listReceived) // 遍历接收列表
                    nBalance += r.amount; // 累加金额
            }
            BOOST_FOREACH(const COutputEntry& s, listSent) // 遍历发送列表
                nBalance -= s.amount; // 减去花费的金额
            nBalance -= allFee; // 减去交易费
        }
        return  ValueFromAmount(nBalance); // 得到钱包总余额并返回
    }

    string strAccount = AccountFromValue(params[0]); // 获取指定的账户名

    CAmount nBalance = GetAccountBalance(strAccount, nMinDepth, filter); // 获取账户余额

    return ValueFromAmount(nBalance); // 返回账户余额
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令剖析 "fundrawtransaction" 2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
