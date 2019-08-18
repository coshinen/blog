---
layout: post
title:  "比特币源码剖析（二）"
date:   2018-06-02 08:02:56 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码剖析
---
上一篇分析了应用程序启动前运行环境的设置和信号处理函数的连接，详见[比特币源码剖析（一）](/blog/2018/05/bitcoin-source-anatomy-01.html)。
本篇开始分析 AppInit(argc, argv) 应用程序初始化函数。

## 源码剖析

<p id="AppInit-ref"></p>
3.调用 AppInit(argc, argv) 函数初始化并启动应用程序。该函数定义在“bitcoind.cpp”文件中 main 函数的上面，入参为 main 函数的入参：参数个数，参数。

{% highlight C++ %}
//////////////////////////////////////////////////////////////////////////////
//
// Start // 启动
//
bool AppInit(int argc, char* argv[]) // 3.0.应用程序初始化
{
    boost::thread_group threadGroup; // 空线程组对象，管理多线程，不可复制和移动
    CScheduler scheduler; // 调度器对象

    bool fRet = false; // 启动标志：用于判断应用程序启动状态，初始化为 false，表示未启动

    //
    // Parameters // 参数
    //
    // If Qt is used, parameters/bitcoin.conf are parsed in qt/bitcoin.cpp's main() // 如果使用 Qt，则在 qt/bitcoin.cpp 文件的 main 函数中解析参数/配置文件
    ParseParameters(argc, argv); // 3.1.解析命令行（控制台传入）参数
    ...
};
{% endhighlight %}

首先创建了一个空的线程组对象，用于管理多线程，内部还未创建线程，子线程的创建在后面进行，这里不再赘述，详见 [Chapter 44. Boost.Thread - Creating and Managing Threads](https://theboostcpplibraries.com/boost.thread-management)。<br>
接着创建了一个调度器对象，用于定时运行后台任务，具体用途也在后面进行描述。

<p id="ParseParameters-ref"></p>
3.1.调用 ParseParameters(argc, argv) 函数解析命令行参数，该函数声明在“util.h”文件中。

{% highlight C++ %}
void ParseParameters(int argc, const char*const argv[]); // 解析命令行参数（启动选项）
{% endhighlight %}

实现在“util.cpp”文件中，入参为 main 函数入参：参数个数，指向参数的二级指针（指针数组）。

{% highlight C++ %}
map<string, string> mapArgs; // 启动选项（命令行参数，配置文件）单值映射列表，map<选项名，选项值>
map<string, vector<string> > mapMultiArgs; // 启动选项多值映射列表，map<选项名，vector<选项值> >
...
/** Interpret string as boolean, for argument parsing */
static bool InterpretBool(const std::string& strValue) // 把字符串转换为布尔型，用于参数解析
{
    if (strValue.empty()) // 若为空串
        return true; // 返回 true，表示指定的选项未指定值时，该值默认为 true
    return (atoi(strValue) != 0); // 否则，在返回时转换为对应布尔型
}

/** Turn -noX into -X=0 */ // 转换 -noX 为 -X=0
static void InterpretNegativeSetting(std::string& strKey, std::string& strValue)
{
    if (strKey.length()>3 && strKey[0]=='-' && strKey[1]=='n' && strKey[2]=='o') // 若选项名长度大于 3，且满足所示条件
    {
        strKey = "-" + strKey.substr(3); // 重构选项名
        strValue = InterpretBool(strValue) ? "0" : "1"; // 设置选项值
    }
}

void ParseParameters(int argc, const char* const argv[]) // 3.1.0.解析命令行参数
{
    mapArgs.clear(); // 1.清空启动选项单值映射列表
    mapMultiArgs.clear(); // 清空启动选项多值映射列表

    for (int i = 1; i < argc; i++) // 2.从第一个命令行参数开始，遍历命令行参数指针数组
    {
        std::string str(argv[i]); // 2.1.获取一个命令参数：选项名=选项值
        std::string strValue; // 用于保存选项值
        size_t is_index = str.find('='); // 找到等号的位置
        if (is_index != std::string::npos) // 若存在等号
        {
            strValue = str.substr(is_index+1); // 截取选项值子串
            str = str.substr(0, is_index); // 截取选项名子串
        }
#ifdef WIN32 // 2.2.windows 平台
        boost::to_lower(str); // 选项名转换为小写
        if (boost::algorithm::starts_with(str, "/")) // 若选项名以字符 "/" 开头
            str = "-" + str.substr(1); // 替换开头为字符 "-"
#endif

        if (str[0] != '-') // 2.3.若选项名不以字符 '-' 开头
            break; // 跳出，丢弃该选项

        // Interpret --foo as -foo. // 转换 --foo 为 -foo。
        // If both --foo and -foo are set, the last takes effect. // 若同时设置了 --foo 和 -foo，则后者生效。
        if (str.length() > 1 && str[1] == '-') // 若选项名长度大于 1 且 第二个字符为 '-'
            str = str.substr(1); // 则丢弃第一个字符 '-'
        InterpretNegativeSetting(str, strValue); // 2.4.转换 -no 选项名设置

        mapArgs[str] = strValue; // 2.5.加入启动选项单值映射列表
        mapMultiArgs[str].push_back(strValue); // 加入启动选项多值映射列表
    } // 循环，直到所有命令行参数解析完毕
}
{% endhighlight %}

1.清空 2 个全局的启动选项映射列表对象。<br>
2.从第 1 个命令行参数开始，遍历命令行参数指针数组。<br>
2.1.分离一个命令行参数中的选项名和选项值，一个命令行参数的形式为：选项名=选项值。<br>
2.2.windows 平台下把选项名开头的字符 '/' 转换为 '-'。<br>
2.3.选项名必须以 - 开头，并把选项名形式 --foo 转换为 -foo。<br>
2.4.把命令行参数 -noX 转换为 -X=0 的形式。<br>
2.5.把选项名和选项值加入 2 个启动选项映射列表。

<p id="HelpVersionInfo-ref"></p>
3.2.在处理数据目录前，先处理帮助和版本信息，实现在“bitcoind.cpp”文件的 AppInit(argc, argv) 函数中。

{% highlight C++ %}
bool AppInit(int argc, char* argv[]) // 3.0.应用程序初始化
{
    ...
    // Process help and version before taking care about datadir // 在关注数据目录前，处理帮助和版本
    if (mapArgs.count("-?") || mapArgs.count("-h") ||  mapArgs.count("-help") || mapArgs.count("-version")) // 3.2.0.版本和帮助信息
    {
        std::string strUsage = _("Bitcoin Core Daemon") + " " + _("version") + " " + FormatFullVersion() + "\n"; // 1.获取版本信息

        if (mapArgs.count("-version")) // 2.版本许可和帮助信息的选择
        {
            strUsage += LicenseInfo(); // 2.1.获取许可证信息
        }
        else
        {
            strUsage += "\n" + _("Usage:") + "\n" +
                  "  bitcoind [options]                     " + _("Start Bitcoin Core Daemon") + "\n";

            strUsage += "\n" + HelpMessage(HMM_BITCOIND); // 2.2.获取帮助信息
        }

        fprintf(stdout, "%s", strUsage.c_str()); // 3.把信息输出到标准输出并退出
        return false;
    }
    ...
};
{% endhighlight %}

若启动选项单值映射列表中含有 "-?"、"-h"、"-help" 和 "-version" 中的一项，则显示帮助或版本信息。
**注意此时配置文件还未读取，只解析了命令函参数，所以以上命令只有在控制台输入（作为命令行参数）时才有效。**

1.获取比特币核心服务守护进程的版本信息。<br>
2.进行版本许可和帮助信息的选择。<br>
2.1.若指定了 "-version"，则获取许可信息。<br>
2.2.否则获取帮助信息。<br>
3.把信息输出到标准输出。

1.调用 FormatFullVersion() 函数获取版本信息，该函数声明在“clientversion.h”文件中。

{% highlight C++ %}
std::string FormatFullVersion(); // 格式化全版本信息
{% endhighlight %}

实现在“clientversion.cpp”文件中，没有入参。

{% highlight C++ %}
/**
 * Client version number
 */ // 客户端版本号
#define CLIENT_VERSION_SUFFIX "" // 版本后缀，默认为 ""


/**
 * The following part of the code determines the CLIENT_BUILD variable.
 * Several mechanisms are used for this:
 * * first, if HAVE_BUILD_INFO is defined, include build.h, a file that is
 *   generated by the build environment, possibly containing the output
 *   of git-describe in a macro called BUILD_DESC
 * * secondly, if this is an exported version of the code, GIT_ARCHIVE will
 *   be defined (automatically using the export-subst git attribute), and
 *   GIT_COMMIT will contain the commit id.
 * * then, three options exist for determining CLIENT_BUILD:
 *   * if BUILD_DESC is defined, use that literally (output of git-describe)
 *   * if not, but GIT_COMMIT is defined, use v[maj].[min].[rev].[build]-g[commit]
 *   * otherwise, use v[maj].[min].[rev].[build]-unk
 * finally CLIENT_VERSION_SUFFIX is added
 */

//! First, include build.h if requested
#ifdef HAVE_BUILD_INFO
#include "build.h"
#endif

//! git will put "#define GIT_ARCHIVE 1" on the next line inside archives. $Format:%n#define GIT_ARCHIVE 1$ // git 会将 "#define GIT_ARCHIVE 1" 放在档案中的下一行。$Format:%n#define GIT_ARCHIVE 1$
#ifdef GIT_ARCHIVE
#define GIT_COMMIT_ID "$Format:%h$"
#define GIT_COMMIT_DATE "$Format:%cD$"
#endif

#define BUILD_DESC_WITH_SUFFIX(maj, min, rev, build, suffix) \
    "v" DO_STRINGIZE(maj) "." DO_STRINGIZE(min) "." DO_STRINGIZE(rev) "." DO_STRINGIZE(build) "-" DO_STRINGIZE(suffix)

#define BUILD_DESC_FROM_COMMIT(maj, min, rev, build, commit) \
    "v" DO_STRINGIZE(maj) "." DO_STRINGIZE(min) "." DO_STRINGIZE(rev) "." DO_STRINGIZE(build) "-g" commit

#define BUILD_DESC_FROM_UNKNOWN(maj, min, rev, build) \
    "v" DO_STRINGIZE(maj) "." DO_STRINGIZE(min) "." DO_STRINGIZE(rev) "." DO_STRINGIZE(build) "-unk"

#ifndef BUILD_DESC
#ifdef BUILD_SUFFIX
#define BUILD_DESC BUILD_DESC_WITH_SUFFIX(CLIENT_VERSION_MAJOR, CLIENT_VERSION_MINOR, CLIENT_VERSION_REVISION, CLIENT_VERSION_BUILD, BUILD_SUFFIX)
#elif defined(GIT_COMMIT_ID)
#define BUILD_DESC BUILD_DESC_FROM_COMMIT(CLIENT_VERSION_MAJOR, CLIENT_VERSION_MINOR, CLIENT_VERSION_REVISION, CLIENT_VERSION_BUILD, GIT_COMMIT_ID)
#else
#define BUILD_DESC BUILD_DESC_FROM_UNKNOWN(CLIENT_VERSION_MAJOR, CLIENT_VERSION_MINOR, CLIENT_VERSION_REVISION, CLIENT_VERSION_BUILD)
#endif
#endif
...
const std::string CLIENT_BUILD(BUILD_DESC CLIENT_VERSION_SUFFIX);
...
std::string FormatFullVersion()
{
    return CLIENT_BUILD; // 返回客户端构建版本
}
{% endhighlight %}

宏定义 BUILD_SUFFIX 定义在“obj/build.h”文件中，这个文件是构建比特币过程中生成的。<br>
宏替换函数 DO_STRINGIZE(...) 和版本号的宏定义在“clientversion.h”文件中。

{% highlight C++ %}
/**
 * client versioning and copyright year // 客户端版本和版权年份
 */

//! These need to be macros, as clientversion.cpp's and bitcoin*-res.rc's voodoo requires it
#define CLIENT_VERSION_MAJOR 0 // 主版本号
#define CLIENT_VERSION_MINOR 12 // 次版本号
#define CLIENT_VERSION_REVISION 1 // 修订版本号
#define CLIENT_VERSION_BUILD 0 // 构建版本号
...
/**
 * Converts the parameter X to a string after macro replacement on X has been performed.
 * Don't merge these into one macro!
 */ // 在执行 X 宏替换后把参数 X 转换为字符串。不要把这些合并为一个宏
#define STRINGIZE(X) DO_STRINGIZE(X)
#define DO_STRINGIZE(X) #X
{% endhighlight %}

#X 中 # 的作用就是把后面跟着的 X 转换为字符串。

2.1.调用 LicenseInfo() 函数获取许可信息。<br>
2.2.调用 HelpMessage(HMM_BITCOIND) 函数获取帮助信息。<br>
它们均声明在“init.h”文件中。

{% highlight C++ %}
/** The help message mode determines what help message to show */ // 确定显示什么帮助信息的帮助信息模式
enum HelpMessageMode { // 帮助信息模式枚举
    HMM_BITCOIND, // 0
    HMM_BITCOIN_QT // 1
};

/** Help for options shared between UI and daemon (for -help) */ // 用于 UI 和守护进程间共享的帮助选项（用于 -help）
std::string HelpMessage(HelpMessageMode mode);
/** Returns licensing information (for -version) */ // 返回许可证信息（用于 -version）
std::string LicenseInfo();
{% endhighlight %}

实现在“init.cpp”文件中，LicenseInfo() 没有入参，HelpMessage(...) 入参为 HMM_BITCOIND。

{% highlight C++ %}
std::string HelpMessage(HelpMessageMode mode)
{
    const bool showDebug = GetBoolArg("-help-debug", false); // 调试选项，默认关闭

    // When adding new options to the categories, please keep and ensure alphabetical ordering. // 当添加新选项到类别时，请确保按字母顺序排序。
    // Do not translate _(...) -help-debug options, Many technical terms, and only a very small audience, so is unnecessary stress to translators. // 不要翻译  _(...) -help-debug 选项，许多技术术语，只有非常小的受众，所以对译者来说是不必要的压力。
    string strUsage = HelpMessageGroup(_("Options:"));
    strUsage += HelpMessageOpt("-?", _("This help message"));
    strUsage += HelpMessageOpt("-version", _("Print version and exit"));
    ...
    if (showDebug) {
        strUsage += HelpMessageOpt("-rpcworkqueue=<n>", strprintf("Set the depth of the work queue to service RPC calls (default: %d)", DEFAULT_HTTP_WORKQUEUE));
        strUsage += HelpMessageOpt("-rpcservertimeout=<n>", strprintf("Timeout during HTTP requests (default: %d)", DEFAULT_HTTP_SERVER_TIMEOUT));
    }

    return strUsage; // 返回用法字符串
}

std::string LicenseInfo() // 许可证信息
{
    // todo: remove urls from translations on next change // todo：在下次更改时从翻译中移除 urls
    return FormatParagraph(strprintf(_("Copyright (C) 2009-%i The Bitcoin Core Developers"), COPYRIGHT_YEAR)) + "\n" +
           "\n" +
           FormatParagraph(_("This is experimental software.")) + "\n" +
           "\n" +
           FormatParagraph(_("Distributed under the MIT software license, see the accompanying file COPYING or <http://www.opensource.org/licenses/mit-license.php>.")) + "\n" +
           "\n" +
           FormatParagraph(_("This product includes software developed by the OpenSSL Project for use in the OpenSSL Toolkit <https://www.openssl.org/> and cryptographic software written by Eric Young and UPnP software written by Thomas Bernard.")) +
           "\n"; // 返回格式化的文本信息
}
{% endhighlight %}

未完待续...<br>
请看下一篇[比特币源码剖析（三）](/blog/2018/06/bitcoin-source-anatomy-03.html)。

## 参照

* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1){:target="_blank"}
* [mistydew/blockchain](https://github.com/mistydew/blockchain){:target="_blank"}
