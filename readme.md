# 綠界物流 - 取得門市清單
技術文件連結：https://developers.ecpay.com.tw/?p=47496

# 程式運作
前端將參數 MerchantID、 CvsType 送給後端，後端計算 CheckMacValue 後再呼叫綠界 API。綠界 API 回傳給後端，後端再回傳給前端。

# 前端 Repo：
[https://github.com/evojroan/ecpay-getstorelist-front](https://github.com/evojroan/ecpay-getstorelist-front)