/**
 * Compila num diretorio separado de `.next`, para validar um build sem
 * derrubar um `next dev` que esteja rodando.
 *
 * Por que isso existe: `next dev` e `next build` usam o MESMO `.next/` por
 * padrao. Um build feito com o dev ligado sobrescreve os chunks de
 * desenvolvimento, e o dev server segue com um manifest em memoria apontando
 * para arquivos que nao existem mais. O sintoma e
 * `Error: Cannot find module './819.js'` e a unica saida e apagar o `.next`.
 *
 * Por que e um arquivo e nao um `node -e` no package.json: a versao inline
 * passava por `cmd.exe` (o npm no Windows executa scripts por ele) e a variavel
 * de ambiente nao chegava ao processo do build - ele compilava em `.next`
 * mesmo assim, justamente o que se queria evitar. Aqui o env e passado
 * explicitamente e nao ha shell no caminho.
 */
const { spawnSync } = require('child_process')
const path = require('path')

const DIST_DIR = '.next-verify'

const env = { ...process.env, NEXT_DIST_DIR: DIST_DIR }

// Invoca o binario do Next pelo caminho resolvido, sem shell: sem shell nao ha
// interpretacao de aspas nem de ambiente pelo caminho.
const nextBin = require.resolve('next/dist/bin/next')

const result = spawnSync(process.execPath, [nextBin, 'build', '--no-lint'], {
  stdio: 'inherit',
  env,
  cwd: path.join(__dirname, '..'),
})

if (result.error) {
  console.error('[build:verify] falha ao iniciar o build:', result.error.message)
  process.exit(1)
}

if (result.status === 0) {
  console.log('\n[build:verify] build OK em ' + DIST_DIR + '/ — .next intacto.')
}

process.exit(result.status === null ? 1 : result.status)
