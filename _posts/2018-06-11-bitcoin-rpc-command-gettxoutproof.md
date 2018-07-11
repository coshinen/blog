---
layout: post
title:  "比特币 RPC 命令剖析 \"gettxoutproof\""
date:   2018-06-11 10:45:50 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin client rpc
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
gettxoutproof ["txid",...] ( blockhash ) # 获取包含在一个区块上的交易 `txid` 的 16 进制编码的证明
{% endhighlight %}

**注：默认情况下，此功能仅在有时可用。这是当在该交易的未花费交易输出上有一个未花费的输出时。
为了使其一直工作，你需要维持一个交易索引，使用 `-txindex` 命令行选项或手动指定包含该交易的区块（通过区块哈希）。**

参数：<br>
1. `txids` （字符串）一个用于过滤器的交易索引 json 数组。<br>
{% highlight shell %}
    [
      "txid"     （字符串）一笔交易哈希
      ,...
    ]
{% endhighlight %}
2. `block hash` （字符串，可选）如果指定了，则在该哈希对应的区块上查询交易。

结果：（字符串）返回原始交易数据。一个序列化的字符串，16 进制编码的证明。

## 用法示例

### 比特币核心客户端

用法一：获取指定索引的交易验证。

{% highlight shell %}
$ bitcoin-cli gettxoutproof [\"b797bafd7830774cec4d24d1e649cafb0aa7a67b9f1cc06954102a50b463fa0f\"]
00000020a7bdefd4740678bd9e4b6c6c170dd6ebdfb4dabfb237e428bb4a70f3ae000000ea0a02f07f8f8d9e81792b0068341be05dc20a1d7488b0c34a64c6ed1de72d41b7a3305b538c021e7d5952000200000002ba9ac033f860746a4ab907f918192bf412965e414d84aca52d705131f3b47e570ffa63b4502a105469c01c9f7ba6a70afbca49e6d1244dec4c773078fdba97b70105
{% endhighlight %}

用法二：通过指定交易所在的区块获取指定索引的交易验证。<br>
先使用 [`gettransaction`](/2018/06/07/bitcoin-rpc-command-gettransaction) 获取指定交易所在的区块。

{% highlight shell %}
$ bitcoin-cli gettransaction b797bafd7830774cec4d24d1e649cafb0aa7a67b9f1cc06954102a50b463fa0f
{
  "amount": -1.00000000,
  "fee": -0.00003840,
  "confirmations": 383,
  "blockhash": "000001a79bb8f78383723fdaab5c3cdf2a64431ea2edaadde5656bee9718b027",
  "blockindex": 1,
  "blocktime": 1529914295,
  "txid": "b797bafd7830774cec4d24d1e649cafb0aa7a67b9f1cc06954102a50b463fa0f",
  "walletconflicts": [
  ],
  "time": 1529912960,
  "timereceived": 1529912960,
  "bip125-replaceable": "no",
  "details": [
    {
      "account": "",
      "address": "1Q11qnWi8RqMgJy6DJ8FzrUEdbsFxq651Y",
      "category": "send",
      "amount": -1.00000000,
      "vout": 0,
      "fee": -0.00003840,
      "abandoned": false
    }
  ],
  "hex": "01000000010667e834b5ab662ee16594f94544eb4c19053c91c43fbf0d632d79b9049d435c0000000048473044022006d96053e65a45947d76afaec17c7dea2812a3b1e68392023e9608eaad63a0070220743d593a922b3a38b6a875888966ded6e3a90e1337029cec9e1540ab53e7acdb01feffffff0200e1f505000000001976a914fc4b985c0e6819f137f5c7dd2947fb0ba6eff1d988ac00021024010000001976a9144483dc8ad0a184355b70b2767a832266b4c2df0a88ac425f0000"
}
$ bitcoin-cli gettxoutproof [\"b797bafd7830774cec4d24d1e649cafb0aa7a67b9f1cc06954102a50b463fa0f\"]
00000020a7bdefd4740678bd9e4b6c6c170dd6ebdfb4dabfb237e428bb4a70f3ae000000ea0a02f07f8f8d9e81792b0068341be05dc20a1d7488b0c34a64c6ed1de72d41b7a3305b538c021e7d5952000200000002ba9ac033f860746a4ab907f918192bf412965e414d84aca52d705131f3b47e570ffa63b4502a105469c01c9f7ba6a70afbca49e6d1244dec4c773078fdba97b70105
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "gettxoutproof", "params": [["b797bafd7830774cec4d24d1e649cafb0aa7a67b9f1cc06954102a50b463fa0f"]] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"00000020a7bdefd4740678bd9e4b6c6c170dd6ebdfb4dabfb237e428bb4a70f3ae000000ea0a02f07f8f8d9e81792b0068341be05dc20a1d7488b0c34a64c6ed1de72d41b7a3305b538c021e7d5952000200000002ba9ac033f860746a4ab907f918192bf412965e414d84aca52d705131f3b47e570ffa63b4502a105469c01c9f7ba6a70afbca49e6d1244dec4c773078fdba97b70105","error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`gettxoutproof` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue gettxoutproof(const UniValue& params, bool fHelp); // 获取交易输出证明
{% endhighlight %}

实现在“rpcrawtransaction.cpp”文件中。

{% highlight C++ %}
UniValue gettxoutproof(const UniValue& params, bool fHelp)
{
    if (fHelp || (params.size() != 1 && params.size() != 2)) // 参数为 1 个或 2 个
        throw runtime_error( // 命令帮助反馈
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
        );

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
    return strHex; // 返回结果
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.获取相关参数：交易索引集合，上锁。<br>
3.若指定了区块，获取指定的区块哈希并验证同时获取区块索引。<br>
4.若未指定区块，先获取指定的最后一个交易的币信息，在获取其所在区块的索引。<br>
5.若区块索引为空，再次尝试获取。<br>
6.通过区块索引从磁盘读区块数据到内存 block 对象。<br>
7.遍历该区块体交易列表，验证所有指定的交易都存在于该区块。<br>
8.构建一个 CMerkleBlock 对象，导入数据流对象并转换为 16 进制后返回。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#gettxoutproof)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
