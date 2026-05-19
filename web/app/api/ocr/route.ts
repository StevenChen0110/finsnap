import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(request: Request): Promise<Response> {
  try {
    const { imageBase64, mimeType } = (await request.json()) as {
      imageBase64: string
      mimeType: string
    }

    const { text } = await generateText({
      model: anthropic('claude-haiku-4.5'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: `data:${mimeType};base64,${imageBase64}`,
            },
            {
              type: 'text',
              text: `請分析這張財務截圖，提取關鍵資訊。只回傳 JSON，不要任何其他文字：
{
  "type": "transaction 或 asset",
  "amount": 數字,
  "merchant": "商家或機構名稱",
  "date": "YYYY-MM-DD 格式，若不確定用今天",
  "time": "HH:MM 格式，若不確定用 00:00",
  "account": "帳戶名稱（如：玉山信用卡、LINE Pay）",
  "category": "飲食|交通|購物|娛樂|居家|帳單|收入|其他 其中之一",
  "transactionType": "expense 或 income",
  "confidence": 0到1之間的小數
}

判斷規則：
- 消費通知、付款紀錄 → type: "transaction", transactionType: "expense"
- 薪資、退款、轉入 → type: "transaction", transactionType: "income"
- 銀行餘額、股票持倉 → type: "asset"`,
            },
          ],
        },
      ],
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return Response.json({ error: 'No JSON found' }, { status: 422 })

    return Response.json(JSON.parse(jsonMatch[0]))
  } catch (err) {
    console.error('OCR error:', err)
    return Response.json({ error: 'OCR failed' }, { status: 500 })
  }
}
