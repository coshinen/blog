---
layout: page
title: Category
permalink: /blog/category.html
excerpt: Blog category.
---

{% assign count = 0 %}
{% for category in site.categories %}
  {% for post in category.last %}
    {% assign count = count | plus: 1 %}
  {% endfor %}
  {% assign count = count | append: ', ' %}
  {% assign counts = counts | append: count %}
  {% assign count = 0 %}
{% endfor %}

{% assign counts = counts | split: ', ' %}
{% assign idx = 0 %}

<blockquote class="category" id="contents">
<h2 align="center">Contents</h2>
{% for category in site.categories %}
  <div><li><a href="#{{ category[0] }}">{{ category | first }}</a>（{{ counts[idx] }}）</li></div>
  {% assign idx = idx | plus: 1 %}
{% endfor %}
</blockquote>

{% assign idx = 0 %}

{% for category in site.categories %}
<blockquote class="contents">
  <h2 id="{{ category[0] }}">{{ category | first }}（{{ counts[idx] }}）<a href="#contents">{% include pages/icon-chevron-up.html %}</a></h2>
    {% assign idx = idx | plus: 1 %}
  <ul class="category-list">
    {% for post in category.last %}
    <li>{{ post.date | date: "%Y-%m-%d-" }}<a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul>
</blockquote>
{% endfor %}
