---
layout: page
title: Archive
permalink: /blog/archive.html
excerpt: Blog archive.
---

{% include search.html %}

{% assign count = 1 %}
{% for post in site.posts reversed %}
  {% assign year = post.date | date: '%Y' %}
  {% assign nyear = post.next.date | date: '%Y' %}
  {% if year != nyear %}
    {% assign years = years | append: year | append: ', ' %}
    {% assign counts = counts | append: count | append: ', ' %}
    {% assign count = 1 %}
  {% else %}
    {% assign count = count | plus: 1 %}
  {% endif %}
{% endfor %}
{% assign years = years | split: ', ' | reverse %}
{% assign counts = counts | split: ', ' | reverse %}
{% assign idx = 0 %}
<blockquote id="archive">
  <h2>日期</h2>
{% for year in years %}
  <li><a href="#{{ year }}">{{ year }}（{{ counts[idx] }}）</a></li>
{% assign idx = idx | plus: 1 %}
{% endfor %}
</blockquote>

{% assign i = 0 %}
{% for post in site.posts %}
  {% assign year = post.date | date: '%Y' %}
  {% assign nyear = post.next.date | date: '%Y' %}
  {% if year != nyear %}
    {% if i != 0 %}
  </ul>
</blockquote>
    {% endif %}
<blockquote class="contents">
  <h2 id="{{ post.date | date: '%Y' }}">{{ post.date | date: '%Y' }}（{{ counts[i] }}）<a href="#archive" style="float:right;">{% include post/icon-chevron-up.svg %}</a></h2>
  <ul>
    {% assign i = i | plus: 1 %}
  {% endif %}
    <li><abbr title="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d-" }}</abbr><a href="{{ post.url }}">{{ post.title }}</a></li>
{% endfor %}
  </ul>
</blockquote>
