from re import S
import threading
import requests
import logging
import os

LOG = logging.getLogger("FC")
LOG.setLevel(logging.INFO)
F = logging.FileHandler("FileControl.log", "a", encoding="utf-8")
F.setFormatter(logging.Formatter('%(asctime)s:%(message)s'))
LOG.addHandler(F)

header = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36 Edg/96.0.1054.53",
}

class FileDownload(threading.Thread):
    def __init__(self, url, path):
        super(FileDownload, self).__init__()  # 重构run函数必须要写
        self.url = url
        self.path = path
        if os.path.exists(path) != True:
            os.mkdir(path)

    def run(self):
        session = requests.Session()
        session.trust_env = False
        try:
            r = session.get(self.url, headers=header)
            with open(self.path + "/" +self.url.split("/")[-1], "wb") as fn:
                fn.write(r.content)
            LOG.info(f"[DOWNLOAD][OK]\t\t\t{self.url}\n")
        except Exception as e:
            LOG.error(F"[DOWNLOAD][ERROR]\t\t\t{self.url}\t{e.args}\n")

class zip_7z():
    def __init__(self,path = "C:\\Program Files\\7-Zip\\7z.exe") -> None:
        self.path = path
    
    def unzip(self,path,path_to_path):
        pass
if __name__ == "__main__":
    Z = zip_7z()
    