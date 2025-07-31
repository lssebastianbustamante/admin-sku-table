/* eslint-disable no-alert */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react'
import {
  Layout,
  PageHeader,
  PageBlock,
  Button,
  Spinner,
  Box,
  Input,
  Checkbox,
  Alert,
} from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'

import useRegister from './hooks/useRegister'

const EditSkuForm = (props: any) => {

  const { sku } = props.params
  const { navigate } = useRuntime()
  const {
    register,
    loading,
    actionLoading,
    actionMessage,
    error,
    isAuth,
    setActionMessage,
    handleOnChangeData,
    saveRegister,
    fetchRegister,
  } = useRegister()

  const returnHome = () => {
    navigate({
      to: `/admin/app/catalog-normalization/main`,
    })
  }

  // Get Current Register
  useEffect(() => {
    if (isAuth) fetchRegister(sku)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth])

  // Debug Action Messages
  /* useEffect(() => {
    if (actionMessage) console.log(actionMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionMessage]) */

  return (

    <Layout pageHeader={
      <PageHeader
        title="Editar SKU"
        linkLabel="VOLVER"
        onLinkClick={returnHome}
      />
    }>
      <PageBlock>
        
        {
          actionMessage &&
          <div className="mb5">
            <Alert 
              autoClose = "10000"
              type={actionMessage.split('|')[0]}
              onClose={() => setActionMessage('')}
            >
                {actionMessage.split('|')[1]}
            </Alert>
          </div>
        }

        {loading && <Spinner />}

        {error && <p>Error cargando los datos.</p>}

        {register.AccountNameAndSkuDis !== '' && (
          <Box>
            <h3>{register.Name}</h3>
            <div className="mb5">
              <Input
                value={register.AccountNameAndSkuDis}
                readOnly
                label="ID"
              />
            </div>
            <div className="mb5">
              <Input
                value={register.Name}
                label="Producto"
                name="Name"
                onChange={(e: any) => handleOnChangeData(e)}
              />
            </div>
            <div className="mb5">
              <Input
                value={register.Sku}
                label="Sku"
                name="Sku"
                onChange={(e: any) => handleOnChangeData(e)}
              />
            </div>
            <div className="mb5">
              <Input
                value={register.ERPCode}
                label="Código de distribuidor"
                name="ERPCode"
                onChange={(e: any) => handleOnChangeData(e)}
              />
            </div>
            <div className="mb5">
              <Input
                value={register.AccountName}
                label="Cuenta"
                name="AccountName"
                onChange={(e: any) => handleOnChangeData(e)}
              />
            </div>
            <div className="w-100 mv6">
              <Checkbox
                checked={register.Active}
                id="option-1"
                label="Activo"
                name="Active"
                onChange={(e: any) => handleOnChangeData(e)}
                value="option-1"
              />
            </div>
            <div className="w-50">
              <Button variation="tertiary" onClick={returnHome}>
                Cancelar
              </Button>
              <Button
                variation="primary"
                onClick={saveRegister}
                isLoading={actionLoading}
              >
                Guardar
              </Button>
            </div>
          </Box>
        )}
      </PageBlock>
    </Layout>
  )
}

export default EditSkuForm
