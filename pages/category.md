---
layout: page
title: Category
permalink: /blog/category.html
excerpt: It's blog category.
---

{% assign count = 0 %}
{% for category in site.categories %}
  {% for post in category.last %}
    {% if post.hidden == true %}
    {% else %}
      {% assign count = count | plus: 1 %}
    {% endif %}
  {% endfor %}
  {% assign count = count | append: ', ' %}
  {% assign counts = counts | append: count %}
  {% assign count = 0 %}
{% endfor %}

{% assign counts = counts | split: ', ' %}
{% assign idx = 0 %}

<blockquote class="contents">
<h2 align="center" id="contents">Contents</h2>
{% for category in site.categories %}
  <div><li><a href="#{{ category[0] }}-ref">{{ category | first }}（{{ counts[idx] }}）</a></li></div>
  {% assign idx = idx | plus: 1 %}
{% endfor %}
</blockquote>

{% assign idx = 0 %}

{% for category in site.categories %}
<blockquote>
  <h2 id="{{ category[0] }}-ref">{{ category | first }}（{{ counts[idx] }}）<a href="#contents">{% include pages/icon-chevron-up.html %}</a></h2>
    {% assign idx = idx | plus: 1 %}
  <ul class="category-list">
    {% for post in category.last %}
      {% if post.hidden == true %}
      {% else %}
    <li>{{ post.date | date: "%Y-%m-%d-" }}<a href="{{ post.url }}">{{ post.title }}</a></li>
      {% endif %}
    {% endfor %}
  </ul>
</blockquote>
{% endfor %}
