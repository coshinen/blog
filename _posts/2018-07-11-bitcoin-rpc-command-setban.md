---
layout: post
title:  "比特币 RPC 命令剖析 \"setban\""
date:   2018-07-11 10:29:55 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli setban "ip(/netmask)" "add|remove" (bantime) (absolute)
---
## 提示说明

```shell
setban "ip(/netmask)" "add|remove" (bantime) (absolute) # 尝试从黑名单添加或移除一个 IP/子网
```

参数：<br>
1.ip(/netmask)（字符串，必备）IP/子网（见 getpeerinfo 中的节点 ip）拥有可选的子网（默认时 /32 = 单一 ip）。<br>
2.command（字符串，必备）add 添加一个 IP/子网 到屏蔽列表，remove 从屏蔽列表移除一个 IP/子网。<br>
3.bantime（数字，可选）ip 被禁止（0 或空意味着使用默认 24h 时间，也可以通过 -bantime 参数在核心服务启动时修改该值）的时间以秒为单位（或若 [absolute] 设置了则为截止时间）<br>
4.absolute（布尔型，可选）如果设置该项，禁止时间必须是一个（从格林尼治时间 1970-01-01 00:00:00 开始）绝对时间戳。默认为相对时间，true 表示绝对时间。

结果：无返回值。

## 用法示例

### 比特币核心客户端

用法一：使用 add 命令禁止 86400 秒（24h）。

```shell
$ bitcoin-cli setban 192.168.0.6 add 86400
$ bitcoin-cli listbanned
[
  {
    "address": "192.168.0.6/32",
    "banned_until": 1527648287,
    "ban_created": 1527561887,
    "ban_reason": "manually added"
  }
]
```

用法二：使用 add 命令添加，使用默认禁止时间 24h。

```shell
$ bitcoin-cli clearbanned
$ bitcoin-cli setban 192.168.0.6 add
$ bitcoin-cli listbanned
[
  {
    "address": "192.168.0.6/32",
    "banned_until": 1527648569,
    "ban_created": 1527562169,
    "ban_reason": "manually added"
  }
]
```

用法三：使用 add 命令添加并指定 absolute 选项。

```shell
$ bitcoin-cli clearbanned
$ bitcoin-cli setban 192.168.0.6 add 1588882233 true
$ bitcoin-cli listbanned
[
  {
    "address": "192.168.0.6/32",
    "banned_until": 1588882233,
    "ban_created": 1527562980,
    "ban_reason": "manually added"
  }
]
```

用法四：使用 remove 命令移除指定 IP。

```shell
$ bitcoin-cli listbanned
[
  {
    "address": "192.168.0.6/32",
    "banned_until": 1588882233,
    "ban_created": 1527562980,
    "ban_reason": "manually added"
  }
]
$ bitcoin-cli setban 192.168.0.6 remove
$ bitcoin-cli listbanned
[
]
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "setban", "params": ["192.168.0.6", "add", 86400] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
```

## 源码剖析
setban 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue setban(const UniValue& params, bool fHelp); // 设置黑名单
```

实现在“rpcnet.cpp”文件中。

```cpp
UniValue setban(const UniValue& params, bool fHelp)
{
    string strCommand;
    if (params.size() >= 2)
        strCommand = params[1].get_str();
    if (fHelp || params.size() < 2 ||
        (strCommand != "add" && strCommand != "remove")) // 参数至少为 2 个
        throw runtime_error( // 命令帮助反馈
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
                            );

    CSubNet subNet;
    CNetAddr netAddr;
    bool isSubnet = false; // 子网标志，默认为 false

    if (params[0].get_str().find("/") != string::npos) // 检查指定的 ip 地址中是否包含子网
        isSubnet = true;

    if (!isSubnet) // 无子网
        netAddr = CNetAddr(params[0].get_str());
    else // 含子网
        subNet = CSubNet(params[0].get_str());

    if (! (isSubnet ? subNet.IsValid() : netAddr.IsValid()) ) // 检查网络有效性
        throw JSONRPCError(RPC_CLIENT_NODE_ALREADY_ADDED, "Error: Invalid IP/Subnet");

    if (strCommand == "add")
    { // 添加选项
        if (isSubnet ? CNode::IsBanned(subNet) : CNode::IsBanned(netAddr)) // 检查是否已经禁止
            throw JSONRPCError(RPC_CLIENT_NODE_ALREADY_ADDED, "Error: IP/Subnet already banned");

        int64_t banTime = 0; //use standard bantime if not specified
        if (params.size() >= 3 && !params[2].isNull()) // 若有 3 个参数且第 3 个参数非空
            banTime = params[2].get_int64(); // 获取禁止时间

        bool absolute = false; // 绝对时间，默认关闭
        if (params.size() == 4 && params[3].isTrue()) // 若有 4 个参数且第 4 个参数为 true
            absolute = true; // 绝对时间标志置为 true

        isSubnet ? CNode::Ban(subNet, BanReasonManuallyAdded, banTime, absolute) : CNode::Ban(netAddr, BanReasonManuallyAdded, banTime, absolute); // 禁止指定地址

        //disconnect possible nodes
        while(CNode *bannedNode = (isSubnet ? FindNode(subNet) : FindNode(netAddr))) // 查找节点列表
            bannedNode->fDisconnect = true; // 把存在的节点的断开连接标志置为 true
    }
    else if(strCommand == "remove")
    { // 移除选项
        if (!( isSubnet ? CNode::Unban(subNet) : CNode::Unban(netAddr) )) // 解禁网络
            throw JSONRPCError(RPC_MISC_ERROR, "Error: Unban failed");
    }

    DumpBanlist(); //store banlist to disk
    uiInterface.BannedListChanged();

    return NullUniValue;
}
```

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.检查指定的 ip 中是否含有子网。<br>
3.创建对应的对象并检查网络的有效性。<br>
4.add 添加到网络禁止列表。<br>
4.1.检查列表中是否已存在该地址。<br>
4.2.获取禁止的到期时间。<br>
4.3.获取绝对时间标志。<br>
4.4.禁止指定的网络。<br>
4.5.查看建立连接的节点是否存在该网络，有则断开连接。<br>
5.或 remove 移除指定网络。<br>
6.导出禁止列表到磁盘文件“banlist.dat”。<br>
7.发送信号，黑名单已改变。

第四步，调用 CNode::Ban(subNet, BanReasonManuallyAdded, banTime, absolute) 或 CNode::Ban(netAddr, BanReasonManuallyAdded, banTime, absolute) 函数
添加指定网络到禁止列表。该函数声明在“net.h”文件的 CNode 类中。

```cpp
/** Information about a peer */
class CNode // 关于同辈的信息
{
    ...
    static bool IsBanned(CNetAddr ip);
    static bool IsBanned(CSubNet subnet);
    static void Ban(const CNetAddr &ip, const BanReason &banReason, int64_t bantimeoffset = 0, bool sinceUnixEpoch = false); // 转调下面添加子网的重载函数
    static void Ban(const CSubNet &subNet, const BanReason &banReason, int64_t bantimeoffset = 0, bool sinceUnixEpoch = false);
    ...
};
```

实现在“net.cpp”文件中。

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
```

第五步，调用 CNode::Unban(subNet) 或 CNode::Unban(netAddr) 函数从禁止列表中移除指定网络。
该函数声明在“net.h”文件的 CNode 类中。

```cpp
class CNode // 关于同辈的信息
{
    ...
    static bool Unban(const CNetAddr &ip); // 调用下面的解禁子网的重载函数
    static bool Unban(const CSubNet &ip);
    ...
};
```

实现在“net.cpp”文件中。

```cpp
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

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#setban){:target="_blank"}
