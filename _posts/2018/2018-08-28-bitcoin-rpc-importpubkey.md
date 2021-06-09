---
layout: post
title:  "比特币 RPC 命令「importpubkey」"
date:   2018-08-28 20:40:03 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
excerpt: $ bitcoin-cli importpubkey "pubkey" ( "label" rescan )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help importpubkey
importpubkey "pubkey" ( "label" rescan )

添加一个公钥（16 进制）用来监视，就像它还在你的钱包，但不能用于花费。

参数：
1. "pubkey"（字符串，必备）16 进制编码的公钥
2. "label" （字符串，可选，默认为 ""）一个可选的标签
3. rescan  （布尔型，可选，默认为 true）重新扫描钱包交易

注：如果 rescan 为 true 那么这个调用可能花费数分钟来完成。

例子：

导入一个公钥到钱包并重新扫描
> bitcoin-cli importpubkey "mypubkey"

使用一个标签导入并不重新扫描
> bitcoin-cli importpubkey "mypubkey" "testing" false

作为一个 JSON-RPC 调用
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "importpubkey", "params": ["mypubkey", "testing", flase] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`importpubkey` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue importpubkey(const UniValue& params, bool fHelp);
```

实现在文件 `wallet/rpcdump.cpp` 中。

```cpp
UniValue importpubkey(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;

    if (fHelp || params.size() < 1 || params.size() > 4)
        throw runtime_error(
            "importpubkey \"pubkey\" ( \"label\" rescan )\n"
            "\nAdds a public key (in hex) that can be watched as if it were in your wallet but cannot be used to spend.\n"
            "\nArguments:\n"
            "1. \"pubkey\"           (string, required) The hex-encoded public key\n"
            "2. \"label\"            (string, optional, default=\"\") An optional label\n"
            "3. rescan               (boolean, optional, default=true) Rescan the wallet for transactions\n"
            "\nNote: This call can take minutes to complete if rescan is true.\n"
            "\nExamples:\n"
            "\nImport a public key with rescan\n"
            + HelpExampleCli("importpubkey", "\"mypubkey\"") +
            "\nImport using a label without rescan\n"
            + HelpExampleCli("importpubkey", "\"mypubkey\" \"testing\" false") +
            "\nAs a JSON-RPC call\n"
            + HelpExampleRpc("importpubkey", "\"mypubkey\", \"testing\", false")
        ); // 2. 帮助内容


    string strLabel = "";
    if (params.size() > 1)
        strLabel = params[1].get_str();

    // Whether to perform rescan after import
    bool fRescan = true; // 3. 在导入之后是否重新扫描
    if (params.size() > 2)
        fRescan = params[2].get_bool();

    if (fRescan && fPruneMode)
        throw JSONRPCError(RPC_WALLET_ERROR, "Rescan is disabled in pruned mode");

    if (!IsHex(params[0].get_str())) // 公钥必须为 16 进制
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Pubkey must be a hex string");
    std::vector<unsigned char> data(ParseHex(params[0].get_str()));
    CPubKey pubKey(data.begin(), data.end()); // 初始化公钥
    if (!pubKey.IsFullyValid()) // 该公钥是否有效
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Pubkey is not a valid public key");

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    ImportAddress(CBitcoinAddress(pubKey.GetID()), strLabel); // 导入地址及关联账户
    ImportScript(GetScriptForRawPubKey(pubKey), strLabel, false); // 导入脚本

    if (fRescan) // 若开启了再扫描
    {
        pwalletMain->ScanForWalletTransactions(chainActive.Genesis(), true); // 再扫描钱包交易
        pwalletMain->ReacceptWalletTransactions(); // 把交易放入内存池
    }

    return NullUniValue;
}
```

相关函数调用详见[比特币 RPC 命令「importaddress"](/blog/2018/08/bitcoin-rpc-importaddress.html)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcdump.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcdump.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
