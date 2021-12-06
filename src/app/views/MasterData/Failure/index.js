import React from 'react';
import { withRouter } from 'react-router-dom';
import { Layout, Typography, Row, Col, Button, Input, Card, Space, notification, Popconfirm, Table } from 'antd';
import { PlusOutlined, SearchOutlined, CloseOutlined, EditFilled } from '@ant-design/icons';
import Modal from './modal';
import { FSMServices } from '../../../service';
import _debounce from 'lodash.debounce';
import { GlobalFunction } from '../../../global/function';
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;

class Failure extends React.Component {

    constructor(props) {
        super(props);
        document.title = `${this.props.name} | FSM`
        this.state = {
            visibleCreate: false,
            visibleUpdate: false,
            datarow: [],
            loading: true,
            loadingDelete: [],
            failureList: [],
            sort: 'created_on,desc',
            search: '',
            pagination: {
                current: 1,
                pageSize: 10,
            }
        }
    }

    componentDidMount() {
        this.setState({
            userIdAkun: this.props.userId
        })
    }

    componentWillMount() {
        this.getFailureList(
            this.state.pagination.current - 1,
            this.state.pagination.pageSize,
            this.state.sort,
            this.state.search
        )
        this.optionDiagnosis();
    }

    handleModalCreate = e => {
        this.setState({ visibleCreate: !this.state.visibleCreate })
    }

    handleModalUpdate = e => {
        this.setState({
            datarow: e,
            visibleUpdate: !this.state.visibleUpdate
        })
    }

    handleTableChange = (pagination, search, sorter) => {
        if ( sorter.order === "ascend" ) {
            sorter.order = !this.state.isSearching ? "asc" : null;
        } else if (sorter.order === "descend" ) {
            sorter.order = "desc";
        }

        this.setState({
            sort: `${sorter.order ? `${sorter.columnKey},${sorter.order}` : 'created_on,desc'}`,
            pagination: pagination
        }, () => {
            this.getFailureList(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            );
        });

    };

    optionDiagnosis() {
        FSMServices.getDiagnosisList('', '', '', '')
        .then(res => {
            this.setState({
                optionDiagnosis: res ? res.data.Data : []
            })
        })
    }

    async getFailureList(page, size, sort, search) {
        this.setState({ loading: true })
        let listTemp = []
        await FSMServices.getFailureList(page, size, sort, search)
        .then(res => {
            listTemp = res && res.data && res.data.Data ? res.data.Data : [];
            this.setState({
                pagination: {
					...this.state.pagination,
					total: res && res.data && res.data.totalListFailure ? res.data.totalListFailure : 0
				}
            });
        })
        this.setState({
            failureList: listTemp.map(item => {
                return {
                    ...item,
                    key: item.failureId,
                    diagnosisDesc: item.diagnosisId ? item.diagnosisId.diagnosisDesc : "-"
                }
            }),
            loading: false
        })
    }

    searchHandler = (e) => {
        if (e !== null) {
            let key = e.target.value;
            this.processSearchFailure(key)
        } else {
            this.getFailureList(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            )
        }

    }

    processSearchFailure = _debounce((key) => {
        this.setState({
            search: GlobalFunction.searchEncode(key),
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.getFailureList(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            )
        });
    }, 500)

    createFailureList = values => {
        const data = {
            diagnosisId: {
                diagnosisId: values.diagnosisId
            },
            failureDesc: values.failureDesc,
            createdBy: this.state.userIdAkun,
            createdOn: Date.now(),
            lastModifiedBy: this.state.userIdAkun,
            lastModifiedOn: Date.now()
        }

        FSMServices.createFailureList(data).then(res => {
            if (
                res &&
                res.status &&
                res.data.Status ?
                    res.status === 200 &&
                    res.data.Status === "OK" : false
            ) {
                notification.success({
                    placement: 'bottomRight',
                    message: 'Success',
                    description: 'Create Failure Success'
                });
                this.handleModalCreate();
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getFailureList(
                    this.state.pagination.current - 1,
                    this.state.pagination.pageSize,
                    this.state.sort,
                    this.state.search
                )
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description:
                        res &&
                        res.data &&
                        res.data.Message ?
                            res.data.Message :'Create Failure Failed'
                })
            }
        });
    }

    editFailureList = values => {
        const data = {
            failureId: values.failureId,
            diagnosisId: {
                diagnosisId: values.diagnosisId
            },
            failureDesc: values.failureDesc,
            lastModifiedBy: this.state.userIdAkun,
            lastModifiedOn: Date.now(),
        }

        FSMServices.editFailureList(values.failureId, data).then(res => {
            if (
                res &&
                res.status &&
                res.data.Status ?
                    res.status === 200 &&
                    res.data.Status === "OK" : false
            ) {
                notification.success({
                    placement: 'bottomRight',
                    message: 'Success',
                    description: 'Edit Failure Success'
                })
                this.handleModalUpdate();
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getFailureList(
                    this.state.pagination.current - 1,
                    this.state.pagination.pageSize,
                    this.state.sort,
                    this.state.search
                )
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description:
                        res &&
                        res.data &&
                        res.data.Message ?
                            res.data.Message :'Edit Failure Failed'
                })
            }
        })
    }

    deleteFailureList = id => {
        let loading = this.state.loadingDelete
        loading[id] = true
        let body =
        {
            "lastModifiedBy": Cookies.get('userId')
        }
        this.setState({ loadingDelete: loading })
        FSMServices.deleteFailureList(id, body).then(res => {
            if (
                res &&
                res.status &&
                res.data.Status ?
                    res.status === 200 &&
                    res.data.Status === "OK" : false
            ) {
                notification.success({
                    placement: 'bottomRight',
                    message: 'Success',
                    description: 'Delete Failure Success'
                })
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getFailureList(
                    this.state.pagination.current - 1,
                    this.state.pagination.pageSize,
                    this.state.sort,
                    this.state.search
                )
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description:
                        res &&
                        res.data &&
                        res.data.Message ?
                            res.data.Message :'Delete Failure Error',
                })
            }
        })
        loading[id] = false
        this.setState({ loadingDelete: loading })
    }

    render() {
        const { loading, failureList, pagination } = this.state

        const paginationCus = { ...pagination, showSizeChanger: false }

        const columns = [
            {
                width: 1,
                render: (record) => (
                    <Popconfirm
                        title="Are you sure?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={ () => this.deleteFailureList(record.failureId) }
                    >
                        <Button
                            className="btn-delete"
                            type="danger"
                            icon={<CloseOutlined />}
                            size={'middle'}
                            loading={this.state.loadingDelete[record.failureId]}
                        />
                    </Popconfirm>

                )
            },
            {
                title: 'ID',
                dataIndex: 'failureId',
                key: 'failure_id',
                sorter: true,
            },
            {
                title: 'Failure',
                dataIndex: 'failureDesc',
                key: 'failure_desc',
                sorter: true,
            },
            {
                title: 'Diagnosis',
                dataIndex: 'diagnosisDesc',
                key: 'd.diagnosis_desc',
                sorter: true,
            },
            {
                width: 1,
                onCell: (record) => {
                    return { onClick: () => this.handleModalUpdate(record) }
                },
                render: () => (
                    <Button className="btn-edit" icon={<EditFilled />} size={'middle'} />
                )
            }
        ]

        return (
            <Content className="content">
                <Row style={{ marginBottom: '15px' }}>
                    <Col md={12}>
                        <Space size={20}>
                            <Title
                                level={2}
                                style={{
                                    display: 'inline-block',
                                    margin: '0'
                                }}
                            >
                                Failure
                            </Title>
                            <Button
                                className="button-create"
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={this.handleModalCreate}
                            >
                                CREATE
                            </Button>
                            <Modal
                                title="Update Failure"
                                visible={this.state.visibleUpdate}
                                buttonCancel={this.handleModalUpdate}
                                datarow={this.state.datarow}
                                onFinish={values => this.editFailureList(values)}
                                optionDiagnosis={this.state.optionDiagnosis}
                            />
                            <Modal
                                title="New Failure"
                                visible={this.state.visibleCreate}
                                buttonCancel={this.handleModalCreate}
                                onFinish={values => this.createFailureList(values)}
                                optionDiagnosis={this.state.optionDiagnosis}
                            />
                        </Space>
                    </Col>
                    <Col md={12} style={{ textAlign: 'right' }}>
                        <Input
                            className="input-search"
                            placeholder="Search..."
                            onChange={ e => this.searchHandler(e) }
                            style={{
                                width: '250px',
                                maxWidth: '80%',
                                marginRight: '10px'
                            }}
                            prefix={<SearchOutlined />}
                        />
                    </Col>
                </Row>
                <Row style={{marginBottom: 10}}>
                    <Col span={24}>
                        <Card
                            bordered={false}
                            className="card-master-data"
                        >
                            <Table
                                onChange={this.handleTableChange}
                                columns={columns}
                                dataSource={failureList}
                                loading={loading}
                                pagination={paginationCus}
                                size="middle"
                            />
                        </Card>
                    </Col>
                </Row>
            </Content>
        )
    }

}

export default withRouter(Failure);
