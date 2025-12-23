import { type NextRequest, NextResponse } from "next/server"
import { uploadFile } from "@/lib/db/storage"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name
    const contentType = file.type

    const fileUrl = await uploadFile(buffer, fileName, contentType, folder)

    return NextResponse.json({ success: true, fileUrl })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

