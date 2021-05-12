---
layout: post
title:  "比特币 RPC 命令剖析 \"setban\""
date:   2018-07-11 20:29:55 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli setban "ip(/netmask)" "add|remove" (bantime) (absolute)
---
## 1. 帮助内容

```shell
$ bitcoin-cli help setban
setban "ip(/netmask)" "add|remove" (bantime) (absolute)

尝试在已禁止的列表中添加或移除一个 IP /子网。

参数：
1. "ip(/netmask)"（字符串，必备）具有可选的网络掩码（默认为 /32 = 单一 ip）的 IP /子网（关于节点 ip 查看 getpeerinfo）
2. "command"     （字符串，必备）'add' 用于添加一个 IP /子网到列表，'remove' 用于从列表中移除一个 IP /子网
3. "bantime"     （数字，可选）以秒为单位的 ip 被禁止时间（或以设置的 [absolute] 为止）（0 或空意味着使用默认的 24h 的时间，也可以被 -bantime 启动参数覆盖）
4. "absolute"    （布尔型，可选）如果设置，则 bantime 必须是一个从格林尼治时间（1970-01-01 00:00:00）开始的绝对时间戳

例子：
> bitcoin-cli setban "192.168.0.6" "add" 86400
> bitcoin-cli setban "192.168.0.0/24" "add"
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "setban", "params": ["192.168.0.6", "add", 86400] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`setban` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue setban(const UniValue& params, bool fHelp);
```

实现在文件 `rpcnet.cpp` 中。

```cpp
UniValue setban(const UniValue& params, bool fHelp)
{
    string strCommand;
    if (params.size() >= 2)
        strCommand = params[1].get_str();
    if (fHelp || params.size() < 2 ||
        (strCommand != "add" && strCommand != "remove"))
        throw runtime_error(
                            "setban \"ip(/netmask)\" \"add|remove\" (bantime) (absolute)\n"
                            "\nAttempts add or remove a IP/Subnet from the banned list.\n"
                            "\nArguments:\n"
                            "1. \"ip(/netmask)\" (string, required) The IP/Subnet (see getpeerinfo for nodes ip) with a optional netmask (default is /32 = single ip)\n"
                            "2. \"command\"      (string, required) 'add' to add a IP/Subnet to the list, 'remove' to remove a IP/Subnet from the list\n"
                            "3. \"bantime\"      (numeric, optional) time in seconds how long (or until when if [absolute] is set) the ip is banned (0 or empty means using the default time of 24h which can also be overwritten by the -bantime startup argument)\n"
                            "4. \"absolute\"     (boolean, optional) If set, the bantime must be a absolute timestamp in seconds since epoch (Jan 1 1970 GMT)\n"
                            "\nExamples:\n"
                            + HelpExampleCli("setban", "\"192.168.0.6\" \"add\" 86400")
                            + HelpExampleCli("setban", "\"192.168.0.0/24\" \"add\"")
                            + HelpExampleRpc("setban", "\"192.168.0.6\", \"add\" 86400")
                            ); // 1. 帮助内容

    CSubNet subNet;
    CNetAddr netAddr;
    bool isSubnet = false;

    if (params[0].get_str().find("/") != string::npos)
        isSubnet = true;

    if (!isSubnet)
        netAddr = CNetAddr(params[0].get_str());
    else
        subNet = CSubNet(params[0].get_str());

    if (! (isSubnet ? subNet.IsValid() : netAddr.IsValid()) ) // 2. 检查指定的 ip /子网是否有效
        throw JSONRPCError(RPC_CLIENT_NODE_ALREADY_ADDED, "Error: Invalid IP/Subnet");

    if (strCommand == "add") // 3. 根据命令进行 IP /子网的添加或删除
    {
        if (isSubnet ? CNode::IsBanned(subNet) : CNode::IsBanned(netAddr))
            throw JSONRPCError(RPC_CLIENT_NODE_ALREADY_ADDED, "Error: IP/Subnet already banned");

        int64_t banTime = 0; //use standard bantime if not specified
        if (params.size() >= 3 && !params[2].isNull()) // 如果未指定则使用标准的禁止时间
            banTime = params[2].get_int64();

        bool absolute = false;
        if (params.size() == 4 && params[3].isTrue())
            absolute = true;

        isSubnet ? CNode::Ban(subNet, BanReasonManuallyAdded, banTime, absolute) : CNode::Ban(netAddr, BanReasonManuallyAdded, banTime, absolute);

        //disconnect possible nodes
        while(CNode *bannedNode = (isSubnet ? FindNode(subNet) : FindNode(netAddr))) // 断开可能的节点连接
            bannedNode->fDisconnect = true;
    }
    else if(strCommand == "remove")
    {
        if (!( isSubnet ? CNode::Unban(subNet) : CNode::Unban(netAddr) ))
            throw JSONRPCError(RPC_MISC_ERROR, "Error: Unban failed");
    }

    DumpBanlist(); //store banlist to disk
    uiInterface.BannedListChanged(); // 4. 存储禁止列表到磁盘，并发送列表已改变的信号

    return NullUniValue;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.2. 检查指定的 ip /子网是否有效

### 2.3. 根据命令进行 IP /子网的添加或删除

禁止函数 `CNode::Ban(subNet, BanReasonManuallyAdded, banTime, absolute)`、`CNode::Ban(netAddr, BanReasonManuallyAdded, banTime, absolute)` 和解禁函数 `CNode::Unban(subNet)`、`CNode::Unban(netAddr)` 都声明在文件 `net.h` 的节点类 `CNode` 中。

```cpp
/** Information about a peer */
class CNode
{
    ...
    static bool IsBanned(CNetAddr ip);
    static bool IsBanned(CSubNet subnet);
    static void Ban(const CNetAddr &ip, const BanReason &banReason, int64_t bantimeoffset = 0, bool sinceUnixEpoch = false);
    static void Ban(const CSubNet &subNet, const BanReason &banReason, int64_t bantimeoffset = 0, bool sinceUnixEpoch = false);
    static bool Unban(const CNetAddr &ip);
    static bool Unban(const CSubNet &ip);
    ...
};
```

均实现在文件 `net.cpp` 中。

```cpp
void CNode::Ban(const CNetAddr& addr, const BanReason &banReason, int64_t bantimeoffset, bool sinceUnixEpoch) {
    CSubNet subNet(addr); // 创建子网对象
    Ban(subNet, banReason, bantimeoffset, sinceUnixEpoch); // 添加禁止列表
}

void CNode::Ban(const CSubNet& subNet, const BanReason &banReason, int64_t bantimeoffset, bool sinceUnixEpoch) {
    CBanEntry banEntry(GetTime()); // 建立一个禁止条目
    banEntry.banReason = banReason; // 禁止原因
    if (bantimeoffset <= 0) // 禁止时间若（未指定）为 0 或小于 0
    {
        bantimeoffset = GetArg("-bantime", DEFAULT_MISBEHAVING_BANTIME); // 则使用默认禁止时间 24h
        sinceUnixEpoch = false; // 相对时间
    }
    banEntry.nBanUntil = (sinceUnixEpoch ? 0 : GetTime() )+bantimeoffset; // 根据绝对时间标志设置到期时间

    LOCK(cs_setBanned);
    if (setBanned[subNet].nBanUntil < banEntry.nBanUntil)
        setBanned[subNet] = banEntry; // 加入禁止列表 map

    setBannedIsDirty = true; // 列表改动标志置为 true
}

bool CNode::Unban(const CNetAddr &addr) {
    CSubNet subNet(addr); // 创建子网对象
    return Unban(subNet);
}

bool CNode::Unban(const CSubNet &subNet) {
    LOCK(cs_setBanned);
    if (setBanned.erase(subNet)) // 从禁止列表中擦除指定的子网
    {
        setBannedIsDirty = true; // 禁止列表改变标记置为 true
        return true;
    }
    return false;
}
```

### 2.4. 存储禁止列表到磁盘，并发送列表已改变的信号

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcnet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcnet.cpp){:target="_blank"}
* [bitcoin/net.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.h){:target="_blank"}
* [bitcoin/net.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.cpp){:target="_blank"}
