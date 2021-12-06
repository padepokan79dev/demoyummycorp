import React, { Component} from "react";
import {
    Modal,
    Typography,
    Spin
} from "antd";
import 'antd/dist/antd.css';
import '../../../css/global.css';
import FormRole from "./form";

const { Title } = Typography;

class ModalCreateEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <Modal
                visible={this.props.visible}
                className="form-modal"
                closable={false}
                footer={null}
                centered
                width={1100}
            >
              <Spin spinning={this.props.loadingPrivilege} tip={'Loading'}>
                <Title level={3}>
                    {this.props.title}
                </Title>
                {
                    this.props.visible ?
                        (
                            <FormRole
                                visible={this.props.visible}
                                onFinish={this.props.onFinish}
                                buttonCancel={this.props.buttonCancel}
                                loading={this.props.loading}
                                userGroup={this.props.userGroup}
                                roleDetail={this.props.roleDetail}
                                privilege={this.props.privilege}
                                handleChangePrivilege={this.props.handleChangePrivilege}
                                checkedAllPrivilege={this.props.checkedAllPrivilege}
                                handlerChangePrivilegeAll={this.props.handlerChangePrivilegeAll}
                            />
                        ) : ( <></> )
                }
              </Spin>
            </Modal>
        )
    }
}

export default ModalCreateEdit;
