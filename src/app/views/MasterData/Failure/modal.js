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
                    failureId: props.datarow.failureId,
                    failureDesc: props.datarow.failureDesc,
                    diagnosisId: props.datarow.diagnosisId.diagnosisId
                } : {}
            }
        >
            <Row gutter={20}>
                    <Col span={24} className="input-hidden">
                        <Form.Item name="failureId">
                            <Input type="hidden" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Text>Failure</Text>
                        <Form.Item
                            name="failureDesc"
                            rules={[{
                                required: true,
                                message: 'Please input failure!'
                            }]}
                        >
                            <Input className="input-modal" placeholder={"Input Failure Name"}/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={20}>
                    <Col span={24}>
                        <Text>Diagnosis</Text>
                        <Form.Item
                            name="diagnosisId"
                            rules={[{
                                required: true,
                                message: 'Please select diagnosis!'
                            }]}
                        >
                            <Select
                                className="select"
                                placeholder="Select Diagnosis"
                            >
                            {
                                props.optionDiagnosis.map(data => {
                                    return (
                                        <Option key={data.diagnosisId} value={data.diagnosisId}>{data.diagnosisDesc}</Option>
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
            this.props.title === "New Failure" || this.props.title === "Update Failure" ?
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
                            optionDiagnosis={this.props.optionDiagnosis}
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