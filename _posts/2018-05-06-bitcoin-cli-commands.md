---
layout: post
title:  "比特币核心客户端 RPC 命令"
date:   2018-05-06 14:02:51 +0800
categories: jekyll update
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## bitcoin-cli 命令行参数
带有 JSON-RPC 接口的基于命令行的守护进程 bitcoind 与 Bicoin Core 绑定在一起。
它也提供访问公共测试网 testnet，一个全球的测试环境，使用一个使用无价值的“测试比特币”替代区块链模仿比特币主网。
回归测试网 regtest 或回归测试模式 Regression Test Mode 创建了一个用作本地测试环境的私有区块链。
最终，一个允许用户发送 RPC 命令到 bitcoind 的简单程序 bitcoin-cli 也包含在比特币核心内。

### 基础命令
> `$ bitcoin-cli -h` 获取以下帮助信息。
{% highlight C++ %}
Bitcoin Core RPC client version v0.12.1.0-f61a24e
比特币核心 RPC 客户端版本 v0.12.1.0-意味不明

Usage:
用法：共 3 种，[] 表示可以省略，单纯的使用 Options 选项不需要 bitcoind，而 help 和 <command> 都需要 bitcoind
  bitcoin-cli [options] <command> [params]  Send command to Bitcoin Core # 发送 RPC 命令到比特币核心 bitcoind
  bitcoin-cli [options] help                List commands # 列出 RPC 命令
  bitcoin-cli [options] help <command>      Get help for a command # 获取一条命令的帮助信息（用法示例）

Options:
选项：

  -?
       This help message
       该程序的帮助信息，同 -h 或 -help

  -conf=<file>
       Specify configuration file (default: bitcoin.conf)
       指定配置文件（默认：~/.bitcoin/bitcoin.conf）

  -datadir=<dir>
       Specify data directory
       指定数据目录

Chain selection options:
链选择选项：

  -testnet
       Use the test chain
       使用公共测试链

  -regtest
       Enter regression test mode, which uses a special chain in which blocks
       can be solved instantly. This is intended for regression testing tools
       and app development.
       进入回归测试模式，使用一条特殊的链，可以立刻解决产块的问题。
       这是专门用于回归测试工具和应用程序开发的。

  -rpcconnect=<ip>
       Send commands to node running on <ip> (default: 127.0.0.1)
       发送命令到运行在 <ip> 上的节点（默认：127.0.0.1）

  -rpcport=<port>
       Connect to JSON-RPC on <port> (default: 8221 or testnet: 18221)
       连接到指定 <port> 上的 JSON-RPC（默认：8221 或 公共测试网：18221）

  -rpcwait
       Wait for RPC server to start
       等待 RPC 服务启动

  -rpcuser=<user>
       Username for JSON-RPC connections
       JSON-RPC 连接的用户名

  -rpcpassword=<pw>
       Password for JSON-RPC connections
       JSON-RPC 连接的密码

  -rpcclienttimeout=<n>
       Timeout during HTTP requests (default: 900)
       HTTP 请求的超时时间（默认：900s）
{% endhighlight %}

### RPC 命令（需要 bitcoind）
> `$ bitcoin-cli help` 获取以下 RPC 命令。
{% highlight C++ %}
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
encryptwallet "passphrase"
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
{% endhighlight %}

## 参照
* [Bitcoin Core - Wikipedia](https://en.wikipedia.org/wiki/Bitcoin_Core)
* [JSON-RPC - Wikipedia](https://en.wikipedia.org/wiki/JSON-RPC)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
