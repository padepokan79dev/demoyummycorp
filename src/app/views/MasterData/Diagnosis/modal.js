import React from "react";
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
                    diagnosisId: props.datarow.diagnosisId,
                    diagnosisDesc: props.datarow.diagnosisDesc,
                    jobCategoryId: props.datarow.jobCategoryId.jobCategoryId
                } : {}
            }
        >
        <Row gutter={20}>
                <Col span={24} className="input-hidden">
                    <Form.Item name="diagnosisId">
                        <Input type="hidden" />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Text>Diagnosis</Text>
                    <Form.Item
                        name="diagnosisDesc"
                        rules={[{
                            required: true,
                            message: 'Please input diagnosis!'
                        }]}
                    >
                        <Input className="input-modal" placeholder={"Input Diagnosis Name"}/>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={20}>
                <Col span={24}>
                    <Text>Job Category</Text>
                    <Form.Item
                        name="jobCategoryId"
                        rules={[{
                            required: true,
                            message: 'Please select job category!'
                        }]}
                    >
                        <Select
                            className="select"
                            placeholder="Select Job Category"
                        >
                        {
                            props.optionCategory.map(data => {
                                return (
                                    <Option key={data.jobCategoryId} value={data.jobCategoryId}>{data.jobCategoryName}</Option>
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
            this.props.title === "New Diagnosis" || this.props.title === "Update Diagnosis" ?
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
                            optionCategory={this.props.optionCategory}
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