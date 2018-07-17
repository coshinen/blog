---
layout: post
title:  "比特币源码剖析（六）"
date:   2018-06-30 12:02:47 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin src
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 概要
上一篇分析了第三步参数转化为内部标志的代码，以及第四步应用程序初始化的大体过程，详见[比特币源码剖析（五）](/2018/06/23/bitcoin-source-anatomy-05)。<br>
本篇主要分析 `Step 4: application initialization: dir lock, daemonize, pidfile, debug log` 第四步应用程序初始化中初始化椭圆曲线代码的详细过程。

## 源码剖析

1.初始化椭圆曲线代码。
首先调用 `ECC_Start()` 函数启动椭圆曲线支持。该函数声明在“key.h”文件中。

{% highlight C++ %}
/** Initialize the elliptic curve support. May not be called twice without calling ECC_Stop first. */
void ECC_Start(void); // 初始化椭圆曲线支持。如果不先调用 ECC_Stop，可能不会调用 2 次。
{% endhighlight %}

实现在“key.cpp”文件中，没有入参。

{% highlight C++ %}
void ECC_Start() {
    assert(secp256k1_context_sign == NULL);

    secp256k1_context *ctx = secp256k1_context_create(SECP256K1_CONTEXT_SIGN); // 1.创建一个 secp256k1 上下文对象
    assert(ctx != NULL); // 检验是否创建成功

    {
        // Pass in a random blinding seed to the secp256k1 context. // 把随机致盲种子传递给 secp256k1 上下文。
        unsigned char seed[32]; // 32 字节的种子
        LockObject(seed); // 2.锁定内存栈对象
        GetRandBytes(seed, 32); // 3.获取 32 字节的随机数做为种子
        bool ret = secp256k1_context_randomize(ctx, seed); // 4.使用种子设置致盲值
        assert(ret); // 检测随机化结果
        UnlockObject(seed); // 5.解锁内存栈对象
    }

    secp256k1_context_sign = ctx;
}
{% endhighlight %}

1.1.创建一个 `secp256k1` 上下文对象。<br>
1.2.锁定待生成的随机数种子数组。<br>
1.3.生成 32 字节的随机数种子。<br>
1.4.使用随机数种子设置致盲值。<br>
1.5.解锁已生成的随机数种子数组。

1.1.调用 `secp256k1_context_create(SECP256K1_CONTEXT_SIGN)` 函数创建一个 `secp256k1` 上下文对象。
该函数声明在“secp256k1.h”文件中。

{% highlight C++ %}
/** All flags' lower 8 bits indicate what they're for. Do not use directly. */ // 所有标志的低 8 位表示它们的用途。不要直接使用。
...
#define SECP256K1_FLAGS_TYPE_CONTEXT (1 << 0) // 1
...
/** The higher bits contain the actual data. Do not use directly. */ // 高位包含真正的数据。不要直接使用。
...
#define SECP256K1_FLAGS_BIT_CONTEXT_SIGN (1 << 9) // 512
...
/** Flags to pass to secp256k1_context_create. */ // 传递给 secp256k1_context_create 的标志
...
#define SECP256K1_CONTEXT_SIGN (SECP256K1_FLAGS_TYPE_CONTEXT | SECP256K1_FLAGS_BIT_CONTEXT_SIGN) // 513
...
/** Create a secp256k1 context object.
 *
 *  Returns: a newly created context object.
 *  In:      flags: which parts of the context to initialize.
 */ // 创建一个 secp256k1 上下文对象。
SECP256K1_API secp256k1_context* secp256k1_context_create(
    unsigned int flags
) SECP256K1_WARN_UNUSED_RESULT;
{% endhighlight %}

实现在“secp256k1.c”文件中，入参为：`SECP256K1_CONTEXT_SIGN`。

{% highlight C++ %}
secp256k1_context* secp256k1_context_create(unsigned int flags) {
    secp256k1_context* ret = (secp256k1_context*)checked_malloc(&default_error_callback, sizeof(secp256k1_context));
    ret->illegal_callback = default_illegal_callback;
    ret->error_callback = default_error_callback;

    if (EXPECT((flags & SECP256K1_FLAGS_TYPE_MASK) != SECP256K1_FLAGS_TYPE_CONTEXT, 0)) {
            secp256k1_callback_call(&ret->illegal_callback,
                                    "Invalid flags");
            free(ret);
            return NULL;
    }

    secp256k1_ecmult_context_init(&ret->ecmult_ctx);
    secp256k1_ecmult_gen_context_init(&ret->ecmult_gen_ctx);

    if (flags & SECP256K1_FLAGS_BIT_CONTEXT_SIGN) {
        secp256k1_ecmult_gen_context_build(&ret->ecmult_gen_ctx, &ret->error_callback);
    }
    if (flags & SECP256K1_FLAGS_BIT_CONTEXT_VERIFY) {
        secp256k1_ecmult_context_build(&ret->ecmult_ctx, &ret->error_callback);
    }

    return ret;
}
{% endhighlight %}

1.2.调用 `LockObject(seed)` 函数锁定待生成的随机数种子内存栈空间。
该函数是一个模板函数，其模板定义在“pagelocker.h”文件中。

{% highlight C++ %}
/**
 * Singleton class to keep track of locked (ie, non-swappable) memory pages, for use in
 * std::allocator templates.
 *
 * Some implementations of the STL allocate memory in some constructors (i.e., see
 * MSVC's vector<T> implementation where it allocates 1 byte of memory in the allocator.)
 * Due to the unpredictable order of static initializers, we have to make sure the
 * LockedPageManager instance exists before any other STL-based objects that use
 * secure_allocator are created. So instead of having LockedPageManager also be
 * static-initialized, it is created on demand.
 */ // 用于跟踪锁定（即不可交换）的内存页的单例类，用于 std::allocator 模板中。
class LockedPageManager : public LockedPageManagerBase<MemoryPageLocker>
{
public:
    static LockedPageManager& Instance() // 获取单例对象的引用
    {
        boost::call_once(LockedPageManager::CreateInstance, LockedPageManager::init_flag); // 保证只执行一次 LockedPageManager::CreateInstance 函数，线程安全
        return *LockedPageManager::_instance; // 返回单例对象
    }

private:
    LockedPageManager();

    static void CreateInstance() // 创建实例
    {
        // Using a local static instance guarantees that the object is initialized // 使用局部静态实例可确保在首次需要时初始化对象，
        // when it's first needed and also deinitialized after all objects that use // 并在所有使用它的对象使用完成后对其进行取消初始化。
        // it are done with it.  I can think of one unlikely scenario where we may // 我可以想到一个不太可能出现静态取消初始化顺序/问题的情况，
        // have a static deinitialization order/problem, but the check in // 但检查 LockedPageManagerBase 类的析构函数可以帮助我们侦测这种情况是否会发生。
        // LockedPageManagerBase's destructor helps us detect if that ever happens.
        static LockedPageManager instance; // 创建局部静态单例对象
        LockedPageManager::_instance = &instance;
    }

    static LockedPageManager* _instance; // 实例指针
    static boost::once_flag init_flag; // 初始化标志（静态初始化为 BOOST_ONCE_INIT）
};

//
// Functions for directly locking/unlocking memory objects.
// Intended for non-dynamically allocated structures.
// // 用于直接锁定/解锁内存对象的函数。用于非动态分配的结构。
template <typename T>
void LockObject(const T& t)
{
    LockedPageManager::Instance().LockRange((void*)(&t), sizeof(T)); // 锁定
}
{% endhighlight %}

`LockedPageManager` 是派生于模板类 `LockedPageManagerBase<MemoryPageLocker>` 的单例类，静态数据成员 `_instance` 和 `init_flag` 初始化在“pagelocker.cpp”文件中。<br>
成员函数 `Instance()` 内的 `boost::call_once(LockedPageManager::CreateInstance, LockedPageManager::init_flag)` 确保成员函数 `LockedPageManager::CreateInstance` 只执行一次，
以线程安全的方式来初始化数据，详见 [boost:call_once](https://www.boost.org/doc/libs/1_32_0/doc/html/call_once.html)。

{% highlight C++ %}
LockedPageManager* LockedPageManager::_instance = NULL; // 懒汉式，单独无法保证前程安全
boost::once_flag LockedPageManager::init_flag = BOOST_ONCE_INIT; // 可保证线程安全
{% endhighlight %}

先调用 `LockedPageManager::Instance()` 获取锁定页面管理器单例对象，然后调用其基类成员函数 `LockedPageManager::Instance().LockRange((void*)(&t), sizeof(T))` 来进行区域锁定。
其继承基类传入的类模板类型参数 `MemoryPageLocker` 是一个依赖操作系统的内存页加解锁类，该类定义在“pagelocker.h”文件中。

{% highlight C++ %}
/**
 * OS-dependent memory page locking/unlocking.
 * Defined as policy class to make stubbing for test possible.
 */ // 依赖操作系统的内存页锁定/解锁。定义为策略类，为测试做准备。
class MemoryPageLocker
{
public:
    /** Lock memory pages.
     * addr and len must be a multiple of the system page size
     */ // 锁定内存页。地址和长度必须是系统页的倍数
    bool Lock(const void* addr, size_t len);
    /** Unlock memory pages.
     * addr and len must be a multiple of the system page size
     */ // 解锁内存页。地址和长度必须是系统页的倍数
    bool Unlock(const void* addr, size_t len);
};
{% endhighlight %}

其成员函数实现在“pagelocker.cpp”文件中。

{% highlight C++ %}
bool MemoryPageLocker::Lock(const void* addr, size_t len)
{
#ifdef WIN32
    return VirtualLock(const_cast<void*>(addr), len) != 0;
#else // Unix/Linux
    return mlock(addr, len) == 0; // 锁定内存页
#endif
}

bool MemoryPageLocker::Unlock(const void* addr, size_t len)
{
#ifdef WIN32
    return VirtualUnlock(const_cast<void*>(addr), len) != 0;
#else // Unix/Linux
    return munlock(addr, len) == 0; // 解锁内存页
#endif
}
{% endhighlight %}

<p id="UnlockRange-ref"></p>
而基类成员函数 `LockedPageManager::Instance().LockRange(...)` 定义在“pagelocker.cpp”文件的 `LockedPageManagerBase` 类中。

{% highlight C++ %}
/**
 * Thread-safe class to keep track of locked (ie, non-swappable) memory pages.
 *
 * Memory locks do not stack, that is, pages which have been locked several times by calls to mlock()
 * will be unlocked by a single call to munlock(). This can result in keying material ending up in swap when
 * those functions are used naively. This class simulates stacking memory locks by keeping a counter per page.
 *
 * @note By using a map from each page base address to lock count, this class is optimized for
 * small objects that span up to a few pages, mostly smaller than a page. To support large allocations,
 * something like an interval tree would be the preferred data structure.
 */ // 用于跟踪锁定（即不可交换）的内存页的线程安全类。
template <class Locker>
class LockedPageManagerBase
{
public:
    ...
    // For all pages in affected range, increase lock count // 对于受影响范围内的所有页面，增加锁定计数
    void LockRange(void* p, size_t size)
    {
        boost::mutex::scoped_lock lock(mutex); // 区域锁
        if (!size) // 若锁定区域大小为 0
            return; // 直接返回
        const size_t base_addr = reinterpret_cast<size_t>(p); // 强制转换
        const size_t start_page = base_addr & page_mask; // 计算开始页
        const size_t end_page = (base_addr + size - 1) & page_mask; // 计算结束页
        for (size_t page = start_page; page <= end_page; page += page_size) { // 遍历每一页
            Histogram::iterator it = histogram.find(page); // 在页面基址映射列表中查询
            if (it == histogram.end()) // Newly locked page // 若未找到，说明还未上锁
            {
                locker.Lock(reinterpret_cast<void*>(page), page_size); // 锁定内存页
                histogram.insert(std::make_pair(page, 1)); // 插入页面基址映射列表
            } else // Page was already locked; increase counter // 若找到了，说明页面已锁，仅增加锁定计数
            {
                it->second += 1; // 锁定计数加 1
            }
        }
    }

    // For all pages in affected range, decrease lock count // 对于受影响范围内的所有页面，减少锁定计数
    void UnlockRange(void* p, size_t size)
    {
        boost::mutex::scoped_lock lock(mutex); // 区域锁
        if (!size) // 若解锁区域大小为 0
            return; // 直接返回
        const size_t base_addr = reinterpret_cast<size_t>(p); // 强制转换
        const size_t start_page = base_addr & page_mask; // 计算开始页
        const size_t end_page = (base_addr + size - 1) & page_mask; // 计算结束页
        for (size_t page = start_page; page <= end_page; page += page_size) { // 遍历每一页
            Histogram::iterator it = histogram.find(page); // 在页面基址映射列表中查询
            assert(it != histogram.end()); // Cannot unlock an area that was not locked // 若未找到，则报错
            // Decrease counter for page, when it is zero, the page will be unlocked // 否则，减少其锁定次数，当次数为 0 时，页面将解锁
            it->second -= 1; // 锁定次数减 1
            if (it->second == 0) // Nothing on the page anymore that keeps it locked // 页面上没有上锁
            {
                // Unlock page and remove the count from histogram // 解锁页面并基址映射列表中从移除该项
                locker.Unlock(reinterpret_cast<void*>(page), page_size); // 先对该内存页解锁
                histogram.erase(it); // 从映射列表中移除
            }
        }
    }
    ...
private:
    Locker locker; // 内存页加解锁对象
    boost::mutex mutex; // 互斥锁
    size_t page_size, page_mask; // 页面大小，页面掩码
    // map of page base address to lock count // 用于锁定计数的页面基址的映射
    typedef std::map<size_t, int> Histogram; // <页面起始地址， 锁定次数>
    Histogram histogram; // 页面基址映射列表
};
{% endhighlight %}

1.3.调用 `GetRandBytes(seed, 32)` 获取 32 个字节的随机数，该函数声明在“random.h”文件中。

{% highlight C++ %}
/**
 * Functions to gather random data via the OpenSSL PRNG
 */ // 通过 OpenSSL 伪随机数生成器搜集随机数据的函数
void GetRandBytes(unsigned char* buf, int num); // 获取 num 字节的随机数
{% endhighlight %}

实现在“random.cpp”文件中，入参为：32 字节的数据（栈空间），待获取随机数的字节数。

{% highlight C++ %}
void GetRandBytes(unsigned char* buf, int num)
{
    if (RAND_bytes(buf, num) != 1) { // 通过加密算法生成 num 位随机数，实际还是伪随机数，若提前设定种子，则该随机数无法被预先计算
        LogPrintf("%s: OpenSSL RAND_bytes() failed with error: %s\n", __func__, ERR_error_string(ERR_get_error(), NULL));
        assert(false);
    }
}
{% endhighlight %}

直接调用 OpenSSL 库的 `RAND_bytes(buf, num)` 函数获取 `num` 字节的随机数到 `buf` 中。
详见[/docs/manmaster/man3/RAND_bytes](https://www.openssl.org/docs/manmaster/man3/RAND_bytes.html)。

1.4.调用 `secp256k1_context_randomize(ctx, seed)` 函数设置致盲值，该函数实现在“secp256k1.c”文件中。

{% highlight C++ %}
int secp256k1_context_randomize(secp256k1_context* ctx, const unsigned char *seed32) {
    VERIFY_CHECK(ctx != NULL); // 验证 secp256k1 上下文对象是否创建
    ARG_CHECK(secp256k1_ecmult_gen_context_is_built(&ctx->ecmult_gen_ctx)); // 检查 secp256k1_ecmult_gen_context 对象的数据成员是否为空
    secp256k1_ecmult_gen_blind(&ctx->ecmult_gen_ctx, seed32); // 设置 secp256k1_ecmult_gen 的盲值
    return 1; // 成功返回 1
}
{% endhighlight %}

1.5.调用 `UnLockObject(seed)` 函数解锁已生成的随机数种子内存栈空间。
该函数是一个模板函数，其模板定义在“pagelocker.h”文件中。

{% highlight C++ %}
template <typename T>
void UnlockObject(const T& t)
{
    memory_cleanse((void*)(&t), sizeof(T)); // 先清空指定区域的数据
    LockedPageManager::Instance().UnlockRange((void*)(&t), sizeof(T)); // 解锁
}
{% endhighlight %}

首先调用 `memory_cleanse((void*)(&t), sizeof(T))` 函数清空指定区域，该函数声明在“cleanse.h”文件中。
然后解锁该区域的内存，详见 [1.2](#UnlockRange-ref)。

{% highlight C++ %}
void memory_cleanse(void *ptr, size_t len); // 清空敏感数据（写入随机数或纯 0）
{% endhighlight %}

实现在“cleanse.cpp”文件中，入参为：指向某内存空间的指针（地址），长度（字节）。

{% highlight C++ %}
void memory_cleanse(void *ptr, size_t len)
{
    OPENSSL_cleanse(ptr, len); // 使用 0 字符串填充从 ptr 指向位置开始 len 大小字节
}
{% endhighlight %}

内部调用 OpenSSL 库 `OPENSSL_cleanse(ptr, len)` 函数把指定空间填充为 0，
详见 [/docs/manmaster/man3/OPENSSL_cleanse](https://www.openssl.org/docs/manmaster/man3/OPENSSL_cleanse.html)。

未完待续...<br>
请看下一篇[比特币源码剖析（七）](/2018/07/07/bitcoin-source-anatomy-07)。

Thanks for your time.

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
