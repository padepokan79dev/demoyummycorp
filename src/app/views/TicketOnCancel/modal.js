import React from "react";
import { Modal, Typography, Button, Input, Space, Row, Col } from "antd";

const { Title, Text } = Typography;
const { TextArea } = Input;

// const [form] = Form.useForm();

class ModalCreateEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    onFinish = values => {
        console.log('Success:', values);
    }

    onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    }

    // onReset = () => {
    //     form.resetFields();
    // }

    render() {
        return (
            <Modal
                visible={this.props.visible}
                className="form-modal"
                footer={null}
                closable={false}
                centered
                width={600}
            >
                <Row gutter={15}>
                    <Col span={24}>
                        <Text><b>TIC0419005</b></Text>
                    </Col>
                    <Col span={24}>
                        <Title level={3}>Layar berkedip-kedip</Title>
                    </Col>
                    <Col span={12}>
                        <Text><b>Customer</b></Text>
                    </Col>
                    <Col span={12}>
                        <Text><b>PIC</b></Text>
                    </Col>
                    <Col span={12}>
                        <Title level={4}>PT. Tirta Maju Bersama</Title>
                    </Col>
                    <Col span={12}>
                        <Title level={4}>Mulya E. Siregar</Title>
                    </Col>
                    <Col span={8}>
                        <Text><b>Date Start</b></Text>
                    </Col>
                    <Col span={4}>
                        <Text><b>Time</b></Text>
                    </Col>
                    <Col span={8}>
                        <Text><b>Date Canceled</b></Text>
                    </Col>
                    <Col span={4}>
                        <Text><b>Time</b></Text>
                    </Col>
                    <Col span={8}>
                        <Title level={4}>April 19, 2020</Title>
                    </Col>
                    <Col span={4}>
                        <Title level={4}>09:40</Title>
                    </Col>
                    <Col span={8}>
                        <Title level={4}>April 19, 2020</Title>
                    </Col>
                    <Col span={4}>
                        <Title level={4}>09:53</Title>
                    </Col>
                    <Col span={24}>
                        <Text><b>Reason</b></Text>
                    </Col>
                    <Col span={24}>
                        <TextArea rows={4} className="input-modal"></TextArea>
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
            </Modal>
        )
    }
}

export default ModalCreateEdit;