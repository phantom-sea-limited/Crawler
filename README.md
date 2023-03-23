# Crawler

## 同人小说(通用)

大部分同人网站那源码都一样的东西，做了个模板，可以直接爬

**使用说明**
```
(main) $ python Template.py -h
usage: Book Downloader [-h] [-d DOMAIN] [-p PROTOCAL] [-i IP] [-s START] [-e END] [-m MODE] [-c CODE] [-x X]

用于下载一些模板一致的网站

options:
  -h, --help            show this help message and exit
  -d DOMAIN, --domain DOMAIN
                        网站域名
  -p PROTOCAL, --protocal PROTOCAL
                        网站支持协议
  -i IP, --ip IP        网站IP地址
  -s START, --start START
                        起始点
  -e END, --end END     终止点
  -m MODE, --mode MODE  模式
  -c CODE, --code CODE  网页编码
  -x X, --x X           高级设定

Phantom-sea © limited |∀` )
```
此处重点说明几个参数:

- MODE：模式，有两个可选项："default"和"local"</br>default默认模式，爬取即时数据，生成URL文件和Data内的一个数据文件</br>local本地模式，读取Data中的数据文件生成一个URL文件
- X：高级设定，其实就是下载txt页面的路径，有单独几个网站这个路径是他们更改过的</br>比如：[https://www.bixiange.top/](https://www.bixiange.top/)</br>它的下载页面比如 [https://www.bixiange.top/download/15-18931-0.html](https://www.bixiange.top/download/15-18931-0.html)</br>相对应的高级设定是`/download/15`</br>同时，也可以更改此设定达到下载不同分类的目的</br>比如，这里的15是同人分类，其他的分类ID可以自行寻找

运行完成之后会生成一个`txt/url.txt`的文件

通过`aria2c -c --input-file=url.txt`执行下载，或者使用IDM等软件进行下载

#### 可以使用的示例网站

- [https://jpxs123.com/](https://jpxs123.com/) </br>IP记录:209.74.105.58
- [https://tongrenquan.org/](https://tongrenquan.org/) </br>IP记录:199.33.126.50-54
- [https://www.bixiange.top](https://www.bixiange.top) </br>IP记录:无(安全意识强,尚未发现)
- [https://m.bixiange.me/](https://m.bixiange.me/) </br>IP记录:209.74.107.162/209.74.107.163/209.74.107.165


## trxs(原版)[已失效]

前不久看见个同人小说的网站，写了个爬虫爬着玩
这里是小说[网站地址](https://www.trxs123.com)

~~编译完成之后的程序[在这下载](https://github.com/Rcrwrate/Crawler/tree/main/dist)~~

## imwcr[已失效]

针对[https://down.imwcr.com/1/main](https://down.imwcr.com/1/main)编写的爬虫

IP记录:43.154.113.63

####  失效记录 2023.3.21

根据这个IP记录，发现了新的域名，但是502，先记录 down.suucc.com

## zxcs

针对[http://zxcs.me/](http://zxcs.me/)编写的爬虫

IP记录:92.242.62.123
