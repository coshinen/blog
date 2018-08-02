---
layout: page
title: Category
permalink: /category.html
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

{% for category in site.categories %}
<p style="line-height:8px"><a href="{{ site.JB.tags_path }}#{{ category[0] }}-ref">{{ category | first }} [{{ counts[idx] }}]</a></p>
    {% assign idx = idx | plus: 1 %}
{% endfor %}

{% assign idx = 0 %}

{% for category in site.categories %}
<h2 id="{{ category[0] }}-ref">{{ category | first }} ({{ counts[idx] }})</h2>
    {% assign idx = idx | plus: 1 %}
<ul class="arc-list">
    {% for post in category.last %}
      {% if post.hidden == true %}
      {% else %}
        <li>{{ post.date | date: "%Y-%m-%d-" }}<a href="{{ post.url }}">{{ post.title }}</a></li>
      {% endif %}
    {% endfor %}
</ul>
{% endfor %}
