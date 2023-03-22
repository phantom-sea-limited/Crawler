# -*- coding:utf-8 -*-

from oa import OA
from Upload_new import Upload
import os
import logging
import json
import traceback

LOG = logging.getLogger("COMMAND")
LOG.setLevel(logging.INFO)
F = logging.FileHandler("command.log", "a")
F.setFormatter(logging.Formatter('%(asctime)s:%(message)s'))
LOG.addHandler(F)


def get_list_new(path: str, li: list):
    # current_address = os.path.dirname(os.path.abspath(__file__))
    current_address = path
    for parent, dirnames, filenames in os.walk(current_address):
        # Case1: traversal the directories
        for dirname in dirnames:
            pass
            # print("Parent folder:", parent)
            # print("Dirname:", dirname)
        # Case2: traversal the files
        for filename in filenames:
            # print("Parent folder:", parent)
            # print("Filename:", filename)
            li.append("{}/{}".format(parent, filename))
            # print("{}\\{}".format(parent, filename))


def get_list(path: str, li: list):
    os.chdir(path)
    get_list_new("./", li)
    # get_list_new(path, li)


def main(local_path, remote_path):
    wait = []
    get_list(local_path, wait)
    err = 0
    try:
        while len(wait) != 0:
            err += 1
            if err >= 25:
                break
            LOG.info(
                "[COMMAND]:\t当前轮次{}/25,队列剩余{}个".format(str(err), str(len(wait))))
            OA.refresh()
            Up = Upload()
            wait = Up.upload_list(wait, remote_path)
            LOG.info("[COMMAND]:\t轮次{}结束,队列剩余{}个".format(
                str(err), str(len(wait))))
    except Exception as err:
        LOG.error("[COMMerr]:\t{}".format(err.args))
        print(traceback.format_exc())
    except KeyboardInterrupt:
        pass
    with open("../wait.log", "w") as f:
        json.dump(wait, f)


def continue_up(local_path, remote_path):
    os.chdir(local_path)
    with open("../wait.log", "r") as f:
        wait = json.load(f)
    err = 0
    try:
        while len(wait) != 0:
            err += 1
            if err >= 25:
                break
            LOG.info(
                "[COMMAND]:\t当前轮次{}/25,队列剩余{}个".format(str(err), str(len(wait))))
            OA.refresh()
            Up = Upload()
            wait = Up.upload_list(wait, remote_path)
            LOG.info("[COMMAND]:\t轮次{}结束,队列剩余{}个".format(
                str(err), str(len(wait))))
    except Exception as err:
        LOG.error("[COMMerr]:\t{}".format(err.args))
    except KeyboardInterrupt:
        pass
    with open("../wait.log", "w") as f:
        json.dump(wait, f)


if __name__ == "__main__":
    main("../image", "Upload/Pixiv/image")
