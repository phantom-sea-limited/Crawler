import zipfile
import os
from .Network import Network


def mkdir(path):
    if os.path.exists(path) != True:
        os.mkdir(path)


def ZIP_EPUB(parent_directory):
    # 遍历目录下的子目录
    for directory in os.listdir(parent_directory):
        dir_path = os.path.join(parent_directory, directory)
        if os.path.isdir(dir_path):
            # 获取子目录的名称
            dir_name = os.path.basename(dir_path)

            # 创建归档文件
            zip_file_path = os.path.join(dir_path, dir_name + ".epub")
            with zipfile.ZipFile(zip_file_path, "w", compression=zipfile.ZIP_STORED) as zipf:
                # 递归地添加子目录中的文件和文件夹到归档文件
                for root, dirs, files in os.walk(dir_path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arc_name = os.path.relpath(file_path, dir_path)
                        zipf.write(file_path, arcname=arc_name)


class Epub():
    def __init__(self, describe, out_path=".tmp", s=Network({})) -> None:
        '''describe = {
            "name":name,
            "author":author,
            "update_time":update_time,
            "coverurl":coverurl,
            "describe":[TextLine1,TextLine2,TextLine3]
        }'''
        self.name = describe["name"]
        self.author = describe["author"]
        self.update_time = describe["update_time"]
        self.out_path = out_path
        self.forder_init()
        self.s = s
        self.list = []
        self.piclist = []
        self.cover(describe["coverurl"], describe["describe"])

    def forder_init(self):
        mkdir(self.out_path)
        mkdir(os.path.join(self.out_path, self.name))
        mkdir(os.path.join(self.out_path, self.name, "META-INF"))
        with open(os.path.join(self.out_path, self.name, "META-INF", "container.xml"), "w", encoding="utf-8") as f:
            f.write('''<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
   </rootfiles>
</container>''')
        with open(os.path.join(self.out_path, self.name, "mimetype"), "w", encoding="utf-8") as f:
            f.write('''application/epub+zip''')
        mkdir(os.path.join(self.out_path, self.name, "OEBPS"))
        mkdir(os.path.join(self.out_path, self.name, "OEBPS", "Images"))
        mkdir(os.path.join(self.out_path, self.name, "OEBPS", "Styles"))
        mkdir(os.path.join(self.out_path, self.name, "OEBPS", "Text"))

    def download(self, url):
        path = os.path.join(self.out_path, self.name,
                            "OEBPS", "Images", url.split("/")[-1])
        if os.path.exists(path) != True:
            while True:
                try:
                    r = self.s.get(url)
                    if r.status_code == 200:
                        with open(path, "wb") as f:
                            f.write(r.content)
                        self.piclist.append(url)
                        break
                    elif r.status_code == 404:
                        print(
                            f"[ERR]:\t{url}\t图片疑似缺失，自动跳过，如果需要手动处理，请手动下载该文件置于{path}")
                        break
                    else:
                        print(f"[ERR]:\t{url}\t网络请求异常，响应代码:{r.status_code}")
                        raise Exception(f"网络请求异常，响应代码:{r.status_code}")
                except:
                    import traceback
                    print(traceback.format_exc())
                    print(f"[ERR]:\t{url}\t下载失败,是否重试[Y/n]")
                    inputs = input('>')
                    if inputs != "n":
                        continue
                    else:
                        print(f'''[TIPS]:您需要手动下载该文件置于{path}''')
                        break
        else:
            self.piclist.append(url)

    def cover(self, url, describe):
        with open(os.path.join(self.out_path, self.name, "OEBPS", "Text", "cover.xhtml"), "w", encoding="utf-8") as f:
            f.write(f'''<?xml version="1.0" encoding="utf-8" standalone="no"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
  "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>书籍封面</title>
</head>
<body>
<div style="text-align: center; padding: 0pt; margin: 0pt;">
<svg xmlns="http://www.w3.org/2000/svg" height="100%" preserveAspectRatio="xMidYMid meet" version="1.1" viewBox="0 0 179 248" width="100%" xmlns:xlink="http://www.w3.org/1999/xlink">
<image height="248" width="179" xlink:href="../Images/{url.split("/")[-1]}"></image>
</svg>
</div>
<h1>{self.name}</h1>
<h2>{self.author}</h2>
<h3>更新时间: {self.update_time}</h3>
<h3>简介:</h3>
''')
            self.download(url)
            for i in describe:
                if i != "":
                    f.write(f"<p>　　{i}</p>\n")
            f.write("</body>\n</html>\n")
        self.list.append({
            "Uid": "cover",
            "url": "Text/cover.xhtml",
            "title": "书籍封面"
        })

    def add_text(self, texts: list):
        '''type可选值:h1、h2、h3、h4、p、img、html

text = [{
    "Uid": "id",
    "title": "title",
    "lines": [
        {
            "item": "msg",
            "type": "p"
        },
        {
            "item": "picUrl",
            "type": "img"
        }
    ]
}]'''
        def add_single_text(text: dict):
            with open(os.path.join(self.out_path, self.name, "OEBPS", "Text", f'''{text["Uid"]}.xhtml'''), "w", encoding="utf-8") as f:
                f.write(f'''<?xml version="1.0" encoding="utf-8" standalone="no"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>{text["title"]}</title>
</head>
<body>
<h3>{text["title"]}</h3>\n''')
                for i in text["lines"]:
                    if i["type"] == "img":
                        self.download(i["item"])
                        f.write(
                            f'''<p>　　<img src="../Images/{i["item"].split("/")[-1]}" alt=""/></p>\n''')
                    elif i["type"] == "html":
                        f.write(f'''{i["item"]}\n''')
                    else:
                        f.write(
                            f'''<{i["type"]}>　　{i["item"]}</{i["type"]}>\n''')
                f.write("</body></html>")
            self.list.append({
                "Uid": text["Uid"],
                "url": f'Text/{text["Uid"]}.xhtml',
                "title": text["title"]
            })

        for i in texts:
            add_single_text(i)

    def finish(self):
        with open(os.path.join(self.out_path, self.name, "OEBPS", "toc.ncx"), "w", encoding="utf-8") as f:
            f.write(f'''<?xml version="1.0" encoding="utf-8" standalone="no" ?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN"
 "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
<head>
<meta content="hbooker:100012892" name="dtb:uid"/>
<meta content="2" name="dtb:depth"/>
<meta content="0" name="dtb:totalPageCount"/>
<meta content="0" name="dtb:maxPageNumber"/>
</head>
<docTitle>
<text>{self.name}</text>
</docTitle>
<docAuthor>
<text>{self.author}</text>
</docAuthor>
<navMap>\n''')
            i = 1
            # while i <= len(self.list):
            #     f.write(
            #         f'''<navPoint id="{self.list[i-1]["Uid"]}" playOrder="{i}"><navLabel><text>{self.list[i-1]["title"]}</text></navLabel><content src="{self.list[i-1]["url"]}" /></navPoint>\n''')
            #     i += 1
            for j in self.list:
                f.write(
                    f'''<navPoint id="{j["Uid"]}" playOrder="{i}"><navLabel><text>{j["title"]}</text></navLabel><content src="{j["url"]}" /></navPoint>\n''')
            f.write("</navMap>\n</ncx>\n")
        with open(f".tmp/{self.name}/OEBPS/content.opf", "w", encoding="utf-8") as f:
            f.write(f'''<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
<dc:identifier id="BookId">{self.author}</dc:identifier>
<dc:title>{self.name}</dc:title>
<dc:creator opf:role="aut">{self.author}</dc:creator>
<dc:language>zh-CN</dc:language>
<dc:publisher></dc:publisher>
</metadata>
<manifest>
<item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml" />
''')
# 可以在此处</metadata>之前加入<meta name="cover" content="cover.jpg"/>,加入后QQ的epub插件会出现异常，移除后正常，但封面章节内的文字依旧不显示
            for i in self.list:
                f.write(
                    f'''<item href="{i["url"]}" id="{i["url"].replace("Text/", "")}" media-type="application/xhtml+xml" />\n''')
            for i in self.piclist:
                f.write(
                    f'''<item href="Images/{i.split("/")[-1]}" id="{i.split("/")[-1]}" media-type="image/jpeg" />\n''')
            f.write('''</manifest>\n<spine toc="ncx">\n''')
            for i in self.list:
                f.write(
                    '''<itemref idref="{}" />\n'''.format(i["url"].replace("Text/", "")))
            f.write(
                '''</spine>\n<guide>\n<reference href="Text/cover.xhtml" title="书籍封面" type="cover" />\n</guide>\n</package>''')
        ZIP_EPUB(self.out_path)


class TXT():
    def __init__(self, name) -> None:
        self.f = open(f".tmp/{name}.txt", "w", encoding="utf-8")

    def add(self, text):
        self.f.write(text.replace("<br />", ""))
        self.f.write("\n")

    def __del__(self):
        self.f.close()


if __name__ == '__main__':
    e = Epub("test", "adw")
    e.cover("ABABA")
    n = Network({})
    e.plugin(n)
    e.add_text("aaa", "wuti", [
               "https://image.nmb.best/image/2022-09-13/6320726e73bd9.jpg"])

    e.finish()
