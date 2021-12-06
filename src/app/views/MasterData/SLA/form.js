import React from "react";
import { Typography, Form, Button, Select, Space, Row, Col, Input, Checkbox } from "antd";

const { Text } = Typography;
const { Option } = Select;

const FormCreateEdit = props => {
   const [form] = Form.useForm();

   const onFinishFailed = errorInfo => {
   }

   const onChangeCustomer = (value) => {
      props.onChangeCompany(value);
      form.setFieldsValue({
         branch: null
      });
   }

   if (props.visible === false) {
      form.resetFields();
   }

   const onValuesChange = (changedValues, allValues) => {
      const valueResponseTime = changedValues.responseTime;
      const valueResolutionTime = changedValues.resolutionTime;
      const reg = /\D/g;
      if (valueResponseTime) {
         form.setFieldsValue({
            responseTime: valueResponseTime.replace(reg, '')
         });
      }
      else if (valueResolutionTime) {
         form.setFieldsValue({
            resolutionTime: valueResolutionTime.replace(reg, '')
         })
      }
   }

   return (
      <Form
         form={form}
         onFinish={props.onFinish}
         onFinishFailed={onFinishFailed}
         onValuesChange={onValuesChange}
         initialValues={
            props.data ?
               {
                  company: props.data.companyId ? props.data.companyId: "",
                  branch: props.data.branchName ? props.data.branchName : "" ,
                  type: props.data.slaTypeId ? props.data.slaTypeId : "",
                  workingTime: props.data.wTimeId ? props.data.wTimeId : "",
                  responseTime: props.data.slaResponseTime ? props.data.slaResponseTime : "",
                  resolutionTime: props.data.slaResolutionTime ? props.data.slaResolutionTime : ""
               } :
               {}
         }
      >
         <Row gutter={16}>
            <Col className="gutter-row" span={12}>
               <Text>Customer</Text>
               <Form.Item
                  className="formItem-custom"
                  name="company"
                  rules={[{ required: true, message: 'Please select customer!' }]}
               >
                  <Select
                     className="select"
                     placeholder="Select Customer"
                     onChange={onChangeCustomer}
                     disabled={props.data ? true : false }
                  >
                     {
                        props.optionListCompany ?
                        props.optionListCompany.map(item => {
                           return (
                              <Option key={item.companyId} value={item.companyId}>{item.companyName}</Option>
                           )
                        }) :
                        (
                           <></>
                        )
                     }
                  </Select>
               </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
               <Text>Branch</Text>
               <Form.Item
                  className="formItem-custom"
                  name="branch"
                  rules={[{ required: true, message: 'Please select branch!' }]}
               >
                  <Select
                     className="select"
                     placeholder="Select Branch"
                     disabled={props.isDisabledBranch || props.data ? true : false}
                     loading={props.loadingBranch}
                  >
                     {
                        props.optionListBranch ?
                        props.optionListBranch.map(item => {
                           return (
                              <Option key={item.branchId} value={item.branchId}>{item.branchName}</Option>
                           )
                        }) :
                        (
                           <></>
                        )
                     }
                  </Select>
               </Form.Item>
            </Col>
         </Row>

         <Row gutter={16}>
            <Col className="gutter-row" span={12}>
               <Text>Type</Text>
               <Form.Item
                  className="formItem-custom"
                  name="type"
                  rules={[{ required: true, message: 'Please select type!' }]}
               >
                  <Select
                     className="select"
                     placeholder="Select Type"
                  >
                     {
                        props.optionListType ?
                        props.optionListType.map(item => {
                           return (
                              <Option key={item.slaTypeId} value={item.slaTypeId}>{item.slaTypeName}</Option>
                           )
                        }) :
                        (
                           <></>
                        )
                     }
                  </Select>
               </Form.Item>
            </Col>
            <Col span={12} className="gutter-row">
               <Text>Working Time</Text>
               <Form.Item
                  className="formItem-custom"
                  name="workingTime"
                  rules={[{ required: true, message: 'Please select working time!' }]}
               >
                  <Select
                     className="select"
                     placeholder="Select Working Time"
                  >
                     {
                        props.optionListWorkingTime ?
                        props.optionListWorkingTime.map(item => {
                           return (
                              <Option key={item.wTimeId} value={item.wTimeId}>{item.wTimeName}</Option>
                           )
                        }) :
                        (
                           <></>
                        )
                     }
                  </Select>
               </Form.Item>
            </Col>
         </Row>

         <Row gutter={16} align="bottom">
            <Col span={12}>
               <Text>Response Time</Text>
               <Form.Item
                  className="formItem-custom"
                  name="responseTime"
                  rules={[{ required: true, message: 'Please input response time' }]}
               >
                  <Input
                     className="input-modal"
                     placeholder="Response Time (Minutes)"
                     maxLength={5}
                  />
               </Form.Item>
            </Col>
            <Col span={12}>
               <Text>Resolution Time</Text>
               <Form.Item
                  className="formItem-custom"
                  name="resolutionTime"
                  rules={[{ required: true, message: 'Please input resolution time' }]}
               >
                  <Input
                     className="input-modal"
                     placeholder="Resolution Time (Hours)"
                     maxLength={5}
                  />
               </Form.Item>
            </Col>
         </Row>

         <Row>
            <Col span={24}>
               <Checkbox
                  defaultChecked={props.data ? props.data.includeWeekend : false}
                  onChange={e => {
                        props.includeWeekend(e)
                     }
                  }>
                  Include weekend
               </Checkbox>
            </Col>
         </Row>

         <Form.Item
            style={{
               textAlign: 'right',
               marginTop: '30px'
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
      </Form>
   )
}

export default FormCreateEdit;
