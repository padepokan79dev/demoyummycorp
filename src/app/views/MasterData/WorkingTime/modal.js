import React from "react";
import { Modal, Typography } from "antd";
import '../../../css/global.css';
import FormWorkingTime from "./form";

const { Title } = Typography;

class ModalCreateEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    }

    render() {
        return (
            <Modal
                visible={this.props.visible}
                className="form-modal-middle"
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
                        <FormWorkingTime
                            data={this.props.data}
                            onFinish={values => this.props.onFinish(values)}
                            visible={this.props.visible}
                            buttonCancel={this.props.buttonCancel}
                            startTime={ values => this.props.startTime(values)}
                            endTime={ values => this.props.endTime(values)}
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