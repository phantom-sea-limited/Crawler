# 错误修复记录


## 1. **文件名导致的URL截断**

错误记录

```
POST:   https://graph.microsoft.com/v1.0/me/drive/root:/Comic/%E5%AD%A4%E7%8B%AC%E6%91%87%E6%BB%9A/%5BUCCUSS%5D%20BOCCHI%20THE%20ROCK!%20%E3%81%BC%E3%81%A3%E3%81%A1%E3%83%BB%E3%81%96%E3%83%BB%E3%82%8D%E3%81%A3%E3%81%8F!%20%E7%AC%AC1%E5%B7%BB%20(BD%201920x1080p%20AVC%20FLAC)/%5BUCCUSS%5D%20BOCCHI%20THE%20ROCK!%20%E3%81%BC%E3%81%A3%E3%81%A1%E3%83%BB%E3%81%96%E3%83%BB%E3%82%8D%E3%81%A3%E3%81%8F!%20%E7%AC%AC02%E8%A9%B1%20%E3%80%8C#02%20%E3%81%BE%E3%81%9F%E6%98%8E%E6%97%A5%E3%80%8D%20(BD%201920x1080p%20AVC%20FLAC).mkv:/createUploadSession
DATA:   {'item': {'@microsoft.graph.conflictBehavior': 'fail', 'name': '[UCCUSS] BOCCHI THE ROCK! ぼっち・ざ・ろっく! 第02話 「#02 また明日」 (BD 1920x1080p AVC FLAC).mkv'}}
        {"error":{"code":"invalidRequest","message":"Invalid request","innerError":{"date":"2023-04-22T05:03:01","request-id":"561eebd4-0962-45aa-ad6a-8b6197a8877a","client-request-id":"561eebd4-0962-45aa-ad6a-8b6197a8877a"}}}
```
URL 解码后：`https://graph.microsoft.com/v1.0/me/drive/root:/Comic/孤独摇滚/[UCCUSS] BOCCHI THE ROCK! ぼっち・ざ・ろっく! 第1巻 (BD 1920x1080p AVC FLAC)/[UCCUSS] BOCCHI THE ROCK! ぼっち・ざ・ろっく! 第02話 「#02 また明日」 (BD 1920x1080p AVC FLAC).mkv:/createUploadSession
`


正确记录
```
POST:   https://graph.microsoft.com/v1.0/me/drive/root:/Comic/%E5%AD%A4%E7%8B%AC%E6%91%87%E6%BB%9A/%5BUCCUSS%5D%20BOCCHI%20THE%20ROCK!%20%E3%81%BC%E3%81%A3%E3%81%A1%E3%83%BB%E3%81%96%E3%83%BB%E3%82%8D%E3%81%A3%E3%81%8F!%20%E7%AC%AC3%E5%B7%BB%20(BD%201920x1080p%20AVC%20FLAC)/%E7%89%B9%E5%85%B8%E6%98%A0%E5%83%8F/%5BUCCUSS%5D%20%E3%81%BC%E3%81%A3%E3%81%A1%E3%83%BB%E3%81%96%E3%83%BB%E3%82%8D%E3%81%A3%E3%81%8F!%20%E7%B5%90%E6%9D%9F%E3%83%90%E3%83%B3%E3%83%89%20%E3%80%8C%E3%82%AE%E3%82%BF%E3%83%BC%E3%81%A8%E5%AD%A4%E7%8B%AC%E3%81%A8%E8%92%BC%E3%81%84%E6%83%91%E6%98%9F%E3%80%8D%20%E3%83%AA%E3%83%AA%E3%83%83%E3%82%AF%E3%83%93%E3%83%87%E3%82%AA%20(BD%201920x1080p%20AVC%20FLAC).mkv:/createUploadSession
DATA:   {'item': {'@microsoft.graph.conflictBehavior': 'fail', 'name': '[UCCUSS] ぼっち・ざ・ろっく! 結束バンド 「ギターと孤独と蒼い惑星」 リリックビデオ (BD 1920x1080p AVC FLAC).mkv'}}
        {"error":{"code":"nameAlreadyExists","message":"The specified item name already exists.","innerError":{"date":"2023-04-22T05:11:43","request-id":"b108daec-42ac-48a8-a285-7cbe36e20c86","client-request-id":"b108daec-42ac-48a8-a285-7cbe36e20c86"}}}
```
URL 解码后：`https://graph.microsoft.com/v1.0/me/drive/root:/Comic/孤独摇滚/[UCCUSS] BOCCHI THE ROCK! ぼっち・ざ・ろっく! 第3巻 (BD 1920x1080p AVC FLAC)/特典映像/[UCCUSS] ぼっち・ざ・ろっく! 結束バンド 「ギターと孤独と蒼い惑星」 リリックビデオ (BD 1920x1080p AVC FLAC).mkv:/createUploadSession
`

分析后认为：

`#`会导致微软Graph进行Url截断,导致文件名不符或invalidRequest


> 相关文件
>
> 1. https://github.com/Rcrwrate/Crawler/blob/main/Upload/Upload_new.py#L26