from session import SESSION
import os
# os.chdir("./Upload")
import logging

LOG = logging.getLogger("UPLOAD")
LOG.setLevel(logging.INFO)
F = logging.FileHandler("upload.log","a")
F.setFormatter(logging.Formatter('%(asctime)s:%(message)s'))
LOG.addHandler(F)
T = logging.StreamHandler()
LOG.addHandler(T)

URLBASE = "https://graph.microsoft.com/v1.0/"


class Upload():
    def __init__(self):
        self.session = SESSION(get_type="upload")
        self.temp = {}
        self.uploadUrl = ""

    def createUploadSession(self, path, name):
        url = URLBASE + "me/drive/root:/" + path + "/" + name + ":/createUploadSession"
        data = {
            "item": {
                "@microsoft.graph.conflictBehavior": "fail",
                "name": name
            }
        }
        r = self.session.post(url, data)
        try:
            tmp = r["error"]["code"]
        except Exception:
            pass
        else:
            if tmp == "nameAlreadyExists":
                raise Exception("文件已存在!")
        self.uploadUrl = r["uploadUrl"]
        self.nextExpectedRanges = r["nextExpectedRanges"]
        return r

    def uploadchunk(self, chunk, msg):
        r = self.session.put(self.uploadUrl, chunk, msg)
        return r

    def upload_one_file(self, file_name, local_path, remote_path):
        self.createUploadSession(remote_path, file_name)
        self.session.put__init__(self.uploadUrl)
        chunks = read_file_by_chunk(os.path.join(local_path,file_name), 1024*1000*10)
        for chunk, msg in chunks:
            tmp = self.uploadchunk(chunk, msg)
            if tmp.__contains__("nextExpectedRanges"):
                pass
            else:
                return tmp

    def upload_forder(self, local_path, remote_path):
        wait_list = []
        get_list(local_path, wait_list)
        for i in wait_list:
            file_path, file_name = os.path.split(i)
            try:
                o = self.upload_one_file(file_name, file_path, os.path.join(remote_path, file_path))
            except Exception as err:
                # print("\n\n[ERROR]:\t{}\\{}\n{}\n".format(file_path, file_name, err.args))
                if err.args[0] == "uploadUrl":
                    LOG.error("\n\n[ERROR]:\tOA权限过期")
                    break
                else:
                    LOG.error("\n\n[ERROR]:\t{}\\{}\n{}\n".format(file_path, file_name, err.args))
            else:
                if o.__contains__("name"):
                    # print("\n\n[OK]:\t{}\\{}\n\n".format(file_path, file_name))
                    LOG.info("\n\n[OK]:\t{}\\{}\n\n".format(file_path, file_name))
                else:
                    # print("\n\n[ERROR]:\t{}\\{}\n\n".format(file_path, file_name))
                    LOG.error("\n\n[ERROR]:\t{}\\{}\n\n".format(file_path, file_name))
                    
    def upload_list(self, wait_list, remote_path):
        while len(wait_list) != 0:
            i = wait_list.pop(0)
            file_path, file_name = os.path.split(i)
            try:
                o = self.upload_one_file(file_name, file_path, os.path.join(remote_path, file_path))
            except Exception as err:
                if err.args[0] == "uploadUrl":
                    LOG.error("\n\n[ERROR]:\tOA权限过期")
                    wait_list.append(i)
                    return wait_list
                if err.args[0] == "空文件不上传!" or err.args[0] == "文件已存在!":
                    LOG.info("\n\n[OK_OTHER]:\t{}\\{}\n{}\n".format(file_path, file_name, err.args[0]))
                else:
                    LOG.error("\n\n[ERROR]:\t{}\\{}\n{}\n".format(file_path, file_name, err.args))
                    wait_list.append(i)
            except KeyboardInterrupt:
                wait_list.append(i)
                return wait_list
            else:
                if o.__contains__("name"):
                    # print("\n\n[OK]:\t{}\\{}\n\n".format(file_path, file_name))
                    LOG.info("\n\n[OK]:\t{}\\{}\n\n".format(file_path, file_name))
                else:
                    # print("\n\n[ERROR]:\t{}\\{}\n\n".format(file_path, file_name))
                    LOG.error("\n\n[ERROR]:\t{}\\{}\n\n".format(file_path, file_name))
                    wait_list.append(i)
        return wait_list




def read_file_by_chunk(file, chunk_size=512):
    all_bytes = os.path.getsize(file)
    if all_bytes == 0:
        raise Exception("空文件不上传!")
    do = 0
    with open(file, mode='rb') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                return
            l = len(chunk)
            msg = {
                "Content-Length": str(l),
                "Content-Range": "bytes {}-{}/{}".format(do, do+l-1, all_bytes)
            }
            do = do + l
            yield chunk, msg


def get_list_old(path: str, li: list):
    forder = os.listdir(path)
    for i in forder:
        if os.path.isdir(i):
            get_list(os.path.join(path, i), li)
        # if os.path.isfile(i):
        else:
            li.append(os.path.join(path, i))
            # print("FILE:\t" + os.path.join(path,i))

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
    get_list_new("./",li)

if __name__ == "__main__":
    up = Upload()
    # # up.createUploadSession("New Forder/0","0.0")
    # chunks = read_file_by_chunk('main.exe', 1024*1000)
    # for chunk, msg in chunks:
    #     up.uploadchunk(chunk, msg)
    # up.upload_forder("main.exe", "", "New Forder/0")
    up.upload_forder("../download/[VCB-Studio] Kobayashi-san Chi no Maid Dragon [Ma10p_1080p]", "[VCB-Studio] Kobayashi-san Chi no Maid Dragon [Ma10p_1080p]")
