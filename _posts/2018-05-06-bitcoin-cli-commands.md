---
layout: post
title:  "比特币核心客户端 RPC 命令"
date:   2018-05-06 14:02:51 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
stickie: true
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## bitcoin-cli 命令行参数
带有 JSON-RPC 接口的基于命令行的守护进程 `bitcoind` 与 Bicoin Core 绑定在一起。
它也提供访问公共测试网 testnet，一个全球的测试环境，使用一个使用无价值的“测试比特币”替代区块链模仿比特币主网。
回归测试网 regtest 或回归测试模式 Regression Test Mode 创建了一个用作本地测试环境的私有区块链。
最终，一个允许用户发送 RPC 命令到 `bitcoind` 的简单程序 `bitcoin-cli` 也包含在比特币核心内。
<!-- excerpt -->

### 基础命令

{% highlight shell %}
$ bitcoin-cli -h # 获取以下帮助信息。
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
       该程序的帮助信息，同 -h 或 -help 选项

  -conf=<file>
       Specify configuration file (default: bitcoin.conf)
       指定配置文件（默认：~/.bitcoin/bitcoin.conf）

  -datadir=<dir>
       Specify data directory
       指定数据目录

Chain selection options:
链选择选项（默认主网）：

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
       Connect to JSON-RPC on <port> (default: 8332 or testnet: 18332)
       连接到指定 <port> 上的 JSON-RPC（默认：8332 或 公共测试网：18332）

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

{% highlight shell %}
$ bitcoin-cli help # 获取以下 RPC 命令
{% endhighlight %}

**注：`()` 内的参数有默认值，可以省略。**

== Blockchain ==<br>
[`getbestblockhash`](/2018/05/22/bitcoin-rpc-command-getbestblockhash) # 获取最佳块哈希<br>
[`getblock "hash" ( verbose )`](/2018/05/22/bitcoin-rpc-command-getblock) # 获取指定区块信息<br>
[`getblockchaininfo`](/2018/05/22/bitcoin-rpc-command-getblockchaininfo) # 获取区块链信息<br>
[`getblockcount`](/2018/05/22/bitcoin-rpc-command-getblockcount) # 获取当前的区块数<br>
[`getblockhash index`](/2018/05/22/bitcoin-rpc-command-getblockhash) # 获取指定区块哈希<br>
[`getblockheader "hash" ( verbose )`](/2018/05/22/bitcoin-rpc-command-getblockheader) # 获取指定区块头信息<br>
[`getchaintips`](/2018/05/22/bitcoin-rpc-command-getchaintips) # 获取区块链尖信息<br>
[`getdifficulty`](/2018/05/22/bitcoin-rpc-command-getdifficulty) # 获取当前挖矿难度<br>
[`getmempoolinfo`](/2018/05/22/bitcoin-rpc-command-getmempoolinfo) # 获取交易内存池信息<br>
[`getrawmempool ( verbose )`](/2018/05/22/bitcoin-rpc-command-getrawmempool) # 获取内存池原始交易<br>
[`gettxout "txid" n ( includemempool )`](/2018/06/11/bitcoin-rpc-command-gettxout) # 获取交易输出细节<br>
[`gettxoutproof ["txid",...] ( blockhash )`](/2018/06/11/bitcoin-rpc-command-gettxoutproof) # 获取交易证明<br>
[`gettxoutsetinfo`](/2018/06/11/bitcoin-rpc-command-gettxoutsetinfo) # 获取交易输出集合信息<br>
[`verifychain ( checklevel numblocks )`](/2018/06/11/bitcoin-rpc-command-verifychain) # 验证链<br>
[`verifytxoutproof "proof"`](/2018/06/11/bitcoin-rpc-command-verifytxoutproof) # 验证交易证明

== Control ==<br>
[`getinfo`](/2018/05/23/bitcoin-rpc-command-getinfo) # 获取比特币核心信息<br>
[`help ( "command" )`](/2018/05/23/bitcoin-rpc-command-help) # 获取命令帮助信息<br>
[`stop`](/2018/05/23/bitcoin-rpc-command-stop) # 远程终止比特币核心服务

== Generating ==<br>
[`generate numblocks`](/2018/05/24/bitcoin-rpc-command-generate) # 生成区块<br>
[`getgenerate`](/2018/05/25/bitcoin-rpc-command-getgenerate) # 获取挖矿状态<br>
[`setgenerate generate ( genproclimit )`](/2018/05/25/bitcoin-rpc-command-setgenerate) # 挖矿开关

== Mining ==<br>
[`getblocktemplate ( "jsonrequestobject" )`](/2018/06/19/bitcoin-rpc-command-getblocktemplate) # 获取区块模板<br>
[`getmininginfo`](/2018/05/25/bitcoin-rpc-command-getmininginfo) # 获取挖矿信息<br>
[`getnetworkhashps ( blocks height )`](/2018/05/25/bitcoin-rpc-command-getnetworkhashps) # 获取网络算力<br>
[`prioritisetransaction <txid> <priority delta> <fee delta>`](/2018/05/28/bitcoin-rpc-command-prioritisetransaction) # 改变交易优先级<br>
[`submitblock "hexdata" ( "jsonparametersobject" )`](/2018/05/28/bitcoin-rpc-command-submitblock) # 提交区块

== Network ==<br>
[`addnode "node" "add|remove|onetry"`](/2018/05/28/bitcoin-rpc-command-addnode) # 添加节点并执行操作<br>
[`clearbanned`](/2018/05/29/bitcoin-rpc-command-listbanned) # 清空黑名单<br>
[`disconnectnode "node"`](/2018/05/30/bitcoin-rpc-command-disconnectnode) # 断开与指定节点的连接<br>
[`getaddednodeinfo dns ( "node" )`](/2018/05/30/bitcoin-rpc-command-getaddednodeinfo) # 获取添加的节点信息<br>
[`getconnectioncount`](/2018/05/29/bitcoin-rpc-command-getconnectioncount) # 获取连接数<br>
[`getnettotals`](/2018/05/29/bitcoin-rpc-command-getnettotals) # 获取网络总流量<br>
[`getnetworkinfo`](/2018/05/29/bitcoin-rpc-command-getnetworkinfo) # 获取网络信息<br>
[`getpeerinfo`](/2018/05/29/bitcoin-rpc-command-getpeerinfo) # 获取对端信息<br>
[`listbanned`](/2018/05/29/bitcoin-rpc-command-listbanned) # 列出黑名单<br>
[`ping`](/2018/05/29/bitcoin-rpc-command-ping) # ping 连接的节点<br>
[`setban "ip(/netmask)" "add|remove" (bantime) (absolute)`](/2018/05/29/bitcoin-rpc-command-setban) # 设置黑名单

== Rawtransactions ==<br>
[`createrawtransaction [{"txid":"id","vout":n},...] {"address":amount,"data":"hex",...} ( locktime )`](/2018/07/02/bitcoin-rpc-command-createrawtransaction) # 创建原始交易<br>
[`decoderawtransaction "hexstring"`](/2018/06/12/bitcoin-rpc-command-decoderawtransaction) # 解码原始交易<br>
[`decodescript "hex"`](/2018/06/13/bitcoin-rpc-command-decodescript) # 解码脚本<br>
[`fundrawtransaction "hexstring" includeWatching`](/2018/07/03/bitcoin-rpc-command-fundrawtransaction) # 资助原始交易<br>
[`getrawtransaction "txid" ( verbose )`](/2018/06/12/bitcoin-rpc-command-getrawtransaction) # 获取原始交易信息<br>
[`sendrawtransaction "hexstring" ( allowhighfees )`](/2018/07/05/bitcoin-rpc-command-sendrawtransaction) # 发送原始交易<br>
[`signrawtransaction "hexstring" ( [{"txid":"id","vout":n,"scriptPubKey":"hex","redeemScript":"hex"},...] ["privatekey1",...] sighashtype )`](/2018/07/04/bitcoin-rpc-command-signrawtransaction) # 签名原始交易

== Util ==<br>
[`createmultisig nrequired ["key",...]`](/2018/06/15/bitcoin-rpc-command-createmultisig) # 创建多重签名<br>
[`estimatefee nblocks`](/2018/06/15/bitcoin-rpc-command-estimatefee) # 估算交易费<br>
[`estimatepriority nblocks`](/2018/06/15/bitcoin-rpc-command-estimatepriority) # 估算交易优先级<br>
[`estimatesmartfee nblocks`](/2018/06/15/bitcoin-rpc-command-estimatesmartfee) # 智能估计交易费<br>
[`estimatesmartpriority nblocks`](/2018/06/15/bitcoin-rpc-command-estimatesmartpriority) # 智能估计交易优先级<br>
[`validateaddress "bitcoinaddress"`](/2018/06/15/bitcoin-rpc-command-validateaddress) # 验证地址<br>
[`verifymessage "bitcoinaddress" "signature" "message"`](/2018/06/15/bitcoin-rpc-command-verifymessage) # 验证消息

<font color="white">== Hidden ==</font>
[<font color="white">invalidateblock</font>](/2018/06/14/bitcoin-rpc-command-invalidateblock) <font color="white"># 无效化区块</font><br>
[<font color="white">reconsiderblock</font>](/2018/06/14/bitcoin-rpc-command-reconsiderblock) <font color="white"># 再考虑区块</font><br>
[<font color="white">setmocktime</font>](/2018/06/14/bitcoin-rpc-command-setmocktime) <font color="white"># 设置 mocktime</font><br>
[<font color="white">resendwallettransactions</font>](/2018/06/14/bitcoin-rpc-command-resendwallettransactions) <font color="white"># 再次发送钱包交易</font>

== Wallet ==<br>
[`abandontransaction "txid"`](/2018/05/31/bitcoin-rpc-command-abandontransaction) # 放弃交易<br>
[`addmultisigaddress nrequired ["key",...] ( "account" )`](/2018/06/15/bitcoin-rpc-command-addmultisigaddress) # 添加多签地址<br>
[`backupwallet "destination"`](/2018/06/01/bitcoin-rpc-command-backupwallet) # 备份钱包<br>
[`dumpprivkey "bitcoinaddress"`](/2018/06/06/bitcoin-rpc-command-dumpprivkey) # 导出私钥<br>
[`dumpwallet "filename"`](/2018/06/01/bitcoin-rpc-command-dumpwallet) # 导出钱包<br>
[`encryptwallet "passphrase"`](/2018/05/31/bitcoin-rpc-command-encryptwallet) # 加密钱包<br>
[`getaccount "bitcoinaddress"`](/2018/06/04/bitcoin-rpc-command-getaccount) # （已过时）获取地址所属账户<br>
[`getaccountaddress "account"`](/2018/06/04/bitcoin-rpc-command-getaccountaddress) # （已过时）获取账户收款地址<br>
[`getaddressesbyaccount "account"`](/2018/06/04/bitcoin-rpc-command-getaddressesbyaccount) # 获取某账户下所有地址<br>
[`getbalance ( "account" minconf includeWatchonly )`](/2018/06/04/bitcoin-rpc-command-getbalance) # 获取余额<br>
[`getnewaddress ( "account" )`](/2018/06/04/bitcoin-rpc-command-getnewaddress) # 获取新的地址<br>
[`getrawchangeaddress`](/2018/06/07/bitcoin-rpc-command-getrawchangeaddress) # 获取原始交易找零地址<br>
[`getreceivedbyaccount "account" ( minconf )`](/2018/06/07/bitcoin-rpc-command-getreceivedbyaccount) # （已过时）获取指定账户接收到的金额<br>
[`getreceivedbyaddress "bitcoinaddress" ( minconf )`](/2018/06/07/bitcoin-rpc-command-getreceivedbyaddress) # 获取指定地址接收到的金额<br>
[`gettransaction "txid" ( includeWatchonly )`](/2018/06/07/bitcoin-rpc-command-gettransaction) # 获取交易信息<br>
[`getunconfirmedbalance`](/2018/06/04/bitcoin-rpc-command-getunconfirmedbalance) # 获取未确认的余额<br>
[`getwalletinfo`](/2018/05/31/bitcoin-rpc-command-getwalletinfo) # 获取钱包信息<br>
[`importaddress "address" ( "label" rescan p2sh )`](/2018/06/07/bitcoin-rpc-command-importaddress) # 导入地址或脚本<br>
[`importprivkey "bitcoinprivkey" ( "label" rescan )`](/2018/06/06/bitcoin-rpc-command-importprivkey) # 导入私钥<br>
[`importpubkey "pubkey" ( "label" rescan )`](/2018/06/07/bitcoin-rpc-command-importpubkey) # 导入公钥<br>
[`importwallet "filename"`](/2018/06/01/bitcoin-rpc-command-importwallet) # 导入钱包<br>
[`keypoolrefill ( newsize )`](/2018/06/01/bitcoin-rpc-command-keypoolrefill) # 再填充钥匙池<br>
[`listaccounts ( minconf includeWatchonly)`](/2018/06/05/bitcoin-rpc-command-listaccounts) # （已过时）列出账户及其余额<br>
[`listaddressgroupings`](/2018/06/05/bitcoin-rpc-command-listaddressgroupings) # 列出地址分组<br>
[`listlockunspent`](/2018/06/05/bitcoin-rpc-command-listlockunspent) # 列出锁定的未花费交易输出<br>
[`listreceivedbyaccount ( minconf includeempty includeWatchonly)`](/2018/06/05/bitcoin-rpc-command-listreceivedbyaccount) # （已过时）列出账户接收金额<br>
[`listreceivedbyaddress ( minconf includeempty includeWatchonly)`](/2018/06/05/bitcoin-rpc-command-listreceivedbyaddress) # 列出地址接收金额<br>
[`listsinceblock ( "blockhash" target-confirmations includeWatchonly)`](/2018/06/06/bitcoin-rpc-command-listsinceblock) # 列从某区块开始的全部交易<br>
[`listtransactions ( "account" count from includeWatchonly)`](/2018/06/06/bitcoin-rpc-command-listtransactions) # 列出交易<br>
[`listunspent ( minconf maxconf  ["address",...] )`](/2018/06/05/bitcoin-rpc-command-listunspent) # 列出未花费交易输出<br>
[`lockunspent unlock [{"txid":"txid","vout":n},...]`](/2018/06/05/bitcoin-rpc-command-lockunspent) # 加解锁未花费交易输出<br>
[`move "fromaccount" "toaccount" amount ( minconf "comment" )`](/2018/06/08/bitcoin-rpc-command-move) # （已过时）转账<br>
[`sendfrom "fromaccount" "tobitcoinaddress" amount ( minconf "comment" "comment-to" )`](/2018/06/08/bitcoin-rpc-command-sendfrom) # （已过时）从指定账户发送<br>
[`sendmany "fromaccount" {"address":amount,...} ( minconf "comment" ["address",...] )`](/2018/06/08/bitcoin-rpc-command-sendmany) # 发送到多个地址<br>
[`sendtoaddress "bitcoinaddress" amount ( "comment" "comment-to" subtractfeefromamount )`](/2018/07/06/bitcoin-rpc-command-sendtoaddress) # 发送到指定地址<br>
[`setaccount "bitcoinaddress" "account"`](/2018/06/08/bitcoin-rpc-command-setaccount) # （已过时）设置地址关联账户<br>
[`settxfee amount`](/2018/06/03/bitcoin-rpc-command-settxfee) # 设置交易费<br>
[`signmessage "bitcoinaddress" "message"`](/2018/06/15/bitcoin-rpc-command-signmessage) # 签名消息<br>
[`walletlock`](/2018/05/31/bitcoin-rpc-command-walletlock) # 锁定钱包<br>
[`walletpassphrase "passphrase" timeout`](/2018/05/31/bitcoin-rpc-command-walletpassphrase) # 解锁钱包数秒<br>
[`walletpassphrasechange "oldpassphrase" "newpassphrase"`](/2018/05/31/bitcoin-rpc-command-walletpassphrasechange) # 更改钱包密码

## 参照
* [Bitcoin Core - Wikipedia](https://en.wikipedia.org/wiki/Bitcoin_Core)
* [JSON-RPC - Wikipedia](https://en.wikipedia.org/wiki/JSON-RPC)
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [精通比特币（第二版） \| 巴比特图书](http://book.8btc.com/masterbitcoin2cn)
* [...](https://github.com/mistydew/blockchain)
