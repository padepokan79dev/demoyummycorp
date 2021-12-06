import React from "react";
import {
   Typography,
   Form,
   Button,
   Input,
   Space,
   Row,
   Col ,
   Select,
   Checkbox
} from "antd";
import '../../../css/global.css';
import { GlobalFunction } from '../../../global/function'

const { Text } = Typography;
const { Option } = Select

const FormCreateEdit = props => {
   const [form] = Form.useForm();

   if (props.visible === false) {
      form.resetFields();
   }

   const onValuesChange = (changedValues, allValues) => {
      const roleName = changedValues.roleName;
      if (roleName) {
         form.setFieldsValue({
            roleName: GlobalFunction.replaceSymbol(changedValues.roleName)
         });
      }
   }

   return (
      <Form
         form={form}
         onValuesChange={onValuesChange}
         initialValues={
            props.roleDetail ?
               {
                  roleName:
                     props.roleDetail &&
                     props.roleDetail.roleName ?
                        props.roleDetail.roleName : "",
                  // userGroup:
                  //    props.roleDetail &&
                  //    props.roleDetail.userGroupId ?
                  //       props.roleDetail.userGroupId : ""
               } : {}
         }
         onFinish={props.onFinish}
      >
         <Row gutter={20}>
            <Col span={8}>
               <Text>Role Name</Text>
               <Form.Item
                  name="roleName"
                  rules={[{ required: true, message: 'Please input name!' }]}
               >
                  <Input
                     className="input-modal"
                     maxLength={25}
                     placeholder={"Input Role Name"}
                  />
               </Form.Item>
            </Col>
            {/*<Col span={12}>
               <Text>User Group</Text>
               <Form.Item
                  name="userGroup"
                  rules={[{ required: true, message: 'Please select user group!' }]}
               >
                  <Select
                     className="select"
                     placeholder={"Select User Group"}
                  >
                     {
                        props.userGroup ?
                           props.userGroup.map( item => (
                              <Option key={item.groupUserId} value={item.groupUserId}>
                                 {item.groupUserName}
                              </Option>
                           )) :
                           ( <></> )
                     }
                  </Select>
               </Form.Item>
            </Col>*/}
            <Col span={12}></Col>
         </Row>
         <Row gutter={20} style={{ alignItems:'center' }}>
            <Col span={8}>
                <Text>Menu / Sub-Menu</Text>
            </Col>
            <Col span={12}>
                <Text>Privilege Access <i>(<b>Read</b> for activated menu)</i></Text>
            </Col>
            <Col span={4} style={{ textAlign:'right' }}>
                <Checkbox className="checkbox-modal" checked={props.checkedAllPrivilege} onChange={(val) => props.handlerChangePrivilegeAll(val)}>All</Checkbox>
            </Col>
         </Row>
         { props.privilege.map( (item, indexMenu) => {
             return (
               <Row gutter={20} style={{ alignItems:'center', marginTop:5 }}>
                  <Col span={8} style={{ backgroundColor:'rgba(0,0,0,0.1)', borderRadius:15, height:30 }}>
                      <Text style={{ marginLeft: (item.type == "Menu") ? 10 : 30, verticalAlign: 'sub' }}>{item.name}</Text>
                  </Col>
                  <Col span={16} style={{ textAlign:'right', backgroundColor: (item.action.length == 0) ? '#00AA13' : 'rgba(0,0,0,0.1)', borderRadius:15, height:30 }}>
                    { item.action.map( (action, indexAction) => {
                        return (
                          <Checkbox className="checkbox-modal" checked={action.checked} onChange={(val) => props.handleChangePrivilege(val, indexMenu, indexAction)}>{action.name}</Checkbox>
                        )
                      })
                    }
                  </Col>
               </Row>
             )
         })}
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
      </Form>
   )
}

export default FormCreateEdit;
