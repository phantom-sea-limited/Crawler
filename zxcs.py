import json
import logging
import requests
import ssl
ssl.HAS_SNI = False
requests.packages.urllib3.disable_warnings()
import execjs
import re

LOG = logging.getLogger("ZXCS")
LOG.setLevel(logging.INFO)
F = logging.FileHandler("zxcs.log", "a", encoding="utf-8")
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
    "host": "zxcs.me",
    "referer": "http://zxcs.me/",
    "cookie":"security_session_verify=453a822f276fca5c9d8b898130b7e7bd; srcurl=687474703a2f2f7a7863732e6d652f"
}

IP = "92.242.62.123"

class ZXCS():
    def __init__(self) -> None:
        self.url = f"http://{IP}/"
        self.s = requests.session()
        self.s.trust_env = False
        self.s.keep_alive = False
    
    def get(self, path):
        URL = f"{self.url}{path}"
        r = self.s.get(url=URL, proxies=pro, headers=header, verify=False)
        LOG.info(f"GET:\t{r.status_code}\t{self.url}{path}")
        return r
    
    def antiBOT(self):
        r = self.s.get(self.url,verify=False,headers=header,allow_redirects=False)
        cookies = r.headers["Set-Cookie"].split(";")[0]
        LOG.info(f"ANTIBOT:\t{r.status_code}\t{self.url}\t{cookies}")
        cookies = "{\"" + cookies.replace(";","\",\"").replace("=","\":\"").replace(" ","") + "\"}"
        Cookies = json.loads(cookies)
        for i in Cookies:
            cookies = i + "=" + Cookies[i] + "; srcurl=687474703a2f2f7a7863732e6d652f"
        header["Cookie"] = cookies
        
        r = self.s.get(self.url + "?security_verify_data=" + self.stringToHex(Cookies["security_session_verify"]),verify=False,headers=header,allow_redirects=False)
        cookies = r.headers["Set-Cookie"].split(";")[0]
        LOG.info(f"ANTIBOT:\t{r.status_code}\t{self.url}\t{cookies}")
        
    @staticmethod
    def stringToHex(str):
        js = '''function stringToHex(str) {
                var val = "";
                for (var i = 0; i < str.length; i++) {
                    if (val == "")
                        val = str.charCodeAt(i).toString(16);
                    else
                        val += str.charCodeAt(i).toString(16);
                }
                return val;
            }'''
        run = execjs.compile(js)
        return run.call("stringToHex",str)
    
    def get_download_url(self,id):
        r = self.get(path=f"download.php?id={id}")
        url = re.findall(r'''<span class="downfile"><a href="([\s\S]+?)" target="_blank">''',r.text)
        return url




if __name__ == "__main__":
    z = ZXCS()
    # z.antiBOT()
    # print(z.stringToHex('http://zxcs.me/'))
    print(z.get_download_url("12902"))