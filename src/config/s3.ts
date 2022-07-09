import AWS from 'aws-sdk'

AWS.config.update({
  region: 'us-east-2',
  accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
  secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY,
  maxRetries: 8,
  httpOptions: {
    timeout: 5000,
    connectTimeout: 3000,
  },
})

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  endpoint: process.env.SPACES_ENDPOINT,
})

export function s3URI(uri: string) {
  const s3UrlRe = /^[sS]3:\/\/(.*?)\/(.*)/
  const match = uri.match(s3UrlRe)
  if (!match) throw new Error(`Not a valid S3 URI: ${uri}`)

  return {
    Bucket: match[1],
    Key: match[2],
  }
}

export async function getSignedURL(urlParams: { Bucket: string; Key: string }) {
  return s3.getSignedUrlPromise('getObject', {
    Key: urlParams.Key,
    Bucket: urlParams.Bucket,
    Expires: 86400 * 7, // 7 days
  })
}

export async function deleteFolder({ Bucket, Prefix }: { Bucket: string; Prefix: string }) {
  // TODO :: Make this work for more than 1000 keys

  if (Prefix.length < 1) {
    throw new Error('Delete folder prefix must be greater than 0')
  }

  const { Contents } = await s3.listObjectsV2({ Bucket, Prefix }).promise()
  const deleteObjects: any =
    Contents?.map(({ Key }) => {
      return { Key }
    }) || []

  return s3
    .deleteObjects({
      Bucket,
      Delete: {
        Quiet: false,
        Objects: deleteObjects,
      },
    })
    .promise()
}

export default s3
export const cdnBucket = process.env.CDN_BUCKET as string
export const archiveBucket = process.env.ARCHIVE_BUCKET as string
