import React, { Component, useState } from "react";
import { withRouter, Link } from 'react-router-dom';
import "../../css/global.css";
import "antd/dist/antd.css";
import { Layout, Row, Input, Card, Button, Modal, notification, Form, Col } from 'antd';
import { FSMServices } from "../../service";
import { MailOutlined } from '@ant-design/icons';
import logo from '../../../assets/logo1.png';
import userIcon from '../../../assets/user.svg';
import passwordIcon from '../../../assets/password.svg';
import Cookies from 'js-cookie'

const FormResetPassword = (props) => {
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);

    const forgetPassword = async (data) => {
        setLoading(true);
        await FSMServices.forgetPassword(data)
        .then(res => {
            if (
                res &&
                res.data &&
                res.data.Message ?
                res.data.Message === "Email telah terkirim! Silahkan check email Anda!" : false
            ) {
                notification.success({
                    placement: 'bottomRight',
                    message: 'Success',
                    description:
                        res &&
                        res.data &&
                        res.data.Message ?
                        res.data.Message : "Forgot Password Success"
                });
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description:
                        res &&
                        res.data &&
                        res.data.Message ?
                        res.data.Message : "Forgot Password Error"
                });
            }
            setLoading(false);
        });
    }

    const onFinish = async (values) => {
        const data = {
            to: values.email
        };
        forgetPassword(data);
    };

    return (
        <Modal
            className="modal-login"
            visible={props.visible}
            onCancel={props.handleCancel}
            footer={[
                <Button
                    htmlType="submit"
                    form="forget"
                    className="btn-modal-login"
                    loading={loading}
                    key={1}
                >
                    Send
                </Button>,
            ]}
        >
            <Row style={{ marginTop: "2em" }}>
                <h1>Forget Password?</h1>
            </Row>
            <Row>
                <span className="label-modal-login">System will send you recovery link to your email of your account</span>
            </Row>
            <Row justify="start" align="left" className="label-modal-login">
                <span>Email</span>
            </Row>
            <Row justify="start">
                <Form
                    form={form}
                    onFinish={onFinish}
                    id='forget'
                >
                    <Form.Item
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your username or email!',
                            },
                        ]}
                    >
                        <Input
                            style={{ marginBottom: 12, marginTop: 24 }}
                            className="form-group-modal"
                            suffix={<MailOutlined />}
                            name="name"
                            type="text"
                        />
                    </Form.Item>
                </Form>
            </Row>
        </Modal>
    )
}

class Login extends Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"

        this.state = {
            loading: false,
            visible: false,
            loadingButton: false,
            versionConst: 'Version 1.2.67'
        };
        this.onFinish = this.onFinish.bind(this);
    }

    componentDidMount() {
        if (
            Cookies.get("LoginSession") &&
            Cookies.get("userId") &&
            Cookies.get("userName")
        ) {
            var pages = JSON.parse(Cookies.get('menu'))
            var pushPage = pages[0].navlink != '' ? pages[0].navlink : pages[0].submenu[0].navlink
            this.props.history.push(pushPage)
        }
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    async onFinish(values) {
        this.setState({
            loadingButton: true
        });
        const data = {
            username: values.username,
            password: values.password
        }
        await FSMServices.authenticationLogin(data).then(async res => {
            if (res ? res.status === 200 : false) {
                let authority = res.data.data.authorities[0].authority;
                let userID = res.data.data.userId || ""
                if ( authority === "ADMIN" ) {
                    Cookies.set('LoginSession', res.data.auth.Authorization, { expires: 1, path: ''})
                    Cookies.set('userId', userID, { expires: 1, path: ''})

                    const paramsToken = {
                      userId: userID,
                      fcmToken: localStorage.getItem("fcmToken")
                    }

                    FSMServices.postFirebaseToken(paramsToken)

                    await FSMServices.getDataAkun(userID).then(dataAkun => {
                        Cookies.set('userName', dataAkun ? dataAkun.data.Data.userFullName :"", { expires: 1, path: ''})
                        Cookies.set('roleId', dataAkun ? dataAkun.data.Data.roleId.roleId: "", { expires: 1, path: ''})
                        Cookies.set('lastModifiedOn', dataAkun ? dataAkun.data.Data.roleId.lastModifiedOn :"", { expires: 1, path: ''})
                        Cookies.set('menu', dataAkun ? JSON.stringify(dataAkun.data.privilege) : null, { expires: 1, path: ''})
                        var pushPage = dataAkun.data.privilege[0].navlink != '' ? dataAkun.data.privilege[0].navlink : dataAkun.data.privilege[0].submenu[0].navlink
                        notification.success({
                            placement: 'bottomRight',
                            message: 'Success',
                            description: 'Login Success',
                        });
                        this.props.login(userID)
                        this.props.history.push(pushPage);
                    })
                } else {
                    notification.error({
                        placement: 'bottomRight',
                        message: 'Error',
                        description: 'Username atau password tidak sesuai'
                    });
                }
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: 'Username atau password tidak sesuai'
                });
            }
        });
        this.setState({
            loadingButton: false
        });
    }

    doRegister() {
        this.props.history.push('/register');
    }

    render() {
        const { visible, loadingButton, versionConst } = this.state;
        return (
            <Layout.Content className="site-layout-login">
                <img
                    src={logo}
                    alt="logo-tugasin"
                    className="logo-login"
                />
                <Card
                    className="card-login"
                >
                    <Form
                        onFinish={this.onFinish}
                    >
                        <Row>
                            <Col span={24}>
                                <div className="container-icon">
                                    <img src={userIcon} alt="icon-user" width="16" />
                                </div>
                                <Form.Item
                                    style={{ marginBottom: 25 }}
                                    name="username"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input username!'
                                        }
                                    ]}
                                >
                                    <Input className="input-login" placeholder="Username" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <div className="container-icon">
                                    <img src={passwordIcon} alt="icon-user" width="16" />
                                </div>
                                <Form.Item
                                    style={{ marginBottom: 25 }}
                                    name="password"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input password!'
                                        }
                                    ]}
                                >
                                    <Input className="input-login" placeholder="Password" type="password" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    style={{ marginBottom: 0 }}
                                >
                                    <Button
                                        className="btn-login"
                                        loading={loadingButton}
                                        htmlType="submit"
                                    >
                                        Login
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                        <div className="wrapper-forgot">
                            <span>Forgot Password? </span>
                            <span
                                onClick={this.showModal}
                                style={{
                                    color: 'royalblue',
                                    cursor: 'pointer'
                                }}
                            >
                                Click Here
                            </span>
                        </div>
                        {/*<div className="wrapper-register">
                            <span><Link to="/register">Register</Link></span>
                        </div>*/}
                        <FormResetPassword
                            visible={visible}
                            handleCancel={this.handleCancel}
                            k
                        />
                    </Form>
                </Card>
                <Row justify="center" align="center">
                    <span
                        style={{
                            color: '#FFF',
                            fontSize: '20px',
                            marginTop: '20px',
                            fontWeight: 'bold',
                            fontKerning: 'auto'
                        }}
                    >
                        {versionConst}
                    </span>
                </Row>
            </Layout.Content>
        );
    }
}

export default withRouter(Login);
