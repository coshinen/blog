---
layout: post
title:  "设计模式—工厂模式"
date:   2018-11-10 17:16:10 +0800
author: mistydew
comments: true
category: 程序人生
tags: DesignPatterns C/C++
---
工厂模式是 23 种设计模式之一，属于创建型模式，用于批量实例化对象。

下面均为抽象工厂的实现。

## 实现一：静态工厂

```cpp
#include <math.h>

class Figure
{
public:
    virtual float area()=0;
};

class Rectangle : public Figure
{
public:
    Rectangle(float flength, float fwidth) : _flength(flength), _fwidth(fwidth) {}

    virtual float area()
    { return _flength * _fwidth; }

private:
    float _flength;
    float _fwidth;
};

class Circle : public Figure
{
public:
    Circle(float fradius) : _fradius(fradius) {}

    virtual float area()
    { return PI * _fradius * _fradius; }

private:
    float _fradius;
    static float PI;
};

float Circle::PI = 3.14159;

class Triangle : public Figure
{
public:
    Triangle(float fa, float fb, float fc) : _fa(fa), _fb(fb), _fc(fc) {}

    virtual float area()
    {
        float p = (_fa + _fb + _fc) / 2; // Heron's formula
        return sqrt(p * (p - _fa) * (p - _fb) * (p - _fc));
    }

private:
    float _fa;
    float _fb;
    float _fc;
};

class StaticFactory
{
public:
    static Rectangle * getRectangle()
    {
        int length = 5;
        int width = 6;
        return new Rectangle(length, width);
    }

    static Circle * getCircle()
    {
        int radius = 10;
        return new Circle(radius);
    }

    static Triangle * getTriangle()
    {
        int a = 3;
        int b = 4;
        int c = 5;
        return new Triangle(a, b, c);
    }
};
```

缺点：
1. 违反单一职责原则。
2. 违反开闭原则（即对扩展开放，对修改关闭）。

适用于创建对象的类型少的情况。

## 实现二：工厂方法

```cpp
#include <math.h>

class Figure
{
public:
    virtual float area()=0;
};

class Rectangle : public Figure
{
public:
    Rectangle(float flength, float fwidth) : _flength(flength), _fwidth(fwidth) {}

    virtual float area()
    { return _flength * _fwidth; }

private:
    float _flength;
    float _fwidth;
};

class Circle : public Figure
{
public:
    Circle(float fradius) : _fradius(fradius) {}

    virtual float area()
    { return PI * _fradius * _fradius; }

private:
    float _fradius;
    static float PI;
};

float Circle::PI = 3.14159;

class Triangle : public Figure
{
public:
    Triangle(float fa, float fb, float fc) : _fa(fa), _fb(fb), _fc(fc) {}

    virtual float area()
    {
        float p = (_fa + _fb + _fc) / 2;
        return sqrt(p * (p - _fa) * (p - _fb) * (p - _fc));
    }

private:
    float _fa;
    float _fb;
    float _fc;
};

// Factory
class Factory
{
public:
    virtual Figure * create()=0;
};

class RectangleFactory : public Factory
{
public:
    Figure * create()
    {
        int length = 5;
        int width = 6;
        return new Rectangle(length, width);
    }
};

class CircleFactory : public Factory
{
public:
    Figure * create()
    {
        int radius = 10;
        return new Circle(radius);
    }
};

class TriangleFactory : public Factory
{
public:
    Figure * create()
    {
        int a = 3;
        int b = 4;
        int c = 5;
        return new Triangle(a, b, c);
    }
};
```

优点：
1. 满足单一职责原则。
2. 满足开闭原则。

适用场景：
1. 针对复杂对象。
2. 针对一系列的对象。

## 参考链接

* [Factory method pattern - Wikipedia](https://en.wikipedia.org/wiki/Factory_method_pattern){:target="_blank"}
* [Abstract factory pattern - Wikipedia](https://en.wikipedia.org/wiki/Abstract_factory_pattern){:target="_blank"}
