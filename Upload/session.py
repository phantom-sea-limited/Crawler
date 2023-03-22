# -*- coding:utf-8 -*-
import requests
import json
# from Crypto.Cipher import AES
import base64
import logging
LOG = logging.getLogger("SESSION")
LOG.setLevel(logging.WARNING)
T = logging.StreamHandler()
LOG.addHandler(T)


proxies = {
    "http": None,
    "https": None,
}


class SESSION():
    def __init__(self, get_type="internet"):
        if get_type == "internet":
            self.AU = self.get_AU()
        elif get_type == "single":
            self.AU = ""
        else:
            self.AU = self.get_AU_locol()
        # self.log = {}
        self.header = {
            "Authorization": self.AU,
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        }

    def get_AU_locol(self):
        with open("../Upload/setting.py", "r") as fn:
            # r = fn.readline()
            AU = json.load(fn)["access_token"]
        return AU

    def get(self, url):
        session = requests.Session()
        session.trust_env = False
        session.keep_alive = False
        r = session.get(headers=self.header, url=url, proxies=proxies, timeout=(120,180))
        # self.log = r
        LOG.info("GET:\t" + r.url + "\n\t" + r.text)
        r = json.loads(r.text)
        return r

    def get_normal(self, url):
        session = requests.Session()
        session.trust_env = False
        session.keep_alive = False
        r = session.get(url=url, proxies=proxies, timeout=(120,180))
        LOG.info("GET:\t" + r.url + "\n\t" + r.text)
        return r.json()
        
    def post(self, url, Data):
        session = requests.Session()
        session.trust_env = False
        session.keep_alive = False
        headers = self.header.copy()
        headers["Content-Type"] = "application/json"
        r = session.post(headers=headers, url=url, json=Data, proxies=proxies, timeout=(120,180))
        LOG.info("POST:\t" + r.url + "\nDATA:\t" + str(Data) + "\n\t" + r.text)
        return json.loads(r.text)

    def delete(self, url):
        session = requests.Session()
        session.trust_env = False
        session.keep_alive = False
        headers = self.header.copy()
        del headers["Authorization"]
        r = session.delete(headers=headers, url=url, proxies=proxies, timeout=(120,180))
        LOG.info("DELETE:\t" + r.url + "\n\t" + str(r.status_code))
        return r.text

    def put__init__(self, url):
        try:
            self.session.close()
        except Exception:
            pass
        self.session = requests.Session()
        self.session.trust_env = False
        self.session.keep_alive = True

    def put(self, url, data: bytes, header: dict):
        # session = requests.Session()
        # session.trust_env = False
        # session.keep_alive = False
        headers = self.header.copy()
        del headers["Authorization"]
        for i in header:
            headers[i] = header[i]
        r = self.session.put(headers=headers, url=url, data=data, proxies=proxies, timeout=(120,180))
        LOG.info("PUT:\t" + str(header) + "\n\t" + str(r.text))
        return r.text

# with open("api.phantom-sea-limited.ltd/token/token","r") as fn:
#     temp = fn.readline()
#     AU = decrypt(temp).strip("\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00")
    # print(AU)


def get(url):
    session = requests.Session()
    session.trust_env = False
    session.keep_alive = False
    r = session.get(headers=header, url=url)
    r = json.loads(r.text)
    return r


if __name__ == "__main__":
    se = SESSION(get_type="")

    print(se.AU)
