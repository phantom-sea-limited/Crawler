import json
import logging
import requests
import ssl
from urllib import parse
ssl.HAS_SNI = False
requests.packages.urllib3.disable_warnings()

LOG = logging.getLogger("IMWCR")
LOG.setLevel(logging.INFO)
F = logging.FileHandler("imwcr.log", "a", encoding="utf-8")
F.setFormatter(logging.Formatter('%(asctime)s:%(message)s'))
LOG.addHandler(F)

pro = {
    "http": None,
    "https": None
}

header = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36 Edg/101.0.1210.39",
    "sec-ch-ua": '''" Not A;Brand";v="99", "Chromium";v="101", "Microsoft Edge";v="101"''',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "Windows",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "dnt": "1",
    "accept": "application/json, text/plain, */*",
    "accept-encoding": "utf-8",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "host": "down.imwcr.com",
    "referer": "https://down.imwcr.com/1/main/"
}

IP = "43.154.113.63"


class imwcr():
    def __init__(self) -> None:
        self.url = f"https://{IP}/"
        self.s = requests.session()
        self.s.trust_env = False
        self.s.keep_alive = False

    def get(self, path):
        URL = f"{self.url}{path}"
        r = self.s.get(url=URL, proxies=pro, headers=header, verify=False)
        LOG.info(f"GET:\t{r.status_code}\t{self.url}{path}")
        return r

    def dir(self, path, drive=1):
        if path == "/":
            pass
        else:
            path = parse.quote(path)
        path = f"api/list/{drive}?path={path}&password=&orderBy=&orderDirection="
        r = self.get(path)
        return r

    def list_all(self):
        self.file = []
        self.forder = ["/"]
        while len(self.forder) != 0:
            wait = self.forder.pop(0)
            r = self.dir(wait).json()
            self.Filtering(r)

    def Filtering(self, r: json):
        try:
            for i in r["data"]["files"]:
                for j in i:
                    if j["type"] == "FILE":
                        self.file.append(j["url"])
                    elif j["type"] == "FOLDER":
                        self.forder.append(j["path"] + j["name"])
        except:
            for i in r["data"]["files"]:
                if i["type"] == "FILE":
                    self.file.append(i["url"])
                elif i["type"] == "FOLDER":
                    self.forder.append(i["path"] + i["name"])


if __name__ == "__main__":
    i = imwcr()
    i.list_all()
    print(len(i.file))
    print(len(i.forder))
    with open("imwcr.txt","w",encoding="utf-8") as f:
        for j in i.file:
            f.write(j+"\n")
    # r = i.dir("/")
    # print(r.text)
