# Google Sheet 付款紀錄欄位設計

建議工作表名稱：`payment_records`

## 欄位順序

1. `created_at`
2. `merchant_trade_no`
3. `trade_no`
4. `payment_status`
5. `rtn_code`
6. `rtn_msg`
7. `trade_amt`
8. `payment_type`
9. `simulate_paid`
10. `product_code`
11. `product_name`
12. `buyer_name`
13. `buyer_email`
14. `buyer_phone`
15. `source`
16. `raw_payload`

## 欄位說明

- `created_at`
  - 寫入時間，建議使用 `YYYY-MM-DD HH:mm:ss`
- `merchant_trade_no`
  - 綠界訂單編號，建議作為唯一鍵
- `trade_no`
  - 綠界交易編號
- `payment_status`
  - 建議寫 `paid` 或 `failed`
- `rtn_code`
  - 綠界回傳狀態碼
- `rtn_msg`
  - 綠界回傳訊息
- `trade_amt`
  - 付款金額
- `payment_type`
  - 付款方式
- `simulate_paid`
  - 是否為測試付款
- `product_code`
  - 商品代碼，例如 `A`, `B`, `C`, `D`
- `product_name`
  - 商品名稱
- `buyer_name`
  - 購買者姓名
- `buyer_email`
  - 購買者 Email
- `buyer_phone`
  - 購買者電話
- `source`
  - 建議固定寫 `ecpay`
- `raw_payload`
  - 保留完整 webhook 原始資料，方便日後對帳

## 商品對應建議

- `A` -> `【A劑】斷路器・沉靜頻率`
- `B` -> `【B劑】深海艙・放鬆頻率`
- `C` -> `【C劑】心流校準・專注頻率`
- `D` -> `【D劑】豐盛錨點・安定頻率`

## MerchantTradeNo 命名建議

建議在建立綠界訂單時，就把商品代碼寫進訂單編號。

範例：

- `A-20260407-0001`
- `B-20260407-0002`
- `C-20260407-0003`
- `D-20260407-0004`

這樣 webhook 收到資料後，就可以直接從 `MerchantTradeNo` 判斷是哪一款商品。
