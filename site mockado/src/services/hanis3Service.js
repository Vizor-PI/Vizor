AWS_REGION=sa-east-1
AWS_ACCESS_KEY_ID=AKIA
AWS_SECRET_ACCESS_KEY=123
S3_CLIENT_BUCKET=meu-bucket-client
S3_TRUSTED_PREFIX=trusted // / opcional se usar prefixo

// services/s3Service.js
import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import stream from "stream";
import { promisify } from "util";

const streamToString = async (readableStream) => {
  const chunks = [];
  for await (const chunk of readableStream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
};

const REGION = process.env.AWS_REGION || "sa-east-1";
const S3_CLIENT_BUCKET = process.env.S3_CLIENT_BUCKET || process.env.S3_CLIENT_BUCKET || "meu-bucket-client";

const s3Client = new S3Client({
  region: REGION,
  // If you rely on env AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY the SDK picks them up automatically.
  // If you want to pass explicit creds (not recommended in code) you can add credentials: { accessKeyId, secretAccessKey }
});

/**
 * Read a JSON file from S3 and parse it.
 * @param {string} key - S3 object key (ex: 'alertas-tratado.json' or 'client/Empresa/2025-09-10/summary.json')
 * @param {string} [bucket] - optional bucket name, default is S3_CLIENT_BUCKET env var
 * @returns {Promise<any>} parsed JSON
 */
export async function getJsonObject(key, bucket = S3_CLIENT_BUCKET) {
  if (!key) throw new Error("S3 key is required");

  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  const res = await s3Client.send(cmd);
  const body = res.Body;
  if (!body) throw new Error("Empty body from S3");

  // body is a readable stream in Node.js
  const txt = await streamToString(body);
  try {
    return JSON.parse(txt);
  } catch (err) {
    // fallback: return raw text if not JSON
    throw new Error(`Failed to parse JSON from S3 object ${key}: ${err.message}`);
  }
}

/**
 * List objects under a prefix (useful to discover files under trusted/)
 * @param {string} prefix - S3 prefix (ex: 'trusted/')
 * @param {string} [bucket] - optional bucket name
 * @returns {Promise<string[]>} list of object keys
 */
export async function listKeys(prefix = "", bucket = S3_CLIENT_BUCKET) {
  const results = [];
  let ContinuationToken;
  do {
    const cmd = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken,
      MaxKeys: 1000
    });
    const res = await s3Client.send(cmd);
    if (res.Contents) {
      for (const obj of res.Contents) results.push(obj.Key);
    }
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return results;
}

/**
 * Convenience: if your trusted layout is trusted/{empresa}/{codigo}/{yyyy-mm-dd}/captura_dados_dooh.csv
 * you can call this to get all captura_dados_dooh.csv keys
 */
export async function listTrustedCapturas(trustedRoot = "trusted/") {
  const keys = await listKeys(trustedRoot);
  return keys.filter(k => k.endsWith("captura_dados_dooh.csv"));
}
