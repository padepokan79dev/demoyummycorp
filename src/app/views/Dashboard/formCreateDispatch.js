import React from "react";
import moment from 'moment'
import { Form, DatePicker, TimePicker, Col, Space, Button, Row } from "antd";

const FormCreateDispatch = props => {
   const [form] = Form.useForm();
   const onFinishFailed = errorInfo => {
   };


   if (props.visible === false) {
      form.resetFields();
   }

   const format = 'HH:mm';
   const disabledDate = (current) =>{
      return current < moment().startOf('day');
   }

   const range = (start, end) => {
      const result = [];
      for (let i = start; i < end; i++) {
         result.push(i);
      }
      return result;
   }

   const time = {
      Date: new Date(),
      Hours: new Date().getHours(),
      Minute: new Date().getMinutes()
   }

   const handleDateChange = (date, dateString) => {
      props.onChangeDate(date, dateString)
      if (moment(time.Date).format('YYYY-MM-DD') === dateString) {
         const timeSelected = `${time.Hours}:${time.Minute}:00`
         form.setFieldsValue({
            dispatchTime: timeSelected !== "NaN:NaN" ? moment(timeSelected, 'hh:mm:ss') : null
         })
      }
   }

   const valueDatePick = document.getElementById('form_dispatchDate')

   const disabledHours = () => {
      if (valueDatePick) {
         if (moment(time.Date).format('YYYY-MM-DD') === valueDatePick.value) {
            return range(0, time.Hours)
         }
      }
   }

   const disabledTime = () => {
      if (valueDatePick) {
         if (moment(time.Date).format('YYYY-MM-DD') === valueDatePick.value) {
            return range(0, time.Minute)
         }
      }
   }

   return (
      <Form
         form={form}
         name="form"
         initialValues={{
            // remember: true,
         }}
         onFinish={values => props.onFinish(values)}
         onFinishFailed={onFinishFailed}
      >
         <Row gutter={15}>
            <Col span={13}>
               <Form.Item
                  name="dispatchDate"
                  rules={[
                     {
                        required: true,
                        message: 'Please input date!',
                     },
                  ]}
               >
                     <DatePicker className="pickerDate"
                     disabledDate={disabledDate}
                     onChange={handleDateChange}
                     />
               </Form.Item>
            </Col>
            <Col span={11}>
               <Form.Item
                  name="dispatchTime"
                  rules={[
                     {
                        required: true,
                        message: 'Please input date!',
                     },
                  ]}
               >
                  <TimePicker className="pickerTime" format={format}
                  disabledHours={disabledHours}
                  disabledMinutes={disabledTime}
                  onChange={props.onChangeTime}/>
               </Form.Item>
            </Col>
            <Col span={24} style={{ textAlign: 'right', marginTop: 30, marginBottom: 34 }}>
               <Form.Item>
                  <Space size={'small'}>
                     <Button
                        style={{
                           paddingLeft: '20px',
                           paddingRight: '20px',
                           background: '#27AE60',
                           color: 'white',
                           border: 'none',
                           borderRadius: 15
                        }}
                        htmlType="submit"
                     >
                        Set
                     </Button>
                     <Button
                        type="danger"
                        style={{
                           paddingLeft: '20px',
                           paddingRight: '20px',
                           borderRadius: 15
                        }}
                        onClick={props.buttonCancel}
                        >
                        Cancel
                     </Button>
                  </Space>
               </Form.Item>
            </Col>
         </Row>
      </Form>
   );
};

export default FormCreateDispatch;