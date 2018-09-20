---
layout: post
title:  "比特币 RPC 命令剖析 \"reconsiderblock\""
date:   2018-06-14 10:29:12 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
hidden: true
---
## 提示说明

{% highlight shell %}
reconsiderblock "hash" # 移除指定区块及其后代的无效状态，再次考虑它们为激活状态
{% endhighlight %}

**该操作能够撤销 [invalidateblock](/blog/2018/06/bitcoin-rpc-command-invalidateblock.html) 的效果，但无法恢复连接。**

参数：<br>
1. hash （字符串，必备）用来再次考虑的区块哈希。

结果：无返回值。

## 用法示例

### 比特币核心客户端

参考 [invalidateblock](/blog/2018/06/bitcoin-rpc-command-invalidateblock.html) 命令，
再次考虑高度为 32723 的区块及其之后的区块。

{% highlight shell %}
$ bitcoin-cli reconsiderblock 000000ea5bb666e0ab8e837691bbb2a0605c4a82281eecd858ad3ffce917df96
$ bitcoin-cli getblockcount
32729
$ bitcoin-cli getconnectioncount
0
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "reconsiderblock", "params": ["000000ea5bb666e0ab8e837691bbb2a0605c4a82281eecd858ad3ffce917df96"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
reconsiderblock 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue reconsiderblock(const UniValue& params, bool fHelp); // 再考虑区块
{% endhighlight %}

实现在“rpcblockchain.cpp”文件中。

{% highlight C++ %}
UniValue reconsiderblock(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1) // 参数必须为 1 个
        throw runtime_error( // 命令帮助反馈
            "reconsiderblock \"hash\"\n"
            "\nRemoves invalidity status of a block and its descendants, reconsider them for activation.\n"
            "This can be used to undo the effects of invalidateblock.\n"
            "\nArguments:\n"
            "1. hash   (string, required) the hash of the block to reconsider\n"
            "\nResult:\n"
            "\nExamples:\n"
            + HelpExampleCli("reconsiderblock", "\"blockhash\"")
            + HelpExampleRpc("reconsiderblock", "\"blockhash\"")
        );

    std::string strHash = params[0].get_str(); // 获取指定区块哈希
    uint256 hash(uint256S(strHash)); // 创建 uint256 对象
    CValidationState state;

    {
        LOCK(cs_main); // 上锁
        if (mapBlockIndex.count(hash) == 0) // 若区块索引映射列表中没有指定区块
            throw JSONRPCError(RPC_INVALID_ADDRESS_OR_KEY, "Block not found");

        CBlockIndex* pblockindex = mapBlockIndex[hash]; // 获取指定区块索引
        ReconsiderBlock(state, pblockindex); // 再考虑区块
    }

    if (state.IsValid()) { // 若验证状态有效
        ActivateBestChain(state, Params()); // 激活最佳链
    }

    if (!state.IsValid()) { // 检查激活验证状态
        throw JSONRPCError(RPC_DATABASE_ERROR, state.GetRejectReason());
    }

    return NullUniValue; // 返回空值
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.获取指定区块哈希，构造 uint256 对象。<br>
3.验证指定区块是否存在，若存在，再次考虑该区块。<br>
4.检查验证状态，若有效，激活最佳链。<br>
5.再次检查激活验证状态，若有效，直接返回空值。

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#reconsiderblock)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
