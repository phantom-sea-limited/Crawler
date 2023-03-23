import argparse
import os
import re
import time
import json
# from bs4 import BeautifulSoup
from Lib.Network import Network
from Lib.ini import CONF

if not os.path.exists("txt"):
    os.mkdir("txt")
if not os.path.exists("Data"):
    os.mkdir("Data")

parser = argparse.ArgumentParser(
    prog="Book Downloader",
    description='用于下载一些模板一致的网站',
    epilog='Phantom-sea © limited |∀` )',
)
parser.add_argument('-d', '--domain', type=str, help='网站域名')
parser.add_argument("-p", "--protocal",  type=str,
                    help='网站支持协议', default="https://")
parser.add_argument("-i", "--ip", type=str, help='网站IP地址', default='False')
parser.add_argument("-s", "--start", type=int, help="起始点", default=0)
parser.add_argument("-e", "--end", type=int, help="终止点", default=10000)
parser.add_argument("-m", "--mode", type=str, help="模式", default="default")

args = parser.parse_args()


class Static:
    @staticmethod
    def rematch(text):
        r = re.findall(
            r'''</a> <a ([\s\S]+?)>txt下载</a>''',  text)[0].split(" ")
        fin = {}
        for i in r:
            t = i.split("=")[0]
            fin[t] = i.replace(t+"=", "").replace("\"", "")
        return fin

    # @staticmethod #不搞这个了，麻烦
    # def html(text):
    #     et_html = BeautifulSoup(text, "html.parser")

    #     # 查找所有class属性为hd的div标签下的a标签的第一个span标签
    #     urls = et_html.xpath("/html/body/div[2]/div[2]/div[2]/h2/a[2]")

    #     # movie_list = []
    #     # 获取每个span的文本
    #     for each in urls:
    #         movie = each.attrib
    #         filename = (
    #             movie["download"].replace("/", " ").replace("|", " ").replace("？", " ").replace("?", " ")
    #         )  # 修复文件名存在"/"时候产生的问题
    #         href = movie["href"].strip("aa..")
    #         href = str("https://www.trxs123.com/e/DownSys") + str(href)
    #         # movie_list.append(movie)


class template():
    def __init__(self, domain, ip="False", protocal="https://") -> None:
        if ip == "False":
            ip = False  # 为github action作出妥协
        self.s = Network({domain: {"ip": ip}})
        self.c = CONF(domain, conf_path="Data")
        self.url = protocal + domain

    def get(self, path):
        return self.s.get(self.url+path)

    def get_url(self, ID, method=Static.rematch, tryid=0):
        r = self.get(f"/txt/2-{ID}-0.html")
        if r.status_code != 200:
            if tryid >= 3:
                raise Exception("ERROR")
            time.sleep(1)
            tryid += 1
            return self.get_url(ID, method, tryid)
        try:
            return method(r.text)
        except Exception:
            return False

    def run(self, start=0, end=5000):
        F = open(os.path.join("txt", "url.txt"), "w")
        ID_list = self.c.load("Core", "ID")[0]
        if ID_list == False:
            ID_list = []
        else:
            ID_list = json.loads(ID_list)
        while start <= end:
            try:
                fin = self.get_url(start)
            except:
                print(str(start)+"出现问题，请手动校对")
            if fin != False:
                url = self.url + "/e/DownSys/" + fin["href"].split("/")[1]
                F.write(url)
                F.write("\n\tout=" + fin["download"] + "\n")
                if start not in ID_list:
                    ID_list.append(start)
                self.c.add(start, "Download", url)
                self.c.add(start, "Filename", fin["download"])
            start += 1
        self.c.add("Core", "ID", ID_list)
        self.c.save()
        F.close()

    def run_local(self):
        ID_list = self.c.load("Core", "ID")[0]
        if ID_list == False:
            print("未发现有效配置文件，请手动生成")
        ID_list = json.loads(ID_list)
        with open(os.path.join("txt", "url.txt"), "w") as f:
            for i in ID_list:
                f.write(self.c.load(str(i), "download")[0])
                f.write("\n\tout=" + self.c.load(str(i), "filename")[0] + "\n")


if __name__ == "__main__":
    print(args)
    if args.domain == None:
        print("missing key domain")
    else:
        t = template(args.domain, args.ip, args.protocal)
        if args.mode == "default":
            t.run(args.start, args.end)
        elif args.mode == "local":
            t.run_local()
