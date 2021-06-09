---
layout: post
title:  "比特币 RPC 命令「getblockhash」"
date:   2018-05-28 20:48:05 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin RPCs
excerpt: $ bitcoin-cli getblockhash index
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getblockhash
getblockhash index

根据提供的索引返回最佳区块链上区块的哈希。

参数：
1. index（整型，必备）区块索引

结果：
"hash"（字符串）区块哈希

例子：
> bitcoin-cli getblockhash 1000
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockhash", "params": [1000] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getblockhash` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getblockhash(const UniValue& params, bool fHelp);
```

实现在文件 `rpcblockchain.cpp` 中。

```cpp
UniValue getblockhash(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 1)
        throw runtime_error(
            "getblockhash index\n"
            "\nReturns hash of block in best-block-chain at index provided.\n"
            "\nArguments:\n"
            "1. index         (numeric, required) The block index\n"
            "\nResult:\n"
            "\"hash\"         (string) The block hash\n"
            "\nExamples:\n"
            + HelpExampleCli("getblockhash", "1000")
            + HelpExampleRpc("getblockhash", "1000")
        ); // 1. 帮助内容

    LOCK(cs_main);

    int nHeight = params[0].get_int(); // 2. 把索引转换为链高度
    if (nHeight < 0 || nHeight > chainActive.Height()) // 区块高度范围检测
        throw JSONRPCError(RPC_INVALID_PARAMETER, "Block height out of range");

    CBlockIndex* pblockindex = chainActive[nHeight]; // 3. 获取活跃的链上对应高度的区块索引
    return pblockindex->GetBlockHash().GetHex(); // 返回区块索引对应的区块哈希（16 进制）
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令「getbestblockhash」2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#21-帮助内容)。

### 2.2. 把索引转换为链高度并进行检测

获取活跃的链高度函数 `chainActive.Height()` 实现在文件 `chain.h` 中。

```cpp
/** The block chain is a tree shaped structure starting with the
 * genesis block at the root, with each block potentially having multiple
 * candidates to be the next block. A blockindex may have multiple pprev pointing
 * to it, but at most one of them can be part of the currently active branch.
 */
class CBlockIndex
{
public:
    ...
    //! height of the entry in the chain. The genesis block has height 0
    int nHeight; //! 链上区块的高度。创世区块高度为 0
    ...
};
...
/** An in-memory indexed chain of blocks. */
class CChain { // 一个内存中已索引区块的链。
private:
    std::vector<CBlockIndex*> vChain;

public:
    ...
    /** Returns the index entry for the tip of this chain, or NULL if none. */
    CBlockIndex *Tip() const { // 返回该链尖的索引条目，如果没有则为空。
        return vChain.size() > 0 ? vChain[vChain.size() - 1] : NULL;
    }
    ...
    /** Return the maximal height in the chain. Is equal to chain.Tip() ? chain.Tip()->nHeight : -1. */
    int Height() const { // 返回链的最大高度。等于 chain.Tip() ? chain.Tip()->nHeight : -1。
        return vChain.size() - 1;
    }
    ...
};
```

### 2.3. 获取活跃的链上对应高度的区块索引的哈希转换为 16 进制并返回

参考[比特币 RPC 命令「getbestblockhash」2.2. 返回活跃的链尖区块哈希的 16 进制](/blog/2018/05/bitcoin-rpc-getbestblockhash.html#22-返回活跃的链尖区块哈希的-16-进制)。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcblockchain.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcblockchain.cpp){:target="_blank"}
* [bitcoin/main.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.h){:target="_blank"}
* [bitcoin/chain.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/chain.h){:target="_blank"}
