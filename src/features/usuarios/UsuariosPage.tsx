import { useCallback, useState, type FormEvent } from 'react'
import { ApiError } from '../../shared/api'
import type { Rol } from '../../shared/api/types'
import { useServicios } from '../../shared/session/context'
import { useResource } from '../../shared/hooks/useResource'
import { opcion, useFiltros } from '../../shared/hooks/useFiltros'
import { PageHeader, ErrorConsulta, Paginacion } from '../../shared/ui/Datos'
import { EstadoCarga } from '../../shared/ui/EstadoCarga'
import { EstadoVacio } from '../../shared/ui/EstadoVacio'
import { fecha } from '../tickets/model'
import {
  LIMITES_USUARIO,
  esCampoUsuario,
  roles,
  validarUsuario,
  type ErroresUsuario,
  type NuevoUsuario,
} from './usuarios'
import './usuarios.css'

const VACIO: NuevoUsuario = { nombre: '', email: '', password: '', rol: '' }

export function UsuariosPage() {
  const servicios = useServicios()
  const { params, page, size, actualizar } = useFiltros()
  const rol = opcion(params.get('rol'), roles)
  const load = useCallback(
    (signal: AbortSignal) =>
      servicios.listarUsuarios({ rol, page, size }, signal),
    [servicios, rol, page, size],
  )
  const resource = useResource(params.toString(), load)

  return (
    <>
      <PageHeader
        titulo="Usuarios"
        descripcion="Administrá las personas que forman parte de la mesa de ayuda."
        onActualizar={resource.reload}
      />
      <AltaUsuario onCreado={resource.reload} />
      <section className="panel" aria-labelledby="usuarios-listado">
        <h2 id="usuarios-listado" className="sr-only">
          Listado de usuarios
        </h2>
        <div className="filters" role="group" aria-label="Filtros de usuarios">
          <label>
            Rol
            <select
              value={rol ?? ''}
              onChange={(event) => actualizar({ rol: event.target.value })}
            >
              <option value="">Todos los roles</option>
              {Object.entries(roles).map(([clave, texto]) => (
                <option key={clave} value={clave}>
                  {texto}
                </option>
              ))}
            </select>
          </label>
        </div>
        {resource.loading ? (
          <EstadoCarga />
        ) : resource.error ? (
          <ErrorConsulta
            error={resource.error}
            onReintentar={resource.reload}
          />
        ) : (
          resource.data && (
            <>
              {resource.data.content.length ? (
                <div className="table-scroll">
                  <table className="data-table">
                    <caption className="sr-only">Usuarios</caption>
                    <thead>
                      <tr>
                        <th scope="col">Nombre</th>
                        <th scope="col">Email</th>
                        <th scope="col">Rol</th>
                        <th scope="col">Estado</th>
                        <th scope="col">Alta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resource.data.content.map((usuario) => (
                        <tr key={usuario.id}>
                          <td>{usuario.nombre}</td>
                          <td>{usuario.email}</td>
                          <td>{roles[usuario.rol]}</td>
                          <td>{usuario.activo ? 'Activo' : 'Inactivo'}</td>
                          <td className="date-cell">
                            {fecha(usuario.fechaAlta)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EstadoVacio
                  titulo={
                    rol
                      ? 'No hay usuarios con este rol'
                      : 'Todavía no hay usuarios'
                  }
                  descripcion="Los usuarios que des de alta aparecen acá."
                  icono="usuarios"
                />
              )}
              <Paginacion
                page={resource.data.page}
                totalPages={resource.data.totalPages}
                totalElements={resource.data.totalElements}
                size={size}
                onPage={(value) => actualizar({ page: value })}
                onSize={(value) => actualizar({ size: value })}
              />
            </>
          )
        )}
      </section>
    </>
  )
}

function AltaUsuario({ onCreado }: { onCreado: () => void }) {
  const servicios = useServicios()
  const [valores, setValores] = useState<NuevoUsuario>(VACIO)
  const [errores, setErrores] = useState<ErroresUsuario>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const cambiar = (campo: keyof NuevoUsuario, valor: string) =>
    setValores((actuales) => ({ ...actuales, [campo]: valor }))

  const enviar = async (event: FormEvent) => {
    event.preventDefault()
    if (enviando) return
    const locales = validarUsuario(valores)
    setErrores(locales)
    setErrorGeneral(null)
    setAviso(null)
    if (Object.keys(locales).length || !valores.rol) return
    setEnviando(true)
    try {
      const creado = await servicios.crearUsuario({
        nombre: valores.nombre.trim(),
        email: valores.email.trim(),
        password: valores.password,
        rol: valores.rol,
      })
      setValores(VACIO)
      setAviso(
        `Se dio de alta a ${creado.nombre} (${creado.email}) como ${roles[creado.rol].toLowerCase()}.`,
      )
      onCreado()
    } catch (causa) {
      if (causa instanceof ApiError && causa.status === 409) {
        setErrores({ email: 'Ya existe un usuario con ese email.' })
      } else if (causa instanceof ApiError && causa.status === 400) {
        const delServidor: ErroresUsuario = {}
        for (const detalle of causa.detalles)
          if (esCampoUsuario(detalle.campo))
            delServidor[detalle.campo] = detalle.mensaje
        setErrores(delServidor)
        setErrorGeneral(causa.message)
      } else if (
        causa instanceof ApiError &&
        (causa.tipo === 'red' || causa.tipo === 'timeout')
      ) {
        setErrorGeneral(
          causa.message +
            ' Puede que el usuario se haya creado igual: revisá el listado antes de volver a enviarlo.',
        )
      } else {
        setErrorGeneral(
          causa instanceof Error
            ? causa.message
            : 'No pudimos dar de alta el usuario. Intentá nuevamente.',
        )
      }
    } finally {
      setEnviando(false)
    }
  }

  const campo = (
    nombre: 'nombre' | 'email' | 'password',
    etiqueta: string,
    props: {
      type: string
      maxLength: number
      autoComplete: string
      ayuda: string
    },
  ) => (
    <label>
      {etiqueta}
      <input
        name={nombre}
        type={props.type}
        value={valores[nombre]}
        maxLength={props.maxLength}
        autoComplete={props.autoComplete}
        onChange={(event) => cambiar(nombre, event.target.value)}
        disabled={enviando}
        aria-invalid={Boolean(errores[nombre])}
        aria-describedby={nombre + '-ayuda'}
      />
      <span
        id={nombre + '-ayuda'}
        className={errores[nombre] ? 'usuario-error' : 'usuario-ayuda'}
      >
        {errores[nombre] ?? props.ayuda}
      </span>
    </label>
  )

  return (
    <section className="panel usuario-alta" aria-labelledby="usuario-alta">
      <h2 id="usuario-alta">Nuevo usuario</h2>
      <form className="usuario-form" onSubmit={enviar} noValidate>
        {aviso && (
          <p className="notice usuario-aviso" role="status">
            {aviso}
          </p>
        )}
        {errorGeneral && (
          <p className="notice warning usuario-aviso" role="alert">
            {errorGeneral}
          </p>
        )}
        {campo('nombre', 'Nombre', {
          type: 'text',
          maxLength: LIMITES_USUARIO.nombre,
          autoComplete: 'off',
          ayuda: 'Como se va a ver en la mesa de ayuda.',
        })}
        {campo('email', 'Email', {
          type: 'email',
          maxLength: LIMITES_USUARIO.email,
          autoComplete: 'off',
          ayuda: 'Con este email inicia sesión.',
        })}
        {campo('password', 'Contraseña inicial', {
          type: 'password',
          maxLength: LIMITES_USUARIO.passwordMax,
          autoComplete: 'new-password',
          ayuda: `Entre ${LIMITES_USUARIO.passwordMin} y ${LIMITES_USUARIO.passwordMax} caracteres.`,
        })}
        <label>
          Rol
          <select
            name="rol"
            value={valores.rol}
            onChange={(event) => cambiar('rol', event.target.value as Rol | '')}
            disabled={enviando}
            aria-invalid={Boolean(errores.rol)}
            aria-describedby="rol-ayuda"
          >
            <option value="">Elegí un rol</option>
            {Object.entries(roles).map(([clave, texto]) => (
              <option key={clave} value={clave}>
                {texto}
              </option>
            ))}
          </select>
          <span
            id="rol-ayuda"
            className={errores.rol ? 'usuario-error' : 'usuario-ayuda'}
          >
            {errores.rol ?? 'Define a qué pantallas accede.'}
          </span>
        </label>
        <button
          type="submit"
          className="button button-primary"
          disabled={enviando}
        >
          {enviando ? 'Dando de alta…' : 'Dar de alta'}
        </button>
      </form>
    </section>
  )
}
