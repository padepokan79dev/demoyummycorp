import React from "react";
import { 
    Layout, 
    Typography, 
    Row, 
    Col, 
    Button, 
    Input, 
    Card, 
    Space, 
    notification, 
    Popconfirm,
    Table
} from "antd";
import {
    PlusOutlined, 
    SearchOutlined, 
    CloseOutlined, 
    EditFilled 
} from '@ant-design/icons';
import ModalCreateEdit from './modal';
import { withRouter } from "react-router-dom";
import { FSMServices } from "../../../service";
import _debounce from 'lodash.debounce';
import { GlobalFunction } from '../../../global/function';

const { Content } = Layout;
const { Title } = Typography;

class MasterDataReport extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"
        
        this.state = {
            visibleCreate: false,
            visibleUpdate: false,
            sort: "created_on,desc",
            search: "",
            pagination: {
                current: 1,
                pageSize: 10,
            },
            loadingDelete: []
        }
    }

    componentDidMount() {
        this.getReportList(
            this.state.search,
            this.state.pagination.current - 1,
            this.state.pagination.pageSize,
            this.state.sort,
        );
        this.setState({ userId: this.props.userId });
    }

    toggleModalCreate = () => {
        this.setState({
            visibleCreate: !this.state.visibleCreate,
        });
    }

    toggleModalUpdate = (data) => {
        this.setState({
            visibleUpdate: !this.state.visibleUpdate,
            dataRow: data
        });
    }

    // get list api
    async getReportList(search, page, size, sort) {
        this.setState({
            loading: true
        });
        let listTemp = [];
        await FSMServices.getReportList(search, page, size, sort).then( res => {
            listTemp = 
                res &&
                res.data &&
                res.data.Data ? 
                res.data.Data : [];
            this.setState({
                pagination: {
                    ...this.state.pagination,
                    total: 
                        res &&
                        res.data &&
                        res.data.totalListWorkingTime ?
                        res.data.totalListWorkingTime : 0
                }
            });
        });
        this.setState({
            reportList: listTemp.map(item => {
                return {
                    ...item,
                    key: item.reportId
                }
            }),
            loading: false
        });
    }

    searchHandler(e) {
        let key = e.target.value;
        this.processSearch(key);
    }

    processSearch = _debounce( key => {
        this.setState({
            search: GlobalFunction.searchEncode(key),
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.getReportList(
                this.state.search,
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort
            );
        });
    }, 500)

    handleTableChange = (pagination, filters, sorter) => {
        if (sorter.order === "ascend") {
            sorter.order = "asc";
        } else if (sorter.order === "descend") {
            sorter.order = "desc";
        }

        this.setState({
            sort: `${sorter.order ? `${sorter.columnKey},${sorter.order}` : 'created_on,desc'}`,
            pagination: pagination
        }, () => {
            this.getReportList(
                this.state.search,
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort
            );
        });
    };

    createReport = async data => {
        await FSMServices.createReport(data)
        .then(res => {
            if (
                res &&
                res.status &&
                res.data.Status ?
                res.data.Status === "OK" : false
            ) {
                notification.success({
                    placement: 'bottomRight',
                    message: 'Success',
                    description: 
                        res &&
                        res.data &&
                        res.data.Message ?
                        res.data.Message : "Create Report Success",
                });
                this.toggleModalCreate();
                this.getReportList(
                    this.state.search,
                    this.state.pagination.current - 1,
                    this.state.pagination.pageSize,
                    this.state.sort
                );
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: 
                        res &&
                        res.data &&
                        res.data.Message ?
                        res.data.Message : "Create Report Error",
                });
            }
        });
    }

    onCreate = async values => {
        this.setState({ loadingCreate: true });
        const data = {
            reportName: values.name,
            createdBy: this.state.userId,
            lastModifiedBy: this.state.userId,
        }
        await this.createReport(data);
        this.setState({ loadingCreate: false });
    }

    editReport = async (data, reportId) => {
        await FSMServices.editReport(data, reportId)
        .then(res => {
            if (
                res &&
                res.status &&
                res.data.Status ?
                res.data.Status === "OK" : false
            ) {
                notification.success({
                    placement: 'bottomRight',
                    message: 'Success',
                    description: 
                        res &&
                        res.data &&
                        res.data.Message ?
                        res.data.Message : "Edit Report Success"
                });
                this.toggleModalUpdate();
                this.getReportList(
                    this.state.search,
                    this.state.pagination.current - 1,
                    this.state.pagination.pageSize,
                    this.state.sort
                );
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: 
                        res &&
                        res.data &&
                        res.data.Message ?
                        res.data.Message : "Edit Report Error"
                });
            }
        });
    }
    
    onEdit = async values => {
        this.setState({ loadingUpdate: true});
        const reportId = this.state.dataRow.reportId;
        const data = {
            reportName: values.name,
            lastModifiedBy: this.state.userId
        }
        await this.editReport(data, reportId);
        this.setState({ loadingUpdate: false });
    }

    deleteReport = async (data, reportId) => {
        await FSMServices.deleteReport(data, reportId)
        .then(res => {
            if (
                res &&
                res.status &&
                res.data.Status ?
                res.data.Status === "OK" : false
            ) {
                notification.success({
                    placement: 'bottomRight',
                    message: 'Success',
                    description: 
                        res &&
                        res.data &&
                        res.data.Message ?
                        res.data.Message : "Delete Report Success",
                });
                this.getReportList(
                    this.state.search,
                    this.state.pagination.current - 1,
                    this.state.pagination.pageSize,
                    this.state.sort
                );
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description:
                        res &&
                        res.data &&
                        res.data.Message ?
                        res.data.Message : "Delete Report Error",
                });
            }
        });
    }

    onDelete = async record => {
        let loading = this.state.loadingDelete;
        const report = record.key;
        loading[report] = true;
        this.setState({ loadingDelete: loading });
        const data = {
          lastModifiedBy: this.state.userId
        }
        this.deleteReport(data, report)
        loading[report] = false;
        this.setState({ loadingDelete: loading });
    }

    render() {
        const {
            reportList,
            loading,
            pagination,
            visibleCreate,
            loadingCreate,
            loadingUpdate,
            dataRow,
            visibleUpdate
        } = this.state;

        const paginationCus = { ...pagination, showSizeChanger: false }

        const columns = [
            {
                width: 1,
                render: record => (
                    <Popconfirm 
                        title="Are you sure?" 
                        okText="Yes" 
                        cancelText="No"
                        onConfirm={() => this.onDelete(record)}
                    >
                        <Button
                            className="btn-delete"
                            type="danger"
                            icon={<CloseOutlined />}
                            size={'middle'}
                            loading={this.state.loadingDelete[record.key]}
                        />
                    </Popconfirm>
                )
            },
            {
                title: 'Report ID',
                dataIndex: 'reportId',
                key: 'report_id',
                sorter: true
            },
            {
                title: 'Name',
                dataIndex: 'reportName',
                key: 'report_name',
                sorter: true
            },
            {
                width: 300,
                render: record => (
                    <Button
                        className="btn-edit"
                        icon={<EditFilled />}
                        size={'middle'}
                        onClick={() => this.toggleModalUpdate(record)}
                    />
                )
            },
        ];
        return (
            <Content className="content">
                <Row
                    style={{
                        marginBottom: '15px'
                    }}
                >
                    <Col xs={24} sm={24} md={6} lg={6} xl={6} style={{ textAlign: "center" }}>
                        <Space size={20}>
                            <Title
                                level={2}
                                style={{
                                    display: 'inline-block',
                                    margin: '0'
                                }}
                            >
                                Report
                                </Title>
                            <Button
                                className="button-create"
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={this.toggleModalCreate}
                            >
                                CREATE
                                </Button>
                            <ModalCreateEdit
                                title="New Report"
                                visible={visibleCreate}
                                buttonCancel={this.toggleModalCreate}
                                onFinish={this.onCreate}
                                loading={loadingCreate}
                            />
                            <ModalCreateEdit
                                title="Update Report"
                                visible={visibleUpdate}
                                buttonCancel={this.toggleModalUpdate}
                                data={dataRow}
                                onFinish={this.onEdit}
                                loading={loadingUpdate}
                            />
                        </Space>
                    </Col>
                    <Col xs={24} sm={24} md={{ span: 8, offset: 10 }} lg={{ span: 7, offset: 11 }} xl={{ span: 7, offset: 11 }} style={{ textAlign: "right" }}>
                        <Input
                            className="input-search"
                            placeholder="Search.."
                            style={{
                                width: '250px',
                                maxWidth: '80%',
                                marginRight: '10px'
                            }}
                            prefix={<SearchOutlined />}
                            onChange={(e) => this.searchHandler(e)}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Card
                            bordered={false}
                            className="card-master-data"
                        >
                            <Table
                                columns={columns}
                                dataSource={reportList}
                                pagination={paginationCus}
                                loading={loading}
                                onChange={this.handleTableChange}
                                size="middle"
                            />                               
                        </Card>
                    </Col>
                </Row>
            </Content>
        );
    }
}

export default withRouter(MasterDataReport);