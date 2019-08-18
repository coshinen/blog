---
layout: post
title:  "比特币 RPC 命令剖析 \"walletpassphrase\""
date:   2018-09-25 15:47:22 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
excerpt: $ bitcoin-cli walletpassphrase "passphrase" timeout
---
## 提示说明

{% highlight shell %}
walletpassphrase "passphrase" timeout # 在内存中存储钱包解密密钥 timeout 秒
{% endhighlight %}

在执行与私钥相关的交易前需要先执行此操作，比如发送比特币。

参数：<br>
1.passphrase（字符串，必备）钱包密码。<br>
2.timeout（整型，必备）在内存中维持解密密钥的以秒为单位的时间。

**注：在钱包已经解锁的情况下使用此命令，将设置一个新解锁时间覆盖旧解锁时间。**

结果：无返回值。

## 用法示例

### 比特币核心客户端

用法一：解锁钱包 60 秒。

{% highlight shell %}
$ bitcoin-cli getinfo | grep unlocked_until
  "unlocked_until": 0,
$ bitcoin-cli walletpassphrase "mypasswd" 60
$ bitcoin-cli getinfo | grep unlocked_until
  "unlocked_until": 1527753859,
{% endhighlight %}

[getinfo](/blog/2018/06/bitcoin-rpc-command-getinfo.html) 中 unlocked_until 字段表示钱包解锁的过期时间，0 表示处于锁定状态。

用法二：解锁钱包 60 秒，再次使用此命令解密 20，密钥过期时间被覆盖。

{% highlight shell %}
$ bitcoin-cli walletpassphrase "mypasswd" 60
$ bitcoin-cli getinfo | grep unlocked_until
  "unlocked_until": 1527753859,
$ bitcoin-cli walletpassphrase "mypasswd" 20
$ bitcoin-cli getinfo | grep unlocked_until
  "unlocked_until": 1527753825,
{% endhighlight %}

用法三：锁定钱包。

{% highlight shell %}
$ bitcoin-cli getinfo | grep unlocked_until
  "unlocked_until": 1527753825,
$ bitcoin-cli walletpassphrase "mypasswd" 0
$ bitcoin-cli getinfo | grep unlocked_until
  "unlocked_until": 0
{% endhighlight %}

### cURL

{% highlight shell %}
$ curl --user myusername:mypassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "walletpassphrase", "params": ["mypasswd", 60] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{"result":null,"error":null,"id":"curltest"}
{% endhighlight %}

## 源码剖析
walletpassphrase 对应的函数在“rpcserver.h”文件中被引用。

{% highlight C++ %}
extern UniValue walletpassphrase(const UniValue& params, bool fHelp); // 钱包解锁
{% endhighlight %}

实现在“rpcwallet.cpp”文件中。

{% highlight C++ %}
UniValue walletpassphrase(const UniValue& params, bool fHelp)
{
    if (!EnsureWalletIsAvailable(fHelp)) // 确保钱包可用
        return NullUniValue;
    
    if (pwalletMain->IsCrypted() && (fHelp || params.size() != 2)) // 参数个数必须为 2 个
        throw runtime_error( // 命令帮助反馈
            "walletpassphrase \"passphrase\" timeout\n"
            "\nStores the wallet decryption key in memory for 'timeout' seconds.\n"
            "This is needed prior to performing transactions related to private keys such as sending bitcoins\n"
            "\nArguments:\n"
            "1. \"passphrase\"     (string, required) The wallet passphrase\n"
            "2. timeout            (numeric, required) The time to keep the decryption key in seconds.\n"
            "\nNote:\n"
            "Issuing the walletpassphrase command while the wallet is already unlocked will set a new unlock\n"
            "time that overrides the old one.\n"
            "\nExamples:\n"
            "\nunlock the wallet for 60 seconds\n"
            + HelpExampleCli("walletpassphrase", "\"my pass phrase\" 60") +
            "\nLock the wallet again (before 60 seconds)\n"
            + HelpExampleCli("walletlock", "") +
            "\nAs json rpc call\n"
            + HelpExampleRpc("walletpassphrase", "\"my pass phrase\", 60")
        );

    LOCK2(cs_main, pwalletMain->cs_wallet); // 钱包上锁

    if (fHelp) // 钱包未加密时无法查看该命令帮助
        return true;
    if (!pwalletMain->IsCrypted()) // 钱包未加密时无法执行该命令
        throw JSONRPCError(RPC_WALLET_WRONG_ENC_STATE, "Error: running with an unencrypted wallet, but walletpassphrase was called.");

    // Note that the walletpassphrase is stored in params[0] which is not mlock()ed
    SecureString strWalletPass;
    strWalletPass.reserve(100); // 预开辟 100 个字节的空间
    // TODO: get rid of this .c_str() by implementing SecureString::operator=(std::string)
    // Alternately, find a way to make params[0] mlock()'d to begin with.
    strWalletPass = params[0].get_str().c_str(); // 获取用户指定的钱包密码

    if (strWalletPass.length() > 0) // 密码长度必须大于 0
    {
        if (!pwalletMain->Unlock(strWalletPass)) // 解锁钱包
            throw JSONRPCError(RPC_WALLET_PASSPHRASE_INCORRECT, "Error: The wallet passphrase entered was incorrect.");
    }
    else
        throw runtime_error(
            "walletpassphrase <passphrase> <timeout>\n"
            "Stores the wallet decryption key in memory for <timeout> seconds.");

    pwalletMain->TopUpKeyPool(); // 充满密钥池

    int64_t nSleepTime = params[1].get_int64(); // 获取密钥过期时间作为睡眠时间
    LOCK(cs_nWalletUnlockTime);
    nWalletUnlockTime = GetTime() + nSleepTime; // 得出绝对秒数
    RPCRunLater("lockwallet", boost::bind(LockWallet, pwalletMain), nSleepTime); // 创建锁定钱包线程

    return NullUniValue;
}
{% endhighlight %}

基本流程：<br>
1.确保当前钱包可用（已初始化完成）。<br>
2.处理命令帮助和参数个数。<br>
3.钱包上锁。<br>
4.获取用户指定密码。<br>
5.密码长度检查，必须大于 0 个字符。<br>
6.充满密钥池。<br>
7.获取指定过期秒数，并计算绝对过期时间。<br>
8.设置锁定钱包定时器，之后运行锁定钱包函数。

第八步，调用 RPCRunLater("lockwallet", boost::bind(LockWallet, pwalletMain), nSleepTime) 函数设置定时器，定时执行制定函数功能。
该函数声明在“rpcserver.h”文件中。

{% highlight C++ %}
/**
 * Run func nSeconds from now.
 * Overrides previous timer <name> (if any).
 */ // 从现在开始的 nSeconds 秒后运行该函数
void RPCRunLater(const std::string& name, boost::function<void(void)> func, int64_t nSeconds);
{% endhighlight %}

定义在“rpcserver.cpp”文件中。

{% highlight C++ %}
void RPCRunLater(const std::string& name, boost::function<void(void)> func, int64_t nSeconds)
{
    if (timerInterfaces.empty())
        throw JSONRPCError(RPC_INTERNAL_ERROR, "No timer handler registered for RPC");
    deadlineTimers.erase(name); // 擦除指定名字的定时器
    RPCTimerInterface* timerInterface = timerInterfaces.back(); // 拿到列表中最后一个定时器
    LogPrint("rpc", "queue run of timer %s in %i seconds (using %s)\n", name, nSeconds, timerInterface->Name());
    deadlineTimers.insert(std::make_pair(name, boost::shared_ptr<RPCTimerBase>(timerInterface->NewTimer(func, nSeconds*1000)))); // 和定时器名字配对，插入到截止时间定时器映射列表中
}
{% endhighlight %}

定时器接口列表 timerInterfaces 和定时器映射列表 deadlineTimers 的定义在“rpcserver.cpp”文件中。

{% highlight C++ %}
/* Timer-creating functions */
static std::vector<RPCTimerInterface*> timerInterfaces; // RPC 定时器接口列表
/* Map of name to timer.
 * @note Can be changed to std::unique_ptr when C++11 */ // 定时器名字映射
static std::map<std::string, boost::shared_ptr<RPCTimerBase> > deadlineTimers; // 截止时间定时器
{% endhighlight %}

## 参照

* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation){:target="_blank"}
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#walletpassphrase){:target="_blank"}
