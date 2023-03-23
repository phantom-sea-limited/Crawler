import argparse
from main import main

parser = argparse.ArgumentParser(
    prog="Pixiv Downloader",
    description='用于下载固定UID的收藏列表',
    epilog='Phantom-sea © limited |∀` )',
)

parser.add_argument('-p', '--path', type=str,
                    dest="path", help='上传路径', default="幻海图书馆/0.爬虫")

args = parser.parse_args()


if args.path.startswith("幻海图书馆/0.爬虫"):
    main("../txt", args.path.replace("\r",""))