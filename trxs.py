import requests
from bs4 import BeautifulSoup
from lxml import etree
import re

def get_item(ID):
    headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36',
        'Host': 'www.trxs123.com'
    }
    url = "https://www.trxs123.com/txt/2-"+ str(ID)+"-0.html"
    log("="*36+"\n"+url+"\n")
    r = requests.get(url, headers=headers, timeout=10)
    print("{}  响应状态码:{}".format(pre,r.status_code),end="",flush=True)
    if 200 != r.status_code:
        log(r.status_code+"\n")
        return None
    check = re.search('alert',r.text)
    if check != None:
        log("\t\t\t404 not found\n")
        return 1
    return xpath_parse(r.text)

def xpath_parse(html):
    et_html = etree.HTML(html)
    # 查找所有class属性为hd的div标签下的a标签的第一个span标签
    urls = et_html.xpath("/html/body/div[2]/div[2]/div[2]/h2/a[2]")
 
    # movie_list = []
    # 获取每个span的文本
    for each in urls:
        movie = each.attrib
        filename = movie["download"]
        href = movie["href"].strip("aa..")
        href = str("https://www.trxs123.com/e/DownSys") + str(href)
        # movie_list.append(movie)
    
    download_file(filename,href)
    return filename

def download_file(filename,href):
    session = requests.Session()
    session.trust_env = False
    r = requests.get(href) 
    with open(filename,'wb') as fn:
        fn.write(r.content)
    log(filename+"\tOK\n")
    return 0

def log(item):
    with open('log.log','a') as log:
        # log.write('='*16+ i + '='*16 +'\n')
        log.write(item)

def check_out(thing):
    if thing == 1:
        print(pre +"  文件异常      ",end="",flush=True)
    else:  
        print("{}  文件:{}      OK\t\t\t".format(pre,thing),end="",flush=True)

if __name__ == '__main__':
    try:
        start=int(input("请输入起始点："))
        end=int(input("请输入终点："))
    except ValueError:
        print("请输入数字!")
    else:
        for i in range(start, end+1):
            cent = int((float(i) - float(start) + 1) / (float(end) - float(start)) * 100 )
            # if i < 10:
            #     i = "0000" + str(i)
            # elif 10 <= i and i < 100:
            #     i = "000" + str(i)
            # elif 100 <= i and i < 1000:
            #     i = "00" + str(i)
            # else:
            #     i = "0" + str(i)
            global pre
            num = int(float(cent)/2)
            pre = '\r{}%:{}'.format(cent,'#'*num)
            print('{}:  正在准备中'.format(pre),end='',flush=True)
            thing = get_item(i)
            check_out(thing)

