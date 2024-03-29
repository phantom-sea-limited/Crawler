# Crawler

快速目录

1. [sangtacviet](#sangtacviet)
2. [nhimmeocf-刺猬猫分享](#nhimmeocf-刺猬猫分享)
3. [轻之国度](#轻之国度)
4. [(正版漫画)heros-web.com](#heros-webcom)
5. [同人小说通用](#同人小说通用)
6. [imwcr](#imwcr)
7. [已失效内容](#已失效内容)

# **sangtacviet**

### 相关文件

> sangtacviet.user.js
>
> sangtacviet.py

**使用说明**

请使用[Tampermonkey](https://www.tampermonkey.net/)安装此用户脚本

[**点击安装脚本**](https://github.com/phantom-sea-limited/Crawler/raw/main/sangtacviet.user.js)

[**点击安装脚本(镜像)**](https://static.sirin.top/https://github.com/phantom-sea-limited/Crawler/raw/main/sangtacviet.user.js)

安装后，在ciweimao/sfacg/qidian/等等(未列出的来源未提供优化)书籍页面会出现一个黑色的下载框，点击就会自动操作，如果点击后没有反应，可以打开控制台康康有没有报错

![image](https://github.com/phantom-sea-limited/Crawler/assets/46920034/e7bffa86-cb0c-44f3-b79f-d8a6392df331)

**已支持云端服务,将每一次用户的结果上传至云端,可以节约所有人的时间,希望各位保留这个功能.同时,所有文件均公开,可以通过上图所示按钮访问**

1. 在sangtacviet.com书籍详情页面，点击下载相关按钮

2. 在执行完之后，会产生一个包含所有信息的json文件，由于目前没做js的epub打包，可以先用python版本的

3. 执行`python sangtacviet.py ****.json`打包epub，过程中会下载一些网络图片，请静候

4. 在`.tmp`目录下找到成品

**中文显示**

恢复被官方隐藏的中文，但是请**悄咪咪**的用，切忌宣传，如果你不想大家都没得用的话

![image](https://github.com/phantom-sea-limited/Crawler/assets/46920034/3af749c0-958e-4e0c-a6ca-50b4948d59ed)

在搜索界面支持ciweimao/sfacg/linovel/wenku8的中文显示
[传送门](https://sangtacviet.vip/?find=&host=&minc=0&tag=)

**TIPS:当然，你也可以使用控制台使用:`STV.search_helper_handler()`**

以wenku8为例

![image](https://github.com/phantom-sea-limited/Crawler/assets/46920034/05012acc-fe67-42d2-8df9-ec1905a9f2c6)

[**高级说明**](https://github.com/phantom-sea-limited/Crawler/blob/main/sangtacviet.md)

# **nhimmeo.cf 刺猬猫分享**

### 相关文件

> nhimmeo.user.js
>
> nhimmeo.py

### 题外话

> |∀` )被站长发现咯

[请合理使用爬虫](https://ko-fi.com/post/For-Chinese-users-D1D1LZSTG)

[如果可以的话，赞助一下这位站长](https://ko-fi.com/post/Alipay-Q5Q2M70VM)

**使用说明**

请使用[Tampermonkey](https://www.tampermonkey.net/)安装此用户脚本

[**点击安装脚本**](https://github.com/phantom-sea-limited/Crawler/raw/main/nhimmeo.user.js)

[**点击安装脚本(镜像)**](https://static.sirin.top/https://github.com/phantom-sea-limited/Crawler/raw/main/nhimmeo.user.js)

安装后，在书籍页面会出现一个黑色的下载框，点击就会自动操作，如果点击后没有反应，可以打开控制台康康有没有报错顺，带可以来仓库发一个issue，记得带上URL地址，以及相关信息

![image](https://github.com/phantom-sea-limited/Crawler/assets/46920034/fb65e26b-7c3b-499c-b3c1-ee1e5f122b63)

**已支持云端服务,将每一次用户的结果上传至云端,可以节约所有人的时间,希望各位保留这个功能.同时,所有文件均公开,可以通过上图所示按钮访问**

1. 在zh.nhimmeo.cf书籍详情页面，点击下载相关黑色系按钮，~~推荐使用稳定，高速有存储上限，可能无法正常运作~~(高速服务已不主动使用)

2. 在执行完之后，会产生一个包含所有信息的json文件，由于目前没做js的epub打包，可以先用python版本的

3. 执行`python nhimmeo.py ****.json`打包epub，过程中会下载一些网络图片，请静候

4. 在`.tmp`目录下找到成品

[**高级说明**](https://github.com/phantom-sea-limited/Crawler/blob/main/nhimmeo.md)

# **轻之国度**

### 相关文件

> lightnovel.us.user.js
>
> lightnovel.us.py

### 题外话

> 请合理使用，禁止在任何平台传播本脚本
>
> [**高级说明请参考nhimmeo.md**](https://github.com/phantom-sea-limited/Crawler/blob/main/nhimmeo.md)

**使用说明**

请使用[Tampermonkey](https://www.tampermonkey.net/)安装此用户脚本

[**点击安装脚本**](https://github.com/phantom-sea-limited/Crawler/raw/main/lightnovel.us.user.js)

[**点击安装脚本(镜像)**](https://static.sirin.top/https://github.com/phantom-sea-limited/Crawler/raw/main/lightnovel.us.user.js)

![image](https://github.com/phantom-sea-limited/Crawler/assets/46920034/a89b82bd-039f-420d-81cd-397402780ef4)

1. 在https://www.lightnovel.us/cn/series/312之类的合集详情页面，点击下载相关按钮，仅仅提供稳定相关服务

2. 在执行完之后，会产生一个包含所有信息的json文件，由于目前没做js的epub打包，可以先用python版本的

3. 执行`python lightnovel.us.py ****.json`打包epub，过程中会下载一些网络图片，请静候

4. 在`.tmp`目录下找到成品

# **heros-web.com**

### 相关文件

> heros-web.com.user.js

**使用说明**

请使用[Tampermonkey](https://www.tampermonkey.net/)安装此用户脚本

[**点击安装脚本**](https://github.com/phantom-sea-limited/Crawler/raw/main/heros-web.com.user.js)

[**点击安装脚本(镜像)**](https://static.sirin.top/https://github.com/phantom-sea-limited/Crawler/raw/main/heros-web.com.user.js)

![image](https://github.com/phantom-sea-limited/Crawler/assets/46920034/0b4b04ca-eafb-4349-b0a6-2e2c192c18b8)

和以往不一样，功能入口在Tampermonkey中，如上图所示

![image](https://github.com/phantom-sea-limited/Crawler/assets/46920034/97578a30-fe50-4572-98f6-e85cf16db5fc)

温馨提示：请提前给与网页下载多项文件的权限

# **同人小说(通用)**

大部分同人网站那源码都一样的东西，做了个模板，可以直接爬

### 相关文件

> Template.py

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

- [https://www.bixiange.top](https://www.bixiange.top) </br>IP记录:无(安全意识强,尚未发现)</br>不过内容和[https://m.bixiange.me/](https://m.bixiange.me/)完全一致

- [https://m.bixiange.me/](https://m.bixiange.me/) </br>IP记录:209.74.107.162/209.74.107.163/209.74.107.165

## **imwcr**

### 相关文件

> imwcr.py

针对[https://down.imwcr.com/1/main](https://down.imwcr.com/1/main)编写的爬虫

IP记录:43.154.113.63

####  失效记录 2023.3.21

根据这个IP记录，发现了新的域名，但是502，先记录 down.suucc.com

#### 恢复正常 2023.6.1

实际上只是拥有者更换域名而已，功能还未测试，应该差不多改改就行


# 已失效内容
<details>
<summary>已失效内容</summary>
  
## **trxs(原版)[已失效]**
  
### 相关文件

> trxs.py

前不久看见个同人小说的网站，写了个爬虫爬着玩
这里是小说[网站地址](https://www.trxs123.com)

~~编译完成之后的程序[在这下载](https://github.com/Rcrwrate/Crawler/tree/main/dist)~~
 

## **zxcs[已失效]**

### 相关文件
 
> zxcs.py

针对[http://zxcs.me/](http://zxcs.me/)编写的爬虫

IP记录:92.242.62.123

### 失效记录 2023.6.7
  
  具体情况可以通过如下链接查看
  
  https://webcache.googleusercontent.com/search?q=cache:https://zxcs.wiki/
  
  https://web.archive.org/web/20230602155316/https://zxcs.wiki/

</details>
