---
layout: post
title:  "比特币 RPC 命令剖析 \"importaddress\""
date:   2018-08-24 20:55:46 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli importaddress "address" ( "label" rescan p2sh )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help importaddress
importaddress "address" ( "label" rescan p2sh )

添加一个脚本（16 进制）或地址用于查看，就好像它在你的钱包里但不能用于花费。

参数：
1. "script"（字符串，必备）16 进制编码的脚本（或地址）
2. "label" （字符串，可选，默认为 ""）一个可选的标签
3. rescan  （布尔型，可选，默认为 true）重新扫描钱包交易
4. p2sh    （布尔型，可选，默认为 true）添加脚本的 P2SH 版本

注：如果重新扫描为 true，这个调用要花费数分钟来完成。
如果你有完整的公钥，你应该调用 importpubkey 代替这个。

例子：

导入一个脚本并重新扫描
> bitcoin-cli importaddress "myscript"

导入地址到钱包账户 "testing" 中，并关闭再扫描。
> bitcoin-cli importaddress "myscript" "testing" false

作为一个 JSON-RPC 调用
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "importaddress", "params": ["myscript", "testing", false] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`importaddress` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue importaddress(const UniValue& params, bool fHelp);
```

实现在文件 `wallet/rpcdump.cpp` 中。

```cpp
UniValue importaddress(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 1 || params.size() > 4)
        throw runtime_error(
            "importaddress \"address\" ( \"label\" rescan p2sh )\n"
            "\nAdds a script (in hex) or address that can be watched as if it were in your wallet but cannot be used to spend.\n"
            "\nArguments:\n"
            "1. \"script\"           (string, required) The hex-encoded script (or address)\n"
            "2. \"label\"            (string, optional, default=\"\") An optional label\n"
            "3. rescan               (boolean, optional, default=true) Rescan the wallet for transactions\n"
            "4. p2sh                 (boolean, optional, default=false) Add the P2SH version of the script as well\n"
            "\nNote: This call can take minutes to complete if rescan is true.\n"
            "If you have the full public key, you should call importpublickey instead of this.\n"
            "\nExamples:\n"
            "\nImport a script with rescan\n"
            + HelpExampleCli("importaddress", "\"myscript\"") +
            "\nImport using a label without rescan\n"
            + HelpExampleCli("importaddress", "\"myscript\" \"testing\" false") +
            "\nAs a JSON-RPC call\n"
            + HelpExampleRpc("importaddress", "\"myscript\", \"testing\", false")
        ); // 2. 帮助内容


    string strLabel = "";
    if (params.size() > 1)
        strLabel = params[1].get_str();

    // Whether to perform rescan after import
    bool fRescan = true; // 3. 在导入后是否执行重新扫描
    if (params.size() > 2)
        fRescan = params[2].get_bool();

    if (fRescan && fPruneMode)
        throw JSONRPCError(RPC_WALLET_ERROR, "Rescan is disabled in pruned mode");

    // Whether to import a p2sh version, too
    bool fP2SH = false; // 4. 是否也导入一个 p2sh 版本
    if (params.size() > 3)
        fP2SH = params[3].get_bool();

    LOCK2(cs_main, pwalletMain->cs_wallet);

    CBitcoinAddress address(params[0].get_str());
    if (address.IsValid()) {
        if (fP2SH)
            throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Cannot use the p2sh flag with an address - use a script instead");
        ImportAddress(address, strLabel); // 导入地址及其关联账户
    } else if (IsHex(params[0].get_str())) {
        std::vector<unsigned char> data(ParseHex(params[0].get_str()));
        ImportScript(CScript(data.begin(), data.end()), strLabel, fP2SH); // 导入脚本
    } else {
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid Bitcoin address or script");
    }

    if (fRescan)
    {
        pwalletMain->ScanForWalletTransactions(chainActive.Genesis(), true); // 重新扫描钱包交易
        pwalletMain->ReacceptWalletTransactions(); // 把交易放入内存池
    }

    return NullUniValue;
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令剖析 "fundrawtransaction" 2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.4. 是否也导入一个 p2sh 版本

导入地址函数 `ImportAddress(address, strLabel)` 实现在文件 `wallet/rpcdump.cpp` 中。

```cpp
void ImportAddress(const CBitcoinAddress& address, const string& strLabel)
{
    CScript script = GetScriptForDestination(address.Get()); // 通过脚本索引获取脚本
    ImportScript(script, strLabel, false); // 导入脚本
    // add to address book or update label // 添加到地址簿或更新账户
    if (address.IsValid()) // 若该地址有效
        pwalletMain->SetAddressBook(address.Get(), strLabel, "receive"); // 添加地址及关联账户、用途到地址簿
}
```

导入脚本函数 `ImportScript(CScript(data.begin(), data.end()), strLabel, fP2SH)` 实现在文件 `wallet/rpcdump.cpp` 中。

```cpp
void ImportScript(const CScript& script, const string& strLabel, bool isRedeemScript) // 导入脚本
{
    if (!isRedeemScript && ::IsMine(*pwalletMain, script) == ISMINE_SPENDABLE) // P2SH 类型 且 是自己的脚本
        throw JSONRPCError(RPC_WALLET_ERROR, "The wallet already contains the private key for this address or script");

    pwalletMain->MarkDirty(); // 标记钱包已改变

    if (!pwalletMain->HaveWatchOnly(script) && !pwalletMain->AddWatchOnly(script)) // 若 watch-only 集合中没有指定脚本，则添加该脚本到 watch-only 脚本集合
        throw JSONRPCError(RPC_WALLET_ERROR, "Error adding address to wallet");

    if (isRedeemScript) { // 若为赎回脚本
        if (!pwalletMain->HaveCScript(script) && !pwalletMain->AddCScript(script))
            throw JSONRPCError(RPC_WALLET_ERROR, "Error adding p2sh redeemScript to wallet");
        ImportAddress(CBitcoinAddress(CScriptID(script)), strLabel); // 导入地址及关联账户
    }
}
```

`Watch-only` 脚本对象定义在文件 `keystore.h` 的基础密钥存储类 `CBasicKeyStore` 中。

```cpp
typedef std::set<CScript> WatchOnlySet; // watch-only 脚本集合

/** Basic key store, that keeps keys in an address->secret map */
class CBasicKeyStore : public CKeyStore // 基础密钥存储，以 address->secret 映射维持私钥
{
protected:
    KeyMap mapKeys; // 私钥和索引的映射列表
    WatchKeyMap mapWatchKeys; // 公钥和索引的映射列表，用于 watch-only
    ScriptMap mapScripts; // 脚本索引映射列表
    WatchOnlySet setWatchOnly; // watch-only 脚本集合
    ...
};
```

重新接受钱包交易函数 `pwalletMain->ReacceptWalletTransactions()` 定义在文件 `wallet/wallet.cpp` 中。

```cpp
void CWallet::ReacceptWalletTransactions()
{
    // If transactions aren't being broadcasted, don't let them into local mempool either
    if (!fBroadcastTransactions) // 如果交易未被广播，也不让它们进入本地交易内存池
        return;
    LOCK2(cs_main, cs_wallet); // 钱包上锁
    std::map<int64_t, CWalletTx*> mapSorted; // 位置与钱包交易映射列表

    // Sort pending wallet transactions based on their initial wallet insertion order // 基于它们初始的钱包交易顺序来排序挂起的钱包交易
    BOOST_FOREACH(PAIRTYPE(const uint256, CWalletTx)& item, mapWallet) // 遍历钱包交易映射列表
    {
        const uint256& wtxid = item.first; // 获取交易索引
        CWalletTx& wtx = item.second; // 获取钱包交易
        assert(wtx.GetHash() == wtxid); // 验证交易与其索引是否一致

        int nDepth = wtx.GetDepthInMainChain(); // 获取交易在主链中的深度

        if (!wtx.IsCoinBase() && (nDepth == 0 && !wtx.isAbandoned())) { // 该交易不能是 coinbase 且 该交易深度为 0（表示该交易还未被接受）且该交易未被抛弃
            mapSorted.insert(std::make_pair(wtx.nOrderPos, &wtx)); // 加入临时映射列表
        }
    }

    // Try to add wallet transactions to memory pool // 尝试添加钱包交易到内存池
    BOOST_FOREACH(PAIRTYPE(const int64_t, CWalletTx*)& item, mapSorted) // 遍历该列表
    {
        CWalletTx& wtx = *(item.second); // 获取钱包交易

        LOCK(mempool.cs); // 内存池上锁
        wtx.AcceptToMemoryPool(false); // 把交易放入内存池
    }
}
...
bool CMerkleTx::AcceptToMemoryPool(bool fLimitFree, bool fRejectAbsurdFee)
{
    CValidationState state;
    return ::AcceptToMemoryPool(mempool, state, *this, fLimitFree, NULL, false, fRejectAbsurdFee); // 添加交易到内存池
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcdump.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcdump.cpp){:target="_blank"}
* [bitcoin/wallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
