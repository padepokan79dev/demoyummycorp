import React from "react";
import { Modal, Typography, Form, Button, Input, Space, Row, Col } from "antd";
import { GlobalFunction } from '../../../global/function'

const { Title, Text } = Typography;

const FormCreateEdit = (props) => {
    const [form] = Form.useForm()

    const onFinishFailed = errorInfo => {}

    const onValuesChange = (changedValues, allValues) => {
        const jobClassName = changedValues.jobClassName;
        if (jobClassName) {
            form.setFieldsValue({
                jobClassName: GlobalFunction.replaceSymbol(changedValues.jobClassName)
            });
        }
    }

    return (
        <Form
            form={form}
            onFinish={values => props.onFinish(values)}
            onFinishFailed={onFinishFailed}
            onValuesChange={onValuesChange}
            initialValues={
                props.dataEdit ?
                {
                    jobClassId:  props.dataEdit.jobClassId,
                    jobClassName:  props.dataEdit.jobClassName,
                } : {}
            }
        >
            <Row>
                <Col span={24} className="input-hidden">
                    <Form.Item
                        name="jobClassId"
                    >
                        <Input type="hidden" />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Text>Name</Text>
                    <Form.Item
                        name="jobClassName"
                        rules={[{ required: true, message: 'Please input name!' }]}
                    >
                        <Input className="input-modal" maxLength="25" placeholder={"Input Job Class Name"}/>
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
        this.state = {
        }
    }

    render() {
        return (
            this.props.title === "Update Job Class" || this.props.title === "New Job Class" ?
            <Modal
                visible={this.props.visible}
                className="form-modal"
                footer={null}
                closable={false}
                centered
                width={650}
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
                            dataEdit={this.props.dataEdit}
                            loading={this.props.loading}
                        />
                    ) : 
                    (
                        <></>
                    )
                }
            </Modal>
            :{}
        )
    }
}

export default ModalCreateEdit;