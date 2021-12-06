import React from "react";
import { Modal, Row, Col, Spin, Typography } from "antd";
const { Text } = Typography;
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
                className="form-modal"
                footer={null}
                onCancel={this.props.buttonCancel}
                centered
                width={350}
            >
                <Spin spinning={this.props.loading}>
                    <Row gutter={[15, 15]}>
                        <Col span={24}>
                            <Text>
                                <b>
                                    {this.props.title} #{this.props.scheduleDetail.detailTicket
                                        ? this.props.scheduleDetail.detailTicket
                                        : "" }
                                </b>
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Text><b>Ref. Ticket ID</b></Text>
                        </Col>
                        <Col span={12}>
                            <Text>
                                {this.props.scheduleDetail.referenceTicket
                                    ? '#' + this.props.scheduleDetail.referenceTicket.ticketCode
                                    : "-"}
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Text><b>Customer</b></Text>
                        </Col>
                        <Col span={12}>
                            <Text>
                                {this.props.scheduleDetail.company_name
                                    ? this.props.scheduleDetail.company_name
                                    : ""}
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Text><b>Branch</b></Text>
                        </Col>
                        <Col span={12}>
                            <Text>
                                {this.props.scheduleDetail.branchName
                                    ? this.props.scheduleDetail.branchName
                                    : ""}
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Text><b>Address</b></Text>
                        </Col>
                        <Col span={12}>
                            <Text>
                                {this.props.scheduleDetail.branch_address
                                    ? this.props.scheduleDetail.branch_address
                                    : ""}
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Text><b>City</b></Text>
                        </Col>
                        <Col span={12}>
                            <Text>
                                {this.props.scheduleDetail.city
                                    ? this.props.scheduleDetail.city
                                    : ""}
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Text><b>Task Type</b></Text>
                        </Col>
                        <Col span={12}>
                            <Text>
                            {this.props.scheduleDetail.taskType
                                    ? this.props.scheduleDetail.taskType
                                    : ""}
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Text><b>Task Title</b></Text>
                        </Col>
                        <Col span={12}>
                            <Text>
                            {this.props.scheduleDetail.taskTitle
                                    ? this.props.scheduleDetail.taskTitle
                                    : ""}
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Text><b>Status</b></Text>
                        </Col>
                        <Col span={12}>
                            <Text>
                                {this.props.scheduleDetail.status
                                    ? this.props.scheduleDetail.status
                                    : ""}
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Text><b>Description</b></Text>
                        </Col>
                        <Col span={12}>
                            <Text>
                                {this.props.scheduleDetail.description
                                    ? this.props.scheduleDetail.description
                                    : ""}
                            </Text>
                        </Col>
                    </Row>
                </Spin>
            </Modal>
        )
    }
}

export default ModalCreateEdit;
