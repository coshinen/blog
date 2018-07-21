---
layout: post
title:  "比特币源码剖析（九）"
date:   2018-07-21 23:05:28 +0800
author: mistydew
categories: Blockchain
tags: blockchain bitcoin src
---
![bitcoin](/images/20180504/bitcoin.svg)

## 读在前面
比特币相关的解读目前均采用 [bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)，此版本为官方内置挖矿算法的最后一版。<br>
目前比特币的最新版本为 bitcoin v0.16.0，离区块链 1.0 落地还有些距离。

## 概要
上一篇分析了应用程序初始化中创建脚本验证的线程函数，详见[比特币源码剖析（八）](/2018/07/14/bitcoin-source-anatomy-08)。<br>
本篇主要分析 `Step 4: application initialization: dir lock, daemonize, pidfile, debug log` 第四步应用程序初始中创建轻量级任务调度线程的详细过程。

## 源码剖析

<p id="serviceQueue-ref"></p>
8.创建轻量级任务调度线程，这部分代码实现在“init.cpp”文件的 `AppInit2(...)` 函数的第四步 `Step 4: application initialization: dir lock, daemonize, pidfile, debug log`。

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

8.1.`Function/bind` 绑定线程函数 `CScheduler::serviceQueue` 到函数对象 `serviceLoop`。<br>
8.2.创建一个轻量级任务调度线程加入线程组 `threadGroup`。

线程函数 `CScheduler::serviceQueue` 声明在“scheduler.h”文件的 `CScheduler` 类中。

{% highlight C++ %}
class CScheduler // 调度器类
{
    ...
    // To keep things as simple as possible, there is no unschedule. // 为了使事情尽可能的简单，这里没有调度。

    // Services the queue 'forever'. Should be run in a thread, // “永远”服务队列。应该运行一个线程，
    // and interrupted using boost::interrupt_thread // 并使用 boost::interrupt_thread 打断。
    void serviceQueue(); // scheduler 调度器线程函数循环主体
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
                // Wait until there is something to do.
                newTaskScheduled.wait(lock); // 等待条件满足
            }

            // Wait until either there is a new task, or until // 等待知道有一个新任务，
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
            // thread may service the task we were waiting on). // （另一个线程可在我们等待时提供服务）。
            if (shouldStop() || taskQueue.empty()) // 3.3.清空任务队列
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
3.3.清空任务队列，跳过本次循环。<br>
3.4.取出队列中第一个任务。<br>
3.5.解锁并执行该任务。<br>
4.使用任务队列的线程数减 1。

未完待续...<br>
请看下一篇[比特币源码剖析（十）](/2018/07/28/bitcoin-source-anatomy-10)。

Thanks for your time.

## 参照
* [bitcoin/bitcoin v0.12.1](https://github.com/bitcoin/bitcoin/tree/v0.12.1)
* [...](https://github.com/mistydew/blockchain)
