---
layout: post
title:  "比特币 RPC 命令剖析 \"clearbanned\""
date:   2018-06-28 09:46:12 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli clearbanned
---
## 提示说明

{% highlight shell %}
clearbanned # 清除所有禁止的 IP
{% endhighlight %}

结果：无返回值。

## 用法示例

### 比特币核心客户端

使用 RPC 命令 [listbanned](/blog/2018/07/bitcoin-rpc-command-listbanned.html) 查看黑名单。

{% highlight shell %}
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
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "clearbanned", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
listbanned 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue clearbanned(const UniValue& params, bool fHelp); // 清空黑名单
{% endhighlight %}

实现在“rpcnet.cpp”文件中。

{% highlight C++ %}
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
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.清空黑名单。<br>
3.导出黑名单到磁盘（清空相应的数据库文件）。<br>
4.发送信号，黑名单已改变。

函数 CNode::ClearBanned() 声明在“net.h”文件的 CNode 类中。

{% highlight C++ %}
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
{% endhighlight %}

实现在“net.cpp”文件中。

{% highlight C++ %}
banmap_t CNode::setBanned; // 设置屏蔽地址列表
CCriticalSection CNode::cs_setBanned;
bool CNode::setBannedIsDirty; // 标志禁止列表已被清空过

void CNode::ClearBanned()
{
    LOCK(cs_setBanned); // 上锁
    setBanned.clear(); // 清空列表
    setBannedIsDirty = true; // 标志置为 true
}
{% endhighlight %}

函数 DumpBanlist() 声明在“net.h”文件中。

{% highlight C++ %}
void DumpBanlist();
{% endhighlight %}

实现在“net.cpp”文件中。

{% highlight C++ %}
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
{% endhighlight %}

函数 CNode::SweepBanned() 声明在“net.h”文件的 CNode 类中。

{% highlight C++ %}
/** Information about a peer */
class CNode // 关于同辈的信息
{
    ...
    //!clean unused entries (if bantime has expired)
    static void SweepBanned(); // 清除无用的条目（若禁止时间已过期）
    ...
};
{% endhighlight %}

实现在“net.cpp”文件中，用于清除黑名单中过期的条目。

{% highlight C++ %}
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
{% endhighlight %}

类 CBanDB 定义在“net.h”文件中。

{% highlight C++ %}
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
{% endhighlight %}

数据库对象 bandb 生成时，其无参构造函数自动初始化数据库文件名。

{% highlight C++ %}
//
// CBanDB
//

CBanDB::CBanDB()
{
    pathBanlist = GetDataDir() / "banlist.dat";
}
{% endhighlight %}

可以看到被禁止的 IP 列表的数据库文件名为“banlist.dat”，就存放在数据目录“~/.bitcoin”下。

Thanks for your time.

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#clearbanned){:target="_blank"}
