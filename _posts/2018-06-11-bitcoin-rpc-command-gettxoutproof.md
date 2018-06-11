---
layout: post
title:  "比特币 RPC 命令剖析 \"gettxoutproof\""
date:   2018-06-11 10:45:50 +0800
author: mistydew
categories: Blockchain
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
为了使其一直工作，你需要维持一个交易索引，使用 -txindex 命令行选项或手动指定交易所包含在的区块（通过区块哈希）。**

参数：<br>
1. `txids` （字符串）一个用于过滤器的交易索引 json 数组。<br>
{% highlight shell %}
    [
      "txid"     (string) A transaction hash
      ,...
    ]
{% endhighlight %}
2. `block hash` （字符串，可选）如果指定，在该哈希的区块上查询交易。

结果：（字符串）返回元交易数据。一个序列化的字符串，16 进制编码的证明数据。

## 用法示例

用法一：直接通过交易索引获取该交易的验证。

{% highlight shell %}
$ bitcoin-cli gettxoutproof [\"5d306125b2fbfc5855b1b7729ceac1b3010e0ddaa7b03f7abeb225f7b13677ff\"]
00000020833c129fd31f08097043e99c9c402d321b0c4adc7113c311eae61f3985040000a2de87bfe308217d7f081364e6226348d43826b37784c79f22b1efd9a29e97655bc0045b1212221e23850d006400000008422f3ac5676e74eb5897bf995da0ff25b4a17cb159c90291f0f806da6be926d5aaba707d3d33d66536b8ff50555224a4fa4fe6ed12223e48bfa907bc9cb1d746ff7736b1f725b2be7a3fb0a7da0d0e01b3c1ea9c72b7b15558fcfbb22561305d909a82f522c54603f5ee8a936c891f6310352bba789c2b74770c876561eb31b3cad1e95caaa026649a86e12f92d0a16e8614a8a0160ce19a96820906a0bf138940f37ed5368c71c23c086b2872c528462fdb8742446abe73272e22d157a5eacbdbcd89202b0090b2e14347c1aba39bd3588f853ce6c0be70e1a3baae7abba75ee96f4c02790982171633df9576a90701ad0f1bea6e526fd7f3d95571031503af02db03
{% endhighlight %}

用法二：通过交易索引并指定其所在区块的哈希获取该交易的验证。

{% highlight shell %}
$ bitcoin-cli gettransaction 5d306125b2fbfc5855b1b7729ceac1b3010e0ddaa7b03f7abeb225f7b13677ff
{
  "amount": 0.10000000,
  "confirmations": 49372,
  "instantlock": false,
  "blockhash": "000018a8100074b9639c79ab2cc2c74a9d1daa6945caef63bde24dd6a28d570d",
  "blockindex": 40,
  "blocktime": 1527038043,
  "txid": "5d306125b2fbfc5855b1b7729ceac1b3010e0ddaa7b03f7abeb225f7b13677ff",
  "walletconflicts": [
  ],
  "time": 1527038031,
  "timereceived": 1527038031,
  "bip125-replaceable": "no",
  "details": [
    {
      "account": "",
      "address": "1kjTv8TKSsbpGEBVZqLTcx1MeA4G8JkCnk",
      "category": "receive",
      "amount": 0.10000000,
      "label": "",
      "vout": 0
    }
  ],
  "hex": "0100000001c5c4f0250d3d7f4ab94f5ff6d0762b4b11db88ff461fd00058c0fb475e63f30b000000004847304402202d7eeff6237b72a214320b2090e4133b6fa3103168e671561c3ce465003687e802201512be84feeb93213db0dacc20db78d1c02a68a6f9ae39a6c6db01736d31ad2901feffffff0280969800000000001976a914a4d938a6461a0d6f24946b9bfcda0862a1db6f7488acc0616a94000000001976a9149d349153b4c40b59744528559bf5379d84db17d288ace6600000"
}
$ bitcoin-cli gettxoutproof [\"5d306125b2fbfc5855b1b7729ceac1b3010e0ddaa7b03f7abeb225f7b13677ff\"] 000018a8100074b9639c79ab2cc2c74a9d1daa6945caef63bde24dd6a28d570d
00000020833c129fd31f08097043e99c9c402d321b0c4adc7113c311eae61f3985040000a2de87bfe308217d7f081364e6226348d43826b37784c79f22b1efd9a29e97655bc0045b1212221e23850d006400000008422f3ac5676e74eb5897bf995da0ff25b4a17cb159c90291f0f806da6be926d5aaba707d3d33d66536b8ff50555224a4fa4fe6ed12223e48bfa907bc9cb1d746ff7736b1f725b2be7a3fb0a7da0d0e01b3c1ea9c72b7b15558fcfbb22561305d909a82f522c54603f5ee8a936c891f6310352bba789c2b74770c876561eb31b3cad1e95caaa026649a86e12f92d0a16e8614a8a0160ce19a96820906a0bf138940f37ed5368c71c23c086b2872c528462fdb8742446abe73272e22d157a5eacbdbcd89202b0090b2e14347c1aba39bd3588f853ce6c0be70e1a3baae7abba75ee96f4c02790982171633df9576a90701ad0f1bea6e526fd7f3d95571031503af02db03
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
