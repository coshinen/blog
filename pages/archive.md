---
layout: page
title: Archive
permalink: /blog/archive.html
---

{% include search.html %}

{% assign count = 1 %}
{% for post in site.posts reversed %}
  {% assign year = post.date | date: '%Y' %}
  {% assign nyear = post.next.date | date: '%Y' %}
  {% if year != nyear %}
    {% assign count = count | append: ', ' %}
    {% assign counts = counts | append: count %}
    {% assign count = 1 %}
  {% else %}
    {% assign count = count | plus: 1 %}
  {% endif %}
{% endfor %}

{% assign counts = counts | split: ', ' | reverse %}
{% assign i = 0 %}

{% for post in site.posts %}
  {% assign year = post.date | date: '%Y' %}
  {% assign nyear = post.next.date | date: '%Y' %}
  {% if year != nyear %}
    {% if i != 0 %}
  </ul>
</blockquote>
    {% endif %}
<blockquote>
  <h2>{{ post.date | date: '%Y' }} ({{ counts[i] }})</h2>
  <ul class="archive-list">
    {% assign i = i | plus: 1 %}
  {% endif %}
  {% if post.hidden == true %}
  {% else %}
    <li>{{ post.date | date: "%Y-%m-%d-" }}<a href="{{ post.url }}">{{ post.title }}</a></li>
  {% endif %}
{% endfor %}
