# coding=utf-8

import re
import sys
import json
from Lib.Epub import Epub


def remove_html_tags(text):
    "匹配并剔除除了 <img> 标签之外的所有 HTML 标签"
    pattern = r'<(?!img\b)[^>]*>'
    clean_text = re.sub(pattern, '', text)
    return clean_text


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
    })
    i = 1
    while i < len(raw["chapterList"]):
        Chaptername = raw["chapterList"][i]["name"]
        for j in raw["chapterList"][i]["lists"]:
            chap = raw["chapterList"][i]["lists"][j]
            content = remove_html_tags(chap["content"]).split("\n")
            text = [{
                "Uid": chap["href"].split("/")[-2],
                "title": f'{Chaptername}-{chap["name"]}',
                "lines": []
            }]
            for k in content:
                k = k.replace('\u3000', " ")
                if "<img" not in k:
                    text[0]['lines'].append({
                        "type": "p",
                        "item": k
                    })
                else:
                    try:
                        text[0]['lines'].append(
                            {
                                "type": "img",
                                "item": re.findall(r'''<img referrerpolicy="no-referrer" src="([\s\S]+?)">''', k)[0]
                            }
                        )
                    except:
                        print(k)
                        print(chap)
            e.add_text(text)
        i += 1
    e.finish()
