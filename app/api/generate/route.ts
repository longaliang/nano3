import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "Nano Banana Image Editor",
  },
})

type ImageItem = { image_url: { url: string } }

function isValidImageUrl(url: string) {
  if (typeof url !== "string" || url.length === 0) {
    return false
  }

  if (url.startsWith("data:image/")) {
    return true
  }

  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

function extractImages(message: any): ImageItem[] {
  const images: ImageItem[] = []

  if (Array.isArray(message?.images)) {
    for (const image of message.images) {
      if (image?.image_url?.url && isValidImageUrl(image.image_url.url)) {
        images.push({ image_url: { url: image.image_url.url } })
      }
    }
  }

  if (Array.isArray(message?.content)) {
    for (const item of message.content) {
      if (item?.type === "image_url" && item?.image_url?.url && isValidImageUrl(item.image_url.url)) {
        images.push({ image_url: { url: item.image_url.url } })
      }
    }
  }

  return images
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, imageBase64, aspectRatio, numImages, mode } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const requestedImages = Math.min(Math.max(Number(numImages) || 1, 1), 4)
    const isImageToImage = mode === "image-to-image"

    if (isImageToImage && !imageBase64) {
      return NextResponse.json({ error: "Reference image is required" }, { status: 400 })
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
    const enhancedPrompt = `${prompt}

Generate image in ${selectedRatio.label} aspect ratio (${selectedRatio.width}x${selectedRatio.height}).`

    const content: any[] = [
      {
        type: "text",
        text: enhancedPrompt,
      },
    ]

    if (isImageToImage && imageBase64) {
      content.push({
        type: "image_url",
        image_url: {
          url: imageBase64,
        },
      })
    }

    const timeoutMs = Math.max(Number(process.env.GENERATE_TIMEOUT_MS) || 15000, 1000)
    const overallTimeoutMs = Math.max(
      Number(process.env.GENERATE_OVERALL_TIMEOUT_MS) || timeoutMs,
      1000
    )
    const maxConcurrent = Math.min(
      Math.max(Number(process.env.GENERATE_MAX_CONCURRENT) || requestedImages, 1),
      requestedImages
    )

    const controllers: AbortController[] = []
    let overallTimedOut = false

    const overallTimer = setTimeout(() => {
      overallTimedOut = true
      for (const controller of controllers) {
        controller.abort()
      }
    }, overallTimeoutMs)

    const withTimeout = async <T,>(controller: AbortController, task: Promise<T>, ms: number) => {
      return Promise.race([
        task,
        new Promise<T>((_, reject) => {
          const timeout = setTimeout(() => {
            controller.abort()
            reject(new Error("Generation timed out"))
          }, ms)
          task.finally(() => clearTimeout(timeout))
        }),
      ])
    }

    const tasks = Array.from({ length: requestedImages }, () => {
      const controller = new AbortController()
      controllers.push(controller)
      return async () => {
        const request = openai.chat.completions.create({
          model: "google/gemini-3-pro-image-preview",
          messages: [
            {
              role: "user",
              content,
            },
          ],
          modalities: ["image", "text"],
          signal: controller.signal,
        })

        return withTimeout(controller, request, timeoutMs)
      }
    })

    const completions: PromiseSettledResult<any>[] = Array(tasks.length)
    let cursor = 0

    const workers = Array.from({ length: maxConcurrent }, async () => {
      while (cursor < tasks.length) {
        if (overallTimedOut) {
          break
        }
        const current = cursor
        cursor += 1
        try {
          const value = await tasks[current]()
          completions[current] = { status: "fulfilled", value }
        } catch (error) {
          completions[current] = { status: "rejected", reason: error }
        }
      }
    })

    await Promise.all(workers)
    clearTimeout(overallTimer)

    const successful = completions.flatMap((result) =>
      result && result.status === "fulfilled" ? [result.value] : []
    )

    if (successful.length === 0) {
      return NextResponse.json({ error: "All generation requests failed" }, { status: 502 })
    }

    const messages = successful.map((completion) => completion.choices[0].message)
    const images = messages.flatMap(extractImages).slice(0, requestedImages)

    return NextResponse.json({
      result: {
        images,
        stats: {
          requested: requestedImages,
          successful: successful.length,
          failed: requestedImages - successful.length,
        },
      },
    })
  } catch (error: any) {
    console.error("Generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    )
  }
}
