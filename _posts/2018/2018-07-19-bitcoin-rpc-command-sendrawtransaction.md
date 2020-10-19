---
layout: post
title:  "比特币 RPC 命令剖析 \"sendrawtransaction\""
date:   2018-07-19 20:54:02 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli sendrawtransaction "hexstring" ( allowhighfees )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help sendrawtransaction
sendrawtransaction "hexstring" ( allowhighfees )

提交原始交易（序列化的，16 进制编码的）到本地节点和网络。

也可以查看 createrawtransaction 和 signrawtransaction 调用。

参数：
1. "hexstring"  （字符串，必备）原始交易的 16 进制字符串
2. allowhighfees（布尔型，可选，默认为 false）允许高交易费

结果：
"hex"（字符串）16 进制的交易哈希

例子：

创建一笔交易
> bitcoin-cli createrawtransaction "[{\"txid\":\"mytxid\",\"vout\":0}]" "{\"myaddress\":0.01}"

签名该交易，并获取返回的 16 进制
> bitcoin-cli signrawtransaction "myhex"

发送该交易（已签名的 16 进制）
> bitcoin-cli sendrawtransaction "signedhex"

作为一个 json rpc 调用
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "sendrawtransaction", "params": ["signedhex"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`sendrawtransaction` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue sendrawtransaction(const UniValue& params, bool fHelp);
```

实现在文件 `rpcrawtransaction.cpp` 中。

```cpp
UniValue sendrawtransaction(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() < 1 || params.size() > 2)
        throw runtime_error(
            "sendrawtransaction \"hexstring\" ( allowhighfees )\n"
            "\nSubmits raw transaction (serialized, hex-encoded) to local node and network.\n"
            "\nAlso see createrawtransaction and signrawtransaction calls.\n"
            "\nArguments:\n"
            "1. \"hexstring\"    (string, required) The hex string of the raw transaction)\n"
            "2. allowhighfees    (boolean, optional, default=false) Allow high fees\n"
            "\nResult:\n"
            "\"hex\"             (string) The transaction hash in hex\n"
            "\nExamples:\n"
            "\nCreate a transaction\n"
            + HelpExampleCli("createrawtransaction", "\"[{\\\"txid\\\" : \\\"mytxid\\\",\\\"vout\\\":0}]\" \"{\\\"myaddress\\\":0.01}\"") +
            "Sign the transaction, and get back the hex\n"
            + HelpExampleCli("signrawtransaction", "\"myhex\"") +
            "\nSend the transaction (signed hex)\n"
            + HelpExampleCli("sendrawtransaction", "\"signedhex\"") +
            "\nAs a json rpc call\n"
            + HelpExampleRpc("sendrawtransaction", "\"signedhex\"")
        ); // 1. 帮助内容

    LOCK(cs_main);
    RPCTypeCheck(params, boost::assign::list_of(UniValue::VSTR)(UniValue::VBOOL)); // 2. RPC 类型检测

    // parse hex string from parameter
    CTransaction tx;
    if (!DecodeHexTx(tx, params[0].get_str())) // 3. 从参数解析 16 进制的字符串
        throw JSONRPCError(RPC_DESERIALIZATION_ERROR, "TX decode failed");
    uint256 hashTx = tx.GetHash();

    bool fOverrideFees = false;
    if (params.size() > 1)
        fOverrideFees = params[1].get_bool();

    CCoinsViewCache &view = *pcoinsTip;
    const CCoins* existingCoins = view.AccessCoins(hashTx);
    bool fHaveMempool = mempool.exists(hashTx);
    bool fHaveChain = existingCoins && existingCoins->nHeight < 1000000000;
    if (!fHaveMempool && !fHaveChain) { // 4. 推送到本地节点并同步钱包
        // push to local node and sync with wallets
        CValidationState state;
        bool fMissingInputs;
        if (!AcceptToMemoryPool(mempool, state, tx, false, &fMissingInputs, false, !fOverrideFees)) { // 接受到内存池
            if (state.IsInvalid()) {
                throw JSONRPCError(RPC_TRANSACTION_REJECTED, strprintf("%i: %s", state.GetRejectCode(), state.GetRejectReason()));
            } else {
                if (fMissingInputs) {
                    throw JSONRPCError(RPC_TRANSACTION_ERROR, "Missing inputs");
                }
                throw JSONRPCError(RPC_TRANSACTION_ERROR, state.GetRejectReason());
            }
        }
    } else if (fHaveChain) {
        throw JSONRPCError(RPC_TRANSACTION_ALREADY_IN_CHAIN, "transaction already in block chain");
    }
    RelayTransaction(tx); // 5. 转发交易

    return hashTx.GetHex(); // 6. 获取交易哈希的 16 进制并返回
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.4. 推送到本地节点并同步钱包

函数 `AcceptToMemoryPool(mempool, state, tx, false, &fMissingInputs, false, !fOverrideFees)` 实现在文件 `main.cpp` 中。

```cpp
bool AcceptToMemoryPool(CTxMemPool& pool, CValidationState &state, const CTransaction &tx, bool fLimitFree,
                        bool* pfMissingInputs, bool fOverrideMempoolLimit, bool fRejectAbsurdFee)
{
    std::vector<uint256> vHashTxToUncache; // 未缓存交易哈希列表
    bool res = AcceptToMemoryPoolWorker(pool, state, tx, fLimitFree, pfMissingInputs, fOverrideMempoolLimit, fRejectAbsurdFee, vHashTxToUncache); // 接收到内存池工作者
    if (!res) { // 若添加失败
        BOOST_FOREACH(const uint256& hashTx, vHashTxToUncache) // 遍历未缓存的交易哈希列表
            pcoinsTip->Uncache(hashTx); // 从缓存中移除该交易索引
    }
    return res;
}
```

### 2.5. 转发交易

函数 `RelayTransaction(tx)` 声明在文件 `net.h` 中。

```cpp
class CTransaction;
void RelayTransaction(const CTransaction& tx);
void RelayTransaction(const CTransaction& tx, const CDataStream& ss);
```

定义在文件 `net.cpp` 中。

```cpp
void RelayTransaction(const CTransaction& tx)
{
    CDataStream ss(SER_NETWORK, PROTOCOL_VERSION);
    ss.reserve(10000); // 预开辟 10000 个字节
    ss << tx; // 导入交易
    RelayTransaction(tx, ss); // 开始转发
}

void RelayTransaction(const CTransaction& tx, const CDataStream& ss)
{
    CInv inv(MSG_TX, tx.GetHash()); // 根据交易哈希创建 inv 对象
    {
        LOCK(cs_mapRelay); // 中继映射列表上锁
        // Expire old relay messages // 使旧的中继数据过期
        while (!vRelayExpiration.empty() && vRelayExpiration.front().first < GetTime())
        { // 中继到期队列非空 且 中继过期队列队头元素过期时间小于当前时间（表示已过期）
            mapRelay.erase(vRelayExpiration.front().second); // 从中继数据映射列表中擦除中继过期队列的队头
            vRelayExpiration.pop_front(); // 中继过期队列出队
        }

        // Save original serialized message so newer versions are preserved // 保存原始的序列化消息，以便保留新版本
        mapRelay.insert(std::make_pair(inv, ss)); // 把该交易插入中继数据映射列表
        vRelayExpiration.push_back(std::make_pair(GetTime() + 15 * 60, inv)); // 加上 15min 的过期时间，加入过期队列
    }
    LOCK(cs_vNodes); // 已建立连接的节点列表上锁
    BOOST_FOREACH(CNode* pnode, vNodes) // 遍历当前已建立连接的节点列表
    {
        if(!pnode->fRelayTxes) // 若中继交易状态为 false
            continue; // 跳过该节点
        LOCK(pnode->cs_filter);
        if (pnode->pfilter) // 布鲁姆过滤器
        {
            if (pnode->pfilter->IsRelevantAndUpdate(tx))
                pnode->PushInventory(inv);
        } else // 没有使用 bloom filter
            pnode->PushInventory(inv); // 直接推送 inv 消息到该节点
    }
}
```

函数 `pnode->PushInventory(inv)` 在文件 `net.h` 的节点类 `CNode` 中。

```cpp
/** Information about a peer */
class CNode
{
    ...
    // inventory based relay
    CRollingBloomFilter filterInventoryKnown;
    std::vector<CInv> vInventoryToSend; // 基于库存的转发
    ...
    void PushInventory(const CInv& inv)
    {
        {
            LOCK(cs_inventory);
            if (inv.type == MSG_TX && filterInventoryKnown.contains(inv.hash)) // 若为交易类型 且 布鲁姆过滤器包含了该交易所在 inv 的哈希
                return; // 啥也不做直接返回
            vInventoryToSend.push_back(inv); // 否则加入发送库存列表
        }
    }
    ...
};
```

最终把库存条目 `inv` 消息对象加入到发送库存消息列表。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcrawtransaction.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcrawtransaction.cpp){:target="_blank"}
* [bitcoin/main.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.cpp){:target="_blank"}
* [bitcoin/net.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.h){:target="_blank"}
* [bitcoin/net.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.cpp){:target="_blank"}
