---
layout: post
title:  "比特币 RPC 命令剖析 \"importprivkey\""
date:   2018-08-27 20:10:01 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli importprivkey "bitcoinprivkey" ( "label" rescan )
---
## 1. 帮助内容

```shell
importprivkey "bitcoinprivkey" ( "label" rescan )

添加一个私钥（由 dumpprivkey 返回）到你的钱包。

参数：
1. "bitcoinprivkey"（字符串，必备）私钥（见 dumpprivkey）
2. label           （字符串，可选，默认为 ""）一个可选的标签
3. rescan          （布尔型，可选，默认为 true）重新扫描钱包交易

注：如果 rescan 为 true 那么这个调用可能花费数分钟来完成。

结果：无返回值。

例子：

导出一个私钥
> bitcoin-cli dumpprivkey "myaddress"

导入私钥并重新扫描
> bitcoin-cli importprivkey "mykey"

用一个标签导入并不重新扫描
$ bitcoin-cli importprivkey "mykey" "testing" false

作为一个 JSON-RPC 调用
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "importprivkey", "params": ["mykey", "testing", false] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`importprivkey` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue importprivkey(const UniValue& params, bool fHelp);
```

实现在文件 `wallet/rpcdump.cpp` 中。

```cpp
UniValue importprivkey(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 1. 确保钱包可用
        return NullUniValue;
    
    if (fHelp || params.size() < 1 || params.size() > 3)
        throw runtime_error(
            "importprivkey \"bitcoinprivkey\" ( \"label\" rescan )\n"
            "\nAdds a private key (as returned by dumpprivkey) to your wallet.\n"
            "\nArguments:\n"
            "1. \"bitcoinprivkey\"   (string, required) The private key (see dumpprivkey)\n"
            "2. \"label\"            (string, optional, default=\"\") An optional label\n"
            "3. rescan               (boolean, optional, default=true) Rescan the wallet for transactions\n"
            "\nNote: This call can take minutes to complete if rescan is true.\n"
            "\nExamples:\n"
            "\nDump a private key\n"
            + HelpExampleCli("dumpprivkey", "\"myaddress\"") +
            "\nImport the private key with rescan\n"
            + HelpExampleCli("importprivkey", "\"mykey\"") +
            "\nImport using a label and without rescan\n"
            + HelpExampleCli("importprivkey", "\"mykey\" \"testing\" false") +
            "\nAs a JSON-RPC call\n"
            + HelpExampleRpc("importprivkey", "\"mykey\", \"testing\", false")
        ); // 2. 帮助内容


    LOCK2(cs_main, pwalletMain->cs_wallet);

    EnsureWalletIsUnlocked(); // 3. 确保钱包被解锁

    string strSecret = params[0].get_str();
    string strLabel = "";
    if (params.size() > 1)
        strLabel = params[1].get_str();

    // Whether to perform rescan after import
    bool fRescan = true; // 4. 在导入后是否执行重新扫描
    if (params.size() > 2)
        fRescan = params[2].get_bool();

    if (fRescan && fPruneMode)
        throw JSONRPCError(RPC_WALLET_ERROR, "Rescan is disabled in pruned mode");

    CBitcoinSecret vchSecret;
    bool fGood = vchSecret.SetString(strSecret);

    if (!fGood) throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Invalid private key encoding");

    CKey key = vchSecret.GetKey();
    if (!key.IsValid()) throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Private key outside allowed range");

    CPubKey pubkey = key.GetPubKey();
    assert(key.VerifyPubKey(pubkey)); // 验证公私钥是否配对
    CKeyID vchAddress = pubkey.GetID(); // 获取公钥索引
    {
        pwalletMain->MarkDirty(); // 标记钱包以改变
        pwalletMain->SetAddressBook(vchAddress, strLabel, "receive"); // 设置地址簿并关联账户指定用途

        // Don't throw error in case a key is already there
        if (pwalletMain->HaveKey(vchAddress)) // 若密钥已存在，不抛出错误
            return NullUniValue;

        pwalletMain->mapKeyMetadata[vchAddress].nCreateTime = 1; // 初始化创建时间为 1

        if (!pwalletMain->AddKeyPubKey(key, pubkey)) // 添加公私钥到钱包
            throw JSONRPCError(RPC_WALLET_ERROR, "Error adding key to wallet");

        // whenever a key is imported, we need to scan the whole chain // 无论何时导入密钥，我们都需要扫描整个链
        pwalletMain->nTimeFirstKey = 1; // 0 would be considered 'no value' // 0 会被当作 '没有价值'

        if (fRescan) { // 若开启再扫描
            pwalletMain->ScanForWalletTransactions(chainActive.Genesis(), true); // 再扫描整个钱包交易
        }
    }

    return NullUniValue;
}
```

### 2.1. 确保钱包可用

参考[比特币 RPC 命令剖析 "fundrawtransaction" 2.1. 确保钱包可用](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html#21-确保钱包可用)。

### 2.2. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.4. 在导入后是否执行重新扫描

添加密钥对函数 `pwalletMain->AddKeyPubKey(key, pubkey)` 定义在文件 `keystore.cpp` 中。

```cpp
bool CBasicKeyStore::AddKeyPubKey(const CKey& key, const CPubKey &pubkey)
{
    LOCK(cs_KeyStore); // 密钥库上锁
    mapKeys[pubkey.GetID()] = key; // 加入公钥索引和私钥的映射列表
    return true;
}
```

密钥映射对象 `mapKeys` 定义在文件 `keystore.h` 的基础密钥存储类 `CBasicKeyStore` 中。

```cpp
typedef std::map<CKeyID, CKey> KeyMap; // 密钥索引和私钥的映射
...
/** Basic key store, that keeps keys in an address->secret map */
class CBasicKeyStore : public CKeyStore // 基础密钥存储，以 address->secret 映射维持私钥
{
protected:
    KeyMap mapKeys; // 密钥索引和私钥的映射列表
    ...
};
```

扫描钱包交易函数 `pwalletMain->ScanForWalletTransactions(chainActive.Genesis(), true)` 定义在文件 `wallet.cpp` 中。

```cpp
/**
 * Scan the block chain (starting in pindexStart) for transactions
 * from or to us. If fUpdate is true, found transactions that already
 * exist in the wallet will be updated.
 */ // 扫描区块链（从 pindexStart 开始）的交易。如果 fUpdate 为 true，在钱包中已存在的找到的交易将会升级。
int CWallet::ScanForWalletTransactions(CBlockIndex* pindexStart, bool fUpdate)
{
    int ret = 0; // 只要升级了一笔，该值就会 +1
    int64_t nNow = GetTime(); // 获取当前时间
    const CChainParams& chainParams = Params(); // 获取链参数

    CBlockIndex* pindex = pindexStart; // 拿到起始区块索引
    {
        LOCK2(cs_main, cs_wallet); // 钱包上锁

        // no need to read and scan block, if block was created before // 如果是在我们的钱包创建之前创建的块，
        // our wallet birthday (as adjusted for block time variability) // 不需要读取和扫描区块信息（根据块时间可变性进行调整）
        while (pindex && nTimeFirstKey && (pindex->GetBlockTime() < (nTimeFirstKey - 7200))) // 若区块时间在钱包创建前 2h
            pindex = chainActive.Next(pindex); // 跳过此区块

        ShowProgress(_("Rescanning..."), 0); // show rescan progress in GUI as dialog or on splashscreen, if -rescan on startup
        double dProgressStart = Checkpoints::GuessVerificationProgress(chainParams.Checkpoints(), pindex, false);
        double dProgressTip = Checkpoints::GuessVerificationProgress(chainParams.Checkpoints(), chainActive.Tip(), false);
        while (pindex) // 若该区块存在
        {
            if (pindex->nHeight % 100 == 0 && dProgressTip - dProgressStart > 0.0) // 扫描进度
                ShowProgress(_("Rescanning..."), std::max(1, std::min(99, (int)((Checkpoints::GuessVerificationProgress(chainParams.Checkpoints(), pindex, false) - dProgressStart) / (dProgressTip - dProgressStart) * 100))));

            CBlock block;
            ReadBlockFromDisk(block, pindex, Params().GetConsensus()); // 从磁盘上读取区块信息
            BOOST_FOREACH(CTransaction& tx, block.vtx) // 遍历区块交易列表
            {
                if (AddToWalletIfInvolvingMe(tx, &block, fUpdate)) // 升级该交易
                    ret++;
            }
            pindex = chainActive.Next(pindex); // 指向下一块
            if (GetTime() >= nNow + 60) { // 时间若超过 60s
                nNow = GetTime(); // 更新时间
                LogPrintf("Still rescanning. At block %d. Progress=%f\n", pindex->nHeight, Checkpoints::GuessVerificationProgress(chainParams.Checkpoints(), pindex));
            }
        }
        ShowProgress(_("Rescanning..."), 100); // hide progress dialog in GUI
    }
    return ret;
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcdump.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/rpcdump.cpp){:target="_blank"}
* [bitcoin/keystore.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/keystore.h){:target="_blank"}
* [bitcoin/keystore.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/keystore.cpp){:target="_blank"}
* [bitcoin/wallet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/wallet/wallet.cpp){:target="_blank"}
* [bitcoin/init.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.h){:target="_blank"}
* [bitcoin/init.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/init.cpp){:target="_blank"}
