/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import {
  Layout,
  PageHeader,
  PageBlock,
  Table,
  Modal,
  Input,
  Dropzone,
  Textarea,
  Checkbox,
  Button,
  ButtonWithIcon,
  IconEdit,
  IconDelete,
  Spinner,
  Alert,
  IconSuccess,
  IconFailure,
} from 'vtex.styleguide'

import { useRuntime } from 'vtex.render-runtime'

import useRegister from './hooks/useRegister'

const Main = () => {
  const { navigate } = useRuntime()
  const {
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
    fetchRegisters,
    createRegister,
    deleteRegister,
    createRegisterByList,
  } = useRegister()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [registerList, setRegisterList] = useState({})
  const [registerToDelete, setRregisterToDelete] = useState(0)

  const handleNewRegister = () => {
    // eslint-disable-next-line no-console
    console.log('[handleNewRegister] Creating Register...')
    createRegister()
    handleToggleModal()
  }

  const handleImportRegisters = () => {
    // eslint-disable-next-line no-console
    console.log('[handleImportRegisters] Importing Registers...')
    createRegisterByList(registerList)
    handleToggleModal()
  }

  const handleToggleModal = () => {
    // eslint-disable-next-line no-console
    //console.log('handleToggleModal')
    // eslint-disable-next-line no-console
    //console.log('REGISTER: ', register)
    setRegister(initialRegister)
    setRegisterList({})
    setRregisterToDelete(0)
    setIsModalOpen(!isModalOpen)
  }

  const handleRegisterCount = (registers: any, type?: any) => {
    let _registerCount = ''
    if (!registers) _registerCount = 'No hay datos.'

    if (type == 'active') _registerCount = registers.filter((register: any) => register["Active"]).length
    if (type == 'inactive') _registerCount = registers.filter((register: any) => !register["Active"]).length
    if (!type) _registerCount = registers.length

    return _registerCount
  }

  const handleFileReset = () => {
    setRregisterToDelete(0)
    setRegisterList({})
  }

  const handleCSVFile = (files: any) => {

    const file = files[0] //event.target.files[0];

    if (file && file.type === 'text/csv') {

      const reader = new FileReader();

      reader.onload = function (e: any) {

        const cleanTrailing = (string: string) => {
          return string.replace(/[\n\r]+/g, ''); // Compensates Carriage Return & New Line
        }

        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');

        // Set Base JSON Structure
        const jsonData = {
          //AccountName: "",
          ErpData: []
        }

        let _regToDelete = registerToDelete

        // Create Registers
        jsonData.ErpData = lines.slice(1).map((line: any) => {

          const values = line.split(',');

          return headers.reduce((acc: any, header: any, i: any) => {

            let dataDictionary: { [key: string]: string } = {
              "Cuenta": "AccountName",
              "ID": "AccountNameAndSkuDis",
              "Producto": "Name",
              "SKU ID": "Sku",
              "Codigo Distribuidor": "ERPCode",
              "Activo": "Active",
              "Borrar": "Delete"
            }

            let cleanHeader = cleanTrailing(header)
            let translatedHeader = dataDictionary[cleanHeader]

            if (cleanHeader == "Activo" || cleanHeader == "Borrar") {

              let _booleanValue = cleanTrailing(values[i]).toLowerCase()

              // This value must be a Boolean
              if (_booleanValue == '' || _booleanValue == 'false') acc[translatedHeader] = false
              if (_booleanValue == 'true') acc[translatedHeader] = true

              // If Deletion, add to warning
              if (cleanHeader == "Borrar" && acc[translatedHeader]) _regToDelete++

            } else {

              acc[translatedHeader] = cleanTrailing(values[i])

            }

            //acc[header] = values[i];


            return acc;

          }, {});

        });

        setRregisterToDelete(_regToDelete)
        setRegisterList(jsonData)

      };

      reader.readAsText(file);

    } else {
      setRegisterList({
        Error: "El tipo de archivo es Incorrecto."
      })
    }

  }

  const downloadCSV = (CSVData:string) => {

    const csvData = new Blob([CSVData], { type: 'text/csv' });
    const csvURL = URL.createObjectURL(csvData);
    const link = document.createElement('a');
    const fileName = `catalog-homologation-${new Date().toLocaleDateString('es-CR').replace(/\//g, '-')}`;

    link.href = csvURL;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  };

  const handleExportRegisters = ( registers: any) => {

    let _headers = "Producto,SKU ID,Cuenta,Codigo Distribuidor,Activo,Borrar"

    let dataDictionary: { [key: string]: any } = {

      "Name": {
        order: 0,
        name: "Producto",
      }, 

      "Sku": {
        order: 1,
        name: "SKU ID",
      }, 

      "AccountName": {
        order: 2,
        name: "Cuenta",
      },

      "ERPCode": {
        order: 3,
        name: "Codigo Distribuidor",
      },

      "Active": {
        order: 4,
        name: "Activo",
      }, 

    }

    let csvContent = _headers + "\r\n";

    // Traverse All Registers
    registers.forEach(function (register:any) {

      let _forgedRow:Array<string> = []

      // Traverse Register Data
      Object.keys(register).forEach((key) => {

        if (dataDictionary[key]) {

          if (key === "Active") register[key] = String(register[key]).toUpperCase() // Transform Boolean

          _forgedRow[dataDictionary[key].order] = register[key]

        }

      })

      // Adds forged row plus the Delete Key in FALSE.
      csvContent += _forgedRow.join(",") + ",FALSE" + "\r\n";

    });

    //console.log('[handleExportRegisters] - FINAL: ', csvContent)

    downloadCSV(csvContent)

  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (rowData: any) => {
    const { AccountNameAndSkuDis } = rowData

    navigate({
      to: `/admin/app/catalog-normalization/sku/${AccountNameAndSkuDis}`,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actionsComponent = (e: any) => {
    return (
      <div className="flex">
        <div className="pt5 pr3 pb5">
          <ButtonWithIcon
            disabled={loading}
            icon={<IconEdit />}
            variation="secondary"
            onClick={() => handleEdit(e.rowData)}
          />
        </div>
        <div className="pt5 pb5">
          <ButtonWithIcon
            disabled={loading}
            icon={<IconDelete />}
            variation="danger"
            onClick={() => {
              deleteRegister(e.rowData.AccountNameAndSkuDis)
            }}
          />
        </div>
      </div>
    )
  }

  const jsonschema = {
    properties: {
      Active: {
        title: 'Activo',
        width: 60,
        cellRenderer: ({ /* cellData,  */rowData }: any) => {
          return (
            <Checkbox
              checked={(rowData.Active) ? 'checked' : ''}
              disabled={true}
              id="isActive"
              name="isActive"
            />
          )
        }
      },
      AccountNameAndSkuDis: {
        title: 'ID',
        width: 280,
      },
      Name: {
        title: 'Producto',
        minWidth: 400,
      },
      Sku: {
        title: 'SKU ID',
        width: 200,
      },
      AccountName: {
        title: 'Cuenta',
        width: 200,
      },
      ERPCode: {
        title: 'Código Distribuidor',
        width: 150,
      },
      actions: {
        title: 'Acciones',
        width: 110,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellRenderer: (e: any) => actionsComponent(e),
      },
    },
  }

  useEffect(() => {
    if (isAuth) {
      fetchRegisters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth])

  useEffect(() => {
    if (error) {
      setActionMessage("error|Ocurrió un error en el acceso de datos.")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <Layout
      fullWidth
      pageHeader={
        <PageHeader title="Homologación de Catálogo" />
      }
    >
      <PageBlock variation="full">

        {
          actionMessage &&
          <div className="mb5">
            <Alert
              autoClose="10000"
              type={actionMessage.split('|')[0]}
              onClose={() => setActionMessage('')}
            >
              {actionMessage.split('|')[1]}
            </Alert>
          </div>
        }

        {loading && <Spinner />}

        {registers.length > 0 && (
          <Table
            fullWidth
            schema={jsonschema}
            items={registers.slice(0, registers.length)}
            toolbar={{
              density: {
                buttonLabel: 'Espaciado de Filas',
                lowOptionLabel: 'Amplio',
                mediumOptionLabel: 'Normal',
                highOptionLabel: 'Estrecho',
                // eslint-disable-next-line prettier/prettier
              },
              fields: {
                label: 'Mostrar / Ocultar Campos',
                showAllLabel: 'Mostrar Todos',
                hideAllLabel: 'Ocultar Todos',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onToggleColumn: (params: any) => {
                  // eslint-disable-next-line no-console
                  console.log(params.toggledField)
                  // eslint-disable-next-line no-console
                  console.log(params.activeFields)
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onHideAllColumns: (activeFields: any) =>
                  // eslint-disable-next-line no-console
                  console.log(activeFields),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onShowAllColumns: (activeFields: any) =>
                  // eslint-disable-next-line no-console
                  console.log(activeFields),
              },
              download: {
                label: 'Exportar',
                isLoading: loading,
                handleCallback: () => handleExportRegisters(registers),
              },
              newLine: {
                label: 'Agregar registros',
                isLoading: actionLoading,
                handleCallback: () => handleToggleModal(),
              },
            }}
            totalizers={[
              {
                label: 'Registros Totales',
                value: handleRegisterCount(registers),
                isLoading: loading,
              },
              {
                label: 'Registros Activos',
                value: handleRegisterCount(registers, 'active'),
                iconBackgroundColor: '#eafce3',
                icon: <IconSuccess color="#79B03A" size={14} />,
                isLoading: loading,
              },
              {
                label: 'Registros Inactivos',
                value: handleRegisterCount(registers, 'inactive'),
                icon: <IconFailure size={14} />,
                isLoading: loading,
              },
            ]}
          />
        )}

        <Modal
          centered
          bottomBar={
            <div className="nowrap">
              <span className="mr4">
                <Button variation="tertiary" onClick={handleToggleModal}>
                  Cancelar
                </Button>
              </span>
            </div>
          }
          isOpen={isModalOpen}
          onClose={handleToggleModal}
        >
          <div className="flex flex-row-ns">

            <div className="w-100 w-50-ns mv4 pv6-ns pl6-ns">

              <div className="w-100 mv6">
                <h3> Agregar Registro </h3>
              </div>

              <div className="w-100 mv6">
                <Input
                  placeholder="ID"
                  size="large"
                  name="AccountNameAndSkuDis"
                  value={register.AccountNameAndSkuDis}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e: any) => handleOnChangeData(e)}
                />
              </div>

              <div className="w-100 mv6">
                <Input
                  placeholder="Producto"
                  size="large"
                  name="Name"
                  value={register.Name}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e: any) => handleOnChangeData(e)}
                />
              </div>

              <div className="w-100 mv6">
                <Input
                  placeholder="SKU ID"
                  size="large"
                  name="Sku"
                  value={register.Sku}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e: any) => handleOnChangeData(e)}
                />
              </div>

              <div className="w-100 mv6">
                <Input
                  placeholder="Cuenta"
                  size="large"
                  name="AccountName"
                  value={register.AccountName}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e: any) => handleOnChangeData(e)}
                />
              </div>

              <div className="w-100 mv6">
                <Input
                  placeholder="Código Distribuidor"
                  size="large"
                  name="ERPCode"
                  value={register.ERPCode}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e: any) => handleOnChangeData(e)}
                />
              </div>

              <div className="w-100 mv6">
                <Checkbox
                  checked={register.Active}
                  id="option-1"
                  label="Activo"
                  name="Active"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e: any) => handleOnChangeData(e)}
                  value="Activo"
                />
              </div>

              <div className="w-100 mv6">
                <ButtonWithIcon
                  disabled={loading}
                  icon={<IconEdit />}
                  variation="primary"
                  onClick={handleNewRegister}
                >
                  Guardar Registro
                </ButtonWithIcon>
              </div>

            </div>

            <div className="w-100 w-50-ns mv4 pv6-ns pl6-ns">

              <div className="w-100 mv6">

                <h3> Importar Planilla </h3>

                <div className="w-100 mv6" style={{ cursor: 'pointer' }}>
                  <Dropzone
                    onFileReset={handleFileReset}
                    onDropAccepted={handleCSVFile}
                  >
                    <div className="pt7">
                      <div>
                        <span className="f4">Arrastre su CSV o </span>
                        <span className="f4 c-link">
                          haga Click para buscarlo.
                        </span>
                      </div>
                    </div>
                  </Dropzone>
                </div>

                <div className="w-100 mv6">
                  <Textarea
                    label="Vista Previa"
                    disabled
                    value={JSON.stringify(registerList, null, 2)}
                  />
                </div>

                {
                  registerToDelete > 0 &&
                  <div className="w-100 mv6">
                    <Alert type="warning">
                      [Aviso]  Registro(s) a eliminar:  <strong>{registerToDelete}</strong>
                    </Alert>
                  </div>
                }

                <div className="w-100 mv6">
                  <ButtonWithIcon
                    disabled={loading}
                    icon={<IconEdit />}
                    variation="primary"
                    onClick={handleImportRegisters}
                  >
                    Importar Registros
                  </ButtonWithIcon>
                </div>

              </div>

            </div>

          </div>
        </Modal>
      </PageBlock>
    </Layout>
  )
}

export default Main
