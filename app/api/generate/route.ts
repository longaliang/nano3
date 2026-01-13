import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Nano Banana Image Editor",
  },
})

export async function POST(req: NextRequest) {
  try {
    const { prompt, imageBase64, aspectRatio } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Map aspect ratios to dimensions
    const dimensionMap: Record<string, { width: number; height: number; label: string }> = {
      "1:1": { width: 1024, height: 1024, label: "square 1:1" },
      "16:9": { width: 1344, height: 768, label: "wide 16:9 landscape" },
      "9:16": { width: 768, height: 1344, label: "portrait 9:16 vertical" },
      "4:3": { width: 1152, height: 896, label: "landscape 4:3" },
      "3:4": { width: 896, height: 1152, label: "portrait 3:4" },
    }

    const selectedRatio = dimensionMap[aspectRatio] || dimensionMap["1:1"]

    // Enhance prompt with aspect ratio information
    const enhancedPrompt = `${prompt}\n\nGenerate image in ${selectedRatio.label} aspect ratio (${selectedRatio.width}x${selectedRatio.height}).`

    const content: any[] = [
      {
        type: "text",
        text: enhancedPrompt,
      },
    ]

    if (imageBase64) {
      content.push({
        type: "image_url",
        image_url: {
          url: imageBase64,
        },
      })
    }

    const completion = await openai.chat.completions.create({
      model: "google/gemini-3-pro-image-preview",
      messages: [
        {
          role: "user",
          content,
        },
      ],
      modalities: ["image", "text"],
    })

    return NextResponse.json({ result: completion.choices[0].message })
  } catch (error: any) {
    console.error("Generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    )
  }
}
