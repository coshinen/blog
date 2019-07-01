---
layout: post
title:  "比特币源码剖析（八）"
date:   2018-07-14 22:11:45 +0800
author: mistydew
comments: true
categories: Blockchain Bitcoin
tags: 区块链 比特币 源码剖析
---
上一篇分析了应用程序初始化中初始化完整性检查和数据目录锁的过程，详见[比特币源码剖析（七）](/blog/2018/07/bitcoin-source-anatomy-07.html)。
本篇主要分析 Step 4: application initialization: dir lock, daemonize, pidfile, debug log 第四步应用程序初始化中创建脚本验证线程和轻量级任务调度线程的详细过程。

## 源码剖析

<p id="ThreadScriptCheck-ref"></p>
7.调用 threadGroup.create_thread(&ThreadScriptCheck) 函数创建脚本验证线程，
详见 [create_thread](https://www.boost.org/doc/libs/1_67_0/doc/html/thread/thread_management.html#thread.thread_management.threadgroup)。
传入的线程行为函数 ThreadScriptCheck 声明在”main.h”文件中。

{% highlight C++ %}
/** Run an instance of the script checking thread */
void ThreadScriptCheck(); // 运行一个脚本检查线程的实例
{% endhighlight %}

实现在“main.cpp”文件中，没有入参。

{% highlight C++ %}
static CCheckQueue<CScriptCheck> scriptcheckqueue(128); // 脚本检查队列，队列容量为 128

void ThreadScriptCheck() {
    RenameThread("bitcoin-scriptch"); // 1.重命名线程
    scriptcheckqueue.Thread(); // 2.执行线程工作函数
}
{% endhighlight %}

7.1.重命名线程。<br>
7.2.执行线程工作函数。

7.1.调用 RenameThread("bitcoin-scriptch") 函数重命名线程，3 种不同平台的重命名。
该函数声明在“util.h”文件中。

{% highlight C++ %}
void RenameThread(const char* name); // 重命名线程函数
{% endhighlight %}

实现在“util.cpp”文件中，入参为：线程名字符串常量。

{% highlight C++ %}
void RenameThread(const char* name)
{
#if defined(PR_SET_NAME) // Linux
    // Only the first 15 characters are used (16 - NUL terminator) // 仅用前 15 个字符（16 - NULL 终止符）
    ::prctl(PR_SET_NAME, name, 0, 0, 0); // 设置线程名为 name，命名超出 15 个字符的部分会被静默截断
#elif (defined(__FreeBSD__) || defined(__OpenBSD__) || defined(__DragonFly__)) // UNIX
    pthread_set_name_np(pthread_self(), name);

#elif defined(MAC_OSX) // Apple
    pthread_setname_np(name);
#else
    // Prevent warnings for unused parameters... // 防止对未使用的参数的警告
    (void)name; // 转为空
#endif
}
{% endhighlight %}

Linux 下调用 prctl 进行线程的命名，该函数详见 [prctl](http://man7.org/linux/man-pages/man2/prctl.2.html)。

7.2.调用 scriptcheckqueue.Thread() 执行脚本验证线程工作函数，该函数定义在“checkqueue.h”文件的 CCheckQueue 类模板中。

{% highlight C++ %}
/** 
 * Queue for verifications that have to be performed.
  * The verifications are represented by a type T, which must provide an
  * operator(), returning a bool.
  *
  * One thread (the master) is assumed to push batches of verifications
  * onto the queue, where they are processed by N-1 worker threads. When
  * the master is done adding work, it temporarily joins the worker pool
  * as an N'th worker, until all jobs are done.
  */ // 必须执行验证的队列。该验证由类型 T 表示，必须提供一个函数调用运算符，返回布尔型。
template <typename T> // 假设一个线程（主）推送批量验证到队列中，它们被 N-1 个工作线程处理。当主线程完成添加工作，它临时加入工作池作为第 N 个工作线程，直到全部工作完成。
class CCheckQueue // 检验队列类模板
{
private:
    //! Mutex to protect the inner state
    boost::mutex mutex; // 保护内部状态的互斥锁

    //! Worker threads block on this when out of work
    boost::condition_variable condWorker; // 工作线程的条件变量

    //! Master thread blocks on this when out of work
    boost::condition_variable condMaster; // 主线程的条件变量

    //! The queue of elements to be processed. // 被处理的元素队列。
    //! As the order of booleans doesn't matter, it is used as a LIFO (stack)
    std::vector<T> queue; // 因为布尔的顺序不重要，它被用作 LIFO （栈）

    //! The number of workers (including the master) that are idle.
    int nIdle; // 空闲的工作线程数（包含主线程）。

    //! The total number of workers (including the master).
    int nTotal; // 工作线程总数（包含主线程）。

    //! The temporary evaluation result.
    bool fAllOk; // 临时评估结果。

    /**
     * Number of verifications that haven't completed yet.
     * This includes elements that are no longer queued, but still in the
     * worker's own batches.
     */ // 还未完成的验证数。包含不在队列中的元素，但仍在工作线程自己的批次中。
    unsigned int nTodo;

    //! Whether we're shutting down.
    bool fQuit; // 我们是否关闭。

    //! The maximum number of elements to be processed in one batch
    unsigned int nBatchSize; // 一批中要处理的最大元素数

    /** Internal function that does bulk of the verification work. */
    bool Loop(bool fMaster = false) // 做大量验证工作的内部函数。
    {
        boost::condition_variable& cond = fMaster ? condMaster : condWorker; // 条件变量，默认为工作线程的
        std::vector<T> vChecks; // 检查列表
        vChecks.reserve(nBatchSize); // 预开辟一批要检测的最大空间
        unsigned int nNow = 0; // 当下时间，初始化为 0
        bool fOk = true; // 状态标志，初始化为 true
        do {
            {
                boost::unique_lock<boost::mutex> lock(mutex); // 上锁
                // first do the clean-up of the previous loop run (allowing us to do it in the same critsect) // 首先清理上一次循环运行（允许我们在相同的临界资源中运行）
                if (nNow) { // 若当前时间非 0，说明非首次循环
                    fAllOk &= fOk; // 更新状态
                    nTodo -= nNow; // 计算待完成的验证数
                    if (nTodo == 0 && !fMaster) // 若验证数为 0 且 非主工作线程
                        // We processed the last element; inform the master it can exit and return the result // 我们处理最后一个元素；通知主线程它可以退出并返回结果
                        condMaster.notify_one(); // 激活主工作线程条件，通知主线程
                } else { // 首次循环
                    // first iteration // 首次迭代
                    nTotal++; // 工作线程数加 1
                }
                // logically, the do loop starts here // 理论上，do 循环从这里开始
                while (queue.empty()) { // 若验证队列（列表）为空
                    if ((fMaster || fQuit) && nTodo == 0) { // 主工作线程 或 将要退出 且未完成数为 0
                        nTotal--; // 工作线程总数减 1
                        bool fRet = fAllOk; // 获取最终状态
                        // reset the status for new work later // 稍后重置新工作线程状态
                        if (fMaster) // 若为主线程
                            fAllOk = true; // 状态置为 true
                        // return the current status
                        return fRet; // 返回当前状态
                    }
                    nIdle++; // 空闲线程数加 1
                    cond.wait(lock); // wait // 线程条件等待锁
                    nIdle--; // 一旦被激活，空闲线程数减 1
                }
                // Decide how many work units to process now. // 决定现在要处理多少工作单元。
                // * Do not try to do everything at once, but aim for increasingly smaller batches so // 不要试图一次完成所有的事情，
                //   all workers finish approximately simultaneously. // 但对于不断增加的小批次以至所有线程基本同时完成
                // * Try to account for idle jobs which will instantly start helping. // 尝试记录即将开始帮助的空闲工作。
                // * Don't do batches smaller than 1 (duh), or larger than nBatchSize. // 不要做小于 1（duh）的批次，或大于 nBatchSize 的批次。
                nNow = std::max(1U, std::min(nBatchSize, (unsigned int)queue.size() / (nTotal + nIdle + 1)));
                vChecks.resize(nNow); // 重置检查列表大小
                for (unsigned int i = 0; i < nNow; i++) { // 遍历检查列表
                    // We want the lock on the mutex to be as short as possible, so swap jobs from the global
                    // queue to the local batch vector instead of copying.
                    vChecks[i].swap(queue.back()); // 取被处理元素队列最后一个元素与检测列表的首个元素交换
                    queue.pop_back(); // 队尾元素出队
                }
                // Check whether we need to do work at all // 检查我们是否需要完成工作
                fOk = fAllOk; // 设置状态位
            }
            // execute work // 执行工作
            BOOST_FOREACH (T& check, vChecks) // 遍历检查列表
                if (fOk) // 若需要检查
                    fOk = check(); // 执行该检查函数
            vChecks.clear(); // 清空检查列表
        } while (true); // do loop
    }

public:
    //! Create a new check queue // 创建一个新的检查队列
    CCheckQueue(unsigned int nBatchSizeIn) : nIdle(0), nTotal(0), fAllOk(true), nTodo(0), fQuit(false), nBatchSize(nBatchSizeIn) {}

    //! Worker thread // 工作线程
    void Thread()
    {
        Loop(); // 调用 Loop 进行循环
    }
    ...
};
{% endhighlight %}

从这里可以看出为什么指定创建 N 个脚本检测线程，实际上只显示创建了 N-1 个。
有一个主工作线程负责往验证队列中添加元素，完成添加工作后就作为第 N 个普通工作线程加入工作线程池，直到完成工作。

7.2.1.获取条件变量的引用，这里进行线程的选择。<br>
7.2.2.上锁。<br>
7.2.3.若首次运行，线程数加 1，否则清理上次循环的资源。<br>
7.2.4.若工作队列为空，工作线程进行条件等待，等待时先解锁。<br>
7.2.5.处理工作单元，根据一批次的大小把队列中的元素换入检查列表中。<br>
7.2.6.遍历检查列表，顺序执行每个待检测的脚本。

7.2.6.调用 check() 函数来进行脚本检测，其重载的函数调用运算符声明在“main.h”文件的 CScriptCheck 类中。

{% highlight C++ %}
/**
 * Closure representing one script verification
 * Note that this stores references to the spending transaction 
 */ // 闭包代表一个脚本验证。注：这会存储对花费交易的引用。
class CScriptCheck // 脚本验证类
{
    ...
    bool operator()(); // 重载的函数调用运算符
    ...
};
{% endhighlight %}

实现在“main.cpp”文件中，没有入参。

{% highlight C++ %}
bool CScriptCheck::operator()() {
    const CScript &scriptSig = ptxTo->vin[nIn].scriptSig; // 获取交易指定输入的脚本签名
    if (!VerifyScript(scriptSig, scriptPubKey, nFlags, CachingTransactionSignatureChecker(ptxTo, nIn, cacheStore), &error)) { // 验证脚本
        return false;
    }
    return true;
}
{% endhighlight %}

这里调用 VerifyScript(scriptSig, scriptPubKey, nFlags, CachingTransactionSignatureChecker(ptxTo, nIn, cacheStore), &error) 函数验证交易指定输入的脚本。
该函数声明在“interpreter.h”文件中。

{% highlight C++ %}
bool EvalScript(std::vector<std::vector<unsigned char> >& stack, const CScript& script, unsigned int flags, const BaseSignatureChecker& checker, ScriptError* error = NULL); // 评测脚本
bool VerifyScript(const CScript& scriptSig, const CScript& scriptPubKey, unsigned int flags, const BaseSignatureChecker& checker, ScriptError* error = NULL); // 验证脚本
{% endhighlight %}

实现在“interpreter.cpp”文件中，入参为：脚本签名，脚本公钥，标志位，缓存交易签名检查对象，待获取的脚本错误信息。

{% highlight C++ %}
bool VerifyScript(const CScript& scriptSig, const CScript& scriptPubKey, unsigned int flags, const BaseSignatureChecker& checker, ScriptError* serror)
{
    set_error(serror, SCRIPT_ERR_UNKNOWN_ERROR); // 设置未知类型错误

    if ((flags & SCRIPT_VERIFY_SIGPUSHONLY) != 0 && !scriptSig.IsPushOnly()) { // 若脚本验证为 SCRIPT_VERIFY_SIGPUSHONLY 且 该脚本操作码并非 PushOnly
        return set_error(serror, SCRIPT_ERR_SIG_PUSHONLY); // 设置错误信息
    }

    vector<vector<unsigned char> > stack, stackCopy; // 栈，栈副本
    if (!EvalScript(stack, scriptSig, flags, checker, serror)) // 评估脚本，通过脚本签名
        // serror is set // 错误已设置
        return false;
    if (flags & SCRIPT_VERIFY_P2SH) // 若为 SCRIPT_VERIFY_P2SH
        stackCopy = stack; // 复制栈副本
    if (!EvalScript(stack, scriptPubKey, flags, checker, serror)) // 再次评估脚本，通过脚本公钥
        // serror is set // 错误已设置
        return false;
    if (stack.empty()) // 若栈为空
        return set_error(serror, SCRIPT_ERR_EVAL_FALSE); // 设置错误码并退出
    if (CastToBool(stack.back()) == false) // 若栈顶元素转换为布尔型后为 false
        return set_error(serror, SCRIPT_ERR_EVAL_FALSE); // 设置错误码为评估 false

    // Additional validation for spend-to-script-hash transactions: // 花费到脚本哈希交易的附加验证：
    if ((flags & SCRIPT_VERIFY_P2SH) && scriptPubKey.IsPayToScriptHash())
    {
        // scriptSig must be literals-only or validation fails // 脚本签名必须是仅文字或验证失败
        if (!scriptSig.IsPushOnly())
            return set_error(serror, SCRIPT_ERR_SIG_PUSHONLY);

        // Restore stack. // 存储栈。
        swap(stack, stackCopy);

        // stack cannot be empty here, because if it was the // 栈在这里不能为空，因为如果它是
        // P2SH  HASH <> EQUAL  scriptPubKey would be evaluated with // P2SH  HASH <> EQUAL 脚本公钥
        // an empty stack and the EvalScript above would return false. // 将使用空栈进行评估，且 EvalScript 将返回 false。
        assert(!stack.empty()); // 验证栈非空

        const valtype& pubKeySerialized = stack.back(); // 获取栈顶元素（序列化的公钥）
        CScript pubKey2(pubKeySerialized.begin(), pubKeySerialized.end()); // 构建公钥脚本对象
        popstack(stack); // 出栈

        if (!EvalScript(stack, pubKey2, flags, checker, serror)) // 使用新的公钥脚本评估脚本
            // serror is set
            return false;
        if (stack.empty()) // 栈若为空
            return set_error(serror, SCRIPT_ERR_EVAL_FALSE);
        if (!CastToBool(stack.back())) // 栈顶元素若为 false
            return set_error(serror, SCRIPT_ERR_EVAL_FALSE);
    }

    // The CLEANSTACK check is only performed after potential P2SH evaluation, // CLEANSTACK 检测仅在潜在的 P2SH 评估后执行，
    // as the non-P2SH evaluation of a P2SH script will obviously not result in // 因为 P2SH 脚本的非 P2SH 评估
    // a clean stack (the P2SH inputs remain). // 显然不会产生干净的堆栈（P2SH 输入仍然存在）。
    if ((flags & SCRIPT_VERIFY_CLEANSTACK) != 0) {
        // Disallow CLEANSTACK without P2SH, as otherwise a switch CLEANSTACK->P2SH+CLEANSTACK // 禁止带 P2SH 的 CLEANSTACK，否则切换 CLEANSTACK->P2SH+CLEANSTACK 将是可能的，
        // would be possible, which is not a softfork (and P2SH should be one). // 这不是一软分叉（P2SH 应该是一个）。
        assert((flags & SCRIPT_VERIFY_P2SH) != 0);
        if (stack.size() != 1) { // 栈的大小必须为 1，只有一个 P2SH
            return set_error(serror, SCRIPT_ERR_CLEANSTACK);
        }
    }

    return set_success(serror); // 返回设置错误信息成功
}
{% endhighlight %}

<p id="serviceQueue-ref"></p>
8.创建轻量级任务调度线程，这部分代码实现在“init.cpp”文件的 AppInit2(...) 函数的第四步 Step 4: application initialization: dir lock, daemonize, pidfile, debug log。

{% highlight C++ %}
bool AppInit2(boost::thread_group& threadGroup, CScheduler& scheduler) // 3.11.程序初始化，共 12 步
{
    ...
    // Start the lightweight task scheduler thread // 8.启动轻量级任务调度线程
    CScheduler::Function serviceLoop = boost::bind(&CScheduler::serviceQueue, &scheduler); // 8.1.Function/bind 绑定类成员函数 serviceQueue 到函数对象 serviceLoop
    threadGroup.create_thread(boost::bind(&TraceThread<CScheduler::Function>, "scheduler", serviceLoop)); // 8.2.线程组 threadGroup 创建一个轻量级任务调度线程
    ...
}
{% endhighlight %}

8.1.Function/bind 绑定线程函数 CScheduler::serviceQueue 到函数对象 serviceLoop。<br>
8.2.创建一个轻量级任务调度线程加入线程组 threadGroup。

线程函数 CScheduler::serviceQueue 声明在“scheduler.h”文件的 CScheduler 类中。

{% highlight C++ %}
class CScheduler // 调度器类
{
public:
    ...
    typedef boost::function<void(void)> Function;
    ...
    // To keep things as simple as possible, there is no unschedule. // 为了使事情尽可能的简单，这里没有调度。

    // Services the queue 'forever'. Should be run in a thread, // “永远”服务队列。应该运行一个线程，
    // and interrupted using boost::interrupt_thread // 并使用 boost::interrupt_thread 打断。
    void serviceQueue(); // scheduler 调度器线程函数循环主体
    ...
private:
    std::multimap<boost::chrono::system_clock::time_point, Function> taskQueue; // 任务队列
    boost::condition_variable newTaskScheduled; // 任务队列条件变量
    mutable boost::mutex newTaskMutex; // 任务队列锁
    int nThreadsServicingQueue; // 记录服务队列的线程数
    ...
}
{% endhighlight %}

实现在“scheduler.cpp”文件中，没有入参。

{% highlight C++ %}
void CScheduler::serviceQueue()
{
    boost::unique_lock<boost::mutex> lock(newTaskMutex); // 1.上锁，保证函数线程安全
    ++nThreadsServicingQueue; // 2.使用队列的线程数加 1

    // newTaskMutex is locked throughout this loop EXCEPT
    // when the thread is waiting or when the user's function
    // is called. // 当线程正在等待或调用用户函数时，newTaskMutex 在整个循环中锁定。
    while (!shouldStop()) { // 3.loop
        try {
            while (!shouldStop() && taskQueue.empty()) { // 3.1.任务队列为空
                // Wait until there is something to do. // 等待直到这里有事可做（任务队列非空）。
                newTaskScheduled.wait(lock); // 等待条件满足
            }

            // Wait until either there is a new task, or until // 等待直到有一个新任务，
            // the time of the first item on the queue: // 或直到队列中首个项目超时：

// wait_until needs boost 1.50 or later; older versions have timed_wait: // wait_until 需要 boost 1.50 或更新版本；旧版本有 timed_wait：
#if BOOST_VERSION < 105000 // 任务队列非空
            while (!shouldStop() && !taskQueue.empty() &&
                   newTaskScheduled.timed_wait(lock, toPosixTime(taskQueue.begin()->first))) { // 3.2.获取新任务的 key（时间），进行等待
                // Keep waiting until timeout // 等待直到超时
            }
#else // 高版本 boost 库
            // Some boost versions have a conflicting overload of wait_until that returns void. // 一些 boost 版本有一个 wait_until 冲突的重载函数，返回 void。
            // Explicitly use a template here to avoid hitting that overload. // 精确使用模板以避免方式发生重载。
            while (!shouldStop() && !taskQueue.empty() &&
                   newTaskScheduled.wait_until<>(lock, taskQueue.begin()->first) != boost::cv_status::timeout) { // 105000 之后的 boost 版本
                // Keep waiting until timeout // 等待直到超时
            }
#endif
            // If there are multiple threads, the queue can empty while we're waiting (another // 如果这里有多个线程，队列可在我们等待时清空
            // thread may service the task we were waiting on). // （另一个线程可在我们等待时取任务）。
            if (shouldStop() || taskQueue.empty()) // 3.3.任务队列被清空
                continue; // 跳过本次循环

            Function f = taskQueue.begin()->second; // 3.4.获取队列中第一个任务
            taskQueue.erase(taskQueue.begin()); // 清除该任务

            {
                // Unlock before calling f, so it can reschedule itself or another task
                // without deadlocking: // 在调用 f 之前解锁，以至于它能重新安排自己或其他任务而不会死锁：
                reverse_lock<boost::unique_lock<boost::mutex> > rlock(lock); // 3.5.在调用 f 前解锁，防止死锁
                f(); // 执行任务
            }
        } catch (...) {
            --nThreadsServicingQueue; // 使用任务队列的线程数减 1
            throw;
        }
    } // end of loop
    --nThreadsServicingQueue; // 4.使用任务队列的线程数减 1
}
{% endhighlight %}

1.任务队列上锁。<br>
2.使用队列的线程数加 1。<br>
3.线程函数循环体。<br>
3.1.当任务队列为空时，等待条件满足。<br>
3.2.超时等待。<br>
3.3.若任务队列被清空，跳过本次循环。<br>
3.4.取出队列中第一个任务。<br>
3.5.解锁并执行该任务。<br>
4.使用任务队列的线程数减 1。

3.5.调用模板类 reverse_lock 创建对象，执行反转锁操作：它提供 RAII 功能，在构造时解锁并在析构时上锁。
另外，它会临时转移所有权，所以互斥锁不能用该锁锁定。其实例永远不会持有锁。详见 [reverse_lock](https://www.boost.org/doc/libs/1_65_0/doc/html/thread/synchronization.html#thread.synchronization.other_locks.reverse_lock)。

未完待续...<br>
请看下一篇[比特币源码剖析（九）](/blog/2018/07/bitcoin-source-anatomy-09.html)。

Thanks for your time.

## 参照

* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
