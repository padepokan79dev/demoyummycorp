import React from 'react';
import { withRouter } from 'react-router-dom';
import { Layout, Typography, Row, Col, Button, Input, Card, Space, notification, Table, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, CloseOutlined, EditFilled } from '@ant-design/icons';
import Modal from './modal';
import { FSMServices } from '../../../service';
import _debounce from 'lodash.debounce';
import { GlobalFunction } from '../../../global/function';
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;

class Action extends React.Component {

    constructor(props) {
        super(props);
        document.title = `${this.props.name} | FSM`
        this.state = {
            visibleCreate: false,
            visibleUpdate: false,
            datarow: null,
            loading: true,
            loadingDelete: [],
            actionList: [],
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
        this.getActionList(
            this.state.pagination.current - 1,
            this.state.pagination.pageSize,
            this.state.sort,
            this.state.search
        )
        this.optionFailure()
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
            this.getActionList(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            );
        });

    };

    optionFailure() {
        FSMServices.getFailureList('', '', '', '')
        .then(res => {
            this.setState({
                optionFailure: res ? res.data.Data : []
            })
        })
    }

    async getActionList(page, size, sort, search) {
        this.setState({ loading: true })
        let listTemp = []
        await FSMServices.getActionList(page, size, sort, search)
        .then(res => {
            listTemp = res && res.data && res.data.Data ? res.data.Data : [];
            this.setState({
                pagination: {
					...this.state.pagination,
					total: res && res.data && res.data.totalListAction ? res.data.totalListAction : 0
				}
            });
        })
        this.setState({
            actionList: listTemp.map(item => {
                return {
                    ...item,
                    key: item.actionId,
                    failureDesc : item.failureId ? item.failureId.failureDesc : "-"
                }
            }),
            loading: false
        })
    }

    searchHandler = (e) => {
        if (e !== null) {
            let key = e.target.value;
            this.processSearchAction(key)
        } else {
            this.getActionList(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            )
        }
    }

    processSearchAction = _debounce((key) => {
        this.setState({
            search: GlobalFunction.searchEncode(key),
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.getActionList(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            )
        });
    }, 500)

    createActionList = values => {
        const data = {
            failureId: {
                failureId: values.failureId
            },
            actionDesc: values.actionDesc,
            createdBy: this.state.userIdAkun,
            createdOn: Date.now(),
            lastModifiedBy: this.state.userIdAkun,
            lastModifiedOn: Date.now()
        }

        this.setState({
            loadingCreate: true
        });
        FSMServices.createActionList(data).then(res => {
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
                    description: 'Create Action Success'
                });
                this.handleModalCreate();
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getActionList(
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
                            res.data.Message :'Create Action Failed'
                })
            }
        });
        this.setState({
            loadingCreate: false
        });
    }

    editActionList = values => {
        const data = {
            actionId: values.actionId,
            failureId: {
                failureId: values.failureId
            },
            actionDesc: values.actionDesc,
            lastModifiedBy: this.state.userIdAkun,
            lastModifiedOn: Date.now(),
        }

        this.setState({
            loadingUpdate: true
        });
        FSMServices.editActionList(values.actionId, data).then(res => {
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
                    description: 'Edit Action Success'
                })
                this.handleModalUpdate();
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getActionList(
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
                            res.data.Message :'Edit Action Failed'
                })
            }
        })
        this.setState({
            loadingUpdate: false
        });
    }

    deleteActionList = id => {
        let loading = this.state.loadingDelete;
        loading[id] = true;
        let body =
        {
            "lastModifiedBy": Cookies.get('userId')
        }
        this.setState({
            loadingDelete: loading
        });
        FSMServices.deleteActionList(id, body).then(res => {
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
                    description: 'Delete Action Success'
                })
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getActionList(
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
                            res.data.Message :'Delete Action Error',
                })
            }
        })
        loading[id] = false;
        this.setState({
            loadingDelete: loading
        });
    }

    render() {
        const { loading, loadingDelete, actionList, pagination } = this.state

        const paginationCus = { ...pagination, showSizeChanger: false }

        const columns = [
            {
                width: 1,
                render: record => (
                    <Popconfirm
                        title="Are you sure?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => this.deleteActionList(record.actionId)}
                    >
                        <Button
                            className="btn-delete"
                            type="danger"
                            icon={<CloseOutlined />}
                            size={'middle'}
                            loading={loadingDelete[record.actionId]}
                        />
                    </Popconfirm>
                )
            },
            {
                title: 'ID',
                dataIndex: 'actionId',
                key: 'action_id',
                sorter: true,
            },
            {
                title: 'Action',
                dataIndex: 'actionDesc',
                key: 'action_desc',
                sorter: true,
            },
            {
                title: 'Failure',
                dataIndex: 'failureDesc',
                key: 'f.failure_desc',
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
                                Action
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
                                title="Update Action"
                                visible={this.state.visibleUpdate}
                                buttonCancel={this.handleModalUpdate}
                                datarow={this.state.datarow}
                                onFinish={values => this.editActionList(values)}
                                optionFailure={this.state.optionFailure}
                            />
                            <Modal
                                title="New Action"
                                visible={this.state.visibleCreate}
                                buttonCancel={this.handleModalCreate}
                                onFinish={values => this.createActionList(values)}
                                optionFailure={this.state.optionFailure}
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
                                dataSource={actionList}
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

export default withRouter(Action);
