import requests
import json
import time
# import os
# os.chdir("/home/ubuntu/aria/Upload")

au = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_type=code&client_id=***&scope=Files.ReadWrite+offline_access"
code = "0.***.*--***-***-**-**-*-*-*-*-*-*-*-*-*-*-*-*"

with open("oa.json", "r") as f:
    key = json.load(f)


class OA():
    @staticmethod
    def default():
        data = {
            "code": code,
            "client_id": key["client_id"],
            "client_secret": key["client_secret"],
            "grant_type": "authorization_code",
            "scope": "Files.ReadWrite offline_access"
        }

        session = requests.Session()
        session.trust_env = False
        session.keep_alive = False
        r = session.post(
            url="https://login.microsoftonline.com/common/oauth2/v2.0/token", data=data)
        TOKEN = json.loads(r.text)
        TOKEN["expires_on"] = int(time.time()) + int(TOKEN["expires_in"])
        with open("setting.py", "w") as fn:
            json.dump(TOKEN, fn)

    def refresh():
        with open("../Upload/setting.py", "r") as fn:
            r = fn.readline()
        RT = json.loads(r)["refresh_token"]
        data = {
            "refresh_token": RT,
            "client_id": key["client_id"],
            "client_secret": key["client_secret"],
            "grant_type": "refresh_token",
            "scope": "Files.ReadWrite offline_access"
        }
        session = requests.Session()
        session.trust_env = False
        session.keep_alive = False
        r = session.post(
            url="https://login.microsoftonline.com/common/oauth2/v2.0/token", data=data)
        TOKEN = json.loads(r.text)
        TOKEN["expires_on"] = int(time.time()) + int(TOKEN["expires_in"])
        with open("../Upload/setting.py", "w") as fn:
            # fn.write(str(r.text))
            json.dump(TOKEN, fn)

    @staticmethod
    def CRY():
        from CRY import FileAES
        FileAES.main()


if __name__ == "__main__":
    # OA.default()
    OA.refresh()
    # OA.CRY()
