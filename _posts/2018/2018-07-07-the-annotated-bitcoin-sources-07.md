---
layout: post
title:  "比特币源码剖析（七）"
date:   2018-07-07 11:43:10 +0800
author: mistydew
comments: true
category: 区块链
tags: Blockchain Bitcoin bitcoind
---
上一篇分析了应用程序初始化中椭圆曲线初始化的详细过程，详见[比特币源码剖析（六）](/blog/2018/06/the-annotated-bitcoin-sources-06.html)。
本篇主要分析 Step 4: application initialization: dir lock, daemonize, pidfile, debug log 第四步应用程序初始化中 InitSanityCheck() 初始化完整性检查和数据目录上锁的详细过程。

## 源码剖析

<p id="InitSanityCheck-ref"></p>
2.初始化完整性检查，主要检查椭圆曲线加密的初始化和 glibc 及 glibcxx 的完整性。

```cpp
/** Sanity checks
 *  Ensure that Bitcoin is running in a usable environment with all
 *  necessary library support.
 */ // 完整性检查。确保比特币在具有全部必备库支持的可用环境里运行。
bool InitSanityCheck(void)
{
    if(!ECC_InitSanityCheck()) { // 1.椭圆曲线密码学初始化完整性检查
        InitError("Elliptic curve cryptography sanity check failure. Aborting.");
        return false;
    }
    if (!glibc_sanity_test() || !glibcxx_sanity_test()) // 2.glibc 和 glibcxx 完整性测试
        return false;

    return true; // 检查通过返回 true
}
```

2.1.调用 ECC_InitSanityCheck() 函数检查椭圆曲线加密初始化完整性，该函数声明在“key.h”文件中。

```cpp
/** Check that required EC support is available at runtime. */
bool ECC_InitSanityCheck(void); // 检查运行时所需的 EC 支持是否可用。生成私钥->计算公钥->匹配验证
```

实现在“key.cpp”文件中，没有入参。

```cpp
bool ECC_InitSanityCheck() {
    CKey key; // 私钥对象
    key.MakeNewKey(true); // 生成新的私钥
    CPubKey pubkey = key.GetPubKey(); // 通过私钥获取公钥
    return key.VerifyPubKey(pubkey); // 验证私钥公钥是否匹配
}
```

椭圆曲线加密初始化完整性验证流程就是一个比特币地址生成过程中的前一部分：私钥->公钥->验证。

2.2.调用 glibc_sanity_test() 和 glibcxx_sanity_test() 函数测试 glibc 及 glibcxx 的完整性。
它们声明在“sanity.h”文件中。

```cpp
bool glibc_sanity_test(); // glibc 完整性测试
bool glibcxx_sanity_test(); // glibcxx 完整性测试
```

首先调用 glibc_sanity_test() 测试 glibc 的完整性，该函数实现在“glibc_sanity.cpp”文件中，没有入参。

```cpp
namespace
{
// trigger: Use the memcpy_int wrapper which calls our internal memcpy.
//   A direct call to memcpy may be optimized away by the compiler.
// test: Fill an array with a sequence of integers. memcpy to a new empty array. // 测试：用一系列证数填充数组。内存拷贝该数组到一个新的空数组。
//   Verify that the arrays are equal. Use an odd size to decrease the odds of // 验证数组是否相等。
//   the call being optimized away. // 使用奇数大小可降低被优化的机率。
template <unsigned int T>
bool sanity_test_memcpy()
{
    unsigned int memcpy_test[T]; // 1025
    unsigned int memcpy_verify[T] = {};
    for (unsigned int i = 0; i != T; ++i) // 遍历填充
        memcpy_test[i] = i;

    memcpy_int(memcpy_verify, memcpy_test, sizeof(memcpy_test)); // 内存拷贝

    for (unsigned int i = 0; i != T; ++i) { // 遍历
        if (memcpy_verify[i] != i) // 逐个验证
            return false; // 若不等返回 false
    }
    return true; // 若完全相等返回 true
}

#if defined(HAVE_SYS_SELECT_H)
// trigger: Call FD_SET to trigger __fdelt_chk. FORTIFY_SOURCE must be defined
//   as >0 and optimizations must be set to at least -O2.
// test: Add a file descriptor to an empty fd_set. Verify that it has been
//   correctly added. // 测试：把文件描述符添加到空的 fd_set。验证其是否正确添加。
bool sanity_test_fdelt()
{
    fd_set fds; // 文件描述符集对象
    FD_ZERO(&fds); // 清空
    FD_SET(0, &fds); // 设置标准输入到该集合
    return FD_ISSET(0, &fds); // 检查标准输入描述符是否在该集合中
}
#endif

} // anon namespace

bool glibc_sanity_test()
{
#if defined(HAVE_SYS_SELECT_H)
    if (!sanity_test_fdelt()) // 测试文件描述符集合
        return false;
#endif
    return sanity_test_memcpy<1025>(); // 测试内存拷贝
}
```

在 glibc 测试中测试了文件描述符集合与内存拷贝两项。

然后调用 glibcxx_sanity_test() 测试 glibcxx 的完整性，该函数实现在“glibcxx_sanity.cpp”文件中，没有入参。

```cpp
namespace
{
// trigger: use ctype<char>::widen to trigger ctype<char>::_M_widen_init().
// test: convert a char from narrow to wide and back. Verify that the result
//   matches the original. // 测试：把一个字符从窄转换为宽。验证结果是否匹配原始字符。
bool sanity_test_widen(char testchar)
{
    const std::ctype<char>& test(std::use_facet<std::ctype<char> >(std::locale())); // 初始化本地区域设置
    return test.narrow(test.widen(testchar), 'b') == testchar; // 转换测试字符为宽字符再转换为窄字符，与原字符比较，'b' 为转换失败时生成的默认值
}

// trigger: use list::push_back and list::pop_back to trigger _M_hook and
//   _M_unhook.
// test: Push a sequence of integers into a list. Pop them off and verify that
//   they match the original sequence. // 测试：推送一系列整数到一个链表。弹出它们验证与原始序列是否匹配。
bool sanity_test_list(unsigned int size) // 100
{
    std::list<unsigned int> test; // 测试用双向循环链表
    for (unsigned int i = 0; i != size; ++i) // 顺序推入整数
        test.push_back(i + 1);

    if (test.size() != size) // 验证大小
        return false;

    while (!test.empty()) { // 若链表非空
        if (test.back() != test.size()) // 与比较原数列比较
            return false;
        test.pop_back(); // 弹出
    }
    return true; // 匹配成功返回 true
}

} // anon namespace

// trigger: string::at(x) on an empty string to trigger __throw_out_of_range_fmt.
// test: force std::string to throw an out_of_range exception. Verify that
//   it's caught correctly. // 测试：强制 std::string 抛出 out_of_range 超出范围异常。验证是否正确捕获该异常。
bool sanity_test_range_fmt()
{
    std::string test; // 创建 std::string 空对象
    try {
        test.at(1); // 获取位置 1 处字符的引用，执行边界检查，访问无效将抛出 std::out_of_range 类型的异常
    } catch (const std::out_of_range&) { // 若捕获 std::out_of_range 异常
        return true; // 返回 true
    } catch (...) {
    }
    return false; // 否则返回 false
}

bool glibcxx_sanity_test()
{
    return sanity_test_widen('a') && sanity_test_list(100) && sanity_test_range_fmt(); // 测试宽窄字符互转、链表、范围格式
}
```

在 glibcxx 测试中测试了宽窄字符互转、链表、范围的异常处理。
调用 [std::ctype::widen](https://en.cppreference.com/w/cpp/locale/ctype/widen)、[std::ctype::narrow](https://en.cppreference.com/w/cpp/locale/ctype/narrow) 进行宽窄字符转换。
使用 [std::basic_string::at](https://en.cppreference.com/w/cpp/string/basic_string/at) 来触发超出范围异常。
这一部分逻辑较为简单，只需耐心啃代码即可。

<p id="DataDirLock-ref"></p>
3.数据目录上锁，保证同一时间只有一个比特币后台服务进程使用该目录。

```cpp
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.0.程序初始化，共 12 步
{
    ...
    // ********************************************************* Step 4: application initialization: dir lock, daemonize, pidfile, debug log // 初始化 ECC，目录锁检查（保证只有一个 bitcoind 运行），pid 文件，debug 日志
    ...
    std::string strDataDir = GetDataDir().string(); // 3.1.获取数据目录路径
#ifdef ENABLE_WALLET // 若开启钱包功能
    // Wallet file must be a plain filename without a directory // 3.2.钱包文件必须是不带目录的文件名
    if (strWalletFile != boost::filesystem::basename(strWalletFile) + boost::filesystem::extension(strWalletFile)) // 验证钱包文件名的完整性，basename 获取文件基础名 "wallet"，extension 获取文件扩展名 ".dat"
        return InitError(strprintf(_("Wallet %s resides outside data directory %s"), strWalletFile, strDataDir));
#endif // 钱包名校验结束
    // Make sure only a single Bitcoin process is using the data directory. // 3.3.确保只有一个比特币进程使用该数据目录。
    boost::filesystem::path pathLockFile = GetDataDir() / ".lock"; // 空的 lock 隐藏文件，作用：作为临界资源，保证当前只有一个 Bitcoin 进程使用数据目录
    FILE* file = fopen(pathLockFile.string().c_str(), "a"); // empty lock file; created if it doesn't exist.
    if (file) fclose(file); // 若文件正常打开则关闭该空文件

    try {
        static boost::interprocess::file_lock lock(pathLockFile.string().c_str()); // 初始化文件锁对象
        if (!lock.try_lock()) // 上锁
            return InitError(strprintf(_("Cannot obtain a lock on data directory %s. Bitcoin Core is probably already running."), strDataDir)); // 第二个进程会在这里上锁失败并退出
    } catch(const boost::interprocess::interprocess_exception& e) {
        return InitError(strprintf(_("Cannot obtain a lock on data directory %s. Bitcoin Core is probably already running.") + " %s.", strDataDir, e.what()));
    }
    ...
}
```

3.1.获取数据目录位置。<br>
3.2.验证钱包文件名的完整性，包含文件扩展名 ".dat"，不含路径。<br>
3.3.创建空的目录锁文件，并对该文件进行文件上锁，保证同一时间只有一个进程运行。

3.2.调用 boost::filesystem::basename(strWalletFile) 和 boost::filesystem::extension(strWalletFile) 函数分别获取文件名和文件格式进行比对，
详见 [extension()](https://www.boost.org/doc/libs/1_68_0_beta1/libs/filesystem/doc/reference.html#path-extension)。

3.3.首先创建 boost::interprocess::file_lock 文件锁对象，然后调用 lock.try_lock() 函数使调用线程尝试获取文件锁的独占所有权而无需等待。
详见 [file_lock](https://www.boost.org/doc/libs/1_67_0/doc/html/interprocess/synchronization_mechanisms.html#interprocess.synchronization_mechanisms.file_lock)。

<p id="CreatePidFile-ref"></p>
4.调用 CreatePidFile(GetPidFile(), getpid()) 函数创建进程号文件，用于记录当前运行的比特币服务进程的 PID。
该函数声明在“util.h”文件中。

```cpp
#ifndef WIN32
boost::filesystem::path GetPidFile(); // 获取 pid 路径名
void CreatePidFile(const boost::filesystem::path &path, pid_t pid); // 创建 pid 文件
#endif
```

实现在“util.cpp”文件中，入参为：PID 文件路径名，PID。

```cpp
const char * const BITCOIN_PID_FILENAME = "bitcoind.pid"; // 比特币默认 pid 文件名
...
#ifndef WIN32
boost::filesystem::path GetPidFile()
{
    boost::filesystem::path pathPidFile(GetArg("-pid", BITCOIN_PID_FILENAME)); // 获取 pid 文件名
    if (!pathPidFile.is_complete()) pathPidFile = GetDataDir() / pathPidFile; // pid 文件路径拼接
    return pathPidFile; // 返回 pid 文件路径名
}

void CreatePidFile(const boost::filesystem::path &path, pid_t pid)
{
    FILE* file = fopen(path.string().c_str(), "w"); // 以只写方式打开文件，若不存在则新建
    if (file) // 创建成功
    {
        fprintf(file, "%d\n", pid); // 输出 pid 到该文件
        fclose(file); // 关闭文件
    }
}
#endif
```

4.1.获取 PID 文件的位置。<br>
4.2.创建（仅限第一次）并打开 PID 文件。

<p id="ShrinkOrOpenDebugLogFile-ref"></p>
5.首先调用 ShrinkDebugFile() 函数收缩调试日志文件，从接近 10MiB 缩小到接近 200KB，只保留最近的 200KB 的日志记录。
然后调用 OpenDebugLog() 函数打开日志文件，它们均声明在“util.h”文件中。

```cpp
void OpenDebugLog(); // 打开调试日志文件
void ShrinkDebugFile(); // 收缩调试文件 10 * 1,000,000B -> 200,000B
```

5.1.函数 ShrinkDebugFile() 实现在“util.cpp”文件中，没有入参。

```cpp
void ShrinkDebugFile()
{
    // Scroll debug.log if it's getting too big // 若它变得太大，回滚 debug.log
    boost::filesystem::path pathLog = GetDataDir() / "debug.log"; // 1.获取日志位置
    FILE* file = fopen(pathLog.string().c_str(), "r"); // 以只读方式打开日志
    if (file && boost::filesystem::file_size(pathLog) > 10 * 1000000) // 2.若日志文件大小超过约 10MiB
    {
        // Restart the file with some of the end // 使用结尾信息重写文件
        std::vector <char> vch(200000,0); // 2.1.开辟 200KB 容器并初始化为 0
        fseek(file, -((long)vch.size()), SEEK_END); // 文件指针从文件尾部向前偏移 200,000 个字节
        int nBytes = fread(begin_ptr(vch), 1, vch.size(), file); // 读取最新的 200KB 调试日志到内存
        fclose(file); // 关闭文件

        file = fopen(pathLog.string().c_str(), "w"); // 2.2.以只写方式重新打开文件，文件存在长度清零
        if (file) // 若打开成功
        {
            fwrite(begin_ptr(vch), 1, nBytes, file); // 把最新的 200KB 调试日志写入文件
            fclose(file); // 关闭文件
        }
    }
    else if (file != NULL) // 若打开成功
        fclose(file); // 直接关闭文件
}
```

5.1.1.获取日志文件位置，并以只读方式打开该文件。<br>
5.1.2.若文件大小超过 10 * 1000,000B，则将其缩小到 200,000B。<br>
5.1.2.1.首先读取文件末尾的 200,000B 大小的数据到内存，然后关闭文件。<br>
5.1.2.2.以只写方式重新打开并清空日志文件，把内存中的 200,000B 数据写入日志文件中，并关闭文件。

其中调用 begin_ptr(vch) 获取 vector 的首元素地址，这是一个模板函数，其函数模板定义在“serialize.h”文件中。

```cpp
/** 
 * Get begin pointer of vector (non-const version).
 * @note These functions avoid the undefined case of indexing into an empty
 * vector, as well as that of indexing after the end of the vector.
 */ // 获取容器 vector 的首部指针（非常量版）。注：这些函数用于避免索引到空 vector 的未定义情况，和 vector 尾部后的情况。
template <typename V>
inline typename V::value_type* begin_ptr(V& v)
{
    return v.empty() ? NULL : &v[0]; // 若 vector 为空，返回空，否则返回首部元素的地址
}
```

5.2.函数 OpenDebugLog() 实现在“util.cpp”文件中，没有入参。

```cpp
/**
 * We use boost::call_once() to make sure mutexDebugLog and
 * vMsgsBeforeOpenLog are initialized in a thread-safe manner.
 *
 * NOTE: fileout, mutexDebugLog and sometimes vMsgsBeforeOpenLog
 * are leaked on exit. This is ugly, but will be cleaned up by
 * the OS/libc. When the shutdown sequence is fully audited and
 * tested, explicit destruction of these objects can be implemented.
 */ // 我们使用 boost::call_once() 确保 mutexDebugLog 和 vMsgsBeforeOpenLog 以线程安全的方式初始化。
static FILE* fileout = NULL; // 日志文件指针
static boost::mutex* mutexDebugLog = NULL; // 日志文件锁
static list<string> *vMsgsBeforeOpenLog; // 打开日志文件前的消息链表

static int FileWriteStr(const std::string &str, FILE *fp)
{
    return fwrite(str.data(), 1, str.size(), fp); // 写入字符串到文件指针关联的文件
}

static void DebugPrintInit() // 初始化调试日志文件锁
{
    assert(mutexDebugLog == NULL); // 若调试日志锁为空
    mutexDebugLog = new boost::mutex(); // 新建一个互斥锁
    vMsgsBeforeOpenLog = new list<string>; // 新建一个字符串类型的链表
}

void OpenDebugLog()
{
    boost::call_once(&DebugPrintInit, debugPrintInitFlag); // 1.确保只执行 DebugPrintInit() 一次
    boost::mutex::scoped_lock scoped_lock(*mutexDebugLog); // 上锁

    assert(fileout == NULL); // 文件指针检测，确保未初始化
    assert(vMsgsBeforeOpenLog); // 确保打开日志文件前的消息链表存在
    boost::filesystem::path pathDebug = GetDataDir() / "debug.log"; // 2.获取调试文件位置
    fileout = fopen(pathDebug.string().c_str(), "a"); // 以追加只写的方式打开，若文件不存在则创建
    if (fileout) setbuf(fileout, NULL); // unbuffered // 设置无缓冲

    // dump buffered messages from before we opened the log // 3.导出在我们打开日志前缓冲的消息
    while (!vMsgsBeforeOpenLog->empty()) { // 若消息链表非空，遍历该链表
        FileWriteStr(vMsgsBeforeOpenLog->front(), fileout); // 把一个消息字符串写入日志文件
        vMsgsBeforeOpenLog->pop_front(); // 链表头出链
    }

    delete vMsgsBeforeOpenLog; // 4.删除该链表
    vMsgsBeforeOpenLog = NULL; // 指针置空，防止出现野指针
}
```

5.2.1.调试打印初始化：互斥锁、消息链表，完成后上锁。<br>
5.2.2.获取日志文件位置并以追加只写的方式打开。<br>
5.2.3.若消息链表非空，遍历该链表，把消息写入日志文件。<br>
5.2.4.删除该链表，指针置空，防止出现野指针。

未完待续...<br>
请看下一篇[比特币源码剖析（八）](/blog/2018/07/the-annotated-bitcoin-sources-08.html)。

## 参考链接

* [bitcoin/key.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/key.h){:target="_blank"}
* [bitcoin/key.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/key.cpp){:target="_blank"}
* [bitcoin/sanity.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/compat/sanity.h){:target="_blank"}
* [bitcoin/glibc_sanity.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/compat/glibc_sanity.cpp){:target="_blank"}
* [bitcoin/glibcxx_sanity.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/compat/glibcxx_sanity.cpp){:target="_blank"}
* [bitcoin/util.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/util.h){:target="_blank"}
* [bitcoin/util.cpp at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/util.cpp){:target="_blank"}
* [bitcoin/serialize.h at v0.12.1 · bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/blob/v0.12.1/src/serialize.h){:target="_blank"}
