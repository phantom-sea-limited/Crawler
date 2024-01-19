import sys
import json
import re
from Lib.Epub import Epub


def find_src(k):
    try:
        return re.findall(r'''<img src="([\s\S]+?)" ''', k)[0]
    except:
        pass
    try:
        return re.findall(r'''<img loading="lazy" src="([\s\S]+?)" ''', k)[0]
    except:
        pass
        # print(f"[WARNING]:\t failed using Default regular expression \t {k}")
    try:
        return re.findall(r'''<img alt="([\s\S]+?)" src="([\s\S]+?)"''', k)[0][1]
    except:
        print(f"[WARNING]:\t failed using Senior regular expression \t {k}")
    try:
        tmp = re.findall(r'''src="([\s\S]+?)"''', k)[0]
        print(f"[WARNING]:\t using Unsafety regular expression \t {k}")
        return tmp
    except:
        print(
            f"[Critical]:\t can not find the src with all regular expression \t {k}")


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
    for i in raw["chapterList"]:
        Chaptername = i["name"]
        for j in i["lists"]:
            chap = i["lists"][j]
            content = chap["content"].split("\n")
            text = [{
                "Uid": chap["href"].split("/")[-1],
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
                    text[0]['lines'].append(
                        {
                            "type": "img",
                            "item": find_src(k)
                        }
                    )
            e.add_text(text)

    e.finish()
