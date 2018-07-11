---
layout: post
title:  "比特币 RPC 命令剖析 \"getblockcount\""
date:   2018-05-22 14:06:42 +0800
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
getblockcount # 获取当前最长区块链的区块总数（不包含创世区块）
{% endhighlight %}

结果：（数字）当前的区块数。<br>

## 用法示例

### 比特币核心客户端

获取当前最佳链区块总数。

{% highlight shell %}
$ bitcoin-cli getblockcount
524783
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockcount", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":25109,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
`getblockcount` 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue getblockcount(const UniValue& params, bool fHelp); // 获取当前区块总数
{% endhighlight %}

实现在“rpcblockchain.cpp”文件中。

{% highlight C++ %}
UniValue getblockcount(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 没有参数
        throw runtime_error( // 帮助信息反馈
            "getblockcount\n"
            "\nReturns the number of blocks in the longest block chain.\n"
            "\nResult:\n"
            "n    (numeric) The current block count\n"
            "\nExamples:\n"
            + HelpExampleCli("getblockcount", "")
            + HelpExampleRpc("getblockcount", "")
        );

    LOCK(cs_main);
    return chainActive.Height(); // 返回激活的链高度
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.上锁。<br>
3.返回当前激活链的高度。

对象 chainActive 在文件“main.h”文件中被引用。

{% highlight C++ %}
/** The currently-connected chain of blocks (protected by cs_main). */
extern CChain chainActive; // 当前连接的区块链（激活的链）
{% endhighlight %}

定义在“main.cpp”文件中。

{% highlight C++ %}
CChain chainActive; // 当前连接的区块链（激活的链）
{% endhighlight %}

第三步，调用 chainActive.Height() 函数获取当前激活链的高度，该函数定义在“chain.h”文件的 CChain 类中。

{% highlight C++ %}
/** An in-memory indexed chain of blocks. */
class CChain { // 一个内存中用于区块索引的链
private:
    std::vector<CBlockIndex*> vChain; // 内存中区块的索引列表

public:
    ...
    /** Return the maximal height in the chain. Is equal to chain.Tip() ? chain.Tip()->nHeight : -1. */
    int Height() const {
        return vChain.size() - 1; // 返回区块链的最大高度（总区块数减 1）。等价于 chain.Tip() ? chain.Tip()->nHeight : -1。
    }
    ...
};
{% endhighlight %}

Thanks for your time.

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#getblockcount)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
