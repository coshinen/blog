---
layout: page
title: Category
permalink: /blog/category.html
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

<p id="category"></p>
<blockquote>
<details>
<summary>Contents</summary>
{% for category in site.categories %}
<div><a href="#{{ category[0] }}-ref">{{ category | first }} [{{ counts[idx] }}]</a></div>
    {% assign idx = idx | plus: 1 %}
{% endfor %}
</details>
</blockquote>

{% assign idx = 0 %}

{% for category in site.categories %}
<blockquote>
<h2 id="{{ category[0] }}-ref">{{ category | first }} ({{ counts[idx] }})<a href="#category">{% include icon/chevron-up.html %}</a></h2>
    {% assign idx = idx | plus: 1 %}
<ul class="arc-list">
    {% for post in category.last %}
      {% if post.hidden == true %}
      {% else %}
        <li>{{ post.date | date: "%Y-%m-%d-" }}<a href="{{ post.url }}">{{ post.title }}</a></li>
      {% endif %}
    {% endfor %}
</ul>
</blockquote>
{% endfor %}
