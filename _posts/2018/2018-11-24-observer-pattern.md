---
layout: post
title:  "观察者设计模式"
date:   2018-11-24 21:58:44 +0800
author: Coshin
comments: true
category: 程序人生
tags: Design-Patterns C++
---
观察者模式属于行为型模式，用于内容的发布（推送）和订阅（拉取）。

## 实现

```cpp
#include <list>
#include <iostream>
#include <algorithm>
#include <memory>

typedef int State;

class Subject;

class Observer
{
public:
    virtual ~Observer() {}

    virtual void update(Subject*)=0;
};

class Subject
{
public:
    virtual ~Subject() {}

    void attach(Observer* pOb)
    {
        if (_obList.end() == std::find(_obList.begin(), _obList.end(), pOb))
            _obList.push_back(pOb);
    }
    void detach(Observer* pOb)
    {
        auto it = std::find(_obList.begin(), _obList.end(), pOb);
        if (it != _obList.end())
            _obList.erase(it);
    }

    void notify()
    {
        std::cout << "Subject notify all observers!" << std::endl;
        for (auto & ob : _obList)
        {
            ob->update(this);
        }
    }

    virtual State getState()=0;
    virtual void setState(State)=0;

private:
    std::list<Observer*> _obList;
    //std::list<Observer*> _vipObList;
    //std::list<Observer*> _svipObList;
};

class ConcreateObserver : public Observer
{
public:
    //void update(State state); // push mode: updated
    void update(Subject* subject) // pull mode: to update
    {
        State state = subject->getState();
        if (_state != state) {
            _state = state;
            std::cout << "Observer update state: " << _state << std::endl;
        }
    }

private:
    State _state;
};

class ConcreateSubject : public Subject
{
public:
    State getState()
    { return _state; }
    void setState(State state)
    {
        if (_state != state) {
            _state = state;
            notify();
        }
    }

private:
    State _state;
};

int main(void)
{
    std::unique_ptr<Subject> pSubject(new ConcreateSubject);

    std::unique_ptr<Observer> pOb1(new ConcreateObserver);
    std::unique_ptr<Observer> pOb2(new ConcreateObserver);
    std::unique_ptr<Observer> pOb3(new ConcreateObserver);
    std::unique_ptr<Observer> pOb4(new ConcreateObserver);

    pSubject->attach(pOb1.get());
    pSubject->attach(pOb2.get());
    pSubject->attach(pOb3.get());
    pSubject->attach(pOb4.get());

    pSubject->setState(1);

    pSubject->detach(pOb3.get());
    pSubject->setState(2);

    return 0;
}
```

测试结果：

```shell
Subject notify all observers!
Observer update state: 1
Observer update state: 1
Observer update state: 1
Observer update state: 1
Subject notify all observers!
Observer update state: 2
Observer update state: 2
Observer update state: 2
```

## 参考链接

* [Observer pattern - Wikipedia](https://en.wikipedia.org/wiki/Observer_pattern){:target="_blank"}
