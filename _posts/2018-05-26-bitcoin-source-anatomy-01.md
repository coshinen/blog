---
layout: post
title:  "比特币源码剖析（一）"
date:   2018-05-26 10:06:52 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码剖析
---
第一篇主要列出比特币核心服务程序 bitcoind 的启动流程及其入口函数，详见[比特币源码剖析](/blog/2018/05/bitcoin-source-anatomy-00.html)。
该篇主要分析 SetupEnvironment() 和 noui_connect() 函数。

## 源码剖析

<p id="SetupEnvironment-ref"></p>
1.调用 SetupEnvironment() 函数设置程序运行环境。该函数声明在“util.h”文件中。

{% highlight C++ %}
void SetupEnvironment(); // 设置运行环境
{% endhighlight %}

实现在“util.cpp”文件中，没有入参。

{% highlight C++ %}
void SetupEnvironment()
{
    // On most POSIX systems (e.g. Linux, but not BSD) the environment's locale // 在多数系统（例如：Linux，而非 BSD）上，环境的区域设置（场所或地点）可能无效，
    // may be invalid, in which case the "C" locale is used as fallback. // “C” 区域设置用于后备。
#if !defined(WIN32) && !defined(MAC_OSX) && !defined(__FreeBSD__) && !defined(__OpenBSD__) // 若非（为定义） WIN32、MAC_OSX、__FreeBSD__、__OpenBSD__
    try { // 1.尝试进行本地区域设置
        std::locale(""); // Raises a runtime error if current locale is invalid // 若当前区域设置无效，则导致运行时错误
    } catch (const std::runtime_error&) {
        setenv("LC_ALL", "C", 1); // POSIX 接口，回退到 “C” 环境变量
    }
#endif
    // The path locale is lazy initialized and to avoid deinitialization errors // 路径区域设置是懒加载的，且为了避免在多线程环境中的反初始化错误，
    // in multithreading environments, it is set explicitly by the main thread. // 它通过主线程显示设置。
    // A dummy locale is used to extract the internal default locale, used by // 虚拟区域设置通过使用 boost::filesystem::path 用于提取内部默认的区域设置，
    // boost::filesystem::path, which is then used to explicitly imbue the path. // 然后用于显示填充路径。
    std::locale loc = boost::filesystem::path::imbue(std::locale::classic()); // 2.先设置一个虚假的用于提取出原有设置
    boost::filesystem::path::imbue(loc); // 2.再填充
}
{% endhighlight %}

1.1.先尝试调用 std::locale("") 进行本地的区域设置，若因系统使该接口无效，则调用 setenv 改变区域设置为 "C" 环境变量。<br>
1.2.先用一个虚假的区域设置获取原来内部的区域设置，然后再显示的填充路径区域设置。

区域设置 locale 是一组特定文化的功能，程序可以使用这些功能在国际上更佳的方便被使用。
简单来说就是根据系统进行该程序的区域设置，用于日期、时间、语言的显示风格提供支持。
详见 [locale - C++ Reference](http://www.cplusplus.com/reference/locale/locale)。<br>
POSIX 函数 setenv 用于添加或改变环境变量，详见 [setenv](http://pubs.opengroup.org/onlinepubs/9699919799/functions/setenv.html)。<br>
Boost 库中的 imbue 用于嵌入路径区域设置，详见 [Filesystem Reference](https://www.boost.org/doc/libs/1_67_0/libs/filesystem/doc/reference.html#class-path)

<p id="noui_connect-ref"></p>
2.调用 noui_connect() 函数连接比特币核心服务的信号处理函数。该函数在“noui.h”文件中被引用。

{% highlight C++ %}
extern void noui_connect(); // 连接信号处理函数
{% endhighlight %}

实现在“noui.cpp”文件中，没有入参。

{% highlight C++ %}
static bool noui_ThreadSafeMessageBox(const std::string& message, const std::string& caption, unsigned int style)
{
    bool fSecure = style & CClientUIInterface::SECURE; // 通过消息类型获取安全标志
    style &= ~CClientUIInterface::SECURE;

    std::string strCaption; // 字符串类型标题
    // Check for usage of predefined caption // 检查预定义标题的用法
    switch (style) { // 根据类型选择消息标题
    case CClientUIInterface::MSG_ERROR:
        strCaption += _("Error"); // 错误标题
        break;
    case CClientUIInterface::MSG_WARNING:
        strCaption += _("Warning"); // 警告标题
        break;
    case CClientUIInterface::MSG_INFORMATION:
        strCaption += _("Information"); // 信息标题
        break;
    default:
        strCaption += caption; // Use supplied caption (can be empty) // 使用提供的标题（可能为空）
    }

    if (!fSecure) // 若不安全
        LogPrintf("%s: %s\n", strCaption, message);
    fprintf(stderr, "%s: %s\n", strCaption.c_str(), message.c_str()); // 字符串拼接重定向到标准错误
    return false; // 成功返回 false
}

static void noui_InitMessage(const std::string& message)
{
    LogPrintf("init message: %s\n", message); // 记录日志
}

void noui_connect()
{
    // Connect bitcoind signal handlers // 连接比特币核心服务信号处理函数
    uiInterface.ThreadSafeMessageBox.connect(noui_ThreadSafeMessageBox); // 1.连接无 UI 线程安全消息框（类型+消息）
    uiInterface.InitMessage.connect(noui_InitMessage); // 2.连接无 UI 初始化消息
}
{% endhighlight %}

uiInterface 是一个客户端 UI 通讯信号接口类对象，定义在“init.cpp”文件中。

{% highlight C++ %}
CClientUIInterface uiInterface; // Declared but not defined in ui_interface.h
{% endhighlight %}

uiInterface.ThreadSafeMessageBox 和 uiInterface.InitMessage 均为 boost::signals2::signal 信号，类似于 function/bind，它们定义在“ui_interface.h”文件的 CClientUIInterface 类中。
详见 [Chapter 67. Boost.Signals2 - Signals](https://theboostcpplibraries.com/boost.signals2-signals)。<br>
关于 function/bind 可以参考孟岩的 [function/bind的救赎（上） - CSDN博客](https://blog.csdn.net/myan/article/details/5928531)。

{% highlight C++ %}
/** Signals for UI communication. */ // UI 通讯信号
class CClientUIInterface // 客户端 UI 接口类
{
    ...
    /** Show message box. */ // 显示消息框
    boost::signals2::signal<bool (const std::string& message, const std::string& caption, unsigned int style), boost::signals2::last_value<bool> > ThreadSafeMessageBox;

    /** Progress message during initialization. */ // 初始化期间的进度消息
    boost::signals2::signal<void (const std::string &message)> InitMessage;
    ...
};
{% endhighlight %}

2.1.连接无 UI 线程安全消息框（消息类型+内容）函数 noui_ThreadSafeMessageBox。<br>
2.2.连接无 UI 初始化消息 noui_InitMessage。

其中均调用 LogPrintf 函数进行记录打印，该函数定义在“util.h”文件中，是宏定义函数。

{% highlight C++ %}
/** Return true if log accepts specified category */ // 如果日志接受特殊的类别返回 true
bool LogAcceptCategory(const char* category); // category 类似于 printf 中的格式控制
/** Send a string to the log output */ // 发送一个字符串到日志输出
int LogPrintStr(const std::string &str);

#define LogPrintf(...) LogPrint(NULL, __VA_ARGS__) // 日志输出（标准输出或调试日志）
...
/**
 * Zero-arg versions of logging and error, these are not covered by
 * TINYFORMAT_FOREACH_ARGNUM
 */ // TINYFORMAT_FOREACH_ARGNUM 不涵盖零参数版本的日志记录和错误
static inline int LogPrint(const char* category, const char* format)
{
    if(!LogAcceptCategory(category)) return 0; // 检验类别，这里类型为空直接返回 true
    return LogPrintStr(format); // 日志输出字符串
}
{% endhighlight %}

函数 LogPrint 类似于 C 语言的标准库函数 printf。
其中第一个参数为类别（用于调试，这里为 NULL），第二个为可变参数的宏 __VA_ARGS__（包含格式控制字符串）。

首先调用 LogAcceptCategory(category) 函数进行类型检查（与调试有关），
然后调用 LogPrintStr(format) 进行日志输出，即把指定字符串以指定格式进行输出到控制台或日志文件。
该函数定义在“util.cpp”文件中。

{% highlight C++ %}
/**
 * LogPrintf() has been broken a couple of times now
 * by well-meaning people adding mutexes in the most straightforward way.
 * It breaks because it may be called by global destructors during shutdown.
 * Since the order of destruction of static/global objects is undefined,
 * defining a mutex as a global object doesn't work (the mutex gets
 * destroyed, and then some later destructor calls OutputDebugStringF,
 * maybe indirectly, and you get a core dump at shutdown trying to lock
 * the mutex).
 */

static boost::once_flag debugPrintInitFlag = BOOST_ONCE_INIT;

/**
 * We use boost::call_once() to make sure mutexDebugLog and
 * vMsgsBeforeOpenLog are initialized in a thread-safe manner.
 *
 * NOTE: fileout, mutexDebugLog and sometimes vMsgsBeforeOpenLog
 * are leaked on exit. This is ugly, but will be cleaned up by
 * the OS/libc. When the shutdown sequence is fully audited and
 * tested, explicit destruction of these objects can be implemented.
 */
static FILE* fileout = NULL; // 日志文件指针
static boost::mutex* mutexDebugLog = NULL; // 日志文件锁
static list<string> *vMsgsBeforeOpenLog; // 打开日志文件前的消息链表

static int FileWriteStr(const std::string &str, FILE *fp)
{
    return fwrite(str.data(), 1, str.size(), fp); // 写入字符串到文件指针关联的文件
}

static void DebugPrintInit()
{
    assert(mutexDebugLog == NULL); // 若调试日志锁为空
    mutexDebugLog = new boost::mutex(); // 新建一个互斥锁
    vMsgsBeforeOpenLog = new list<string>; // 新建一个字符串类型的链表
}
...
bool LogAcceptCategory(const char* category)
{
    if (category != NULL) // 若类型非空
    {
        if (!fDebug) // 若调试选项未开启
            return false; // 直接返回 false

        // Give each thread quick access to -debug settings. // 让每个线程快速访问 -debug 选项设置。
        // This helps prevent issues debugging global destructors, // 这有助于防止调试全局析构函数的问题，
        // where mapMultiArgs might be deleted before another // mapMultiArgs 可能在另一个全局析构函数
        // global destructor calls LogPrint() // 调用 LogPrint() 之前被删除
        static boost::thread_specific_ptr<set<string> > ptrCategory; // 线程局部存储（TLS）为每个线程独有
        if (ptrCategory.get() == NULL) // 初始为空
        {
            const vector<string>& categories = mapMultiArgs["-debug"]; // 获取调试选项指定的值（调试内容）存入类型列表
            ptrCategory.reset(new set<string>(categories.begin(), categories.end())); // 获取类型列表每个元素的地址存入 TLS 中
            // thread_specific_ptr automatically deletes the set when the thread ends.
        } // thread_specific_ptr 在线程结束时自动删除该集合。RAII 技术。
        const set<string>& setCategories = *ptrCategory.get(); // 获取类别字符串集合的引用

        // if not debugging everything and not debugging specific category, LogPrint does nothing. // 如果不调试全部内容而调试特定类别，LogPrint 什么也不做。
        if (setCategories.count(string("")) == 0 && // 若类别集中含有空串
            setCategories.count(string("1")) == 0 && // 且含有字符串 “1”
            setCategories.count(string(category)) == 0) // 且含有指定类别
            return false; // 直接返回 false
    }
    return true; // 返回 true
}

/**
 * fStartedNewLine is a state variable held by the calling context that will
 * suppress printing of the timestamp when multiple calls are made that don't
 * end in a newline. Initialize it to true, and hold it, in the calling context.
 */ // fStartedNewLine 是一个调用上下文保存的状态变量，它将在多次调用不以换行符结束时禁止打印时间戳。初始化为 true，并在调用上下文中保存该值。
static std::string LogTimestampStr(const std::string &str, bool *fStartedNewLine)
{
    string strStamped; // 保存打上时间戳的字符串

    if (!fLogTimestamps) // 记录时间戳标志若为 false
        return str; // 直接返回该字符串

    if (*fStartedNewLine) { // 换行标志，默认为 true
        int64_t nTimeMicros = GetLogTimeMicros(); // 获取当前时间，微秒
        strStamped = DateTimeStrFormat("%Y-%m-%d %H:%M:%S", nTimeMicros/1000000); // 转换为秒，并格式化日期时间字符串
        if (fLogTimeMicros) // 若记录微秒时间
            strStamped += strprintf(".%06d", nTimeMicros%1000000); // 追加微秒到时间戳
        strStamped += ' ' + str; // 空格隔开拼接字符串
    } else // 否则
        strStamped = str; // 不打时间戳

    if (!str.empty() && str[str.size()-1] == '\n') // 若字符串非空 且 最后一个字符为换行符
        *fStartedNewLine = true; // 换行标志置为 true
    else // 若字符串为空
        *fStartedNewLine = false; // 换行标志置为 false

    return strStamped; // 返回打上时间戳的字符串
}

int LogPrintStr(const std::string &str)
{
    int ret = 0; // Returns total number of characters written // 返回写入字符的总数
    static bool fStartedNewLine = true; // 开始新的一行标志，初始化为 true

    string strTimestamped = LogTimestampStr(str, &fStartedNewLine); // 把字符串加上时间戳

    if (fPrintToConsole) // 若输出到控制台选项开启
    {
        // print to console // 输出到控制台
        ret = fwrite(strTimestamped.data(), 1, strTimestamped.size(), stdout); // 把数据写入标准输出
        fflush(stdout); // 刷新标准输出
    }
    else if (fPrintToDebugLog) // 若输出到调试日志选项开启
    {
        boost::call_once(&DebugPrintInit, debugPrintInitFlag); // 注册只调用一次调试打印初始化
        boost::mutex::scoped_lock scoped_lock(*mutexDebugLog); // 区域锁

        // buffer if we haven't opened the log yet // 如果我们还未打开日志，进行缓冲
        if (fileout == NULL) { // 若文件指针为空
            assert(vMsgsBeforeOpenLog); // 检查消息链表已创建完毕
            ret = strTimestamped.length(); // 获取打上时间戳的字符串长度
            vMsgsBeforeOpenLog->push_back(strTimestamped); // 加入该消息链表
        }
        else // 若已经打开
        {
            // reopen the log file, if requested // 若有需求，再次打开日志文件
            if (fReopenDebugLog) { // 若指定在再次打开日志文件
                fReopenDebugLog = false; // 该标志先置为 false
                boost::filesystem::path pathDebug = GetDataDir() / "debug.log"; // 获取日志文件的路径
                if (freopen(pathDebug.string().c_str(),"a",fileout) != NULL) // 再次打开日志文件，以追加的方式打开
                    setbuf(fileout, NULL); // unbuffered // 关闭该文件指针的缓冲机制
            }

            ret = FileWriteStr(strTimestamped, fileout); // 把打上时间戳的字符串写入日志文件
        }
    }
    return ret; // 返回写入调试日志文件的字符总数
}
{% endhighlight %}

未完待续...<br>
请看下一篇[比特币源码剖析（二）](/blog/2018/06/bitcoin-source-anatomy-02.html)。

Thanks for your time.

## 参照

* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
