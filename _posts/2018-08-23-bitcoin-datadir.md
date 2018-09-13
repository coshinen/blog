---
layout: post
title:  "比特币数据目录"
date:   2018-08-23 09:28:37 +0800
author: mistydew
categories: Blockchain Bitcoin
tags: 区块链 比特币 数据目录
---
比特币核心通常把其所有数据放在一个目录中，该目录称为数据目录。<br>
不同的操作系统，其默认位置是不同的，以下列出 3 种常用操作系统下比特币数据目录的默认位置：

* Windows < Vista: C:\Documents and Settings\Username\Application Data\Bitcoin

* Windows >= Vista: C:\Users\Username\AppData\Roaming\Bitcoin

* Mac: ~/Library/Application Support/Bitcoin

* Unix: ~/.bitcoin

## 源码剖析

数据目录默认的位置硬编在源码“util.cpp”文件的 GetDefaultDataDir() 函数中。

{% highlight C++ %}
boost::filesystem::path GetDefaultDataDir()
{
    namespace fs = boost::filesystem;
    // Windows < Vista: C:\Documents and Settings\Username\Application Data\Bitcoin
    // Windows >= Vista: C:\Users\Username\AppData\Roaming\Bitcoin
    // Mac: ~/Library/Application Support/Bitcoin
    // Unix: ~/.bitcoin
#ifdef WIN32
    // Windows
    return GetSpecialFolderPath(CSIDL_APPDATA) / "Bitcoin";
#else // Unix/Linux
    fs::path pathRet;
    char* pszHome = getenv("HOME");
    if (pszHome == NULL || strlen(pszHome) == 0)
        pathRet = fs::path("/");
    else
        pathRet = fs::path(pszHome);
#ifdef MAC_OSX
    // Mac
    pathRet /= "Library/Application Support";
    TryCreateDirectory(pathRet);
    return pathRet / "Bitcoin";
#else
    // Unix
    return pathRet / ".bitcoin";
#endif
#endif
}
{% endhighlight %}

## 目录结构
以 Ubuntu 18.04.1 下比特币的默认数据根目录 "~/.bitcoin" 为例，其文件结构如下：

* bitcoin.conf # 配置文件（启动选项）
* /blocks/ # 区块数据目录
  * blk00000.dat # 区块数据文件
  * index/ # 区块索引目录
    * 000003.log
    * CURRENT # MANIFEST-000002
    * LOCK # 目录锁文件
    * LOG # 日志文件
    * MANIFEST-000002 # 存放文件描述符
  * rev00000.dat # 区块恢复文件
* /chainstate/ # 链状态数据目录（该目录的访问速度影响比特币核心的整体速度）
  * 000003.log
  * CURRENT # MANIFEST-000002
  * LOCK # 目录锁文件
  * LOG # 日志文件
  * MANIFEST-000002 # 存放文件描述符
* db.log # 数据库日志文件
* debug.log # 调试日志文件
* fee_estimates.dat # 交易费预估文件
* peers.dat # 对端 IP 列表文件
* wallet.dat # 钱包数据文件（加密）

Thanks for your time.

## 参照
* [Splitting the data directory - Bitcoin Wiki](https://en.bitcoin.it/wiki/Splitting_the_data_directory)
* [...](https://github.com/mistydew/blockchain)
