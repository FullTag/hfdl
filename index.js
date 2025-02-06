#!/usr/bin/env node

import { readFile, writeFile, mkdir } from 'fs/promises'
import { dirname } from 'path'
import YAML from 'yaml'
import pLimit from 'p-limit'
import { z } from 'zod'
import { downloadFile } from '@huggingface/hub'

const schema = z.record(z.string(), z.object({
  files: z.array(z.string()),
}))

const YAML_FILE = process.env.HF_YAML || 'huggingface.yaml'
const CACHE_DIR = process.env.HF_CACHE_DIR || 'cache'
const limit = pLimit(+process.env.HF_CONCURRENCY_LIMIT || 6)
const accessToken = process.env.HF_TOKEN

// read yaml file
const yaml = schema.parse(YAML.parse(await readFile(YAML_FILE, 'utf8')))
const downloads = []

async function ensureDir(filename) {
  return mkdir(dirname(filename), { recursive: true })
}

for (const [repo, options] of Object.entries(yaml)) {
  downloads.push(...options.files.map(path => ensureDir(`${CACHE_DIR}/${repo}/${path}`).then(limit(
    () => downloadFile({
      repo,
      path,
      accessToken,
    }).then(
      (file) => file.blob().then(
        async (blob) => writeFile(`${CACHE_DIR}/${repo}/${path}`, Buffer.from(await blob.arrayBuffer()))
          .then(() => console.log(`Successfully downloaded ${CACHE_DIR}/${repo}/${path}`)))
          .catch((err) => console.error(`Failed to write ${CACHE_DIR}/${repo}/${path}`, err))
    ).catch((err) => console.error(`Failed to download ${repo}/${path}`, err))
  ))))
}

await Promise.all(downloads)
