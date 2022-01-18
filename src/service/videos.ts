import fs from 'fs-extra'
import s3 from '../config/s3'
import mime from 'mime-types'
import { S3 } from 'aws-sdk'
import ffmpeg, { ffprobe, FfprobeData, FfprobeFormat, FfprobeStream } from 'fluent-ffmpeg'

export interface Metadata {
  audio: FfprobeStream
  video: FfprobeStream
  format: FfprobeFormat
}

export async function createThumbnail(
  inputUrl: string,
  uploadParams: S3.PutObjectRequest
): Promise<void> {
  const thumbnailName = uploadParams.Key.split('/').pop() || 'thumbnail.jpg'
  const tmpDir = await fs.mkdtemp('/tmp/bken-')
  const ffThumbOutPath = `${tmpDir}/${thumbnailName}`
  const thumbParams = [
    '-vf',
    'scale=854:480:force_original_aspect_ratio=increase,crop=854:480',
    '-vframes',
    '1',
    '-q:v',
    '4',
    '-f',
    'image2',
  ]

  return new Promise((resolve, reject) => {
    ffmpeg(inputUrl)
      .outputOptions(thumbParams)
      .output(ffThumbOutPath)
      .on('start', function (commandLine) {
        console.log('Spawned Ffmpeg with command: ' + commandLine)
      })
      .on('error', function (err) {
        console.log('An error occurred: ' + err.message)
        reject(err.message)
      })
      .on('end', function () {
        s3.upload({
          ...uploadParams,
          Body: fs.createReadStream(ffThumbOutPath),
          ContentType: mime.lookup(thumbnailName) || '',
        })
          .promise()
          .then(() => {
            fs.removeSync(tmpDir)
            resolve()
          })
          .catch(() => {
            fs.removeSync(tmpDir)
            console.error('Failed to upload thumbnail')
            reject()
          })
      })
      .run()
  })
}

function getVideoFilter(width: number): string {
  return `-vf scale=${width}:${width}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`
}

function getX264(bandwidth: number): string {
  return `-c:v libx264 -crf 24 -maxrate ${bandwidth}k -bufsize ${
    bandwidth * 2
  }k -preset faster -force_key_frames expr:gte(t,n_forced*2)`
}

export async function optimizeOriginal(
  inputUrl: string,
  uploadParams: S3.PutObjectRequest
): Promise<void> {
  const tmpDir = await fs.mkdtemp('/tmp/bken-')
  const tmpFilePath = `${tmpDir}/optimized.mp4`
  const optmizedCmd =
    '-c:a aac -b:a 128k -ar 44100 -c:v libx264 -crf 23 -preset medium -force_key_frames expr:gte(t,n_forced*2)'

  return new Promise((resolve, reject) => {
    ffmpeg(inputUrl)
      .outputOptions(optmizedCmd.split(' '))
      .output(tmpFilePath)
      .on('start', function (commandLine) {
        console.log('Spawned Ffmpeg with command: ' + commandLine)
      })
      .on('error', function (err) {
        console.log('An error occurred: ' + err.message)
        reject(err.message)
      })
      .on('end', function () {
        s3.upload({
          ...uploadParams,
          ContentType: 'video/h264',
          Body: fs.createReadStream(tmpFilePath),
        })
          .promise()
          .then(() => {
            fs.removeSync(tmpDir)
            resolve()
          })
          .catch(() => {
            fs.removeSync(tmpDir)
            console.error('Failed to upload')
            reject()
          })
      })
      .run()
  })
}

function transformFfprobeToMetadata(rawMeta: FfprobeData): Metadata {
  // When analyzing a video, we assume that the first video track found is the
  // only video track We don't error when a container has multiple video tracks,
  // but we currently don't support having multiple video streams
  const videoStreams = rawMeta.streams.filter(stream => {
    return stream.codec_type === 'video'
  })

  const audioStreams = rawMeta.streams.filter(stream => {
    return stream.codec_type === 'audio'
  })

  const metadata: Metadata = {
    video: videoStreams[0],
    audio: audioStreams[0],
    format: rawMeta.format,
  }
  return metadata
}

export function getMetadata(input: string): Promise<Metadata> {
  return new Promise((resolve, reject) => {
    ffprobe(input, function (err, rawMetadata) {
      if (err) return reject(err)
      if (!rawMetadata?.streams?.length) {
        return reject(new Error('Metadata did not contain any streams'))
      }
      return resolve(transformFfprobeToMetadata(rawMetadata))
    })
  })
}

export function parseFramerate(r_frame_rate: string): number {
  let framerate: number

  if (r_frame_rate.includes('/')) {
    // Probably like 60/1 or something
    const [frames, time] = r_frame_rate.split('/')
    framerate = parseFloat(frames) / parseFloat(time)
  } else {
    // Probably like 23.976
    framerate = parseFloat(r_frame_rate)
  }

  if (framerate <= 15.1 && framerate >= 14.9) {
    return 15
  }

  if (framerate <= 25.1 && framerate >= 23.9) {
    return 24
  }

  if (framerate <= 30.1 && framerate >= 29.9) {
    return 30
  }

  if (framerate <= 60.1 && framerate >= 59.9) {
    return 60
  }

  if (framerate > 60.1) {
    return 60
  }

  return Math.round(framerate)
}