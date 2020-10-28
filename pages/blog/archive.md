---
layout: page
title: "归档"
permalink: /blog/archive.html
excerpt: This is my blog post archive.
---
<div id="archive">
  <h2>日期</h2>
  <ul>{% assign count = 1 %}{% for post in site.posts %}{% assign yearmonth = post.date | date: '%Y年%m月' %}{% assign prevyearmonth = post.previous.date | date: '%Y年%m月' %}{% if yearmonth == prevyearmonth %}{% assign count = count | plus: 1 %}{% else %}
    <li><a href="#{{ yearmonth }}">{{ yearmonth }}</a>（{{ count }}）</li>{% assign counts = counts | append: count | append: ', ' %}{% assign count = 1 %}{% endif %}{% endfor %}
  </ul>
</div>

{% assign idx = 0 %}{% assign counts = counts | split: ', ' %}{% for post in site.posts %}{% assign yearmonth = post.date | date: '%Y%m' %}{% assign nextyearmonth = post.next.date | date: '%Y%m' %}{% if yearmonth != nextyearmonth %}{% if idx != 0 %}
  </ul>
</div>
{% endif %}
<div class="contents">
  <h2 id="{{ post.date | date: '%Y年%m月' }}">
    {{ post.date | date: '%Y年%m月' }}（{{ counts[idx] }}）
    <a href="#archive" class="right">🔝</a>
  </h2>
  <ul>{% assign idx = idx | plus: 1 %}{% endif %}
    <li><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d-" }}</abbr><a href="{{ post.url }}">{{ post.title }}</a></li>{% endfor %}
  </ul>
</div>
