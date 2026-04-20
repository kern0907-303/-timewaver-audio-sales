# 綠界 API 建單串接方案

這版改法的目標是把流程改成：

1. 網站收集姓名 / Email / 手機
2. 前端把表單直接 POST 到 n8n 的建單 webhook
3. n8n 先寫入 intake 表
4. n8n 依同一個 `order_no` 建立綠界訂單
5. n8n 回傳一個自動送出的 HTML form，導向綠界付款頁
6. 綠界 callback 用 `MerchantTradeNo = order_no` 回查資料並啟動 21 天流程

## 前端入口

網站現在預設把資料送到：

```text
https://erick303.app.n8n.cloud/webhook/timewaver-create-ecpay-order
```

送出的欄位：

```json
{
  "order_no": "A-20260420194530-ABCD",
  "buyer_name": "王小明",
  "buyer_email": "test@example.com",
  "buyer_phone": "0912345678",
  "product_code": "A",
  "product_name": "【A劑】斷路器・沉靜頻率",
  "trade_amt": "299",
  "status": "pending",
  "source": "landing_page"
}
```

## n8n 建單 workflow 建議結構

```text
Webhook (timewaver-create-ecpay-order)
-> Normalize Intake
-> Google Sheets (Append Intake)
-> Build ECPay Params
-> Build Auto Submit HTML
-> Respond to Webhook (text/html)
```

## 綠界 API 參數重點

依綠界 All Payment 官方文件：

- 串接網址：`https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5`
- `MerchantTradeNo` 必填，且必須唯一
- `CustomField1` ~ `CustomField4` 可放自訂資料

建議對應：

```text
MerchantTradeNo = order_no
CustomField1 = buyer_name
CustomField2 = buyer_email
CustomField3 = buyer_phone
CustomField4 = product_code
```

這樣 callback 就能直接拿到：

- `MerchantTradeNo`
- `CustomField1`
- `CustomField2`
- `CustomField3`
- `CustomField4`

## Build ECPay Params 節點要產出的欄位

至少要有：

```json
{
  "MerchantID": "你的正式 MerchantID",
  "MerchantTradeNo": "A-20260420194530-ABCD",
  "MerchantTradeDate": "2026/04/20 19:45:30",
  "PaymentType": "aio",
  "TotalAmount": 299,
  "TradeDesc": "TimeWaver Audio",
  "ItemName": "【A劑】斷路器・沉靜頻率",
  "ReturnURL": "https://erick303.app.n8n.cloud/webhook/ecpay-payment-callback",
  "OrderResultURL": "https://你的網站成功頁",
  "ChoosePayment": "Credit",
  "CustomField1": "王小明",
  "CustomField2": "test@example.com",
  "CustomField3": "0912345678",
  "CustomField4": "A",
  "EncryptType": 1,
  "CheckMacValue": "依綠界規則計算"
}
```

## Build Auto Submit HTML

n8n 最後要回傳一段 HTML，讓瀏覽器收到後自動 POST 到綠界：

```html
<html>
  <body>
    <form id="ecpay-form" method="post" action="https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5" accept-charset="UTF-8">
      <input type="hidden" name="MerchantID" value="..." />
      <input type="hidden" name="MerchantTradeNo" value="..." />
      <input type="hidden" name="CheckMacValue" value="..." />
    </form>
    <script>
      document.getElementById('ecpay-form').submit();
    </script>
  </body>
</html>
```

`Respond to Webhook` 要回：

- `respondWith`: `text`
- `Content-Type`: `text/html; charset=utf-8`

## callback workflow 要同步調整

付款成功 callback 請改成優先吃綠界正式欄位：

```text
merchant_trade_no = MerchantTradeNo
buyer_name = CustomField1
buyer_email = CustomField2
buyer_phone = CustomField3
product_code = CustomField4
```

如果這些值都有回來，就不需要再靠 `od_hoho` regex 對單。

## 上線驗收

1. 送出網站表單後，會先到 n8n 建單 webhook
2. 瀏覽器自動跳到綠界付款頁
3. 付款成功後 callback 能收到 `MerchantTradeNo`
4. callback 的 `CustomField1~4` 有值
5. 付款記錄表沒有重複資料
6. 21 天流程可用 `buyer_email` 正常啟動

## 官方文件

- All Payment: https://developers.ecpay.com.tw/?p=16449
- Payment Results Notification: https://developers.ecpay.com.tw/16538/
