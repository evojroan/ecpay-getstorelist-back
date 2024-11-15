import express from "express";
import axios from "axios";

import { createHash } from "crypto";
import cors from "cors";
const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());

const APIURL = "https://logistics-stage.ecpay.com.tw/Helper/GetStoreList";

const KeyIV = {
  2000132: { HashKey: "5294y06JbISpM5x9", HashIV: "v77hoKGq4kWxNNIS" },
  2000933: { HashKey: "XBERn1YOvpM9nfZc", HashIV: "h1ONHk4P4yqbl5LK" },
};

//計算檢查碼的函式
function CreateCMV(CMVparams) {
  const selectedKey = KeyIV[CMVparams.MerchantID].HashKey;
  const selectedIV = KeyIV[CMVparams.MerchantID].HashIV;

  function DotNETURLEncode(string) {
    const list = {
      "%2D": "-",
      "%5F": "_",
      "%2E": ".",
      "%21": "!",
      "%2A": "*",
      "%28": "(",
      "%29": ")",
      "%20": "+",
    };

    Object.entries(list).forEach(([encoded, decoded]) => {
      const regex = new RegExp(encoded, "g");
      string = string.replace(regex, decoded);
    });

    return string;
  }

  const Step1 = Object.keys(CMVparams)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=${CMVparams[key]}`)
    .join("&");
  const Step2 = `HashKey=${selectedKey}&${Step1}&HashIV=${selectedIV}`;
  const Step3 = DotNETURLEncode(encodeURIComponent(Step2));
  const Step4 = Step3.toLowerCase();
  const Step5 = createHash("MD5").update(Step4).digest("hex");
  const Step6 = Step5.toUpperCase();

  return Step6;
}

//收到請求時，執行 CreateCMV，僅回應檢查碼，由前端處理後續
app.post("/createCMV", (req, res) => {
  const result = CreateCMV(req.body);
  res.send(result);
});

////收到請求時，計算檢查碼，並且接續呼叫綠界 API
app.post("/post", async (req, res) => {
  const payload = {
    MerchantID: req.body.MerchantID,
    CvsType: req.body.CvsType,
    CheckMacValue: CreateCMV(req.body),
  };

  try {
    const ecpayResponse=await axios({
      method:'post',
      url:APIURL,
      headers:{
        'Accept':'text/html',
        'Content-Type':'application/x-www-form-urlencoded'
      },
      data: new URLSearchParams(payload).toString()
    });
    res.send(ecpayResponse.data)
  } catch (error) {
    console.error("Error！描述如下", error);
    res.status(500).send("發生錯誤！" + error.message);
  }
});

app.listen(port, () => {
  console.log(`Express is listening on localhost:${port}`);
});
