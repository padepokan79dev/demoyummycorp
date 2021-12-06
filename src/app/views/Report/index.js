import React from "react";
import { withRouter, NavLink } from "react-router-dom";
import { Layout, Typography, Row, Col, Select, Card, Tag} from "antd";
// import { PrinterOutlined, PlusOutlined, SearchOutlined, CloseOutlined, EditFilled } from '@ant-design/icons';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const StatisticLoading = (props) => {
    return (
        <div className="statistic-progress">
            <div className="open" style={{ width: props.open }}></div>
            <div className="in-progress" style={{ width: props.inProgress }}></div>
            <div className="hold" style={{ width: props.hold }}></div>
            <div className="finish-reported" style={{ width: props.finishReported }}></div>
            <div className="urgent" style={{ width: props.urgent }}></div>
            <div className="high" style={{ width: props.high }}></div>
            <div className="medium" style={{ width: props.medium }}></div>
            <div className="low" style={{ width: props.low }}></div>
            <div className="task" style={{ width: props.task }}></div>
            <div className="request" style={{ width: props.request }}></div>
            <div className="incident" style={{ width: props.incident }}></div>
        </div>
    );
};
const optionList = [
    {
        key: 1,
        name: 'Today'
    },
    {
        key: 2,
        name: 'This Week'
    },
    {
        key: 3,
        name: 'This Month'
    },
    {
        key: 4,
        name: 'This Year'
    },
    {
        key: 5,
        name: 'Last 2 Month'
    },
    {
        key: 6,
        name: 'Last 6 Month'
    },
    {
        key: 7,
        name: 'Custom'
    }
];
class Report extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"
        
        this.state = {};
    }

    render() {
        return (
            <Content>
                <Row justify="center" style={{ marginTop: 150 }}>
                    <Col xs={23} sm={22} lg={20} xl={18}>
                        <Row>
                            <Col xs={24} sm={12}>
                                <Title level={2} className="report-title">
                                    Report
                                </Title>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Select defaultValue={5} className="select-report">
                                    { 
                                        optionList.map(function(item) {
                                            return (
                                                <Option key={item.key} value={item.key}>
                                                    {item.name}
                                                </Option>
                                            );
                                        })
                                    }
                                </Select>
                            </Col>
                        </Row>
                        <Row gutter={[0, 15]}>
                            <Col className="gutter-row col-custom-responsive" span={24}>
                                <Card className="card">
                                    <Row>
                                        <Col xs={24} sm={12}>
                                            <Title level={4}>
                                                Total Work Order
                                            </Title>
                                        </Col>
                                        <Col xs={24} sm={12} className="col-detail-report">
                                            <NavLink to="/ticketing-list">
                                                <Title level={4}>
                                                    Detail
                                                </Title>
                                            </NavLink>
                                        </Col>
                                        <Col xs={24}>
                                            <Title level={1}>
                                                350
                                            </Title>
                                        </Col>
                                    </Row>
                                    <Row gutter={[0, 20]}>
                                        <Col className="gutter-row col-custom-responsive" xs={24} lg={18} xl={18}>
                                            <Row justify="space-between" align="bottom">
                                                {/* Open */}
                                                <Col xs={24} sm={12} md={6} lg={4}>
                                                    <Row align="middle">
                                                        <Col xs={12} sm={14}>
                                                            <Row>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        Open
                                                                    </Title>
                                                                </Col>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        (43%)
                                                                    </Title>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                        <Col xs={12} sm={10}>
                                                            <span className="round-statistic" style={{ backgroundColor: "#2F80ED" }}></span>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{ marginTop: 10 }}>
                                                        <Col span={12}>
                                                            <Title level={2}>
                                                                150
                                                            </Title>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                {/* In Progress */}
                                                <Col xs={24} sm={12} md={6}>
                                                    <Row align="middle">
                                                        <Col xs={12} sm={17}>
                                                            <Row>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        In-progress
                                                                    </Title>
                                                                </Col>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        (26%)
                                                                    </Title>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                        <Col xs={12} sm={7}>
                                                            <span className="round-statistic" style={{ backgroundColor: "#27AE60" }}></span>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{ marginTop: 10 }}>
                                                        <Col span={12}>
                                                            <Title level={2}>
                                                                90
                                                            </Title>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                {/* Hold */}
                                                <Col xs={24} sm={12} md={6} lg={4}>
                                                    <Row align="middle">
                                                        <Col xs={12} sm={14}>
                                                            <Row>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        Hold
                                                                    </Title>
                                                                </Col>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        (3%)
                                                                    </Title>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                        <Col xs={12} sm={10}>
                                                            <span className="round-statistic" style={{ backgroundColor: "#F2C94C" }}></span>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{ margsinTop: 10 }}>
                                                        <Col span={12}>
                                                            <Title level={2}>
                                                                10
                                                            </Title>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                {/* Finish Reported */}
                                                <Col xs={24} sm={12} md={6} lg={8}>
                                                    <Row align="middle">
                                                        <Col xs={12} sm={18}>
                                                            <Row>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        Finish Reported
                                                                    </Title>
                                                                </Col>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        (28%)
                                                                    </Title>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                        <Col xs={12} sm={6}>
                                                            <span className="round-statistic" style={{ backgroundColor: "#EB5757" }}></span>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{ marginTop: 10 }}>
                                                        <Col span={12}>
                                                            <Title level={2}>
                                                                100
                                                            </Title>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={22}>
                                                    <StatisticLoading 
                                                        open="43%"
                                                        inProgress="26%"
                                                        hold="3%"
                                                        finishReported="28%"
                                                    />
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col className="gutter-row col-custom-responsive" lg={4} xl={6}>
                                            <Row>
                                                <Col span={24}>
                                                    <Title level={4} className="title-report">Average Solving</Title>
                                                </Col>
                                                <Col span={24}>
                                                    <Title level={4} className="title-report">Time</Title>
                                                </Col>
                                                <Col span={24} style={{ marginTop: 10 }}>
                                                    <Title level={2}>15 min</Title>
                                                </Col>
                                                <Col span={24}>
                                                    <Tag color="success">GOOD PERFORMANCE</Tag>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                            <Col className="gutter-row" span={24}>
                                <Card className="card">
                                    <Row>
                                        <Col className="col-custom-responsive" span={24}>
                                            <Title level={4}>
                                                Ticket Based On Priority
                                            </Title>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={24} lg={18}>
                                            <Row justify="space-between">
                                                {/* Urgent */}
                                                <Col className="col-custom-responsive" xs={24} sm={12} md={6}>
                                                    <Row align="middle">
                                                        <Col xs={12} md={11}>
                                                            <Row>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        Urgent
                                                                    </Title>
                                                                </Col>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        (2%)
                                                                    </Title>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                        <Col xs={12} md={13}>
                                                            <span className="round-statistic" style={{ backgroundColor: "#EB5757" }}></span>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{ marginTop: 10 }}>
                                                        <Col xs={12} sm={24}>
                                                            <Title level={2}>
                                                                8
                                                            </Title>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                {/* High */}
                                                <Col className="col-custom-responsive" xs={24} sm={12} md={6}>
                                                    <Row align="middle">
                                                        <Col xs={12} md={10}>
                                                            <Row>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        High
                                                                    </Title>
                                                                </Col>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        (77%)
                                                                    </Title>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                        <Col xs={12} md={14}>
                                                            <span className="round-statistic" style={{ backgroundColor: "#F2994A" }}></span>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{ marginTop: 10 }}>
                                                        <Col xs={12} sm={24}>
                                                            <Title level={2}>
                                                                268
                                                            </Title>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                {/* medium */}
                                                <Col className="col-custom-responsive" xs={24} sm={12} md={6}>
                                                    <Row align="middle">
                                                        <Col xs={12} md={13}>
                                                            <Row>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        Medium
                                                                    </Title>
                                                                </Col>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        (18%)
                                                                    </Title>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                        <Col xs={12} sm={12} md={11}>
                                                            <span className="round-statistic" style={{ backgroundColor: "#F2C94C" }}></span>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{ marginTop: 10 }}>
                                                        <Col span={12}>
                                                            <Title level={2}>
                                                                62
                                                            </Title>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                {/* Low */}
                                                <Col className="col-custom-responsive" xs={24} sm={12} md={6}>
                                                    <Row align="middle">
                                                        <Col xs={12} sm={12}>
                                                            <Row>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        Low
                                                                    </Title>
                                                                </Col>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        (3%)
                                                                    </Title>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                        <Col xs={12}>
                                                            <span className="round-statistic" style={{ backgroundColor: "#27AE60" }}></span>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{ marginTop: 10 }}>
                                                        <Col xs={12} sm={24}>
                                                            <Title level={2}>
                                                                12
                                                            </Title>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={24}>
                                            <StatisticLoading
                                                urgent="2%"
                                                high="77%"
                                                medium="18%"
                                                low="3%"
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                            <Col className="gutter-row col-custom-responsive" span={24}>
                                <Card className="card">
                                    <Row>
                                        <Col span={24}>
                                            <Title level={4}>
                                                Ticket Based On Category
                                            </Title>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={24} lg={18}>
                                            <Row>
                                                {/* Task */}
                                                <Col xs={24} sm={8} md={6}>
                                                    <Row align="middle">
                                                        <Col xs={12} sm={11}>
                                                            <Row>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        Task
                                                                    </Title>
                                                                </Col>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        (20%)
                                                                    </Title>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                        <Col xs={12} sm={13}>
                                                            <span className="round-statistic" style={{ backgroundColor: "#2F80ED" }}></span>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{ marginTop: 10 }}>
                                                        <Col xs={12} sm={24}>
                                                            <Title level={2}>
                                                                93
                                                            </Title>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                {/* High */}
                                                <Col xs={24} sm={8} md={6}>
                                                    <Row align="middle">
                                                        <Col xs={12} sm={10}>
                                                            <Row>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        High
                                                                    </Title>
                                                                </Col>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        (70%)
                                                                    </Title>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                        <Col xs={12} sm={14}>
                                                            <span className="round-statistic" style={{ backgroundColor: "#F2C94C" }}></span>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{ marginTop: 10 }}>
                                                        <Col xs={12} sm={24}>
                                                            <Title level={2}>
                                                                238
                                                            </Title>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                {/* Incident */}
                                                <Col xs={24} sm={8} md={6}>
                                                    <Row align="middle">
                                                        <Col xs={12} sm={13}>
                                                            <Row>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        Incident
                                                                    </Title>
                                                                </Col>
                                                                <Col span={24}>
                                                                    <Title level={4} className="title-report">
                                                                        (10%)
                                                                    </Title>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                        <Col xs={12} sm={11}>
                                                            <span className="round-statistic" style={{ backgroundColor: "#EB5757" }}></span>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{ marginTop: 10 }}>
                                                        <Col xs={12} sm={24}>
                                                            <Title level={2}>
                                                                19
                                                            </Title>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={24}>
                                            <StatisticLoading
                                                task="20%"
                                                request="70%"
                                                incident="10%"
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Content>
        )
    }
}

export default withRouter(Report);