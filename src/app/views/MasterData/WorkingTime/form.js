import React from "react";
import { 
   Typography, 
   Form, 
   Button, 
   Input, 
   Space, 
   Row, 
   Col, 
   TimePicker 
} from "antd";
import '../../../css/global.css';
import TextArea from "antd/lib/input/TextArea";
import moment from 'moment';

const format = 'HH:mm';
const { Text } = Typography;

const FormCreateEdit = props => {
   const [form] = Form.useForm();

   const onFinishFailed = errorInfo => {
      console.log('Failed:', errorInfo);
   }

   if (props.visible === false) {
      form.resetFields();
   }

   const range = (start, end) => {
      const result = [];
      for (let i = start; i < end; i++) {
         result.push(i);
      }
      return result;
   }

   const disabledHours = () => {
      const hours = moment(form.getFieldValue('startTime'), "hh:mm:ss").hours();
      return range(0, hours + 1)
   }

   const onChangeStartTime = (time, timeString) => {
      props.startTime(timeString);
      const defaultEndTime = `${moment(form.getFieldValue('startTime'), "hh:mm:ss").hours() + 1}:${moment(form.getFieldValue('startTime'), "hh:mm:ss").minutes()}`
      form.setFieldsValue({
         endTime: defaultEndTime !== "NaN:NaN" ? moment(defaultEndTime, "hh:mm:ss") : null
      });
   }

   return (
      <Form
         form={form}
         onFinish={values => props.onFinish(values)}
         onFinishFailed={onFinishFailed}
         initialValues={
            props.data ?
               {
                  name: props.data.wtimeName,
                  description: props.data.wtimeDesc,
                  startTime: moment(props.data.wtimeStart, 'HH:mm:ss'),
                  endTime: moment(props.data.wtimeEnd, 'HH:mm:ss')
               } : {}
         }
      >
         <Row gutter={16}>
            <Col span={14}>
               <Text>Name</Text>
               <Form.Item
                  name="name"
                  rules={[
                     { required: true, message: 'Please input name!' },
                     { pattern: /^[A-Za-z]+$/, message: 'Please input a valid name!' },
                  ]}
               >
                  <Input
                     className="input-modal"
                     maxLength={50}
                     placeholder={"Input Working Time Name"}
                  />
               </Form.Item>
            </Col>
            <Col span={5}>
               <Text>Start Time</Text>
               <Form.Item
                  name="startTime"
                  rules={[{ required: true, message: 'Please input start time!' }]}
               >
                  <TimePicker
                     format={format}
                     className="input-modal"
                     onChange={onChangeStartTime}
                  />
               </Form.Item>
            </Col>
            <Col span={5}>
               <Text>End Time</Text>
               <Form.Item
                  name="endTime"
                  rules={[{ required: true, message: 'Please input end time!' }]}
               >
                  <TimePicker
                     format={format}
                     className="input-modal"
                     disabledHours={disabledHours}
                     onChange={(time, timeString) => props.endTime(timeString)}
                  />
               </Form.Item>
            </Col>
         </Row>

         <Text>Description</Text>
         <Form.Item
            name="description"
            rules={[{ required: true, message: 'Please input description!' }]}
         >
            <TextArea
               row={3}
               className="input-modal"
               style={{
                  resize: 'none'
               }}
               maxLength={255}
               placeholder={"Input Description"}
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