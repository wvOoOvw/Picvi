import * as Transformers from '../huggingface/transformers/src/transformers.js'

let generator = null
let currentModelId = null

Transformers.env.allowLocalModels = false

const post = (data) => self.postMessage(data)

const loadModel = async (model) => {
  if (generator !== null && currentModelId === model.id) {
    post({ type: 'ready', modelId: model.id })
    return
  }

  // 切换模型：释放旧的
  if (generator !== null) {
    try {
      if (typeof generator.dispose === 'function') await generator.dispose()
    } catch (e) { }
    generator = null
    currentModelId = null
  }

  try {
    generator = await Transformers.pipeline('text-generation', model.id, {
      dtype: model.dtype || 'q4',
      device: (typeof navigator !== 'undefined' && navigator.gpu) ? 'webgpu' : 'wasm',
      progress_callback: (p) => {
        if (p.status === 'progress' && p.total > 0) {
          post({ type: 'progress', value: Math.round(p.loaded / p.total * 100), file: p.file || '', modelId: model.id })
        }
        if (p.status === 'ready') {
          post({ type: 'progress', value: 100, file: '', modelId: model.id })
        }
      },
    })
    currentModelId = model.id
    post({ type: 'ready', modelId: model.id })
  } catch (error) {
    generator = null
    currentModelId = null
    post({ type: 'error', modelId: model.id })
  }
}

self.onmessage = async (event) => {
  const { type } = event.data

  if (type === 'load') {
    const { model } = event.data
    if (model === undefined || model.id === undefined) {
      post({ type: 'error' })
      return
    }
    await loadModel(model)
    return
  }

  if (type === 'generate') {
    if (generator === null) return

    const { id, messages, model } = event.data

    try {
      // 使用流式输出逐步生成
      const streamer = new Transformers.TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        callback_function: (piece) => {
          post({ type: 'chunk', id, piece })
        },
      })

      const options = {}
      if (model !== undefined) {
        if (typeof model.maxNewTokens === 'number') options.max_new_tokens = model.maxNewTokens
        if (typeof model.temperature === 'number') options.temperature = model.temperature
        if (typeof model.topP === 'number') options.top_p = model.topP
      }

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
