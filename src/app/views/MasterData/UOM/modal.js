import React from "react";
import { Modal, Typography } from "antd";
import '../../../css/global.css';
import FormUOM from './form';

const { Title } = Typography;

class ModalCreateEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }
    // const [form] = Form.useForm();

    onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    }

    // if ( props.visible === false ) {
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
                width={300}
            >
                <Title level={3}>
                    {this.props.title}
                </Title>
                {
                    this.props.visible ?
                        (
                            <FormUOM
                                visible={this.props.visible}
                                onFinish={values => this.props.onFinish(values)}
                                buttonCancel={this.props.buttonCancel}
                                data={this.props.data}
                                loading={this.props.loading}
                            />
                        ) :
                        (
                            <React.Fragment></React.Fragment>
                        )
                }
            </Modal>
        )
    }
}

export default ModalCreateEdit;