---
layout: post
title:  "比特币 RPC 命令剖析 \"getbestblockhash\""
date:   2018-05-22 10:02:28 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli getbestblockhash
---
## 1. 帮助内容

```shell
$ bitcoin-cli help getbestblockhash
getbestblockhash

返回最长区块链上最佳（尖端）区块的哈希。

结果
"hex"（字符串）16 进制编码的区块哈希

例子
> bitcoin-cli getbestblockhash
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getbestblockhash", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`getbestblockhash` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue getbestblockhash(const UniValue& params, bool fHelp);
```

实现在文件 `rpcserver.cpp` 中。

```cpp
UniValue getbestblockhash(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0)
        throw runtime_error(
            "getbestblockhash\n"
            "\nReturns the hash of the best (tip) block in the longest block chain.\n"
            "\nResult\n"
            "\"hex\"      (string) the block hash hex encoded\n"
            "\nExamples\n"
            + HelpExampleCli("getbestblockhash", "")
            + HelpExampleRpc("getbestblockhash", "")
        ); // 1. 帮助内容

    LOCK(cs_main);
    return chainActive.Tip()->GetBlockHash().GetHex(); // 2. 返回活跃的链尖区块哈希的 16 进制
}
```

### 2.1. 帮助内容

帮助例子函数 `HelpExampleCli()` 和 `HelpExampleRpc()` 均定义在文件 `rpcserver.h` 中。

```cpp
extern std::string HelpExampleCli(const std::string& methodname, const std::string& args);
extern std::string HelpExampleRpc(const std::string& methodname, const std::string& args);
```

实现在文件 `rpcserver.cpp` 中。

```cpp
std::string HelpExampleCli(const std::string& methodname, const std::string& args)
{
    return "> bitcoin-cli " + methodname + " " + args + "\n";
}

std::string HelpExampleRpc(const std::string& methodname, const std::string& args)
{
    return "> curl --user myusername --data-binary '{\"jsonrpc\": \"1.0\", \"id\": \"curltest\", "
        "\"method\": \"" + methodname + "\", \"params\": [" + args + "]}' -H 'content-type: text/plain;' http://127.0.0.1:8332/\n";
}
```

### 2.2. 返回活跃的链尖区块哈希

对象 `chainActive` 的引用在文件 `main.h` 中。

```cpp
/** The currently-connected chain of blocks (protected by cs_main). */
extern CChain chainActive; // 当前连接的区块链（活跃的链）。
```

定义在文件 `main.h` 中。

```cpp
CChain chainActive;
```

链类 `CChain` 定义在文件 `chain.h` 中。

```cpp
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
};
```

区块索引类 `CBlockIndex` 也定义在文件 `chain.h` 中。

```cpp
/** The block chain is a tree shaped structure starting with the
 * genesis block at the root, with each block potentially having multiple
 * candidates to be the next block. A blockindex may have multiple pprev pointing
 * to it, but at most one of them can be part of the currently active branch.
 */
class CBlockIndex
{
public:
    //! pointer to the hash of the block, if any. Memory is owned by this CBlockIndex
    const uint256* phashBlock; //! 指向区块的哈希，如果存在。内存属于该区块索引
    ...
    uint256 GetBlockHash() const
    {
        return *phashBlock;
    }
    ...
};
```

区块链是一个从根部创世区块开始的树形结构，每个区块有多个候选作为下一个区块。
一个区块索引可能有多个 pprev 指向它，但最多有一个是当前活跃分支的一部分。

最后把得到区块哈希调用函数 `GetHex()` 转换为 16 进制返回客户端。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/main.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/main.h){:target="_blank"}
* [bitcoin/chain.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/chain.h){:target="_blank"}
