# 一次模块化的尝试

> 总结：不大行
>
> 当前状态: **异常**

采用webpack进行编译

```bash
bash build.sh
```

由于脚本的怪异设计：运行环境分为浏览器环境和油猴的Proxy环境

### 人机验证

人机验证存在奇怪的问题

### this

人机验证添加到页面本身的JS代码

https://github.com/phantom-sea-limited/Crawler/blob/main/ts/Cloud.ts#L56

在实际中此处的this居然是Proxy本身!?

这tm怎么改，同时this指代错误的问题还在Task中出现过，不过目前Task已修复(修复方式为直接不当类了，全部改成静态方式)

### Task.init

队列执行也存在问题，为`window.Article`不存在，明明就在上方赋值了

你通过浏览器控制台也能正常使用，但是在它Proxy环境下就不正常了