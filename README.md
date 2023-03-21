# Crawler

## trxs(原版)[已失效]

前不久看见个同人小说的网站，写了个爬虫爬着玩
这里是小说[网站地址](https://www.trxs123.com)

~~编译完成之后的程序[在这下载](https://github.com/Rcrwrate/Crawler/tree/main/dist)~~

## 同人小说(通用)

大部分同人网站那源码都一样的东西，做了个模板，可以直接爬

使用说明`python Template.py -h`

运行完成之后会生成一个`txt/url.txt`的文件

通过`aria2c -c --input-file=url.txt`执行下载，或者使用IDM等软件进行下载

#### 可以使用的示例网站

- [https://jpxs123.com/](https://jpxs123.com/) IP记录:209.74.105.58
- [https://tongrenquan.org/](https://tongrenquan.org/) IP记录:199.33.126.51

## imwcr[已失效]

针对[https://down.imwcr.com/1/main](https://down.imwcr.com/1/main)编写的爬虫

IP记录:43.154.113.63

####  失效记录 2023.3.21

根据这个IP记录，发现了新的域名，但是502，先记录 down.suucc.com

## zxcs

针对[http://zxcs.me/](http://zxcs.me/)编写的爬虫

IP记录:92.242.62.123
