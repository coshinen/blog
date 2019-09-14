---
layout: page
title: Tags
permalink: /blog/tags.html
excerpt: Blog tags.
---

{% assign first = site.tags.first %}
{% assign max = first[1].size %}
{% assign min = max %}
{% for tag in site.tags offset:1 %}
  {% if tag[1].size > max %}
    {% assign max = tag[1].size %}
  {% elsif tag[1].size < min %}
    {% assign min = tag[1].size %}
  {% endif %}
{% endfor %}
{% assign diff = max | minus: min %}

<center>
<blockquote id="tagcloud">
{% for tag in site.tags %}
  {% assign temp = tag[1].size | minus: min | times: 36 | divided_by: diff %}
  {% assign base = temp | divided_by: 4 %}
  {% assign remain = temp | modulo: 4 %}
  {% if remain == 0 %}
    {% assign size = base | plus: 9 %}
  {% elsif remain == 1 or remain == 2 %}
    {% assign size = base | plus: 9 | append: '.5' %}
  {% else %}
    {% assign size = base | plus: 10 %}
  {% endif %}
  {% if remain == 0 or remain == 1 %}
    {% assign color = 9 | minus: base %}
  {% else %}
    {% assign color = 8 | minus: base %}
  {% endif %}
  <a href="#{{ tag[0] }}-ref" style="font-size: {{ size }}pt; color: #{{ color }}{{ color }}{{ color }};">{{ tag[0] }}</a>
{% endfor %}
</blockquote>
</center>

{% assign count = 0 %}
{% for tag in site.tags %}
  {% for post in tag.last %}
    {% assign count = count | plus: 1 %}
  {% endfor %}
  {% assign count = count | append: ', ' %}
  {% assign counts = counts | append: count %}
  {% assign count = 0 %}
{% endfor %}

{% assign counts = counts | split: ', ' %}
{% assign idx = 0 %}

{% for tag in site.tags %}
<blockquote>
  <h2 id="{{ tag[0] }}-ref">{{ tag | first }}（{{ counts[idx] }}）<a href="#tagcloud">{% include pages/icon-chevron-up.html %}</a></h2>
    {% assign idx = idx | plus: 1 %}
  <ul class="tag-list">
    {% for post in tag.last %}
    <li>{{ post.date | date: "%Y-%m-%d-" }}<a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul>
</blockquote>
{% endfor %}
