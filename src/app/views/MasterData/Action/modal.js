import React from 'react'
import { Modal, Typography, Form, Button, Input, Space, Row, Col, Select } from 'antd'

const { Title, Text } = Typography
const { Option } = Select

const FormCreateEdit = (props) => {

    const onFinishFailed = errorInfo => {
    }
    return (
        <Form
            onFinish={values => props.onFinish(values)}
            onFinishFailed={onFinishFailed}
            initialValues={props.datarow ?
                {
                    actionId: props.datarow.actionId,
                    actionDesc: props.datarow.actionDesc,
                    failureId: props.datarow.failureId.failureId
                } : {}
            }
        >
        <Row gutter={20}>
            <Col span={24} className="input-hidden">
                <Form.Item name="actionId">
                    <Input type="hidden" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Text>Action</Text>
                <Form.Item
                    name="actionDesc"
                    rules={[{
                        required: true,
                        message: 'Please input action!'
                    }]}
                >
                    <Input className="input-modal" placeholder={"Input Action Name"}/>
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={20}>
            <Col span={24}>
                <Text>Failure</Text>
                <Form.Item
                    name="failureId"
                    rules={[{
                        required: true,
                        message: 'Please select failure!'
                    }]}
                >
                    <Select
                        className="select"
                        placeholder="Select Failure"
                    >
                    {
                        props.optionFailure.map(data => {
                            return (
                                <Option key={data.failureId} value={data.failureId}>{data.failureDesc}</Option>
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
        this.state = {
        }
    }

    render() {
        return (
            this.props.title === "New Action" || this.props.title === "Update Action" ?
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
                            optionFailure={this.props.optionFailure}
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
            : {}
        )
    }

}

export default ModalCreateEdit;