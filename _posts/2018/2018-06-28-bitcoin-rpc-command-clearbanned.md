---
layout: post
title:  "比特币 RPC 命令剖析 \"clearbanned\""
date:   2018-06-28 09:46:12 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli clearbanned
---
## 提示说明

```shell
clearbanned # 清除所有禁止的 IP
```

结果：无返回值。

## 用法示例

### 比特币核心客户端

使用 RPC 命令 [listbanned](/blog/2018/07/bitcoin-rpc-command-listbanned.html) 查看黑名单。

```shell
$ bitcoin-cli listbanned
[
  {
    "address": "192.168.0.2/32",
    "banned_until": 1527642100,
    "ban_created": 1527555700,
    "ban_reason": "manually added"
  }
]
$ bitcoin-cli clearbanned
$ bitcoin-cli listbanned
[
]
```

### cURL

```shell
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "clearbanned", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
```

## 源码剖析

listbanned 对应的函数在“rpcserver.h”文件中被引用。

```cpp
extern UniValue clearbanned(const UniValue& params, bool fHelp); // 清空黑名单
```

实现在“rpcnet.cpp”文件中。

```cpp
UniValue clearbanned(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0) // 没有参数
        throw runtime_error( // 命令帮助反馈
                            "clearbanned\n"
                            "\nClear all banned IPs.\n"
                            "\nExamples:\n"
                            + HelpExampleCli("clearbanned", "")
                            + HelpExampleRpc("clearbanned", "")
                            );

    CNode::ClearBanned(); // 清空禁止列表
    DumpBanlist(); //store banlist to disk // 导出禁止列表到硬盘
    uiInterface.BannedListChanged();

    return NullUniValue;
}
```

基本流程：
1. 处理命令帮助和参数个数。
2. 清空黑名单。
3. 导出黑名单到磁盘（清空相应的数据库文件）。
4. 发送信号，黑名单已改变。

函数 CNode::ClearBanned() 声明在“net.h”文件的 CNode 类中。

```cpp
/** Information about a peer */
class CNode // 关于同辈的信息
{
    ...
protected:

    // Denial-of-service detection/prevention
    // Key is IP address, value is banned-until-time
    static banmap_t setBanned;
    static CCriticalSection cs_setBanned;
    static bool setBannedIsDirty;
    ...
    static void ClearBanned(); // needed for unit testing
    ...
};
```

实现在“net.cpp”文件中。

```cpp
banmap_t CNode::setBanned; // 设置屏蔽地址列表
CCriticalSection CNode::cs_setBanned;
bool CNode::setBannedIsDirty; // 标志禁止列表已被清空过

void CNode::ClearBanned()
{
    LOCK(cs_setBanned); // 上锁
    setBanned.clear(); // 清空列表
    setBannedIsDirty = true; // 标志置为 true
}
```

函数 DumpBanlist() 声明在“net.h”文件中。

```cpp
void DumpBanlist();
```

实现在“net.cpp”文件中。

```cpp
void DumpBanlist()
{
    int64_t nStart = GetTimeMillis();

    CNode::SweepBanned(); //clean unused entries (if bantime has expired)

    CBanDB bandb; // 创建禁止列表数据库对象
    banmap_t banmap; // 局部禁止映射列表
    CNode::GetBanned(banmap); // 获取映射列表
    bandb.Write(banmap); // 写入数据库文件

    LogPrint("net", "Flushed %d banned node ips/subnets to banlist.dat  %dms\n",
             banmap.size(), GetTimeMillis() - nStart); // 记录大小及用时
}
```

函数 CNode::SweepBanned() 声明在“net.h”文件的 CNode 类中。

```cpp
/** Information about a peer */
class CNode // 关于同辈的信息
{
    ...
    //!clean unused entries (if bantime has expired)
    static void SweepBanned(); // 清除无用的条目（若禁止时间已过期）
    ...
};
```

实现在“net.cpp”文件中，用于清除黑名单中过期的条目。

```cpp
void CNode::SweepBanned()
{
    int64_t now = GetTime(); // 获取当前时间

    LOCK(cs_setBanned);
    banmap_t::iterator it = setBanned.begin();
    while(it != setBanned.end())
    { // 遍历禁止列表
        CBanEntry banEntry = (*it).second;
        if(now > banEntry.nBanUntil) // 若过期时间小于当前时间
        { // 说明已过期
            setBanned.erase(it++); // 清除该条目
            setBannedIsDirty = true;
        }
        else // 跳过该条目
            ++it;
    }
}
```

类 CBanDB 定义在“net.h”文件中。

```cpp
/** Access to the banlist database (banlist.dat) */
class CBanDB // 访问禁止列表数据库（banlist.dat）
{
private:
    boost::filesystem::path pathBanlist; // 保存数据库文件路径
public:
    CBanDB(); // 路径拼接，数据目录 + "banlist.dat"
    bool Write(const banmap_t& banSet);
    bool Read(banmap_t& banSet);
};
```

数据库对象 bandb 生成时，其无参构造函数自动初始化数据库文件名。

```cpp
//
// CBanDB
//

CBanDB::CBanDB()
{
    pathBanlist = GetDataDir() / "banlist.dat";
}
```

可以看到被禁止的 IP 列表的数据库文件名为“banlist.dat”，就存放在数据目录“~/.bitcoin”下。

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcnet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcnet.cpp){:target="_blank"}
* [bitcoin/net.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.h){:target="_blank"}
* [bitcoin/net.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.cpp){:target="_blank"}
