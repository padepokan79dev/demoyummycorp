import React from 'react'
import { Modal, Typography, Form, Button, Input, Space, Row, Col, Select } from 'antd'
import { GlobalFunction } from '../../../global/function'

const { Title, Text } = Typography
const { Option } = Select

const FormCreateEdit = (props) => {
  const [form] = Form.useForm()

  const onFinishFailed = errorInfo => {}

  const onValuesChange = (changedValues, allValues) => {
    const cityName = changedValues.cityName;
    if (cityName) {
      form.setFieldsValue({
        cityName: GlobalFunction.replaceSymbol(changedValues.cityName)
      });
    }
  }
  
  return (
    <Form
      form={form}
      onFinish={values => props.onFinish(values)}
      onFinishFailed={onFinishFailed}
      onValuesChange={onValuesChange}
      initialValues={props.datarow ?
        {
          cityId: props.datarow.cityId,
          cityName: props.datarow.cityName,
          provinceId: props.datarow.provinceId.provinceId,
          region: props.datarow.region
        } : {}
      }
    >
      <Row gutter={20}>
        <Col span={24} className="input-hidden">
          <Form.Item name="cityId">
            <Input type="hidden" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Text>City Name</Text>
          <Form.Item
            name="cityName"
            rules={[{
              required: true,
              message: 'Please input city name!'
            }]}
          >
            <Input className="input-modal" placeholder={"Input City Name"}/>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={12}>
          <Text>Province</Text>
          <Form.Item
            name="provinceId"
            rules={[{
                required: true,
                message: 'Please select province!'
            }]}
          >
            <Select
                className="select"
                placeholder="Select Province"
                showSearch
                onSearch={props.searchProvince}
                onSelect={()=>props.searchProvince("")}
                optionFilterProp="children"
                filterOption={false}
            >
              {
                props.optionProvince.map(data => {
                  return (
                    <Option key={data.provinceId} value={data.provinceId}>{data.provinceName}</Option>
                  )
                })
              }
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Text>Region</Text>
          <Form.Item
            name="region"
            rules={[{
              required: true,
              message: 'Please select region!'
            }]}
          >
            <Select
              className="select"
              placeholder="Select Region"
            >
              {
                props.optionRegion.map(dataRegion => {
                  return (
                    <Option key={dataRegion.region} value={dataRegion.region}>{dataRegion.region}</Option>
                  )
                })
              }
            </Select>
          </Form.Item>
        </Col>
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
      this.props.title === "New City" || this.props.title === "Update City" ?
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
                optionProvince={this.props.optionProvince}
                optionRegion={this.props.optionRegion}
                datarow={this.props.datarow}
                title={this.props.title}
                loading={this.props.loading}
                searchProvince={this.props.searchProvince}
              />
            ) :
            (
              <></>
            )
          }
        </Modal>
      : {}
    )
  }
}

export default ModalCreateEdit;
