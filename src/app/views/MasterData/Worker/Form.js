import React, { useState, useEffect } from "react";
import { Form, Button, Input, Space, Select, Row, Col, Typography, Tag } from "antd";
import '../../../css/global.css';
import Maps from "../GoogleMaps";
import SetLocation from "../GoogleMaps/setLocation";
import { FSMServices } from '../../../service/index';
const { Option } = Select;
const { Text } = Typography;


const FormWorker = props => {
   // console.log('tenant : ', props.data);
   // console.log('totalTenantAdded form : ', props.totalTenantAdded);
   // console.log('props.tenantList : ', props.tenantList);
   // console.log('props.readOnly : ', props.readOnly);
   const [form] = Form.useForm();
   const [tenant, setTenant] = useState([
      { tenantId: null, jobId: [] }
   ])
   const [loadingJob, setLoadingJob] = useState(false)
   const [optionListJob, setOptionListJob] = useState([[]])
   const [validateTenant, setValidateTenant] = useState([{
      validateStatus: "success", help: ''
   }])
   const [validateJob, setValidateJob] = useState([{
      validateStatus: "success", help: ''
   }])
   const tenantList = props.tenantList;

   const getJobTenant = async (params, index) => {
      setLoadingJob(true)
      await FSMServices.getJobTenant(params).then(res => {
         let temp =
            res &&
               res.data &&
               res.data.Data ?
               res.data.Data : []
         let data = temp.map(item => {
            return {
               value: item.jobId,
               label: item.jobName
            }
         })
         const tempOptionListJob = optionListJob
         tempOptionListJob[index] = data
         setOptionListJob([...tempOptionListJob])
      })
      setLoadingJob(false)
   }

   const onFinishFailed = errorInfo => {
      const tempValidateTenant = validateTenant
      const tempValidateJob = validateJob
      tenant.forEach((e, i) => {
         if ( e.tenantId === null ) {
            tempValidateTenant[i] = { validateStatus: "error", help: "Please input tenant!" }
         } 
         if ( !e.jobId.length ) {
            tempValidateJob[i] = { validateStatus: "error", help: "Please input skill!" }
         }
      })

      setValidateTenant([...tempValidateTenant])
      setValidateJob([...tempValidateJob])
   }

   const onFinish = values => {
      const tempValidateTenant = validateTenant
      const tempValidateJob = validateJob
      let isValidate = true
      tenant.forEach((e, i) => {
         if (e.tenantId === null) {
            tempValidateTenant[i] = { validateStatus: "error", help: "Please input tenant!" }
            isValidate = false
         }
         if (!e.jobId.length) {
            tempValidateJob[i] = { validateStatus: "error", help: "Please input skill!" }
            isValidate = false
         }
      })
      setValidateTenant([...tempValidateTenant])
      setValidateJob([...tempValidateJob])

      if ( isValidate ) {
         values.tenant = tenant
         props.onFinish(values)         
      }
   }

   const [regexUserIdentity, setRegexUseridentity] = useState(null);
   if (props.visible === false) {
      form.resetFields();
   }

   // const children = [];
   // for (let i = 10; i < 36; i++) {
   //    children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
   // }

   function tagRender(val) {
      const { label, onClose } = val
      return (
         <Tag
            color="#14616B"
            closable={false}
            onClose={onClose}
            style={{ marginRight: 3, marginTop: 1, borderRadius: 20 }}
         >
            {label}
         </Tag>
      )
   }

   const onValuesChange = (changedValues, allValues) => {
      const valuePhoneNumber = changedValues.phoneNumber;
      const reg = /\D/g;
      if (valuePhoneNumber) {
         form.setFieldsValue({
            phoneNumber: changedValues.phoneNumber.replace(reg, '')
         });
      }
   }

   const onChangeUserIdentity = (value, e) => {
      form.setFieldsValue({ nik: null })
      if (e.children === "Passpor") {
         setRegexUseridentity(/[A-Z]{1}[0-9]{7}/);
      } else {
         setRegexUseridentity(/^[0-9]*$/)
      }
   }

   const onChangeTenant = (value, index) => {
      const tempTenant = tenant
      tempTenant[index] = { 
         tenantId: value, jobId: []
      }
      setTenant([...tempTenant])

      const tempValidateTenant = validateTenant
      tempValidateTenant[index] = { validateStatus: "success", help: "" }
      setValidateTenant([...tempValidateTenant])

      getJobTenant({tenantId: value, search: ''}, index)
   }

   const onChangeJob = (value, index) => {
      const tempTenant = tenant
      tempTenant[index] = {
         ...tempTenant[index],
         jobId: value
      }
      setTenant([...tempTenant])

      const tempValidateJob = validateJob
      if ( value.length ) {
         tempValidateJob[index] = { validateStatus: "success", help: "" }
      } else {
         tempValidateJob[index] = { validateStatus: "error", help: "Please input skill!" }
      }
      setValidateJob([...tempValidateJob])
   }

   const onClickAddTenant = () => {
      const tempTenant = tenant
      tempTenant.push({ tenantId: null, jobId: [] })
      setTenant([...tempTenant])

      const tempOptionListJob = optionListJob
      tempOptionListJob.push([])
      setOptionListJob([...tempOptionListJob])

      const tempValidateTenant = validateTenant
      tempValidateTenant.push({ validateStatus: "success", help: '' })
      setValidateTenant([...tempValidateTenant])

      const tempValidateJob = validateJob
      tempValidateJob.push({ validateStatus: "success", help: '' })
      setValidateJob([...tempValidateJob])
   }

   const onClickRemoveTenant = (index) => {
      const tempTenant = tenant
      tempTenant.splice(index, 1)
      setTenant([...tempTenant])

      const tempOptionListJob = optionListJob
      tempOptionListJob.splice(index, 1)
      setOptionListJob([...tempOptionListJob])

      const tempValidateTenant = validateTenant
      tempValidateTenant.splice(index, 1)
      setValidateTenant([...tempValidateTenant])

      const tempValidateJob = validateJob
      tempValidateJob.splice(index, 1)
      setValidateJob([...tempValidateJob])
   }

   useEffect(() => {
      if (props.data) {
         const tempValidateTenant = []
         const tempValidateJob = []

         if (props.data[0].tenant.length) {
            props.data[0].tenant.forEach((e, i) => {
               tempValidateTenant.push({ validateStatus: "success", help: '' })
               tempValidateJob.push({ validateStatus: "success", help: '' })
               getJobTenant({ tenantId: e.tenantId, search: '' }, i)
            })
            setValidateTenant([...tempValidateTenant])
            setValidateJob([...tempValidateJob])
   
            setTenant(props.data[0].tenant)
         }
      }
   }, [props.data])

   return (
      <Form
         form={form}
         onFinish={onFinish}
         onFinishFailed={onFinishFailed}
         onValuesChange={onValuesChange}
         initialValues={
            props.data ?
               {
                  userIdentity: props.data[0].userIdentity,
                  nik: props.data[0].userIdentityNo,
                  name: props.data[0].userFullName,
                  email: props.data[0].userEmail,
                  primaryArea: props.data[0].primaryAreaId.cityId,
                  secondaryArea: props.data[0].secondaryAreaId.cityId,
                  workerUsername: props.data[0].userName,
                  workerPassword: props.data[0].userPassword,
                  workerGender: props.data[0].userGender,
                  phoneNumber: props.data[0].phone,
                  address: props.data[0].userAddress,
                  workerTitle: props.data[0].roleId.roleName,
                  // workerLatitude: props.data[0].userLatitude,
                  // workerLongatitude: props.data[0].userLongatitude,
                  jobList: props.jobList,
                  // tenantId: props.data[0].tenant.map(item => item.tenantId),
                  // jobId: props.data[0].jobId.map(data => data.jobId),
               } : {}
         }
      >
         <SetLocation
            visible={props.mapView}
            center={props.mapCenter}
            positionMarker={props.tempCurrentPos}
            onPlacesChanged={props.onPlacesChanged}
            handleClickOk={props.handleClickOk}
            onClickMap={props.onClickMap}
            onMarkerDragEnd={props.onMarkerDragEnd}
            onCancel={props.onCancelMaps}
         />
         <Row gutter={10}>
            <Col span={12}>
               <Text>User Identity</Text>
               <Form.Item
                  className="formItem-custom"
                  name="userIdentity"
                  rules={[{ required: true, message: 'Please select user identity!' }]}
               >
                  <Select
                     className="select"
                     placeholder="Select User Identity"
                     onChange={onChangeUserIdentity}
                     disabled={props.readOnly}
                  >
                     {
                        props.userIdentity ?
                           props.userIdentity.map(item => {
                              return (
                                 <Option key={item.codeId} value={item.codeId}>{item.codeName}</Option>
                              )
                           }) :
                           (
                              <React.Fragment></React.Fragment>
                           )
                     }
                  </Select>
               </Form.Item>
            </Col>
            <Col span={12}>
               <Text>No User Identity</Text>
               <Form.Item
                  className="formItem-custom"
                  name="nik"
                  rules={[
                     {
                        required: true,
                        message: 'Please input no user identity worker!'
                     },
                     {
                        min: 8,
                        message: 'Range no user identity 8 ~ 16 digits!'
                     },
                     {
                        pattern: regexUserIdentity,
                        message: 'Please input valid no user identitas'
                     }
                  ]}
               >
                  <Input
                     className="input-modal"
                     maxLength={16}
                     placeholder={"Input No User Identity"}
                     readOnly={props.readOnly}
                  />
               </Form.Item>
            </Col>
         </Row>

         <Row gutter={10}>
            <Col span={12}>
               <Text>Name</Text>
               <Form.Item
                  className="formItem-custom"
                  name="name"
                  rules={[{ required: true, message: 'Please input name worker!' }]}
               >
                  <Input
                     className="input-modal"
                     maxLength={50}
                     placeholder={"Input Worker Name"}
                     readOnly={props.readOnly}
                  />
               </Form.Item>
            </Col>
            <Col span={12}>
               <Text>Email</Text>
               <Form.Item
                  className="formItem-custom"
                  name="email"
                  rules={[
                     {
                        required: true,
                        message: 'Please input email worker!'
                     },
                     {
                        type: 'email',
                        message: 'Please input a valid email!'
                     }
                  ]}
               >
                  <Input
                     className="input-modal"
                     maxLength={75}
                     placeholder={"Input Email"}
                     readOnly={props.readOnly}
                  />
               </Form.Item>
            </Col>
         </Row>

         <Row gutter={10}>
            <Col span={12}>
               <Text>Primary Area</Text>
               <Form.Item
                  name="primaryArea"
                  rules={[{ required: true, message: 'Please select primary area!' }]}
               >
                  <Select
                     className="select"
                     showSearch
                     placeholder="Select Primary Area"
                     onSearch={props.searchCity}
                     onSelect={() => props.searchCity("")}
                     optionFilterProp="children"
                     filterOption={false}
                     disabled={props.readOnly}
                  >
                     {
                        props.city ?
                           props.city.map(item => {
                              return (
                                 <Option key={item.cityId} value={item.cityId}>{item.cityName}</Option>
                              )
                           }) :
                           (
                              <React.Fragment></React.Fragment>
                           )
                     }
                  </Select>
               </Form.Item>
            </Col>
            <Col span={12}>
               <Text>Secondary Area</Text>
               <Form.Item
                  name="secondaryArea"
                  rules={[{ required: true, message: 'Please select primary area!' }]}
               >
                  <Select
                     className="select"
                     showSearch
                     placeholder="Select Secondary Area"
                     onSearch={props.searchCity}
                     onSelect={() => props.searchCity("")}
                     optionFilterProp="children"
                     filterOption={false}
                     disabled={props.readOnly}
                  >
                     {
                        props.city ?
                           props.city.map(item => {
                              return (
                                 <Option key={item.cityId} value={item.cityId}>{item.cityName}</Option>
                              )
                           }) :
                           (
                              <React.Fragment></React.Fragment>
                           )
                     }
                  </Select>
               </Form.Item>
            </Col>
         </Row>

         <Row gutter={10}>
            <Col span={12}>
               <Text>Username</Text>
               <Form.Item
                  className="formItem-custom"
                  name="workerUsername"
                  rules={[
                     {
                        required: true,
                        message: 'Please input username!'
                     },
                     {
                        min: 3,
                        message: "Please input username min 3"
                     }
                  ]}
               >
                  <Input
                     className="input-modal"
                     maxLength={50}
                     placeholder={"Input Username"}
                     readOnly={props.readOnly}
                  />
               </Form.Item>
            </Col>
            <Col span={12}>
               <Text>Password</Text>
               <Form.Item
                  className="formItem-custom"
                  name="workerPassword"
                  disabled={props.isUpdate}
                  rules={[
                     {
                        required: true,
                        message: 'Please input password!'
                     }
                  ]}
               >
                  <Input.Password
                     className="input-modal"
                     placeholder={"Input Password"}
                     maxLength={50}
                     readOnly={props.readOnly}
                  />
               </Form.Item>
            </Col>
         </Row>
         <Row gutter={10}>
            <Col span={12}>
               <Text>Gender</Text>
               <Form.Item
                  className="formItem-custom"
                  name="workerGender"
                  rules={[{ required: true, message: 'Please select gender!' }]}
               >
                  <Select
                     className="select"
                     placeholder="Select Gender"
                     disabled={props.readOnly}
                  >
                     <Option key={1} value={1}>Male</Option>
                     <Option key={2} value={2}>Female</Option>
                  </Select>
               </Form.Item>
            </Col>
            <Col span={12}>
               <Text>Phone Number</Text>
               <Form.Item
                  className="formItem-custom"
                  name="phoneNumber"
                  rules={[
                     {
                        required: true,
                        message: 'Please input phone number!'
                     },
                     {
                        pattern: /^[+\d](?:.*\d)?$/g,
                        message: 'Please input a valid phone number!'
                     },
                     {
                        min: 10,
                        max: 15,
                        message: 'Range phone number 10 ~ 15 digits!'
                     }
                  ]}
               >
                  <Input
                     className="input-modal"
                     maxLength={15}
                     placeholder={"Input Phone Number"}
                     readOnly={props.readOnly}
                  />
               </Form.Item>
            </Col>
         </Row>
         <Text>Address</Text>
         <Form.Item
            className="formItem-custom"
            name="address"
            rules={[{ required: true, message: 'Please input address worker!' }]}
         >
            <Input.TextArea
               rows={3}
               placeholder="Input Address"
               className="input-modal"
               maxLength={225}
               readOnly={props.readOnly}
            />
         </Form.Item>
         {/* <Row gutter={10}> */}
         {/* <Col span={12}>
               <Text>Latitude</Text>
               <Form.Item
                  className="formItem-custom"
                  name="workerLatitude"
                  rules={[
                     {
                        required: true,
                        message: 'Please input latitude worker!'
                     },
                     {
                        pattern: /^([-+]?)([\d]{1,2})(((\.)(\d+)))(\s*)$/g,
                        message: 'Incorrect pattern latitude!'
                     }
                  ]}
               >
                  <Input
                     className="input-modal" style={{width: '100%'}}
                     maxLength={20}
                     placeholder={"Input Latitude"}
                  />
               </Form.Item>
            </Col>
            <Col span={12}>
               <Text>Longtitude</Text>
               <Form.Item
                  className="formItem-custom"
                  name="workerLongatitude"
                  rules={[
                     {
                        required: true,
                        message: 'Please input longtitude worker!'
                     },
                     {
                        pattern: /^(([-+]?)([\d]{1,3})((\.)(\d+))?)$/g,
                        message: 'Incorrect pattern longitude!'
                     }
                  ]}
               >
                  <Input
                     className="input-modal" style={{width: '100%'}}
                     maxLength={20}
                     placeholder={"Input Longtitude"}
                  />
               </Form.Item>
            </Col> */}
         {/* </Row> */}
         <Row>
            <Col span={24} style={{ marginBottom: 20 }}>
               <Text>Geo Location Worker</Text>
               <div>
                  {(!props.readOnly) ?
                     <span style={{ cursor: 'pointer', color: 'lightblue' }} onClick={props.mapsVisible}>Set Location</span>
                     : <></>
                  }
                  <Maps
                     center={props.currentPos}
                     positionMarker={props.currentPos}
                  />
               </div>
            </Col>
         </Row>
         <Row gutter={15}>
            {/* <Form.List name="tenant">
               {(fields, { add, remove }) => (
                  <>
                     {fields.map((field, index) => (
                        <>
                           <Col span={23} key={`colTenant${field.key}`}>
                              <Text key={`textTenant${field.key}`}>Tenant {index + 1}</Text>
                              <Form.Item
                                 {...field}
                                 name={[field.name, 'tenantId']}
                                 rules={[{ required: true, message: 'Please input Tenant!' }]}
                              >
                                 <Select
                                    key={`tenantId${field.key}`}
                                    className="select"
                                    tagRender={tagRender}
                                    placeholder="Input Tenant"
                                    onChange={onChangeTenant}
                                    // onSearch={props.searchTenant}
                                    // onSelect={() => props.searchTenant("")}
                                    style={{ width: '100%' }}
                                    disabled={props.readOnly}
                                 >
                                    {
                                       tenant && tenant.map(item => {
                                          return (
                                             <Option disabled={(index + 1) !== totalTenant} key={`${field.key}-${item.tenantId}`} value={item.tenantId}>{item.tenantCode} - {item.tenantName}</Option>
                                          )
                                       })
                                    }
                                 </Select>
                              </Form.Item>
                           </Col>
                           <Col span={1} key={`colRemove${field.key}`} style={{ top: 20 }}>
                              {(index + 1) === totalTenant &&
                                 <Form.Item key={`formRemove${field.key}`}>
                                    <MinusCircleOutlined key={`remove${field.key}`} style={{ color: 'red' }} onClick={() => { remove(field.name); setTotalTenant(totalTenant - 1); }} />
                                 </Form.Item>
                              }
                           </Col>
                           <Col span={23} key={`colSkills${field.key}`} style={{ marginBottom: '-15px' }}>
                              <Text key={`textSkills${field.key}`}>Skills of Tenant {index + 1}</Text>
                              <Form.Item
                                 {...field}
                                 name={[field.name, 'jobId']}
                                 fieldKey={[field.fieldKey, 'jobId']}
                                 rules={[{ required: true, message: 'Please input skill!' }]}
                              >
                                 <Select
                                    key={`skills${field.key}`}
                                    className="select"
                                    mode="multiple"
                                    tagRender={tagRender}
                                    placeholder="Input Skill"
                                    // onSearch={props.searchSkill}
                                    // onSelect={() => props.searchSkill("")}
                                    // onDeselect={() => props.searchSkill("")}
                                    // onBlur={() => props.searchSkill("")}
                                    style={{ width: '100%' }}
                                    optionFilterProp="children"
                                    disabled={props.readOnly}
                                    loading={loadingJob}
                                 >
                                    {
                                       optionListJob.map(item => {
                                          return (
                                             <Option disabled={(index + 1) !== totalTenant} key={`${field.key}-${item.value}`} value={item.value}>{item.label}</Option>
                                          )
                                       })
                                    }
                                 </Select>
                              </Form.Item>
                           </Col>
                           <Divider />
                        </>
                     ))}
                     <Col span={24}>
                        <Form.Item>
                           <Button type="primary" style={{ borderRadius: 5 }} onClick={() => { add(); setTotalTenant(totalTenant + 1); }} block icon={<PlusOutlined />}>
                              Add Tenant
                              </Button>
                        </Form.Item>
                     </Col>
                  </>
               )}
            </Form.List> */}
         </Row>
         { tenant.map((e, index) => (
            <Row key={index} gutter={[15]} align="middle">
               <Col span={18}>
                  <Text>Tenant</Text>
                  <Form.Item 
                     style={{marginBottom: 0}}
                     validateStatus={validateTenant[index].validateStatus}
                     help={validateTenant[index].help}
                  >
                     <Select 
                        className="select" 
                        onChange={(val) => onChangeTenant(val, index)}
                        value={tenant[index].tenantId}
                        disabled={props.readOnly}
                     >
                        {
                           tenantList && tenantList.map(item => {
                              return (
                                 <Option key={item.tenantId} value={item.tenantId}>{item.tenantCode} - {item.tenantName}</Option>
                              )
                           })
                        }
                     </Select>
                  </Form.Item>
               </Col>
               { !props.readOnly &&
                  <Col span={6}>
                     { tenant.length - 1 === index ? 
                        <Button type="primary" style={{ borderRadius: 5 }} onClick={onClickAddTenant}>Add Tenant</Button> :
                        <Button type="danger" style={{ borderRadius: 5 }} onClick={() => onClickRemoveTenant(index)}>Remove Tenant</Button>
                     }
                  </Col>
               }

               <Col span={24}>
                  <Form.Item 
                     style={{ marginBottom: 0 }}
                     validateStatus={validateJob[index].validateStatus}
                     help={validateJob[index].help}
                  >
                     <Select
                        className="select"
                        mode="multiple"
                        tagRender={tagRender}
                        loading={loadingJob}
                        onChange={(value) => onChangeJob(value, index)}
                        value={tenant[index].jobId}
                        disabled={props.readOnly}
                     >
                        {
                           optionListJob[index] && optionListJob[index].map(item => {
                              return (
                                 <Option key={item.value} value={item.value}>{item.label}</Option>
                              )
                           })
                        }
                     </Select>
                  </Form.Item>
               </Col>
            </Row>
         )) }

         { (!props.readOnly) ?
            <Form.Item
               style={{
                  textAlign: 'right',
                  marginTop: '50px'
               }}
            >
               <Space size={'small'}>
                  <Button
                     type="danger"
                     size={'small'}
                     style={{
                        paddingLeft: '20px',
                        paddingRight: '20px',
                        borderRadius: '5px'
                     }}
                     onClick={props.buttonCancel}
                  >
                     Cancel
                              </Button>
                  <Button
                     type="primary"
                     htmlType="submit"
                     size={'small'}
                     style={{
                        paddingLeft: '25px',
                        paddingRight: '25px',
                        borderRadius: '5px'
                     }}
                     loading={props.loading}
                  >
                     Save
                      </Button>
               </Space>
            </Form.Item>
            :
            <Form.Item />
         }
      </Form>
   );
}

export default FormWorker;
