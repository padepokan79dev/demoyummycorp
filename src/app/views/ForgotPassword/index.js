import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import "../../css/global.css";
import "antd/dist/antd.css";
import { Layout,Row,Input,Card,Button,Form } from 'antd';
import Icon from '@ant-design/icons';

class ForgotPassword extends Component {

    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"
        
        this.state = {
            
        };
    }

    doLogin(){
        this.props.history.push('/');
    }

    render() {
        return (
            <Layout.Content className="site-layout-register">
                <Row justify="center" align="center">
                    <h1 style={{color:"#fff" ,marginTop:"1em" ,fontSize:"38px",fontWeight:"bold",letterSpacing:"10px"}}>FSM</h1>
                </Row>
                <Row justify="center" align="center">
                    <span className="label-register">Selamat datang. Silahkan mengisi untuk membuat password baru</span>
                </Row>
                <Card className="card-site-register">
                    <Form 
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                    >   
                        {/* <Row justify="center" align="center">
                            <span className="label-register">Code</span>
                        </Row>
                        <Row>
                            <Form.Item
                                name="Code"
                                rules={[{ required: true, message: 'Please input code!' }]}
                            >
                                <Input
                                style={{ marginBottom: 12 }}
                                className="form-group-register"
                                suffix={<Icon type="user"/>}
                                type="text"
                                />
                            </Form.Item>
                        </Row> */}
                        <Row justify="center" align="center">
                            <span className="label-register">Password</span>
                        </Row>
                        <Row>
                            <Form.Item
                                name="Password"
                                rules={[{ required: true, message: 'Please input password!' }]}
                            >
                                <Input
                                style={{ marginBottom: 12 }}
                                className="form-group-register"
                                suffix={<Icon type="user"/>}
                                type="text"
                                />
                            </Form.Item>
                        </Row>
                        <Row justify="center" align="center">
                            <span className="label-register">Confim Password</span>
                        </Row>
                        <Row>
                            <Form.Item
                                name="Confirm Password"
                                rules={[{ required: true, message: 'Please input password again!' }]}
                            >
                                <Input
                                style={{ marginBottom: 12 }}
                                className="form-group-register"
                                suffix={<Icon type="user"/>}
                                type="text"
                                />
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item>
                                <Button
                                    block
                                    type="primary"
                                    htmlType="submit"
                                    className="register-form-button"
                                >
                                    Submit
                                </Button>
                            </Form.Item>
                        </Row>
                    </Form>
                </Card>
                <Row justify="center" align="center">
                    <span 
                        style={{
                            color:"#ffffff",
                            marginTop:"450px",
                            cursor: "pointer"
                        }} 
                        onClick={() => this.doLogin()}
                    >
                        Login
                    </span>
                </Row>
            </Layout.Content>
        );
    }
}

export default withRouter(ForgotPassword);