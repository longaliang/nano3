import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 30

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

type ImageItem = { image_url: { url: string } }

function getErrorStatus(error: any) {
  const status = error?.status ?? error?.code ?? error?.response?.status
  return typeof status === "number" ? status : undefined
}

function getErrorMessage(error: any) {
  if (typeof error?.message === "string") {
    return error.message
  }
  const responseMessage =
    error?.response?.data?.error?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.message
  if (typeof responseMessage === "string") {
    return responseMessage
  }
  return "Failed to generate image"
}

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
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  try {
    const contentType = req.headers.get("content-type") || ""
    console.log("Generate request received", {
      requestId,
      contentType,
      hasApiKey: Boolean(process.env.OPENROUTER_API_KEY),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    })

    const rawBody = await req.text()
    let parsedBody: any
    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : {}
    } catch (parseError) {
      console.error("Generate request JSON parse failed", { requestId, parseError })
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const { prompt, imageBase64, aspectRatio, numImages, mode } = parsedBody

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY is missing" }, { status: 500 })
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
    const maxTokens = Math.max(Number(process.env.GENERATE_MAX_TOKENS) || 2048, 256)
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

    console.log("Calling OpenRouter", {
      requestId,
      requestedImages,
      maxTokens,
      timeoutMs,
      overallTimeoutMs,
      maxConcurrent,
    })

    const tasks = Array.from({ length: requestedImages }, () => {
      const controller = new AbortController()
      controllers.push(controller)
      return async () => {
        const request = fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            "X-Title": "Nano Banana Image Editor",
          },
          body: JSON.stringify({
            model: "google/gemini-3-pro-image-preview",
            messages: [
              {
                role: "user",
                content,
              },
            ],
            max_tokens: maxTokens,
            modalities: ["image", "text"],
          }),
          signal: controller.signal,
        })

        const response = await withTimeout(controller, request, timeoutMs)
        const responseText = await response.text()
        let responseJson: any = null
        try {
          responseJson = responseText ? JSON.parse(responseText) : null
        } catch (parseError) {
          console.error("OpenRouter response JSON parse failed", {
            requestId,
            parseError,
            responseText,
          })
        }

        if (!response.ok) {
          const errorMessage =
            responseJson?.error?.message ||
            responseJson?.error ||
            responseJson?.message ||
            response.statusText ||
            "OpenRouter request failed"
          throw {
            status: response.status,
            message: errorMessage,
            response: { data: responseJson || responseText },
          }
        }

        return responseJson
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
      const rejected = completions.find(
        (result): result is PromiseRejectedResult => !!result && result.status === "rejected"
      )
      const rejectedStatus = rejected ? getErrorStatus(rejected.reason) : undefined
      if (rejected) {
        console.error("All generation requests failed", {
          requestId,
          status: rejectedStatus,
          message: getErrorMessage(rejected.reason),
          response: rejected.reason?.response?.data,
        })
      } else {
        console.error("All generation requests failed", { requestId })
      }
      if (rejectedStatus === 402) {
        return NextResponse.json(
          { error: "Insufficient OpenRouter credits or max_tokens too high", code: 402 },
          { status: 402 }
        )
      }
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
    const status = getErrorStatus(error)
    console.error("Generation error:", {
      requestId,
      status,
      message: getErrorMessage(error),
      response: error?.response?.data,
    })
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: status || 500 }
    )
  }
}
