# 付款前資料收集 Webhook 設定

網站上的「立即購買 NT$299」現在會先把資料 POST 到：

```text
https://erick303.app.n8n.cloud/webhook/timewaver-payment-intake
```

## 前端送出的欄位

```json
{
  "order_no": "B-20260409170530-ABCD",
  "buyer_name": "王小明",
  "buyer_email": "test@example.com",
  "buyer_phone": "0912345678",
  "product_code": "B",
  "product_name": "【B劑】深海艙・放鬆頻率",
  "trade_amt": "299",
  "payment_url": "https://p.ecpay.com.tw/377EA05",
  "status": "pending",
  "source": "landing_page"
}
```

## n8n 建議流程

```text
Webhook (timewaver-payment-intake)
-> Set / Normalize Intake
-> Google Sheets (Append 工作表2)
-> Respond to Webhook
```

## 工作表2 建議欄位

- `created_at`
- `order_no`
- `buyer_name`
- `buyer_email`
- `buyer_phone`
- `product_code`
- `product_name`
- `trade_amt`
- `payment_url`
- `status`
- `source`

## Webhook 回應

建議直接回：

```text
OK
```

或 JSON：

```json
{ "ok": true }
```

## 後續付款成功怎麼接

付款成功 callback workflow 不再直接拿 email。

改成：

1. 從 callback 拿到訂單識別欄位
2. 去工作表2找對應的 `order_no`
3. 找到後再把：
   - `buyer_name`
   - `buyer_email`
   - `buyer_phone`
   - `product_code`
   - `product_name`
   - `trade_amt`
   丟進 21 天 workflow

## 重要提醒

現在網站已經先產生 `order_no`，但你還需要讓綠界付款成功 callback 能回查到同一筆訂單。

最穩做法：

- 建立綠界付款連結時，把 `order_no` 帶進綠界訂單欄位
- 或至少放進你後續能回傳的自訂欄位

如果綠界現成收款網址完全不能帶自訂訂單號，那就還差最後一哩：付款成功時無法百分之百對回這筆預填資料。
