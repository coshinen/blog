---
layout: post
title:  "比特币 RPC 命令剖析 \"help\""
date:   2018-05-23 13:38:36 +0800
categories: Blockchain
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 提示说明

{% highlight shell %}
help ( "command" ) # 列出所有 RPC 命令或指定命令的用法（帮助信息）
{% endhighlight %}

参数：<br>
1. `command` （字符串，可选）想要获取帮助信息的命令。

结果：返回帮助信息的字符串。

## 用法示例
用法一：获取所有比特币核心 RPC 命令名。

{% highlight shell %}
$ bitcoin-cli help
== Blockchain ==
getbestblockhash
getblock "hash" ( verbose )
getblockchaininfo
getblockcount
getblockhash index
getblockheader "hash" ( verbose )
getchaintips
getdifficulty
getmempoolinfo
getrawmempool ( verbose )
gettxout "txid" n ( includemempool )
gettxoutproof ["txid",...] ( blockhash )
gettxoutsetinfo
verifychain ( checklevel numblocks )
verifytxoutproof "proof"

== Control ==
getinfo
help ( "command" )
stop

== Generating ==
generate numblocks
getgenerate
setgenerate generate ( genproclimit )

== Mining ==
getblocktemplate ( "jsonrequestobject" )
getmininginfo
getnetworkhashps ( blocks height )
prioritisetransaction <txid> <priority delta> <fee delta>
submitblock "hexdata" ( "jsonparametersobject" )

== Network ==
addnode "node" "add|remove|onetry"
clearbanned
disconnectnode "node" 
getaddednodeinfo dns ( "node" )
getconnectioncount
getnettotals
getnetworkinfo
getpeerinfo
listbanned
ping
setban "ip(/netmask)" "add|remove" (bantime) (absolute)

== Rawtransactions ==
createrawtransaction [{"txid":"id","vout":n},...] {"address":amount,"data":"hex",...} ( locktime )
decoderawtransaction "hexstring"
decodescript "hex"
fundrawtransaction "hexstring" includeWatching
getrawtransaction "txid" ( verbose )
sendrawtransaction "hexstring" ( allowhighfees )
signrawtransaction "hexstring" ( [{"txid":"id","vout":n,"scriptPubKey":"hex","redeemScript":"hex"},...] ["privatekey1",...] sighashtype )

== Util ==
createmultisig nrequired ["key",...]
estimatefee nblocks
estimatepriority nblocks
estimatesmartfee nblocks
estimatesmartpriority nblocks
validateaddress "bitcoinaddress"
verifymessage "bitcoinaddress" "signature" "message"

== Wallet ==
abandontransaction "txid"
addmultisigaddress nrequired ["key",...] ( "account" )
backupwallet "destination"
dumpprivkey "bitcoinaddress"
dumpwallet "filename"
getaccount "bitcoinaddress"
getaccountaddress "account"
getaddressesbyaccount "account"
getbalance ( "account" minconf includeWatchonly )
getnewaddress ( "account" )
getrawchangeaddress
getreceivedbyaccount "account" ( minconf )
getreceivedbyaddress "bitcoinaddress" ( minconf )
gettransaction "txid" ( includeWatchonly )
getunconfirmedbalance
getwalletinfo
importaddress "address" ( "label" rescan p2sh )
importprivkey "bitcoinprivkey" ( "label" rescan )
importpubkey "pubkey" ( "label" rescan )
importwallet "filename"
keypoolrefill ( newsize )
listaccounts ( minconf includeWatchonly)
listaddressgroupings
listlockunspent
listreceivedbyaccount ( minconf includeempty includeWatchonly)
listreceivedbyaddress ( minconf includeempty includeWatchonly)
listsinceblock ( "blockhash" target-confirmations includeWatchonly)
listtransactions ( "account" count from includeWatchonly)
listunspent ( minconf maxconf  ["address",...] )
lockunspent unlock [{"txid":"txid","vout":n},...]
move "fromaccount" "toaccount" amount ( minconf "comment" )
sendfrom "fromaccount" "tobitcoinaddress" amount ( minconf "comment" "comment-to" )
sendmany "fromaccount" {"address":amount,...} ( minconf "comment" ["address",...] )
sendtoaddress "bitcoinaddress" amount ( "comment" "comment-to" subtractfeefromamount )
setaccount "bitcoinaddress" "account"
settxfee amount
signmessage "bitcoinaddress" "message"
walletlock
walletpassphrase "passphrase" timeout
walletpassphrasechange "oldpassphrase" "newpassphrase"
{% endhighlight %}

用法二：获取指定的 RPC 命令的帮助信息（用法）。

{% highlight shell %}
$ bitcoin-cli help getinfo
getinfo
Returns an object containing various state info.

Result:
{
  "version": xxxxx,           (numeric) the server version
  "protocolversion": xxxxx,   (numeric) the protocol version
  "walletversion": xxxxx,     (numeric) the wallet version
  "balance": xxxxxxx,         (numeric) the total bitcoin balance of the wallet
  "blocks": xxxxxx,           (numeric) the current number of blocks processed in the server
  "timeoffset": xxxxx,        (numeric) the time offset
  "connections": xxxxx,       (numeric) the number of connections
  "proxy": "host:port",     (string, optional) the proxy used by the server
  "difficulty": xxxxxx,       (numeric) the current difficulty
  "testnet": true|false,      (boolean) if the server is using testnet or not
  "keypoololdest": xxxxxx,    (numeric) the timestamp (seconds since GMT epoch) of the oldest pre-generated key in the key pool
  "keypoolsize": xxxx,        (numeric) how many new keys are pre-generated
  "unlocked_until": ttt,      (numeric) the timestamp in seconds since epoch (midnight Jan 1 1970 GMT) that the wallet is unlocked for transfers, or 0 if the wallet is locked
  "paytxfee": x.xxxx,         (numeric) the transaction fee set in BTC/kB
  "relayfee": x.xxxx,         (numeric) minimum relay fee for non-free transactions in BTC/kB
  "errors": "..."           (string) any error messages
}

Examples:
> bitcoin-cli getinfo 
> curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
{% endhighlight %}

## 源码剖析
`help` 对应的函数实现在“rpcmisc.cpp”文件中。

{% highlight C++ %}
UniValue help(const UniValue& params, bool fHelp)
{
    if (fHelp || params.size() > 1) // 1.参数最多为 1 个（RPC 命令）
        throw runtime_error( // 命令帮助反馈
            "help ( \"command\" )\n"
            "\nList all commands, or get help for a specified command.\n"
            "\nArguments:\n"
            "1. \"command\"     (string, optional) The command to get help on\n"
            "\nResult:\n"
            "\"text\"     (string) The help text\n"
        );

    string strCommand;
    if (params.size() > 0) // 2.若带有参数
        strCommand = params[0].get_str(); // 获取命令参数的字符串

    return tableRPC.help(strCommand); // 3.传入命令（可能为空）并返回
}
{% endhighlight %}

基本流程：<br>
1.处理命令帮助和参数个数。<br>
2.获取首个参数并转换为字符串。<br>
3.把参数传入 tableRPC.help(strCommand)，这个是 `help` 命令的核心。

这里我们可以看到传参的方式，可以指定某个 RPC 命令作为 `help` 参数，或不带参数。<br>
调用 tableRPC.help(strCommand) 函数来完成 `help` 命令的主要功能。对象 tableRPC 定义在“rpcserver.cpp”文件最后面。

{% highlight C++ %}
const CRPCTable tableRPC; // 全局常量对象
{% endhighlight %}

类 CRPCTable 定义在“rpcserver.h”文件中，我们还能看到这里引用了对象 tableRPC。

{% highlight C++ %}
/**
 * Bitcoin RPC command dispatcher.
 */ // 比特币 RPC 命令调度器
class CRPCTable // RPC 列表类
{
private:
    std::map<std::string, const CRPCCommand*> mapCommands; // RPC 命令列表
public:
    CRPCTable(); // 注册所有定义的 RPC 命令到 RPC 命令列表
    const CRPCCommand* operator[](const std::string& name) const;
    std::string help(const std::string& name) const;

    /**
     * Execute a method.
     * @param method   Method to execute
     * @param params   UniValue Array of arguments (JSON objects)
     * @returns Result of the call.
     * @throws an exception (UniValue) when an error happens.
     */
    UniValue execute(const std::string &method, const UniValue &params) const; // 执行一个方法
};

extern const CRPCTable tableRPC; // 在 rpcserver.cpp 中创建的一个全局的常量对象
{% endhighlight %}

全局对象 tableRPC 初始化时调用默认无参构造进行 RPC 列表的注册。<br>
RPC 调用列表和类 CRPCTable 无参构造的实现均在“rpcserver.cpp”文件中。

{% highlight C++ %}
/**
 * Call Table
 */ // 调用列表
static const CRPCCommand vRPCCommands[] =
{ //  category              name                      actor (function)         okSafeMode
  //  --------------------- ------------------------  -----------------------  ----------
    /* Overall control/query calls */
    { "control",            "getinfo",                &getinfo,                true  }, /* uses wallet if enabled */
    { "control",            "help",                   &help,                   true  },
    ...
};

CRPCTable::CRPCTable()
{
    unsigned int vcidx;
    for (vcidx = 0; vcidx < (sizeof(vRPCCommands) / sizeof(vRPCCommands[0])); vcidx++)
    { // 遍历上面定义的 RPC 调用列表
        const CRPCCommand *pcmd; // RPC 命令指针

        pcmd = &vRPCCommands[vcidx]; // 指向一条 RPC 命令
        mapCommands[pcmd->name] = pcmd; // 把该命令注册到 RPC 命令列表中
    }
}
{% endhighlight %}

进入 tableRPC.help(strCommand) 函数，它的实现在“rpcserver.cpp”文件中。

{% highlight C++ %}
**
 * Note: This interface may still be subject to change.
 */
// 该接口可能会改变
std::string CRPCTable::help(const std::string& strCommand) const
{
    string strRet; // 保存最终的返回结果
    string category; // 类别
    set<rpcfn_type> setDone; // 方法对应的回调函数
    vector<pair<string, const CRPCCommand*> > vCommands; // 命令列表

    for (map<string, const CRPCCommand*>::const_iterator mi = mapCommands.begin(); mi != mapCommands.end(); ++mi)
        vCommands.push_back(make_pair(mi->second->category + mi->first, mi->second)); // <category+name, const CRPCCommand*>
    sort(vCommands.begin(), vCommands.end()); // 按 key 升序排序

    BOOST_FOREACH(const PAIRTYPE(string, const CRPCCommand*)& command, vCommands)
    { // 遍历列表中的命令
        const CRPCCommand *pcmd = command.second; // 取得 RPC 命令指针
        string strMethod = pcmd->name; // 获得方法名
        // We already filter duplicates, but these deprecated screw up the sort order
        if (strMethod.find("label") != string::npos) // 方法名中含有 "label"
            continue; // 则跳过
        if ((strCommand != "" || pcmd->category == "hidden") && strMethod != strCommand) // 指定的命令非空 或 类别为 "hidden" 且 方法名不等于指定命令名
            continue; // 则跳过
        try
        {
            UniValue params;
            rpcfn_type pfn = pcmd->actor; // 注册对应回调函数
            if (setDone.insert(pfn).second) // 若执行列表插入回调成功
                (*pfn)(params, true); // 传入参数并执行该回调，同时标记 fHelp 为 true
        }
        catch (const std::exception& e)
        {
            // Help text is returned in an exception
            string strHelp = string(e.what()); // 拿到回掉函数抛出的异常（帮助）信息
            if (strCommand == "") // 如果指定命令为空即未指定命令
            {
                if (strHelp.find('\n') != string::npos) // 若帮助信息中存在 '\n'
                    strHelp = strHelp.substr(0, strHelp.find('\n')); // 截取第一个 '\n' 之前的的字符串（命令名）

                if (category != pcmd->category) // 类别不同，category 初始化为空
                {
                    if (!category.empty()) // category 非空
                        strRet += "\n"; // 加入换行（初始类别为空）
                    category = pcmd->category; // 拿到类别
                    string firstLetter = category.substr(0,1); // 截取类别首字母
                    boost::to_upper(firstLetter); // 转换为大写字母
                    strRet += "== " + firstLetter + category.substr(1) + " ==\n"; // 拼接首字母大写的类别到返回的结果
                }
            }
            strRet += strHelp + "\n"; // 拼接 RPC 命令名
        }
    } // 重复以上过程，直至遍历完每一个注册的 RPC 命令
    if (strRet == "") // 返回值为空表示指定了未知命令
        strRet = strprintf("help: unknown command: %s\n", strCommand); // 拼接错误信息
    strRet = strRet.substr(0,strRet.size()-1); // 去除结尾的 '\n'
    return strRet; // 返回结果
}
{% endhighlight %}

这里我们可以看出 `help` 命令的实现还是很巧妙的，把有参和无参两种方式合二为一。<br>
最主要的是把无参结果作为有参结果的子集，该实现在以后版本中可能会改变。

## 参照
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [Bitcoin Developer Reference - Bitcoin](https://bitcoin.org/en/developer-reference#help)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
