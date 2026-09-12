import * as Transformers from '../huggingface/transformers/src/transformers.js'

const MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct'

let generator = null

Transformers.env.allowLocalModels = false

const post = (data) => self.postMessage(data)

self.onmessage = async (event) => {
  const { type } = event.data

  if (type === 'load') {
    if (generator !== null) return
    try {
      generator = await Transformers.pipeline('text-generation', MODEL_ID, {
        dtype: 'q4',
        device: (typeof navigator !== 'undefined' && navigator.gpu) ? 'webgpu' : 'wasm',
        progress_callback: (p) => {
          if (p.status === 'progress' && p.total > 0) {
            post({ type: 'progress', value: Math.round(p.loaded / p.total * 100), file: p.file || '' })
          }
          if (p.status === 'ready') {
            post({ type: 'progress', value: 100, file: '' })
          }
        },
      })
      post({ type: 'ready' })
    } catch (error) {
      post({ type: 'error' })
    }
    return
  }

  if (type === 'generate') {
    if (generator === null) return

    const { id, messages, options } = event.data

    try {
      // 使用流式输出逐步生成
      const streamer = new Transformers.TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        callback_function: (piece) => {
          post({ type: 'chunk', id, piece })
        },
      })

      await generator(messages, {
        max_new_tokens: 128,
        temperature: 0.8,
        top_p: 0.9,
        do_sample: true,
        ...options,
        streamer,
      })

      post({ type: 'done', id })
    } catch (error) {
      post({ type: 'fail', id })
    }
  }
}
