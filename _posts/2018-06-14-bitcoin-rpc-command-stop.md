---
layout: post
title:  "比特币 RPC 命令剖析 \"stop\""
date:   2018-06-14 16:19:52 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli stop
---
## 提示说明

{% highlight shell %}
stop # 终止比特币核心服务 bitcoind
{% endhighlight %}

## 用法示例

### 比特币核心客户端

关闭比特币核心服务，使其有序退出。

{% highlight shell %}
$ bitcoin-cli stop
Bitcoin server stopping
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "stop", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":"Bitcoin server stopping","error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
stop 对应的函数实现在“rpcserver.cpp”文件中。

{% highlight C++ %}
UniValue stop(const UniValue& params, bool fHelp)
{
    // Accept the deprecated and ignored 'detach' boolean argument
    if (fHelp || params.size() > 1) // 1.参数最多为 1 个，这里已经过时，现无参数
        throw runtime_error(
            "stop\n"
            "\nStop Bitcoin server.");
    // Event loop will exit after current HTTP requests have been handled, so
    // this reply will get back to the client. // 在当前 HTTP 请求被处理后时间循环才会退出
    StartShutdown(); // 2.关闭比特币核心服务
    return "Bitcoin server stopping"; // 3.返回停止信息
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.关闭比特币核心服务。<br>
3.完全关闭前返回客端相关信息。

调用 StartShutdown() 函数关闭比特币核心服务，该函数声明在“init.h”文件中。

{% highlight C++ %}
void StartShutdown(); // 关闭比特币核心服务
{% endhighlight %}

实现在“init.cpp”文件中。

{% highlight C++ %}
volatile bool fRequestShutdown = false; // 请求关闭标志置，初始为 false

void StartShutdown()
{
    fRequestShutdown = true; // 把请求关闭标志置为 true
}
{% endhighlight %}

更多细节请参考[比特币核心服务启动过程](/blog/2018/05/bitcoin-source-anatomy-00.html)。

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#stop){:target="_blank"}
