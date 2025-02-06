# 🤗 HFDL

A super simple script that can run using `npx` (or equivalent) in order to download certain files from HuggingFace 🤗

This can be handy when building a Node.js app with transformers.js and Dockerizing that app, for example.

## Usage

Create a `huggingface.yaml` file with the following content:
```yaml
[MODELNAME]:
  files:
    - [<FILE1>]
    - ...
[ANOTHERMODELNAME]:
  files:
    - [FILE1]
    - [FILE2]
    - ...
...
```

then run `npx hfdl` and wait for your files to be downloaded in the `cache` directory. That's it!

Your `Dockerfile` could look something like this:

```Dockerfile
FROM node:lts-alpine
WORKDIR /app
COPY huggingface.yaml ./
RUN npx hfdl
COPY package*.json ./
RUN npm ci
COPY . ./
CMD ['npm', 'run', 'start']
```

## Configuration

| Name                 | Description                                          | Default value      |
| -------------------- | ---------------------------------------------------- | ------------------ |
| HF_YAML              | The location of your yaml file                       | `huggingface.yaml` |
| HF_CACHE_DIR         | The location to store the downloaded files           | `cache`            |
| HF_CONCURRENCY_LIMIT | How many concurrent downloads can take place         | `6`                |
| HF_TOKEN             | The accesstoken to use when accessing private models |                    |
