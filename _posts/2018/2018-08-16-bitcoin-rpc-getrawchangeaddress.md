---
layout: post
title:  "比特币 RPC 命令「getrawchangeaddress」"
date:   2018-08-16 20:28:37 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
excerpt: $ bitcoin-cli getrawchangeaddress
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getrawchangeaddress
getrawchangeaddress

返回一个新的比特币地址，用于接收找零。
这是用于原始交易，而非通常使用。

结果：
"address"（字符串）地址

例子：
> bitcoin-cli getrawchangeaddress
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getrawchangeaddress", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getrawchangeaddress` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getrawchangeaddress(const UniValue& params, bool fHelp);
```

实现在文件 `wallet/rpcwallet.cpp` 中。

```cpp
UniValue getrawchangeaddress(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() > 1)
        throw runtime_error(
            "getrawchangeaddress\n"
            "\nReturns a new Bitcoin address, for receiving change.\n"
            "This is for use with raw transactions, NOT normal use.\n"
            "\nResult:\n"
            "\"address\"    (string) The address\n"
            "\nExamples:\n"
            + HelpExampleCli("getrawchangeaddress", "")
            + HelpExampleRpc("getrawchangeaddress", "")
       ); // 2. 帮助内容

    LOCK2(cs_main, pwalletMain->cs_wallet);

    if (!pwalletMain->IsLocked()) // 若当前钱包处于未加密状态
        pwalletMain->TopUpKeyPool(); // 填充密钥池

    CReserveKey reservekey(pwalletMain); // 创建一个密钥池条目
    CPubKey vchPubKey;
    if (!reservekey.GetReservedKey(vchPubKey)) // 获取一个密钥池中的密钥的公钥
        throw JSONRPCError(RPC_WALLET_KEYPOOL_RAN_OUT, "Error: Keypool ran out, please call keypoolrefill first");

    reservekey.KeepKey(); // 从密钥池中移除获取的密钥，并清空密钥池条目信息

    CKeyID keyID = vchPubKey.GetID(); // 获取公钥索引

    return CBitcoinAddress(keyID).ToString(); // Base58 编码获取公钥地址并返回
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令「fundrawtransaction」2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#21-帮助内容)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcwallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcwallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
