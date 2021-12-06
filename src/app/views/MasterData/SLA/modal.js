import React from "react";
import {
    Modal,
    Typography
} from "antd";
import FormSLA from "./form";

const { Title} = Typography;

class ModalCreateEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
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
                            <FormSLA
                                optionListBranch={this.props.optionListBranch}
                                optionListType={this.props.optionListType}
                                optionListWorkingTime={this.props.optionListWorkingTime}
                                optionListCompany={this.props.optionListCompany}
                                buttonCancel={this.props.buttonCancel}
                                onFinish={values => this.props.onFinish(values)}
                                loading={this.props.loading}
                                includeWeekend={e => this.props.includeWeekend(e)}
                                visible={this.props.visible}
                                data={this.props.data}
                                onChangeCompany={this.props.onChangeCompany}
                                isDisabledBranch={this.props.isDisabledBranch}
                                loadingBranch={this.props.loadingBranch}
                            />
                        ) :
                        (
                            <></>
                        )
                }
            </Modal>
        )
    }
}

export default ModalCreateEdit;