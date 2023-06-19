# coding=utf-8

from Lib.Network import Network
from Lib.Epub import Epub
import re
import sys
import json


def remove_html_tags(text):
    # 匹配并剔除除了 <img> 标签之外的所有 HTML 标签
    pattern = r'<(?!img\b)[^>]*>'
    clean_text = re.sub(pattern, '', text)
    return clean_text


n = Network({})
n.changeHeader({"Referer": "https://www.lightnovel.us/"})

if len(sys.argv) != 2:
    print("缺失json文件")
else:
    file = sys.argv[1]

    with open(file, "r", encoding="utf-8") as f:
        raw = json.load(f)

    e = Epub(describe={
        "name": raw["bookname"],
        "author": raw["author"],
        "update_time": raw["book_uptime"],
        "coverurl": raw["cover"],
        "describe": raw["details"].split("\n")
    }, s=n)

    for j in raw["chapterList"][0]:
        content = remove_html_tags(j["content"]).split("\n")
        text = [{
            "Uid": j["href"].split("/")[-1],
            "title": j["name"],
            "lines": []
        }]
        text[0]["lines"].append(
            {
                "type": "img",
                "item": j["cover"]
            }
        )
        i = -1
        for k in content:
            i += 1
            k = k.replace('&nbsp;', " ").replace(
                "&amp;", "&")

            if "<img" not in k:
                if i <= 25:
                    if "轻之国度" not in k and "禁" not in k and "转载" not in k:
                        text[0]['lines'].append({
                            "type": "p",
                            "item": k
                        })
                else:
                    text[0]['lines'].append({
                        "type": "p",
                        "item": k
                    })
            else:
                text[0]['lines'].append(
                    {
                        "type": "img",
                        "item": re.findall(r'''<img loading="lazy" src="([\s\S]+?)" ''', k)[0]
                    }
                )
        e.add_text(text)

    e.finish()
