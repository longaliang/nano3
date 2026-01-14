"use client"

import { useState, useRef, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Upload, ArrowRight, Sparkles, Loader2, X, Download } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function Generator() {
  const [prompt, setPrompt] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationWarning, setGenerationWarning] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [numImages, setNumImages] = useState([1])
  const [activeTab, setActiveTab] = useState("text-to-image")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t, language } = useLanguage()

  const aspectRatios = [
    { value: "1:1", label: "1:1", width: 1024, height: 1024 },
    { value: "16:9", label: "16:9", width: 1344, height: 768 },
    { value: "9:16", label: "9:16", width: 768, height: 1344 },
    { value: "4:3", label: "4:3", width: 1152, height: 896 },
    { value: "3:4", label: "3:4", width: 896, height: 1152 },
  ]

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert(language === "zh" ? "文件大小必须小于 10MB" : "File size must be less than 10MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert(language === "zh" ? "请输入提示词" : "Please enter a prompt")
      return
    }

    if (activeTab === "image-to-image" && !uploadedImage) {
      alert(language === "zh" ? "请先上传参考图" : "Please upload a reference image")
      return
    }

    setIsGenerating(true)
    setGeneratedImages([])
    setGenerationWarning(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          imageBase64: activeTab === "image-to-image" ? uploadedImage : null,
          aspectRatio,
          numImages: numImages[0],
          mode: activeTab,
        }),
      })

      const contentType = response.headers.get("content-type") || ""
      const isJson = contentType.includes("application/json")

      if (!response.ok) {
        if (isJson) {
          const error = await response.json()
          throw new Error(error.error || (language === "zh" ? "生成失败" : "Generation failed"))
        }
        const text = await response.text()
        throw new Error(text || (language === "zh" ? "生成失败" : "Generation failed"))
      }

      if (!isJson) {
        throw new Error(language === "zh" ? "服务器返回了非 JSON 响应" : "Server returned a non-JSON response")
      }

      const data = await response.json()

      const failedCount = data.result?.stats?.failed
      if (typeof failedCount === "number" && failedCount > 0) {
        setGenerationWarning(
          language === "zh"
            ? `有 ${failedCount} 次生成失败，但已展示成功结果`
            : `${failedCount} generation(s) failed, showing successful results`
        )
      }

      // Handle images from the new response format
      if (data.result?.images) {
        const newImages = data.result.images.map((img: any) => img.image_url.url)
        setGeneratedImages(newImages)
        if (newImages.length === 0) {
          alert(language === "zh" ? "未生成任何图像" : "No images were generated")
        }
      } else if (data.result?.content) {
        // Fallback for old format
        const content = data.result.content
        if (Array.isArray(content)) {
          for (const item of content) {
            if (item.type === "image_url") {
              setGeneratedImages((prev) => [...prev, item.image_url.url])
            }
          }
        }
        if (Array.isArray(content)) {
          const hasImages = content.some((item) => item?.type === "image_url" && item?.image_url?.url)
          if (!hasImages) {
            alert(language === "zh" ? "未生成任何图像" : "No images were generated")
          }
        }
      } else {
        alert(language === "zh" ? "未生成任何图像" : "No images were generated")
      }
    } catch (error: any) {
      alert(error.message || (language === "zh" ? "生成图像失败" : "Failed to generate image"))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `generated-image-${index + 1}.png`
    link.click()
  }

  const isZh = language === "zh"

  return (
    <section id="generator" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            nano banana
          </h2>
          <p className="text-xl text-muted-foreground">{t.generator.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Prompt Engine */}
          <Card className="p-8 shadow-xl border-2">
            <Tabs defaultValue="text-to-image" className="mb-6" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg">
                <TabsTrigger value="text-to-image" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  {t.generator.textToImage}
                </TabsTrigger>
                <TabsTrigger value="image-to-image" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  {t.generator.imageToImage}
                </TabsTrigger>
              </TabsList>

              {/* Text to Image */}
              <TabsContent value="text-to-image" className="space-y-6 mt-6">
                {/* Main Prompt */}
                <div>
                  <Label htmlFor="txt2img-prompt" className="text-base font-semibold mb-3 block">
                    {t.generator.mainPrompt}
                  </Label>
                  <Textarea
                    id="txt2img-prompt"
                    placeholder={isZh ? "描述你想要生成的图像..." : "Describe what you want to generate..."}
                    className="min-h-[120px] resize-none border-2 focus:border-purple-500"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Aspect Ratio */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      {isZh ? "图片比例" : "Aspect Ratio"}
                    </Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aspectRatios.map((ratio) => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Number of Images */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      {isZh ? `图片数量: ${numImages[0]}` : `Images: ${numImages[0]}`}
                    </Label>
                    <Slider
                      value={numImages}
                      onValueChange={setNumImages}
                      min={1}
                      max={4}
                      step={1}
                      className="mt-4"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-base py-6 rounded-xl shadow-lg"
                  onClick={handleGenerate}
                  disabled={isGenerating || (activeTab === "image-to-image" && !uploadedImage)}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isZh ? "生成中..." : "Generating..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      {t.generator.generate}
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* Image to Image */}
              <TabsContent value="image-to-image" className="space-y-6 mt-6">
                {/* Image Upload */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">{t.generator.referenceImage}</Label>
                  {uploadedImage ? (
                    <div className="relative border-2 border-border rounded-xl overflow-hidden bg-muted/30">
                      <img
                        src={uploadedImage}
                        alt={isZh ? "已上传" : "Uploaded"}
                        className="w-full h-48 object-cover"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer bg-muted/20"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">{t.generator.addImage}</p>
                      <p className="text-xs text-muted-foreground">{t.generator.maxSize}</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {/* Main Prompt */}
                <div>
                  <Label htmlFor="prompt" className="text-base font-semibold mb-3 block">
                    {t.generator.mainPrompt}
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder={t.generator.placeholder}
                    className="min-h-[100px] resize-none border-2 focus:border-purple-500"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Aspect Ratio */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      {isZh ? "图片比例" : "Aspect Ratio"}
                    </Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aspectRatios.map((ratio) => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Number of Images */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      {isZh ? `图片数量: ${numImages[0]}` : `Images: ${numImages[0]}`}
                    </Label>
                    <Slider
                      value={numImages}
                      onValueChange={setNumImages}
                      min={1}
                      max={4}
                      step={1}
                      className="mt-4"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-base py-6 rounded-xl shadow-lg"
                  onClick={handleGenerate}
                  disabled={isGenerating || (activeTab === "image-to-image" && !uploadedImage)}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isZh ? "生成中..." : "Generating..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      {t.generator.generate}
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Output Gallery */}
          <Card className="p-8 shadow-xl border-2 flex flex-col">
            <h3 className="text-2xl font-bold mb-6">{t.generator.outputGallery}</h3>
            {generationWarning ? (
              <p className="text-sm text-amber-600 mb-4">{generationWarning}</p>
            ) : null}

            {isGenerating ? (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-xl p-12 bg-muted/20">
                <div className="text-center space-y-3">
                  <Loader2 className="h-16 w-16 mx-auto text-purple-500/50 animate-spin" />
                  <p className="font-semibold">{isZh ? "正在生成图像..." : "Generating your image..."}</p>
                  <p className="text-sm text-muted-foreground">{isZh ? "请稍候片刻" : "This may take a few moments"}</p>
                </div>
              </div>
            ) : generatedImages.length > 0 ? (
              <div className="flex-1 space-y-4">
                {generatedImages.map((imageUrl, index) => (
                  <div key={index} className="relative border-2 border-border rounded-xl overflow-hidden group bg-muted/20">
                    <img src={imageUrl} alt={`${isZh ? "生成" : "Generated"} ${index + 1}`} className="w-full" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(imageUrl, index)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {isZh ? "下载" : "Download"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-xl p-12 bg-muted/20">
                <div className="text-center space-y-3">
                  <Sparkles className="h-16 w-16 mx-auto text-purple-500/50" />
                  <p className="font-semibold">{t.generator.readyTitle}</p>
                  <p className="text-sm text-muted-foreground">{t.generator.readyDescription}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  )
}
