# coding=utf-8

import re


def remove_html_tags(text):
    "匹配并剔除除了 <img> 标签之外的所有 HTML 标签"
    pattern = r'<(?!img\b)[^>]*>'
    clean_text = re.sub(pattern, '', text)
    return clean_text


