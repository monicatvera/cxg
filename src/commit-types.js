export const COMMIT_TYPES = {
  feat: {
    description: 'Agregar nueva característica',
    release: true // que si haces un commit de este tipo, luego deberías hacer un release
  },
  fix: {
    description: 'Enviar una solución a un error',
    release: true
  },
  perf: {
    description: 'Mejorar el rendimiento',
    release: true
  },
  refactor: {
    description: 'Código de refactorización',
    release: true
  },
  docs: {
    description: 'Agregar o actualizar la documentación',
    release: false
  },
  test: {
    description: 'Agregar o actualizar test',
    release: false
  },
  build: {
    description: 'Agregar o actualizar scripts de compilación',
    release: false
  }
}
