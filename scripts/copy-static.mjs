import { cp, copyFile, mkdir } from 'node:fs/promises'

const ignoredGeneratedFiles = new Set(['app.js', 'app.css'])

await mkdir('dist', { recursive: true })
await copyFile('index.html', 'dist/index.html')
await cp('public', 'dist', {
  recursive: true,
  filter: (source) => !ignoredGeneratedFiles.has(source.replace(/\\/g, '/').split('/').pop()),
})
