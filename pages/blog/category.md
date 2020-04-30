---
layout: page
title: "分类"
permalink: /blog/category.html
excerpt: Blog category.
---

{% assign count = 0 %}
{% for category in site.categories %}
  {% for post in category.last %}
    {% assign count = count | plus: 1 %}
  {% endfor %}
  {% assign counts = counts | append: count | append: ', ' %}
  {% assign count = 0 %}
{% endfor %}
{% assign counts = counts | split: ', ' %}
{% assign idx = 0 %}
<div id="category">
  <h2>目录</h2>
{% for category in site.categories %}
  <li><a href="#{{ category[0] }}">{{ category | first }}</a>（{{ counts[idx] }}）</li>
  {% assign idx = idx | plus: 1 %}
{% endfor %}
</div>

{% assign idx = 0 %}
{% for category in site.categories %}
<div class="contents">
  <h2 id="{{ category[0] }}">{{ category | first }}（{{ counts[idx] }}）<a href="#category" style="float:right;">{% include icon/chevron-up.svg %}</a></h2>
    {% assign idx = idx | plus: 1 %}
  <ul>
    {% for post in category.last %}
    <li><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d-" }}</abbr><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul>
</div>
{% endfor %}
