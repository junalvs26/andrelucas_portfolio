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
const net = require('net')
const path = require('path')

const DIST_DIR = '.next-verify'
const DEV_PORT = Number(process.env.PORT || 3000)

/**
 * Recusa rodar se o servidor de dev estiver de pe.
 *
 * Eu achei que compilar em `.next-verify` bastasse para isolar os dois. Nao
 * basta: mesmo com distDir separado, uma execucao concorrente deixou o
 * `.next` em estado inconsistente - `webpack-runtime.js` reescrito por uma
 * compilacao esperando os chunks na raiz enquanto os chunks da outra estavam
 * em `chunks/`. O sintoma e `Cannot find module './390.js'` com o arquivo
 * existindo em `.next/server/chunks/390.js`.
 *
 * Testei o isolamento uma vez, funcionou, e conclui que era seguro. Nao era.
 * Entao a regra vira trava em vez de disciplina.
 */
function devServerIsRunning() {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port: DEV_PORT })
    const done = (result) => {
      socket.destroy()
      resolve(result)
    }
    socket.setTimeout(700)
    socket.once('connect', () => done(true))
    socket.once('timeout', () => done(false))
    socket.once('error', () => done(false))
  })
}

async function main() {
  if (await devServerIsRunning()) {
    console.error(
      '\n[build:verify] RECUSADO: ha algo escutando na porta ' + DEV_PORT + '.\n\n' +
        'Compilar em paralelo com o `next dev` deixa o `.next` inconsistente,\n' +
        'mesmo com distDir separado. Pare o dev, rode o build, suba o dev de novo.\n'
    )
    process.exit(1)
  }

  // Invoca o binario do Next pelo caminho resolvido, sem shell: sem shell nao ha
  // interpretacao de aspas nem de ambiente pelo caminho.
  const nextBin = require.resolve('next/dist/bin/next')

  const result = spawnSync(process.execPath, [nextBin, 'build', '--no-lint'], {
    stdio: 'inherit',
    env: { ...process.env, NEXT_DIST_DIR: DIST_DIR },
    cwd: path.join(__dirname, '..'),
  })

  if (result.error) {
    console.error('[build:verify] falha ao iniciar o build:', result.error.message)
    process.exit(1)
  }

  if (result.status === 0) {
    console.log('\n[build:verify] build OK em ' + DIST_DIR + '/')
  }

  process.exit(result.status === null ? 1 : result.status)
}

main()
