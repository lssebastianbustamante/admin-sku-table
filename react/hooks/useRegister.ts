/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { useState, useCallback, useEffect } from 'react'

import {
  getData,
  getDataById,
  updateData,
  createData,
  deleteData,
  getToken,
  createDataByList,
} from '../services/Register.service'
import { Register } from '../models/Register.interface'

// eslint-disable-next-line no-restricted-syntax, no-shadow
enum Retry {
  retries = 5,
  delay = 1000,
}

const initialRegister = {
  AccountNameAndSkuDis: '',
  Name: '',
  AccountName: '',
  ERPCode: '',
  Sku: '',
  Active: false,
}

const useRegister = () => {
  const [register, setRegister] = useState<Register>(initialRegister)
  const [registers, setRegisters] = useState<Register[]>([])
  const [error, setError] = useState(null)
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [token, setToken] = useState<string>('')

  const handleOnChangeData = (e: any) => {

    const { name, value, checked } = e.target

    if (name === 'Active') {
      setRegister({ ...register, [name]: checked })
    } else {
      setRegister({ ...register, [name]: value })
    }

  }

  const fetchToken = async () => {
    try {
      console.log('try fetch token')
      const result = await getToken()

      console.log('token result', result)
      if (result?.access_token) {
        localStorage.setItem('mdlz-token', result.access_token)
        localStorage.setItem(
          'mdlz-token-expire-time',
          //(Date.now() + 3600 * 1000).toString()
          (Date.now() + 300000).toString() // 5 Minutes
        )
        setToken(result.access_token)
      } else {
        throw new Error('Access Token Not Found.')
      }
    } catch (err) {
      console.log('catch fetch token')
      console.warn(err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRegisters = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getData(Retry.retries, Retry.delay, token)
      setRegisters(result)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [token])

  const fetchRegister = async (id: string) => {
    try {
      const result = await getDataById(id, Retry.retries, Retry.delay, token)
      setRegister(result)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const saveRegister = async () => {
    setActionLoading(true)
    try {
      const result = await updateData(register, token)
      console.log(result)
      setActionMessage('success|Registro Guardado')
    } catch (err) {
      setActionMessage('error|Error al Guardar Registro')
      //setError(err)
    } finally {
      setActionLoading(false)
    }
  }

  const createRegister = async () => {
    setActionLoading(true)
    try {
      await createData(register, token)
        .then(() => {
          setActionMessage('success|Registro Creado')
          fetchRegisters()
        })
        .catch(() => {
          setActionMessage('error|Error al Crear Registro')
        })
    } catch (err) {
      setActionMessage('error|Error al Crear Registro')
      //setError(err)
    } finally {
      setActionLoading(false)
    }
  }

  const deleteRegister = async (id: string) => {
    setLoading(true)
    try {
      await deleteData(id, token)
        .then(() => {
          setActionMessage('success|Registro Borrado')
          fetchRegisters()
        })
        .catch(() => {
          setActionMessage('error|Error al Borrar Registro')
        })
    } catch (err) {
      setActionMessage('error|Error al Borrar Registro')
      //setError(err)
    } finally {
      setLoading(false)
    }
  }
  
  const createRegisterByList = async (registerList:any) => {
    setActionLoading(true)
    try {
      await createDataByList(registerList, token)
        .then(() => {
          setActionMessage('success|Registros Importados')
          fetchRegisters()
        })
        .catch(() => {
          setActionMessage('error|Error al Importar Registros')
        })
    } catch (err) {
      setActionMessage('error|Error al Importar Registros')
      //setError(err)
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    const mdlzToken: string = localStorage.getItem('mdlz-token') ?? ''
    const mdlzTokenExpireTime = Number(
      localStorage.getItem('mdlz-token-expire-time') ?? 0
    )

    if (
      (mdlzToken && (Date.now() > mdlzTokenExpireTime))
      ||
      (mdlzToken === '')
    ) {
      // eslint-disable-next-line no-console
      console.log('[CatalogNormalization] Fetching new Token...')
      fetchToken()
    } else {
      setToken(mdlzToken)
    }
  }, [])

  useEffect(() => {
    if (token !== '') setIsAuth(true)
  }, [token])

  return {
    register,
    registers,
    error,
    loading,
    actionLoading,
    actionMessage,
    isAuth,
    initialRegister,
    setActionMessage,
    handleOnChangeData,
    setRegister,
    saveRegister,
    fetchRegister,
    fetchRegisters,
    createRegister,
    deleteRegister,
    createRegisterByList,
  }
}

export default useRegister
