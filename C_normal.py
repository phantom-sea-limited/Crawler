from CRY.CRY_RSA import CRYRSA
import argparse
import os

parser = argparse.ArgumentParser(
    prog="Pixiv Downloader",
    description='用于下载固定UID的收藏列表',
    epilog='Phantom-sea © limited |∀` )',
)
parser.add_argument('--private', type=str,
                    dest="private", help='设置private key', default=False)
parser.add_argument('--public', type=str,
                    dest="public", help='设置public key', default=False)
parser.add_argument('--mode', type=str,
                    dest="mode", help='加密or解密', default=False)


def load_and_save(path, m: str = ""):
    if m == "":
        with open(path, "r") as f:
            return f.read()
    else:
        with open(path, "w") as f:
            f.write(m)


def main(args):
    # c = Cry(args.private, args.public)
    c = CRYRSA()
    # c.create_rsa_key()

    filelist = [
        os.path.join("Upload", "oa.json"),
        os.path.join("Upload", "setting.py"),
    ]
    if args.mode == "jiami":
        for i in filelist:
            load_and_save(i, c.encrypt_more(load_and_save(i)))
    elif args.mode == "jiemi":
        for i in filelist:
            load_and_save(i, c.decrypt_more(load_and_save(i)))
    elif args.mode == "create":
        c.create_rsa_key()


args = parser.parse_args()
main(args)
