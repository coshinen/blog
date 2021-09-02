---
layout: post
title:  "比特币 RPC 命令「getblockcount」"
date:   2018-05-25 20:06:42 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
---
<pre>
$ bitcoin-cli help getblockcount
getblockcount

返回最长区块链上的区块数。

结果：
n（数字）当前的区块数

例子：
> bitcoin-cli getblockcount
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockcount", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
</pre>

## 源码剖析

`getblockcount` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getblockcount(const UniValue& params, bool fHelp);
```

实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue getblockcount(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0)
        throw runtime_error(
            "getblockcount\n"
            "\nReturns the number of blocks in the longest block chain.\n"
            "\nResult:\n"
            "n    (numeric) The current block count\n"
            "\nExamples:\n"
            + HelpExampleCli("getblockcount", "")
            + HelpExampleRpc("getblockcount", "")
        ); // 1. 帮助内容

    LOCK(cs_main);
    return chainActive.Height(); // 2. 返回活跃的链高度
}
```

### 1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#1-帮助内容)。

### 2. 返回活跃的链高度

活跃的链对象 `chainActive` 在文件 `main.h` 中被引用。

```cpp
/** The currently-connected chain of blocks (protected by cs_main). */
extern CChain chainActive; // 当前连接的区块链（活跃的链）
```

定义在文件 `main.cpp` 中。

```cpp
CChain chainActive;
```

函数 `chainActive.Height()` 定义在文件 `chain.h` 的链类 `CChain` 中。

```cpp
/** An in-memory indexed chain of blocks. */
class CChain { // 一个内存中已索引的区块链。
private:
    std::vector<CBlockIndex*> vChain; // 区块索引列表

public:
    ...
    /** Return the maximal height in the chain. Is equal to chain.Tip() ? chain.Tip()->nHeight : -1. */
    int Height() const {
        return vChain.size() - 1; // 返回链上的最大高度（除去创世区块）。等于 chain.Tip() ? chain.Tip()->nHeight : -1。
    }
    ...
};
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcblockchain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcblockchain.cpp){:target="_blank"}
* [bitcoin/main.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.h){:target="_blank"}
* [bitcoin/main.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.cpp){:target="_blank"}
* [bitcoin/chain.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/chain.h){:target="_blank"}
