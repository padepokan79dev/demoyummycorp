import React from 'react'
import { Modal, Typography, Form, Button, Input, Space, Row, Col } from 'antd'

const { Title, Text } = Typography

const FormCreateEdit = (props) => {
  const onFinishFailed = errorInfo => { }
  return (
    <Form
      onFinish={values => props.onFinish(values)}
      onFinishFailed={onFinishFailed}
      initialValues={props.datarow ?
        {
          tenantId: props.datarow.tenantId,
          tenantCode: props.datarow.tenantCode,
          tenantName: props.datarow.tenantName
        } : {}
      }
    >
      <Row gutter={20}>
        <Col span={24} className="input-hidden">
          <Form.Item name="tenantId">
            <Input type="hidden" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Text>Tenant Code</Text>
          <Form.Item
            name="tenantCode"
            rules={[{
              required: true,
              message: 'Please Input Tenant Code!'
            }]}
          >
            <Input autoFocus className="input-modal" placeholder={"Input Tenant Code"} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Text>Tenant Name</Text>
          <Form.Item
            name="tenantName"
            rules={[{
              required: true,
              message: 'Please Input Tenant Name!'
            }]}
          >
            <Input className="input-modal" placeholder={"Input Tenant Name"} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={24}>
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
        </Col>
      </Row>
    </Form>
  )
}

class ModalCreateEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        className="form-modal"
        footer={null}
        closable={false}
        centered
      >
        <Title level={3}>
          {this.props.title}
        </Title>
        {
          this.props.visible ?
            (
              <FormCreateEdit
                buttonCancel={this.props.buttonCancel}
                onFinish={values => this.props.onFinish(values)}
                datarow={this.props.datarow}
                title={this.props.title}
                loading={this.props.loading}
              />
            ) :
            (
              <></>
            )
        }
      </Modal>
    )
  }
}

export default ModalCreateEdit;
