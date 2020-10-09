---
layout: post
title:  "比特币 RPC 命令剖析 \"gettxoutproof\""
date:   2018-06-06 10:45:50 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli gettxoutproof ["txid",...] ( blockhash )
---
## 1. 帮助内容

```shell
$ bitcoin-cli help gettxoutproof
gettxoutproof ["txid",...] ( blockhash )

返回在一个区块中的 "txid" 的 16 进制编码的证明。

注意：默认情况下该功能只在某些时候起作用。这是指在该交易的 utxo 中有一个未花费的输出。
要使其一直工作，你需要维护一个交易索引，使用 -txindex 命令行选项或者手动指定包含该交易的区块（通过区块哈希）。

返回原始交易数据。

参数：
1. "txids"     （字符串）一个待筛选的交易索引的 json 数组
    [
      "txid"   （字符串）一笔交易哈希
      ,...
    ]
2. "block hash"（字符串，可选）如果指定，则在该哈希对应的区块中查询交易索引

结果：
"data"         （字符串）一个用于证明的序列化的、16 进制编码的字符串。
```

## 2. 源码剖析

`gettxoutproof` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue gettxoutproof(const UniValue& params, bool fHelp);
```

实现在文件 `rpcrawtransaction.cpp` 中。

```cpp
UniValue gettxoutproof(const UniValue& params, bool fHelp)
{
    if (fHelp || (params.size() != 1 && params.size() != 2))
        throw runtime_error(
            "gettxoutproof [\"txid\",...] ( blockhash )\n"
            "\nReturns a hex-encoded proof that \"txid\" was included in a block.\n"
            "\nNOTE: By default this function only works sometimes. This is when there is an\n"
            "unspent output in the utxo for this transaction. To make it always work,\n"
            "you need to maintain a transaction index, using the -txindex command line option or\n"
            "specify the block in which the transaction is included in manually (by blockhash).\n"
            "\nReturn the raw transaction data.\n"
            "\nArguments:\n"
            "1. \"txids\"       (string) A json array of txids to filter\n"
            "    [\n"
            "      \"txid\"     (string) A transaction hash\n"
            "      ,...\n"
            "    ]\n"
            "2. \"block hash\"  (string, optional) If specified, looks for txid in the block with this hash\n"
            "\nResult:\n"
            "\"data\"           (string) A string that is a serialized, hex-encoded data for the proof.\n"
        ); // 1. 帮助内容

    set<uint256> setTxids; // 交易索引集合
    uint256 oneTxid;
    UniValue txids = params[0].get_array(); // 获取指定的交易索引集
    for (unsigned int idx = 0; idx < txids.size(); idx++) { // 遍历该集合
        const UniValue& txid = txids[idx]; // 获取交易索引
        if (txid.get_str().length() != 64 || !IsHex(txid.get_str())) // 长度及 16 进制验证
            throw JSONRPCError(RPC_INVALID_PARAMETER, string("Invalid txid ")+txid.get_str());
        uint256 hash(uint256S(txid.get_str()));
        if (setTxids.count(hash)) // 保证只插入一次
            throw JSONRPCError(RPC_INVALID_PARAMETER, string("Invalid parameter, duplicated txid: ")+txid.get_str());
       setTxids.insert(hash); // 加入交易索引集
       oneTxid = hash; // 记录最后一笔交易哈希
    }

    LOCK(cs_main); // 上锁

    CBlockIndex* pblockindex = NULL;

    uint256 hashBlock;
    if (params.size() > 1) // 指定了区块哈希
    {
        hashBlock = uint256S(params[1].get_str()); // 获取指定区块哈希
        if (!mapBlockIndex.count(hashBlock)) // 若区块索引映射中没有该区块
            throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Block not found"); // 报错
        pblockindex = mapBlockIndex[hashBlock]; // 获取区块索引
    } else { // 未指定区块
        CCoins coins;
        if (pcoinsTip->GetCoins(oneTxid, coins) && coins.nHeight > 0 && coins.nHeight <= chainActive.Height())
            pblockindex = chainActive[coins.nHeight]; // 获取该交易所在的区块索引
    }

    if (pblockindex == NULL) // 区块索引存在
    {
        CTransaction tx;
        if (!GetTransaction(oneTxid, tx, Params().GetConsensus(), hashBlock, false) || hashBlock.IsNull())
            throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Transaction not yet in block");
        if (!mapBlockIndex.count(hashBlock)) // 区块索引不在区块索引映射列表中
            throw JSONRPCError(RPC_INTERNAL_ERROR, "Transaction index corrupt");
        pblockindex = mapBlockIndex[hashBlock]; // 获取区块索引
    }

    CBlock block;
    if(!ReadBlockFromDisk(block, pblockindex, Params().GetConsensus())) // 通过区块索引从磁盘读区块数据到 block
        throw JSONRPCError(RPC_INTERNAL_ERROR, "Can't read block from disk");

    unsigned int ntxFound = 0; // 找到交易的个数
    BOOST_FOREACH(const CTransaction&tx, block.vtx) // 遍历区块交易列表
        if (setTxids.count(tx.GetHash())) // 若该交易在指定的交易集中
            ntxFound++; // +1
    if (ntxFound != setTxids.size()) // 找到交易个数必须等于交易集大小，及指定交易必须全部找到
        throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "(Not all) transactions not found in specified block");

    CDataStream ssMB(SER_NETWORK, PROTOCOL_VERSION); // 创建数据流对象
    CMerkleBlock mb(block, setTxids); // 把交易索引集以及对应区块的数据构建一个 CMerkleBlock 对象
    ssMB << mb; // 导入数据流
    std::string strHex = HexStr(ssMB.begin(), ssMB.end()); // 转换为 16 进制
    return strHex;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

基本流程：
1. 处理命令帮助和参数个数。
2. 获取相关参数：交易索引集合，上锁。
3. 若指定了区块，获取指定的区块哈希并验证同时获取区块索引。
4. 若未指定区块，先获取指定的最后一个交易的币信息，在获取其所在区块的索引。
5. 若区块索引为空，再次尝试获取。
6. 通过区块索引从磁盘读区块数据到内存 block 对象。
7. 遍历该区块体交易列表，验证所有指定的交易都存在于该区块。
8. 构建一个 CMerkleBlock 对象，导入数据流对象并转换为 16 进制后返回。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcrawtransaction.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcrawtransaction.cpp){:target="_blank"}
