import React from "react";
import { Modal, Typography, Form, Button, Input, Space, Row, Col, Select } from "antd";
import 'antd/dist/antd.css';
import '../../../css/global.css';
import { GlobalFunction } from '../../../global/function'

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ModalCreateEdit = (props) => {
    const [form] = Form.useForm()

    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    }

    const onValuesChange = (changedValues, allValues) => {
        const companyName = changedValues.companyName;
        if (companyName) {
            form.setFieldsValue({
                companyName: GlobalFunction.replaceSymbol(changedValues.companyName)
            });
        }
    }

        return (
            <Modal
                destroyOnClose={true}
                visible={props.visible}
                className="form-modal"
                footer={null}
                closable={props.isDetail ? true : false}
                onCancel={props.isDetail ? props.buttonCancel : false}
                centered
            >
                <Title level={3}>
                    {!props.isDetail ? props.title : `Branch List of ${props.companyName}` }
                </Title>

                <Form
                    form={form}
                    onValuesChange={onValuesChange}
                    initialValues={props.dataRow ? {
                            companyId: props.dataRow.company_id,
                            companyName: props.dataRow.company_name,
                            companyEmail: props.dataRow.companyEmail,
                            companyPassword: props.dataRow.companyPassword,
                            companyAddress1: props.dataRow.companyAddress1,
                            companyAddress2: props.dataRow.companyAddress2,
                            cityId: props.dataRow.cityId,
                            companyZipCode: props.dataRow.companyZipCode,
                            companyPhone: props.dataRow.companyPhone,
                            picName: props.dataRow.picName,
                            picEmail: props.dataRow.picEmail,
                            picPhone: props.dataRow.picPhone,
                            picDesc: props.dataRow.picDesc
                        } : {}
                    }
                    onFinish={props.onFinish}
                    onFinishFailed={onFinishFailed}
                >

                {!props.isDetail ?
                    (
                        <Row gutter={20}>
                        <Col span={24} className="input-hidden">
                            <Form.Item name="companyId">
                                <Input
                                type="hidden"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Text>Company Name</Text>
                            <Form.Item
                                name="companyName"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input company name!'
                                    }
                                ]}
                            >
                                <Input
                                className="input-modal"
                                placeholder="Input Company Name"
                                maxLength={50} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Text>Email</Text>
                            <Form.Item
                                name="companyEmail"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input email!'
                                    },
                                    {
                                        type: 'email',
                                        message: 'Please input a valid email!'
                                    }
                                ]}
                            >
                            <Input
                                className="input-modal"
                                placeholder="Input Company Email"
                                maxLength={75}
                            />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Text>Phone</Text>
                            <Form.Item
                                name="companyPhone"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input phone number!'
                                    },
                                    {
                                        pattern: /^[+\d](?:.*\d)?$/g,
                                        message: 'Please input a valid phone number!'
                                    },
                                    {
                                        min: 10,
                                        max: 15,
                                        message: 'Range phone number 10 ~ 15 digits!'
                                    }
                                ]}
                            >
                            <Input
                                className="input-modal"
                                placeholder="Input Company Phone"
                                maxLength={15}
                            />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Text>Address 1</Text>
                            <Form.Item
                                name="companyAddress1"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input address!'
                                    }
                                ]}
                            >
                            <TextArea
                                rows={4}
                                maxLength={255}
                                className="input-modal"
                                placeholder="Input Company Address"
                            />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Text>Address 2</Text>
                            <Form.Item
                                name="companyAddress2"
                            >
                            <TextArea
                                rows={4}
                                maxLength={255}
                                className="input-modal"
                                placeholder="Input Company Address"
                            />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Text>City</Text>
                            <Form.Item
                                name="cityId"
                                rules={[{ required: true, message: 'Please input city!' }]}
                            >
                                <Select
                                        className="select"
                                        placeholder="Select city"
                                        showSearch
                                        onSearch={props.searchCity}
                                        onSelect={()=>props.searchCity("")}
                                        optionFilterProp="children"
                                        filterOption={false}
                                    >
                                        { props.optionListCity.map(data => {
                                            return (
                                                <Option key={data.cityId} value={data.cityId}>{data.cityName}</Option>
                                            )
                                        }) }
                                    </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Text>Zip Code</Text>
                            <Form.Item
                                name="companyZipCode"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input zip code!'
                                    },
                                    {
                                        pattern: /^[0-9]*$/g,
                                        message: 'Please input a valid zip code!'
                                    },
                                    {
                                        min: 5,
                                        max: 5,
                                        message: 'Zip code must be 5 digits!'
                                    }
                                ]}
                            >
                            <Input
                                maxLength={5}
                                className="input-modal"
                                placeholder="Input Company Zip Code"
                            />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Text>PIC Name</Text>
                            <Form.Item
                                name="picName"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input PIC Name!'
                                    }
                                ]}
                            >
                            <Input
                                maxLength={50}
                                className="input-modal"
                                placeholder="Input PIC Name"
                            />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Text>PIC Email</Text>
                            <Form.Item
                                name="picEmail"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input PIC email!'
                                    },
                                    {
                                        type: 'email',
                                        message: 'Please input a valid email!'
                                    }
                                ]}
                            >
                            <Input
                                maxLength={75}
                                className="input-modal"
                                placeholder="Input PIC Email"
                            />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Text>PIC Phone</Text>
                            <Form.Item
                                name="picPhone"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input phone number!'
                                    },
                                    {
                                        pattern: /^[+\d](?:.*\d)?$/g,
                                        message: 'Please input a valid phone number!'
                                    },
                                    {
                                        min: 10,
                                        message: "Minimal Phone Number 10 digits!"
                                    }
                                ]}
                            >
                            <Input
                                maxLength={15}
                                className="input-modal"
                                placeholder="Input PIC Phone"
                            />
                            </Form.Item>
                        </Col>
                        </Row>
                    )
                        :
                    (
                        <Row gutter={20}>
                            {props.dataBranch.map(data => {
                                return (
                                    <>
                                        <Col span={24}>
                                            <Text style={{fontWeight:"bold"}}>{data.Branch}</Text>
                                        </Col>
                                        <Col span={24}>
                                            <Text style={{fontWeight:"bold", marginBottom: '50px'}}>PIC: {data.PICBranch} </Text>
                                        </Col>
                                    </>
                                )
                            })}
                        </Row>
                    )
                }
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
                                {props.isDetail ? 'Close' : 'Cancel'}
                            </Button>
                            {!props.isDetail && (
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size={'small'}
                                    loading={props.loading}
                                    style={{
                                        paddingLeft: '25px',
                                        paddingRight: '25px',
                                        borderRadius: '5px'
                                    }}
                                onClick={props.buttonSave}
                                >
                                    Save
                                </Button>
                            )}

                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        )
    }

export default ModalCreateEdit;
