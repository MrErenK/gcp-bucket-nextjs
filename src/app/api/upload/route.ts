import { NextResponse } from 'next/server'
import { Storage } from '@google-cloud/storage'
import { Readable } from 'stream'

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: './google-cloud-key.json',
})

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME || '')

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const [files] = await bucket.getFiles()
  const totalFiles = files.length
  const totalPages = Math.ceil(totalFiles / limit)

  const paginatedFiles = files.slice((page - 1) * limit, page * limit)
  const fileUrls = paginatedFiles.map(file => `https://storage.googleapis.com/${bucket.name}/${file.name}`)

  return NextResponse.json({
    files: fileUrls,
    currentPage: page,
    totalPages,
    totalFiles,
  })
}

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const stream = Readable.from(Buffer.from(buffer))

  const blob = bucket.file(file.name)
  const blobStream = blob.createWriteStream()

  const origin = new URL(request.url).origin;

  return new Promise((resolve, reject) => {
    stream
      .pipe(blobStream)
      .on('error', (err) => {
        reject(NextResponse.json({ error: err.message }, { status: 500 }))
      })
      .on('finish', async () => {
        await blob.makePublic()
        const downloadUrl = `${origin}/api/download/${blob.name}`
        resolve(NextResponse.json({ url: downloadUrl }))
      })
  })
}
