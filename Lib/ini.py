import os
import time
import configparser
from .log import Log
import traceback

l = Log("Conf", log_level=50)


class CONF():
    def __init__(self, name="conf", conf_path=".log"):
        self.LOG = ""
        if not os.path.exists(conf_path):
            os.makedirs(conf_path)
        self.CONF = configparser.RawConfigParser()  # 不检测存在%的内容，否则抛出异常
        # self.CONF = configparser.ConfigParser()
        self.F = os.path.join(f"{conf_path}", f"{name}.ini")
        try:
            self.CONF.read(self.F, encoding="utf-8")
        except Exception:
            with open(self.F) as f:
                item = f.read()
            l.error(
                f"[CONF][ERROR]:\t\t{self.F}\t\t\n{item}\n{traceback.format_exc()}")
            print("[CONF][ERROR]: .ini文件结构异常或不存在! 即将重新进行初始化")
            self.save()

    def add(self, sec, key, item):
        try:
            self.CONF.set(sec, key, str(item))
        except configparser.NoSectionError as err:
            self.CONF.add_section(err.section)
            self.CONF.set(sec, key, str(item))
        self.add_time(sec)

    def add_time(self, sec):
        i = time.asctime(time.localtime(time.time()))
        self.CONF.set(sec, "time", i)

    def remove(self, sec, key):
        try:
            self.CONF.remove_option(sec, key)
        except configparser.NoSectionError as err:
            # print("键值缺失!")
            l.warning("[CONF][WARN]:\t\t" + str(err))
            return False

    def load(self, sec, key):
        try:
            return self.CONF.get(sec, key), self.load_time(sec)
        except configparser.NoSectionError as err:
            # print("键值缺失!")
            l.warning("[CONF][WARN]:\t\t" + str(err))
            return False, False
        except configparser.NoOptionError as err:
            # print("键值缺失!")
            l.warning("[CONF][WARN]:\t\t" + str(err))
            return False, False

    def load_time(self, sec):
        return self.CONF.get(sec, "time")

    def save(self):
        self.CONF.write(open(self.F, "w+", encoding="utf-8"))


if __name__ == "__main__":
    conf = CONF()
    conf.add("Stellaris", "test", "0")
    conf.remove("S", "0")
    print(conf.LOG)
    conf.save()
