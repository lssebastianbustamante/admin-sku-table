/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/*
 * DCOS Enabled Endpoints:
  POST  - https://sk3iqlradb.execute-api.us-west-2.amazonaws.com/qa/distributors
  GET   - https://sk3iqlradb.execute-api.us-west-2.amazonaws.com/qa/distributors
  GET   - https://sk3iqlradb.execute-api.us-west-2.amazonaws.com/qa/distributors/get/{id}
  PUT   - https://sk3iqlradb.execute-api.us-west-2.amazonaws.com/qa/distributors/update/{id}
  DELETE- https://sk3iqlradb.execute-api.us-west-2.amazonaws.com/qa/distributors/delete/{id}
 
 * Documentation
  https://brandlive-summa.atlassian.net/wiki/spaces/Mondelez1/pages/705036293/Gesti+n+de+C+digos+de+Distribuidores
*/

import axios from 'axios'

import { Register } from '../models/Register.interface'

const tokenUrl =
  'https://mdlz-latam-api-qa.auth.us-west-2.amazoncognito.com/oauth2/token'

const baseURL =
  'https://sk3iqlradb.execute-api.us-west-2.amazonaws.com/qa/distributors'

// eslint-disable-next-line no-restricted-syntax, @typescript-eslint/naming-convention, no-shadow
enum endpoints {
  getAll = '/',
  getById = '/get/',
  updateById = '/update/',
  deleteById = '/delete/',
  create = '/',
  import = '/import',
}

export const getToken = async () => {
  const data = new URLSearchParams()

  data.append('grant_type', 'client_credentials')

  try {
    const response = await axios.post(tokenUrl, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          '',
      },
    })

    // eslint-disable-next-line no-console
    console.log('Response:', response.data)

    return response.data
  } catch (error) {
    console.error('Error:', error)
  }
}

export const getData = async (
  retries: number,
  delay: number,
  token: string
): Promise<any> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log('try')
      // eslint-disable-next-line no-await-in-loop
      const response = await axios.get(`${baseURL}${endpoints.getAll}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const { data } = response

      console.log('response', data)

      return data
    } catch (error) {
      console.log('catch')
      if (attempt === retries) {
        throw error
      }

      console.warn(
        `${error} Intento ${attempt} fallido. Reintentando en ${delay} ms...`
      )
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, delay))
    }
  }
}

export const getDataById = async (
  id: string,
  retries: number,
  delay: number,
  token: string
): Promise<any> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await axios.get(`${baseURL}${endpoints.getById}${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const { data } = response

      console.log('response', data)

      return data
    } catch (error) {
      if (attempt === retries) {
        throw error
      }

      console.warn(
        `${error} Intento ${attempt} fallido. Reintentando en ${delay} ms...`
      )
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, delay))
    }
  }
}

export const updateData = async (
  register: Register,
  token: string
): Promise<any> => {
  /* try { */
    const response = await axios.put(
      `${baseURL}${endpoints.updateById}${register.AccountNameAndSkuDis}`,
      register,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return response
  /* } catch (error) {
    console.warn(error)
  } */
}

export const createData = async (
  register: Register,
  token: string
): Promise<any> => {
  /* try { */
    const response = await axios.post(
      `${baseURL}${endpoints.create}`,
      register,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return response
  /* } catch (error) {
    console.warn(error)
  } */
}

export const deleteData = async (id: string, token: string): Promise<any> => {
  /* try { */
    const response = await axios.delete(
      `${baseURL}${endpoints.deleteById}${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return response
  /* } catch (error) {
    console.warn(error)
  } */
}

export const createDataByList = async (
  registerList: Object,
  token: string
): Promise<any> => {

  const response = await axios.post(
    `${baseURL}${endpoints.import}`,
    registerList,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response

}
