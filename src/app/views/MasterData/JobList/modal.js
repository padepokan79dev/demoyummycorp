import React from "react";
import { Modal, Typography, Form, Button, Input, Space, Row, Col, Spin, Select } from "antd";
import { GlobalFunction } from '../../../global/function'

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const FormCreateEdit = (props) => {
    const [form] = Form.useForm()

    const onFinishFailed = errorInfo => {
    }

    const onValuesChange = (changedValues, allValues) => {
        const jobName = changedValues.jobName;
        if (jobName) {
            form.setFieldsValue({
                jobName: GlobalFunction.replaceSymbol(changedValues.jobName)
            });
        }
    }
    
    return (
        <Form
            form={form}
            onFinish={values => props.onFinish(values)}
            onFinishFailed={onFinishFailed}
            onValuesChange={onValuesChange}
            initialValues={props.dataRow ?
                {
                    title: props.title,
                    jobId:  props.dataRow.jobId,
                    jobName:  props.dataRow.jobName,
                    jobTag: props.dataRow.jobTag,
                    jobDesc: props.dataRow.jobDesc,
                    jobCategoryId: props.dataRow.jobCategoryId.jobCategoryId,
                    uomId: props.dataRow.uomId.uomId,
                } : {}
            }
        >
        <Row gutter={20}>
            <Col span={24} className="input-hidden">
                <Form.Item
                    name="jobId"
                >
                    <Input type="hidden" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Text>Name</Text>
                <Form.Item
                    name="jobName"
                    rules={[{ required: true, message: 'Please input name!' }]}
                >
                    <Input className="input-modal" maxLength="75" placeholder={"Input Job Name"}/>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Text>Tag</Text>
                <Form.Item
                    name="jobTag"
                    rules={[{ required: true, message: 'Please input tag!' }]}
                >
                    <Input className="input-modal" maxLength="125" placeholder={"Input Tag"}/>
                </Form.Item>
            </Col>
            <Col span={24}>
            <Text>Description</Text>
                <Form.Item
                    name="jobDesc"
                    rules={[{ required: true, message: 'Please input description!' }]}
                >
                    <TextArea rows={4} className="input-modal" maxLength="225" placeholder={"Input Description"}/>
                </Form.Item>
            </Col>
            <Col span={24}>
                <Text>Category</Text>
                <Form.Item
                    name="jobCategoryId"
                    rules={[{ required: true, message: 'Please input category!' }]}
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
            <Col span={12}>
                <Text>Uom</Text>
                <Form.Item
                    name="uomId"
                    rules={[{ required: true, message: 'Please input uom!' }]}
                >
                    <Select
                        className="select"
                        placeholder="Select UOM"
                    >
                    {
                        props.optionUom.map(data => {
                            return (
                                <Option key={data.uomId} value={data.uomId}>{data.uomName}</Option>
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
        this.state = {
        }
    }

    render() {
        return (
            this.props.title === "New Job" || this.props.title === "Update Job" ?
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
                            optionUom={this.props.optionUom}
                            dataRow={this.props.dataRow}
                            title={this.props.title}
                            loading={this.props.loading}
                        />
                    ) :
                    (
                        <></>
                    )
                }
            </Modal>
            :
            <Modal
                visible={this.props.visible}
                className="form-modal"
                footer={null}
                closable={false}
                centered
                width={650}
            >
                <Spin spinning={this.props.loading} tip={'Loading'}>
                    <Row gutter={15}>
                    <Col span={24}>
                            <Title level={3}>{this.props.title}</Title>
                        </Col>
                        <Col span={12}>
                            <Text><b>Job</b></Text>
                        </Col>
                        <Col span={12}>
                            <Text><b>UOM</b></Text>
                        </Col>
                        <Col span={12}>
                            <Title className="body-detail" level={4}>{this.props.dataRow.jobName}</Title>
                        </Col>
                        <Col span={12}>
                            <Title className="body-detail" level={4}>{this.props.dataRow.uomName}</Title>
                        </Col>
                        <Col span={12}>
                            <Text><b>Job Class</b></Text>
                        </Col>
                        <Col span={12}>
                            <Text><b>Job Category</b></Text>
                        </Col>
                        <Col span={12}>
                            <Title className="body-detail" level={4}>
                                {
                                    this.props.dataRow.jobCategoryId ?
                                    this.props.dataRow.jobCategoryId.jobClassId.jobClassName : ""
                                }
                            </Title>
                        </Col>
                        <Col span={12}>
                            <Title className="body-detail" level={4}>{this.props.dataRow.jobCategoryName}</Title>
                        </Col>
                        <Col span={24}>
                            <Text><b>Tag</b></Text>
                        </Col>
                        <Col span={24}>
                            <Title className="body-detail" level={4}>{this.props.dataRow.jobTag}</Title>
                        </Col>
                        <Col span={24}>
                            <Text><b>Description</b></Text>
                        </Col>
                        <Col span={24}>
                            <TextArea rows={4} readOnly={true} className="input-modal" value={this.props.dataRow.jobDesc}></TextArea>
                        </Col>
                        <Col span={24} style={{textAlign: 'right', marginTop: 40, marginBottom: 15}}>
                            <Space size={'small'}>
                                <Button
                                    type="danger"
                                    style={{
                                        paddingLeft: '20px',
                                        paddingRight: '20px',
                                        borderRadius: '5px'
                                    }}
                                    onClick={this.props.buttonCancel}
                                >
                                    Close
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Spin>
            </Modal>
        )
    }
}

export default ModalCreateEdit;
