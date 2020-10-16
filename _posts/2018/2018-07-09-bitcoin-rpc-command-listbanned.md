---
layout: post
title:  "比特币 RPC 命令剖析 \"listbanned\""
date:   2018-07-09 08:52:09 +0800
author: mistydew
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli listbanned
---
## 1. 帮助内容

```shell
$ bitcoin-cli help listbanned
listbanned

列出所有已禁止的 IP /子网。

例子：
> bitcoin-cli listbanned
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listbanned", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`listbanned` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue listbanned(const UniValue& params, bool fHelp);
```

实现在文件 `rpcnet.cpp` 中。

```cpp
UniValue listbanned(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0)
        throw runtime_error(
                            "listbanned\n"
                            "\nList all banned IPs/Subnets.\n"
                            "\nExamples:\n"
                            + HelpExampleCli("listbanned", "")
                            + HelpExampleRpc("listbanned", "")
                            ); // 1. 帮助内容

    banmap_t banMap;
    CNode::GetBanned(banMap); // 2. 获取禁止映射列表

    UniValue bannedAddresses(UniValue::VARR); // 3. 构建已禁止的地址集对象并返回
    for (banmap_t::iterator it = banMap.begin(); it != banMap.end(); it++)
    {
        CBanEntry banEntry = (*it).second;
        UniValue rec(UniValue::VOBJ);
        rec.push_back(Pair("address", (*it).first.ToString()));
        rec.push_back(Pair("banned_until", banEntry.nBanUntil));
        rec.push_back(Pair("ban_created", banEntry.nCreateTime));
        rec.push_back(Pair("ban_reason", banEntry.banReasonToString()));

        bannedAddresses.push_back(rec);
    }

    return bannedAddresses;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.2. 获取禁止映射列表

类型 `banmap_t` 定义在文件 `net.h` 中。

```cpp
typedef std::map<CSubNet, CBanEntry> banmap_t;
```

获取屏蔽映射列表函数 `CNode::GetBanned(banMap)` 声明在文件 `net.h` 的节点类 `CNode` 中。

```cpp
/** Information about a peer */
class CNode // 关于一个对端的信息
{
    ...
protected:

    // Denial-of-service detection/prevention
    // Key is IP address, value is banned-until-time
    static banmap_t setBanned;
    static CCriticalSection cs_setBanned;
    ...
public:
    ...
    static void GetBanned(banmap_t &banmap);
    ...
};
```

实现在文件 `net.cpp` 中。

```cpp
banmap_t CNode::setBanned;
CCriticalSection CNode::cs_setBanned;
...
void CNode::GetBanned(banmap_t &banMap)
{
    LOCK(cs_setBanned);
    banMap = setBanned; //create a thread safe copy
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcnet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcnet.cpp){:target="_blank"}
* [bitcoin/net.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.h){:target="_blank"}
* [bitcoin/net.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.cpp){:target="_blank"}
