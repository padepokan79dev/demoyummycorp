import React from "react";
import {
   Typography,
   Form,
   Button,
   Input,
   Space
} from "antd";
import '../../../css/global.css';

const { Text } = Typography;

const FormCreateEdit = props => {
   const [form] = Form.useForm();

   const onFinishFailed = errorInfo => {
      console.log('Failed:', errorInfo);
   }

   if (props.visible === false) {
      form.resetFields();
   }

   return (
      <Form
         onFinish={values => props.onFinish(values)}
         onFinishFailed={onFinishFailed}
         initialValues={
            props.data ?
               {
                  name: props.data.uomName
               } :
               {}
         }
      >
         <Text>Name</Text>
         <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input name!' }]}
         >
            <Input
               className="input-modal"
               maxLength={25}
               placeholder={"Input UOM Name"}
            />
         </Form.Item>

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