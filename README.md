# 圈 X 单应用测试规则

## PhotonCamProbe 0.1.0

这是网络诊断版，不是会员解锁版。用于补查 PhotonCam 同一 Supabase 后台下是否存在此前遗漏的 REST、Edge Function 或认证请求。旧抓取仅发现促销配置和模型配置；手机系统日志显示 StoreKit 2 查询权益。目前没有验证可用于改变 PhotonCam 会员状态的网络响应。

### 首次上传

把本目录里的 README.md、rewrite、scripts 上传到 OnyxNexus/quanquan 的 main 分支根目录，保持目录结构。不要额外套一层 quanquan-ready。此交付不包含原始手机日志、请求头、密钥、收据或第三方脚本。

### 首次导入（仅在上传成功后）

在圈 X 的「重写」远程资源中添加：

https://raw.githubusercontent.com/OnyxNexus/quanquan/main/rewrite/PhotonCamProbe.conf

该文件已经包含 hostname 和完整脚本地址，无需再把这三条写进 rewrite_local，也无需重复手工加该域名。如果已有同用途的本地 PhotonCam 规则，停用旧条目，避免重复命中。保留其他应用的规则。需要保持已安装并信任的圈 X MitM 证书有效、MitM 和本资源启用；不需要添加苹果支付域名。

### 一轮测试

1. 在 Safari 打开 http://example.com/photoncam-probe?reset=1 ，确认显示 0.1.0 和计数清零。
2. 完全结束 PhotonCam，再打开会员页，点恢复购买。若要对照购买路径，选永久，看到苹果确认窗口后取消即可，无需付款。记录操作先后。
3. 回 Safari 打开 http://example.com/photoncam-probe?view=1 ，刷新，截图显示的请求/响应计数与最近记录。现在不必在圈 X 全部日志里寻找脚本名。

自检成功只说明脚本可执行；response 命中说明该后台响应进入脚本。两者都不表示会员成功。只有 request 没有 response 时，也不能直接判定服务器没有响应；可能是解密、规则或脚本执行链路问题。

### 覆盖和隐私

仅观察已从 PhotonCam 请求确认的一个 Supabase 主机。其他 API、StoreKit 系统通信和缓存不在本资源范围。日志只记录固定路由类别、HTTP 状态和白名单字段类型，不输出字段值、URL 参数、请求头或未知路径中的标识符。所有真实请求和响应均用 `$done({})` 原样放行。最多保存最近12条摘要；reset=1 可清空。启用响应脚本会增加一定解析开销，测试结束可停用该资源。

### 后续更新

远程资源地址保持不变。每次脚本更新使用新版本文件名，并修改 conf 内脚本地址；圈 X 更新此远程资源后可避免继续使用旧脚本缓存。README 及自检同时显示版本。GitHub Raw 缓存可能延迟，刷新后以自检版本为准。

## 参考写法核对

- Fotoz：旧 `verifyReceipt` 响应重写。https://github.com/1074305015/chxm1023/blob/main/iTunes/fotoz.js
- Obscura：RevenueCat subscriber 响应及请求缓存头处理。https://github.com/1074305015/chxm1023/blob/main/Revenuecat/obscura.js
- Focos：应用自有后台的 setup / purchases verify 响应。https://github.com/1074305015/chxm1023/blob/main/Focos.js
- 远程资源自带域名：Quantumult X 官方示例。https://github.com/crossutility/Quantumult-X/blob/master/sample-import-rewrite.snippet

这些例子依赖对应接口与客户端信任方式，不能仅替换 App 名或商品 ID 就认为适配 PhotonCam。参考仓库源码未包含 PhotonCam / juniperphoton / Supabase 关键字命中；文本检索也不是证明所有混淆代码均与 PhotonCam 无关。未复制或运行第三方脚本。
