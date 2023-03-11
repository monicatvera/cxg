import {
  intro,
  outro,
  text,
  select,
  confirm,
  multiselect,
  isCancel
} from '@clack/prompts'
import colors from 'picocolors'
import { trytm } from '@bdsqqq/try'

import { exitProgram, snakeCase } from './utils.js'
import { COMMIT_TYPES } from './commit-types.js'
import { BRANCH_TYPES } from './branch-types.js'
import { getChangedFiles, getStagedFiles, gitAdd, gitBranch, gitCommit } from './git.js'

intro(
  colors.inverse(
    ` Asistente para la creación de commits y ramas por ${colors.cyan(' @monicatvera ')}`
  )
)

const [changedFiles, errorChangedFiles] = await trytm(getChangedFiles())
const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles())

if (errorChangedFiles ?? errorStagedFiles) {
  outro(colors.red('Error: Comprueba que estás en un repositorio de git'))
  process.exit(1)
}

const selectedAction = await select({
  message: 'Selecciona una opcion:',
  options: [
    { value: 'branch', label: 'Crear nueva rama' },
    { value: 'commit', label: 'Crear un commit nuevo' }
  ]
})

if (isCancel(selectedAction)) exitProgram()

if (selectedAction === 'commit') {
  if (stagedFiles.length === 0 && changedFiles.length > 0) {
    const files = await multiselect({
      message: colors.cyan(
        'Selecciona los ficheros que quieres añadir al commit:'
      ),
      options: changedFiles.map((file) => ({
        value: file,
        label: file
      }))
    })

    if (isCancel(files)) exitProgram()

    await gitAdd({ files })
  }

  const commitType = await select({
    message: colors.cyan('Selecciona el tipo de commit:'),
    options: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
      value: key,
      label: `${key.padEnd(10, ' ')} · ${value.description}`
    }))
  })

  if (isCancel(commitType)) exitProgram()

  const commitMessage = await text({
    message: colors.cyan('Introduce el mensaje del commit:'),
    validate: (value) => {
      if (value.length === 0) {
        return colors.red('El mensaje no puede estar vacío')
      }

      if (value.length > 50) {
        return colors.red('El mensaje no puede tener más de 100 caracteres')
      }
    }
  })

  if (isCancel(commitMessage)) exitProgram()

  const { release } = COMMIT_TYPES[commitType]

  let breakingChange = false
  if (release) {
    breakingChange = await confirm({
      initialValue: false,
      message: `${colors.cyan(
      '¿Tiene este commit cambios que rompen la compatibilidad anterior?'
    )}
      
  ${colors.yellow(
    'Si la respuesta es sí, deberías crear un commit con el tipo "BREAKING CHANGE" y al hacer release se publicará una versión major'
  )}`
    })

    if (isCancel(breakingChange)) exitProgram()
  }

  let commit = `${commitType}: ${commitMessage}`
  commit = breakingChange ? `${commit} [breaking change]` : commit

  const shouldContinue = await confirm({
    initialValue: true,
    message: `${colors.cyan('¿Quieres crear el commit con el siguiente mensaje?')}
  
    ${colors.green(colors.bold(commit))}
  
    ${colors.cyan('¿Confirmas?')}`
  })

  if (isCancel(shouldContinue)) exitProgram()

  if (!shouldContinue) {
    outro(colors.yellow('No se ha creado el commit'))
    process.exit(0)
  }

  await gitCommit({ commit })

  outro(
    colors.green('✔️ Commit creado con éxito. ¡Gracias por usar el asistente!')
  )
} else {
  const branchType = await select({
    message: colors.cyan('Selecciona el tipo de rama:'),
    options: Object.entries(BRANCH_TYPES).map(([key, value]) => ({
      value: key,
      label: `${key.padEnd(10, ' ')} · ${value.description}`
    }))
  })

  if (isCancel(branchType)) exitProgram()

  const idUS = await text({
    message: colors.cyan('Introduce el ID de la US:'),
    validate: (value) => {
      if (value.length === 0) {
        return colors.red('El id no puede estar vacío')
      }

      if (value.length > 10) {
        return colors.red('El id no puede tener más de 10 caracteres')
      }
    }
  })

  if (isCancel(idUS)) exitProgram()

  const branchMessage = await text({
    message: colors.cyan('Introduce una breve informacion de la rama:'),
    validate: (value) => {
      if (value.length === 0) {
        return colors.red('El mensaje no puede estar vacío')
      }

      if (value.length > 30) {
        return colors.red('El mensaje no puede tener más de 100 caracteres')
      }
    }
  })

  if (isCancel(branchMessage)) exitProgram()

  const branch = `${branchType}/${idUS}_${snakeCase(branchMessage)}`

  const shouldContinue = await confirm({
    initialValue: true,
    message: `${colors.cyan('¿Quieres crear la rama con el el siguiente nombre?')}
  
    ${colors.green(colors.bold(branch))}
  
    ${colors.cyan('¿Confirmas?')}`
  })

  if (isCancel(shouldContinue)) exitProgram()

  if (!shouldContinue) {
    outro(colors.yellow('No se ha creado la rama'))
    process.exit(0)
  }
  await gitBranch({ branch })
  outro(
    colors.green('✔️ Nueva rama creada con exito')
  )
}
