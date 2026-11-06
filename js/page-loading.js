(() => {
  const root = document.documentElement
  const loaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise(resolve => window.addEventListener('load', resolve, { once: true }))

  root.classList.add('page-loading')
  root.setAttribute('aria-busy', 'true')

  async function revealPage() {
    try {
      const images = Array.from(document.images).filter(image => image.src || image.srcset)
      let completed = 0
      const total = images.length + 2
      const advance = () => {
        completed += 1
        root.style.setProperty('--page-load-progress', `${4 + 96 * completed / total}%`)
      }

      const imageLoads = images.map(async image => {
        // Offscreen images must also finish before the page is shown.
        image.loading = 'eager'
        try {
          await image.decode()
        } catch {
          // A failed image must not keep the rest of the page hidden.
        }
        advance()
      })

      await Promise.all([...imageLoads, loaded.then(advance)])
      await document.fonts?.ready
      advance()
    } finally {
      root.classList.remove('page-loading')
      root.removeAttribute('aria-busy')
      root.style.removeProperty('--page-load-progress')
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealPage, { once: true })
  } else {
    revealPage()
  }
})()
