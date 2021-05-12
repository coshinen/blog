---
layout: post
title:  "比特币 RPC 命令剖析 \"clearbanned\""
date:   2018-06-28 19:46:12 +0800
author: Coshin
comments: true
category: 区块链
tags: Bitcoin bitcoin-cli
excerpt: $ bitcoin-cli clearbanned
---
## 1. 帮助内容

```shell
$ bitcoin-cli help clearbanned
clearbanned

清除所有已禁止的 IP。

例子：
> bitcoin-cli clearbanned
> curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "clearbanned", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

## 2. 源码剖析

`listbanned` 对应的函数在文件 `rpcserver.h` 中被引用。

```cpp
extern UniValue clearbanned(const UniValue& params, bool fHelp);
```

实现在文件 `rpcnet.cpp` 中。

```cpp
UniValue clearbanned(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() != 0)
        throw runtime_error(
                            "clearbanned\n"
                            "\nClear all banned IPs.\n"
                            "\nExamples:\n"
                            + HelpExampleCli("clearbanned", "")
                            + HelpExampleRpc("clearbanned", "")
                            ); // 1. 帮助内容

    CNode::ClearBanned(); // 2. 清空已禁止的节点列表
    DumpBanlist(); //store banlist to disk // 3. 存储禁止列表到磁盘
    uiInterface.BannedListChanged();

    return NullUniValue;
}
```

### 2.1. 帮助内容

参考[比特币 RPC 命令剖析 "getbestblockhash" 2.1. 帮助内容](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html#21-帮助内容)。

### 2.2. 清空已禁止的节点列表

清空已禁止的节点列表函数 `CNode::ClearBanned()` 声明在文件 `net.h` 的节点类 `CNode` 中。

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
    static bool setBannedIsDirty;
    ...
    static void ClearBanned(); // needed for unit testing
    ...
};
```

实现在文件 `net.cpp` 中。

```cpp
banmap_t CNode::setBanned;
CCriticalSection CNode::cs_setBanned;
bool CNode::setBannedIsDirty;

void CNode::ClearBanned()
{
    LOCK(cs_setBanned);
    setBanned.clear();
    setBannedIsDirty = true;
}
```

### 2.3. 存储禁止列表到磁盘

导出禁止列表函数 `DumpBanlist()` 声明在文件 `net.h` 中。

```cpp
void DumpBanlist();
```

实现在文件 `net.cpp` 中。

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

函数 `CNode::SweepBanned()` 声明在文件 `net.h` 的节点类 `CNode` 中。

```cpp
/** Information about a peer */
class CNode // 关于同辈的信息
{
    ...
    //!clean unused entries (if bantime has expired)
    static void SweepBanned(); //! 清除无用的条目（若禁止时间已过期）
    ...
};
```

实现在文件 `net.cpp` 中。

```cpp
void CNode::SweepBanned()
{
    int64_t now = GetTime();

    LOCK(cs_setBanned);
    banmap_t::iterator it = setBanned.begin();
    while(it != setBanned.end())
    {
        CBanEntry banEntry = (*it).second;
        if(now > banEntry.nBanUntil) // 当前时间大于禁止时间，说明已过期
        {
            setBanned.erase(it++);
            setBannedIsDirty = true;
        }
        else
            ++it;
    }
}
```

禁止数据库类 `CBanDB` 定义在文件 `net.h` 中。

```cpp
/** Access to the banlist database (banlist.dat) */
class CBanDB // 访问禁止列表数据库（banlist.dat）
{
private:
    boost::filesystem::path pathBanlist;
public:
    CBanDB();
    bool Write(const banmap_t& banSet);
    bool Read(banmap_t& banSet);
};
```

无参构造函数 `CBanDB()` 和写函数 `Write(const banmap_t& banSet)` 实现在文件 `net.cpp` 中。

```cpp
//
// CBanDB
//

CBanDB::CBanDB()
{
    pathBanlist = GetDataDir() / "banlist.dat";
}

bool CBanDB::Write(const banmap_t& banSet)
{
    // Generate random temporary filename
    unsigned short randv = 0; // 生成随机临时的文件名
    GetRandBytes((unsigned char*)&randv, sizeof(randv));
    std::string tmpfn = strprintf("banlist.dat.%04x", randv);

    // serialize banlist, checksum data up to that point, then append csum
    CDataStream ssBanlist(SER_DISK, CLIENT_VERSION); // 序列化禁止列表，校验和数据到那一点，然后追加校验和
    ssBanlist << FLATDATA(Params().MessageStart());
    ssBanlist << banSet;
    uint256 hash = Hash(ssBanlist.begin(), ssBanlist.end());
    ssBanlist << hash;

    // open temp output file, and associate with CAutoFile
    boost::filesystem::path pathTmp = GetDataDir() / tmpfn; // 打开临时输出文件，并关联 CAutoFile
    FILE *file = fopen(pathTmp.string().c_str(), "wb");
    CAutoFile fileout(file, SER_DISK, CLIENT_VERSION);
    if (fileout.IsNull())
        return error("%s: Failed to open file %s", __func__, pathTmp.string());

    // Write and commit header, data
    try { // 写入并提交头部，数据
        fileout << ssBanlist;
    }
    catch (const std::exception& e) {
        return error("%s: Serialize or I/O error - %s", __func__, e.what());
    }
    FileCommit(fileout.Get());
    fileout.fclose();

    // replace existing banlist.dat, if any, with new banlist.dat.XXXX
    if (!RenameOver(pathTmp, pathBanlist)) // 替换现存的 banlist.dat，如果存在，使用新的 banlist.dat.XXXX
        return error("%s: Rename-into-place failed", __func__);

    return true;
}
```

## 参考链接

* [bitcoin/rpcserver.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.h){:target="_blank"}
* [bitcoin/rpcserver.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcserver.cpp){:target="_blank"}
* [bitcoin/rpcnet.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/rpcnet.cpp){:target="_blank"}
* [bitcoin/net.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.h){:target="_blank"}
* [bitcoin/net.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/net.cpp){:target="_blank"}
