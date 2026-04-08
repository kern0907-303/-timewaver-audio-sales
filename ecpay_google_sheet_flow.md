# 綠界付款成功後寫入 Google Sheet 的設計

## 建議架構

`綠界付款 -> 綠界付款結果通知 -> n8n webhook -> Google Sheet`

## 流程說明

1. 使用者點網站上的商品付款連結，進入綠界付款頁。
2. 使用者完成付款後，綠界會打 `Server Return URL` 到你的 n8n webhook。
3. n8n 收到 webhook 後：
   - 檢查 `RtnCode`
   - 判斷是否為付款成功
   - 從 `MerchantTradeNo` 解析商品代碼
   - 組好要寫入 Google Sheet 的欄位
4. n8n 將資料新增到 Google Sheet。
5. n8n 回應綠界 `1|OK`。

## 綠界後台要設定的重點

- `ReturnURL`
  - 設成 n8n 的 Production webhook URL
- `OrderResultURL`
  - 可選，這是付款完成後導回前台頁面的網址
- `MerchantTradeNo`
  - 建議把商品代碼放進去，例如 `A-20260407-0001`

## 成功付款判斷

一般可先用：

- `RtnCode === "1"` -> 視為成功

如果你未來要再更嚴謹，可以再加：

- 檢查 `TradeAmt`
- 檢查 `MerchantTradeNo`
- 檢查 `CheckMacValue`

## 商品代碼解析建議

如果 `MerchantTradeNo` 格式是：

- `A-20260407-0001`

那在 n8n 可直接取第一段：

- `A`

再依照 A/B/C/D 對應成商品名稱。

## 建議你實際落地時的順序

1. 先建立 Google Sheet 與欄位
2. 匯入 `n8n_ecpay_to_google_sheet.json`
3. 在 n8n 裡填入 Google Sheets credential
4. 啟用 workflow
5. 把 Production webhook URL 填回綠界
6. 用綠界測試交易驗證是否有成功寫入 Google Sheet
