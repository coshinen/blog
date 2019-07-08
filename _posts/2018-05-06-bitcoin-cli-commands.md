---
layout: post
title:  "比特币核心客户端 RPC 命令"
date:   2018-05-06 14:02:51 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: CLI bitcoin-cli 区块链 比特币
---
本文列出了 bitcoin v0.12.1 的客户端 bitcoin-cli 所有（包含隐藏分类）的 RPC 命令。

## bitcoin-cli 命令行参数

带有 JSON-RPC 接口的基于命令行的守护进程 bitcoind 与 Bicoin Core 绑定在一起。
它也提供访问公共测试网 testnet，一个全球的测试环境，使用一个使用无价值的“测试比特币”替代区块链模仿比特币主网。
回归测试网 regtest 或回归测试模式 Regression Test Mode 创建了一个用作本地测试环境的私有区块链。
最终，一个允许用户发送 RPC 命令到 bitcoind 的简单程序 bitcoin-cli 也包含在比特币核心内。

### 基础命令

{% highlight shell %}
$ bitcoin-cli -h # 获取以下帮助信息
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

### RPC 命令（需要 bitcoind 提供相关服务）

{% highlight shell %}
$ bitcoin-cli help # 获取以下 RPC 命令
{% endhighlight %}

**注：() 内的参数有默认值，可以省略。**

> == Blockchain ==<br>
> [getbestblockhash](/blog/2018/05/bitcoin-rpc-command-getbestblockhash.html) # 获取最佳块哈希<br>
> [getblock "hash" ( verbose )](/blog/2018/05/bitcoin-rpc-command-getblock.html) # 获取指定区块信息<br>
> [getblockchaininfo](/blog/2018/05/bitcoin-rpc-command-getblockchaininfo.html) # 获取区块链信息<br>
> [getblockcount](/blog/2018/05/bitcoin-rpc-command-getblockcount.html) # 获取当前的区块数<br>
> [getblockhash index](/blog/2018/05/bitcoin-rpc-command-getblockhash.html) # 获取指定区块哈希<br>
> [getblockheader "hash" ( verbose )](/blog/2018/05/bitcoin-rpc-command-getblockheader.html) # 获取指定区块头信息<br>
> [getchaintips](/blog/2018/05/bitcoin-rpc-command-getchaintips.html) # 获取区块链尖信息<br>
> [getdifficulty](/blog/2018/05/bitcoin-rpc-command-getdifficulty.html) # 获取当前挖矿难度<br>
> [getmempoolinfo](/blog/2018/06/bitcoin-rpc-command-getmempoolinfo.html) # 获取交易内存池信息<br>
> [getrawmempool ( verbose )](/blog/2018/06/bitcoin-rpc-command-getrawmempool.html) # 获取内存池原始交易<br>
> [gettxout "txid" n ( includemempool )](/blog/2018/06/bitcoin-rpc-command-gettxout.html) # 获取交易输出细节<br>
> [gettxoutproof ["txid",...] ( blockhash )](/blog/2018/06/bitcoin-rpc-command-gettxoutproof.html) # 获取交易证明<br>
> [gettxoutsetinfo](/blog/2018/06/bitcoin-rpc-command-gettxoutsetinfo.html) # 获取交易输出集合信息<br>
> [verifychain ( checklevel numblocks )](/blog/2018/06/bitcoin-rpc-command-verifychain.html) # 验证链<br>
> [verifytxoutproof "proof"](/blog/2018/06/bitcoin-rpc-command-verifytxoutproof.html) # 验证交易证明
> 
> == Control ==<br>
> [getinfo](/blog/2018/06/bitcoin-rpc-command-getinfo.html) # 获取比特币核心信息<br>
> [help ( "command" )](/blog/2018/06/bitcoin-rpc-command-help.html) # 获取命令帮助信息<br>
> [stop](/blog/2018/06/bitcoin-rpc-command-stop.html) # 远程终止比特币核心服务
> 
> == Generating ==<br>
> [generate numblocks](/blog/2018/06/bitcoin-rpc-command-generate.html) # 生成区块<br>
> [getgenerate](/blog/2018/06/bitcoin-rpc-command-getgenerate.html) # 获取挖矿状态<br>
> [setgenerate generate ( genproclimit )](/blog/2018/06/bitcoin-rpc-command-setgenerate.html) # 挖矿开关
> 
> == Mining ==<br>
> [getblocktemplate ( "jsonrequestobject" )](/blog/2018/06/bitcoin-rpc-command-getblocktemplate.html) # 获取区块模板<br>
> [getmininginfo](/blog/2018/06/bitcoin-rpc-command-getmininginfo.html) # 获取挖矿信息<br>
> [getnetworkhashps ( blocks height )](/blog/2018/06/bitcoin-rpc-command-getnetworkhashps.html) # 获取网络算力<br>
> [prioritisetransaction \<txid> \<priority delta> \<fee delta>](/blog/2018/06/bitcoin-rpc-command-prioritisetransaction.html) # 改变交易优先级<br>
> [submitblock "hexdata" ( "jsonparametersobject" )](/blog/2018/06/bitcoin-rpc-command-submitblock.html) # 提交区块
> 
> == Network ==<br>
> [addnode "node" "add|remove|onetry"](/blog/2018/06/bitcoin-rpc-command-addnode.html) # 添加节点并执行操作<br>
> [clearbanned](/blog/2018/06/bitcoin-rpc-command-listbanned.html) # 清空黑名单<br>
> [disconnectnode "node"](/blog/2018/06/bitcoin-rpc-command-disconnectnode.html) # 断开与指定节点的连接<br>
> [getaddednodeinfo dns ( "node" )](/blog/2018/07/bitcoin-rpc-command-getaddednodeinfo.html) # 获取添加的节点信息<br>
> [getconnectioncount](/blog/2018/07/bitcoin-rpc-command-getconnectioncount.html) # 获取连接数<br>
> [getnettotals](/blog/2018/07/bitcoin-rpc-command-getnettotals.html) # 获取网络总流量<br>
> [getnetworkinfo](/blog/2018/07/bitcoin-rpc-command-getnetworkinfo.html) # 获取网络信息<br>
> [getpeerinfo](/blog/2018/07/bitcoin-rpc-command-getpeerinfo.html) # 获取对端信息<br>
> [listbanned](/blog/2018/07/bitcoin-rpc-command-listbanned.html) # 列出黑名单<br>
> [ping](/blog/2018/07/bitcoin-rpc-command-ping.html) # ping 连接的节点<br>
> [setban "ip(/netmask)" "add|remove" (bantime) (absolute)](/blog/2018/07/bitcoin-rpc-command-setban.html) # 设置黑名单
> 
> == Rawtransactions ==<br>
> [createrawtransaction [{"txid":"id","vout":n},...] {"address":amount,"data":"hex",...} ( locktime )](/blog/2018/07/bitcoin-rpc-command-createrawtransaction.html) # 创建原始交易<br>
> [decoderawtransaction "hexstring"](/blog/2018/07/bitcoin-rpc-command-decoderawtransaction.html) # 解码原始交易<br>
> [decodescript "hex"](/blog/2018/07/bitcoin-rpc-command-decodescript.html) # 解码脚本<br>
> [fundrawtransaction "hexstring" includeWatching](/blog/2018/07/bitcoin-rpc-command-fundrawtransaction.html) # 资助原始交易<br>
> [getrawtransaction "txid" ( verbose )](/blog/2018/07/bitcoin-rpc-command-getrawtransaction.html) # 获取原始交易信息<br>
> [sendrawtransaction "hexstring" ( allowhighfees )](/blog/2018/07/bitcoin-rpc-command-sendrawtransaction.html) # 发送原始交易<br>
> [signrawtransaction "hexstring" ( [{"txid":"id","vout":n,"scriptPubKey":"hex","redeemScript":"hex"},...] ["privatekey1",...] sighashtype )](/blog/2018/07/bitcoin-rpc-command-signrawtransaction.html) # 签名原始交易
> 
> == Util ==<br>
> [createmultisig nrequired ["key",...]](/blog/2018/07/bitcoin-rpc-command-createmultisig.html) # 创建多重签名<br>
> [estimatefee nblocks](/blog/2018/07/bitcoin-rpc-command-estimatefee.html) # 估算交易费<br>
> [estimatepriority nblocks](/blog/2018/07/bitcoin-rpc-command-estimatepriority.html) # 估算交易优先级<br>
> [estimatesmartfee nblocks](/blog/2018/07/bitcoin-rpc-command-estimatesmartfee.html) # 智能估计交易费<br>
> [estimatesmartpriority nblocks](/blog/2018/07/bitcoin-rpc-command-estimatesmartpriority.html) # 智能估计交易优先级<br>
> [validateaddress "bitcoinaddress"](/blog/2018/07/bitcoin-rpc-command-validateaddress.html) # 验证地址<br>
> [verifymessage "bitcoinaddress" "signature" "message"](/blog/2018/07/bitcoin-rpc-command-verifymessage.html) # 验证消息
> 
> <font color="#f5f2f0">== Hidden ==</font>
> [<font color="#f5f2f0">invalidateblock</font>](/blog/2018/08/bitcoin-rpc-command-invalidateblock.html) <font color="#f5f2f0"># 无效化区块</font><br>
> [<font color="#f5f2f0">reconsiderblock</font>](/blog/2018/08/bitcoin-rpc-command-reconsiderblock.html) <font color="#f5f2f0"># 再考虑区块</font><br>
> [<font color="#f5f2f0">setmocktime</font>](/blog/2018/08/bitcoin-rpc-command-setmocktime.html) <font color="#f5f2f0"># 设置 mocktime</font><br>
> [<font color="#f5f2f0">resendwallettransactions</font>](/blog/2018/08/bitcoin-rpc-command-resendwallettransactions.html) <font color="#f5f2f0"># 再次发送钱包交易</font>
> 
> == Wallet ==<br>
> [abandontransaction "txid"](/blog/2018/08/bitcoin-rpc-command-abandontransaction.html) # 放弃交易<br>
> [addmultisigaddress nrequired ["key",...] ( "account" )](/blog/2018/08/bitcoin-rpc-command-addmultisigaddress.html) # 添加多签地址<br>
> [backupwallet "destination"](/blog/2018/08/bitcoin-rpc-command-backupwallet.html) # 备份钱包<br>
> [dumpprivkey "bitcoinaddress"](/blog/2018/08/bitcoin-rpc-command-dumpprivkey.html) # 导出私钥<br>
> [dumpwallet "filename"](/blog/2018/08/bitcoin-rpc-command-dumpwallet.html) # 导出钱包<br>
> [encryptwallet "passphrase"](/blog/2018/08/bitcoin-rpc-command-encryptwallet.html) # 加密钱包<br>
> [getaccount "bitcoinaddress"](/blog/2018/08/bitcoin-rpc-command-getaccount.html) # （已过时）获取地址所属账户<br>
> [getaccountaddress "account"](/blog/2018/08/bitcoin-rpc-command-getaccountaddress.html) # （已过时）获取账户收款地址<br>
> [getaddressesbyaccount "account"](/blog/2018/08/bitcoin-rpc-command-getaddressesbyaccount.html) # 获取某账户下所有地址<br>
> [getbalance ( "account" minconf includeWatchonly )](/blog/2018/08/bitcoin-rpc-command-getbalance.html) # 获取余额<br>
> [getnewaddress ( "account" )](/blog/2018/08/bitcoin-rpc-command-getnewaddress.html) # 获取新的地址<br>
> [getrawchangeaddress](/blog/2018/08/bitcoin-rpc-command-getrawchangeaddress.html) # 获取原始交易找零地址<br>
> [getreceivedbyaccount "account" ( minconf )](/blog/2018/08/bitcoin-rpc-command-getreceivedbyaccount.html) # （已过时）获取指定账户接收到的金额<br>
> [getreceivedbyaddress "bitcoinaddress" ( minconf )](/blog/2018/08/bitcoin-rpc-command-getreceivedbyaddress.html) # 获取指定地址接收到的金额<br>
> [gettransaction "txid" ( includeWatchonly )](/blog/2018/08/bitcoin-rpc-command-gettransaction.html) # 获取交易信息<br>
> [getunconfirmedbalance](/blog/2018/06/bitcoin-rpc-command-getunconfirmedbalance.html) # 获取未确认的余额<br>
> [getwalletinfo](/blog/2018/05/bitcoin-rpc-command-getwalletinfo.html) # 获取钱包信息<br>
> [importaddress "address" ( "label" rescan p2sh )](/blog/2018/08/bitcoin-rpc-command-importaddress.html) # 导入地址或脚本<br>
> [importprivkey "bitcoinprivkey" ( "label" rescan )](/blog/2018/08/bitcoin-rpc-command-importprivkey.html) # 导入私钥<br>
> [importpubkey "pubkey" ( "label" rescan )](/blog/2018/08/bitcoin-rpc-command-importpubkey.html) # 导入公钥<br>
> [importwallet "filename"](/blog/2018/08/bitcoin-rpc-command-importwallet.html) # 导入钱包<br>
> [keypoolrefill ( newsize )](/blog/2018/08/bitcoin-rpc-command-keypoolrefill.html) # 再填充钥匙池<br>
> [listaccounts ( minconf includeWatchonly)](/blog/2018/08/bitcoin-rpc-command-listaccounts.html) # （已过时）列出账户及其余额<br>
> [listaddressgroupings](/blog/2018/09/bitcoin-rpc-command-listaddressgroupings.html) # 列出地址分组<br>
> [listlockunspent](/blog/2018/09/bitcoin-rpc-command-listlockunspent.html) # 列出锁定的未花费交易输出<br>
> [listreceivedbyaccount ( minconf includeempty includeWatchonly)](/blog/2018/09/bitcoin-rpc-command-listreceivedbyaccount.html) # （已过时）列出账户接收金额<br>
> [listreceivedbyaddress ( minconf includeempty includeWatchonly)](/blog/2018/09/bitcoin-rpc-command-listreceivedbyaddress.html) # 列出地址接收金额<br>
> [listsinceblock ( "blockhash" target-confirmations includeWatchonly)](/blog/2018/09/bitcoin-rpc-command-listsinceblock.html) # 列从某区块开始的全部交易<br>
> [listtransactions ( "account" count from includeWatchonly)](/blog/2018/09/bitcoin-rpc-command-listtransactions.html) # 列出交易<br>
> [listunspent ( minconf maxconf  ["address",...] )](/blog/2018/09/bitcoin-rpc-command-listunspent.html) # 列出未花费交易输出<br>
> [lockunspent unlock [{"txid":"txid","vout":n},...]](/blog/2018/09/bitcoin-rpc-command-lockunspent.html) # 加解锁未花费交易输出<br>
> [move "fromaccount" "toaccount" amount ( minconf "comment" )](/blog/2018/09/bitcoin-rpc-command-move.html) # （已过时）转账<br>
> [sendfrom "fromaccount" "tobitcoinaddress" amount ( minconf "comment" "comment-to" )](/blog/2018/09/bitcoin-rpc-command-sendfrom.html) # （已过时）从指定账户发送<br>
> [sendmany "fromaccount" {"address":amount,...} ( minconf "comment" ["address",...] )](/blog/2018/09/bitcoin-rpc-command-sendmany.html) # 发送到多个地址<br>
> [sendtoaddress "bitcoinaddress" amount ( "comment" "comment-to" subtractfeefromamount )](/blog/2018/09/bitcoin-rpc-command-sendtoaddress.html) # 发送到指定地址<br>
> [setaccount "bitcoinaddress" "account"](/blog/2018/09/bitcoin-rpc-command-setaccount.html) # （已过时）设置地址关联账户<br>
> [settxfee amount](/blog/2018/09/bitcoin-rpc-command-settxfee.html) # 设置交易费<br>
> [signmessage "bitcoinaddress" "message"](/blog/2018/09/bitcoin-rpc-command-signmessage.html) # 签名消息<br>
> [walletlock](/blog/2018/09/bitcoin-rpc-command-walletlock.html) # 锁定钱包<br>
> [walletpassphrase "passphrase" timeout](/blog/2018/09/bitcoin-rpc-command-walletpassphrase.html) # 解锁钱包数秒<br>
> [walletpassphrasechange "oldpassphrase" "newpassphrase"](/blog/2018/09/bitcoin-rpc-command-walletpassphrasechange.html) # 更改钱包密码

Thanks for your time.

## 参照

* [JSON-RPC - Wikipedia](https://en.wikipedia.org/wiki/JSON-RPC)
* [bitcoin/bitcoin at v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [Developer Documentation - Bitcoin](https://bitcoin.org/en/developer-documentation)
* [mistydew/blockchain](https://github.com/mistydew/blockchain)
