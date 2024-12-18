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


def remove_all_html_tags(text):
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text).replace(" ", "")


def find_src(k):
    try:
        return re.findall(r'''<img referrerpolicy="no-referrer" src="([\s\S]+?)">''', k)[0]
    except:
        print(f"[WARNING]:\t failed using Default regular expression \t {k}")
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

def write_to_txt(filename, content):
    with open(filename, 'w', encoding='utf-8') as f:
        for line in content:
            # 去掉行首的 'p:' 前缀
            if line.startswith('p: '):
                line = line[3:]  # 去掉 'p: ' 的前缀
            f.write(f"{line}\n")

# 假设 raw 是你的 JSON 数据
e = []  # 用于存储所有章节的内容
i = 1
while i < len(raw["chapterList"]):
    Chaptername = raw["chapterList"][i]["name"]
    for j in raw["chapterList"][i]["lists"]:
        chap = raw["chapterList"][i]["lists"][j]
        content = remove_html_tags(chap["content"]).split("\n")
        
        # 将章节信息添加到 e 列表
        e.append(f"{Chaptername} - {chap['name']}\n")
        
        for k in content:
            k = k.replace('\u3000', " ")
            if "<img" not in k:
                e.append(f"p: {k}")  # 添加段落文本
            else:
                e.append(f"img: {find_src(k)}")  # 添加图片链接
                k = remove_all_html_tags(k)  # 处理跟在图片后的文本
                if k != "":
                    e.append(f"p: {k}")  # 添加后续文本

    i += 1

# 使用 raw["bookname"] 作为文件名
book_filename = f"{raw['bookname']}.txt"  # 确保文件名有效
write_to_txt(book_filename, e)


