import React from "react";
import { withRouter } from 'react-router-dom';
import { Layout, Typography, Row, Col, Button, Input, Card, Space, notification, Table, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, CloseOutlined, EditFilled } from '@ant-design/icons';
import Modal from './modal';
import { FSMServices } from '../../../service';
import _debounce from 'lodash.debounce';
import { GlobalFunction } from "../../../global/function";
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;

class Diagnosis extends React.Component {

    constructor(props) {
        super(props);
        document.title = `${this.props.name} | FSM`
        this.state = {
            visibleCreate: false,
            visibleUpdate: false,
            datarow: null,
            loading: true,
            loadingDelete: [],
            diagnosisList: [],
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
        this.getDiagnosisList(
            this.state.pagination.current - 1,
            this.state.pagination.pageSize,
            this.state.sort,
            this.state.search
        )
        this.optionCategory();
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
            this.getDiagnosisList(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            );
        });

    };

    optionCategory() {
        FSMServices.getOptionListJobCategory()
        .then(res => {
            this.setState({
                optionCategory: res ? res.data.Data : [],
            })
        })
    }

    async getDiagnosisList(page, size, sort, search) {
        this.setState({ loading: true })
        let listTemp = []
        await FSMServices.getDiagnosisList(page, size, sort, search)
        .then(res => {
            listTemp = res && res.data && res.data.Data ? res.data.Data : [];
            this.setState({
                pagination: {
					...this.state.pagination,
					total: res && res.data && res.data.totalListDiagnosis ? res.data.totalListDiagnosis : 0
				}
            });
        })
        this.setState({
            diagnosisList: listTemp.map(item => {
                return {
                    ...item,
                    key: item.diagnosisId,
                    jobClassName: item.jobCategoryId.jobClassId ? item.jobCategoryId.jobClassId.jobClassName : "-",
                    jobCategoryName: item.jobCategoryId ? item.jobCategoryId.jobCategoryName : "-"
                }
            }),
            loading: false
        })
    }

    searchHandler = (e) => {
        if (e !== null) {
            let key = e.target.value;
            this.processSearchDiagnosis(key)
        } else {
            this.getDiagnosisList(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            )
        }

    }

    processSearchDiagnosis = _debounce((key) => {
        this.setState({
            search: GlobalFunction.searchEncode(key),
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.getDiagnosisList(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            )
        });
    }, 500)

    createDiagnosisList = values => {
        const data = {
            jobCategoryId: {
                jobCategoryId: values.jobCategoryId
            },
            diagnosisDesc: values.diagnosisDesc,
            createdBy: this.state.userIdAkun,
            createdOn: Date.now(),
            lastModifiedBy: this.state.userIdAkun,
            lastModifiedOn: Date.now(),
            deleted: false
        }

        FSMServices.createDiagnosisList(data).then(res => {
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
                    description: 'Create Diagnosis Success'
                });
                this.handleModalCreate();
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getDiagnosisList(
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
                            res.data.Message  :'Create Diagnosis Failed'
                })
            }
        });
    }

    editDiagnosisList = values => {
        const data = {
            diagnosisId: values.diagnosisId,
            jobCategoryId: {
                jobCategoryId: values.jobCategoryId
            },
            diagnosisDesc: values.diagnosisDesc,
            lastModifiedBy: this.state.userIdAkun,
            lastModifiedOn: Date.now(),
            deleted: false
        }

        FSMServices.editDiagnosisList(values.diagnosisId, data).then(res => {
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
                    description: 'Edit Diagnosis Success'
                })
                this.handleModalUpdate();
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getDiagnosisList(
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
                            res.data.Message :'Edit Diagnosis Failed'
                })
            }
        })
    }

    deleteDiagnosisList = id => {
        let loading = this.state.loadingDelete;
        loading[id] = true;
        let body =
        {
            "lastModifiedBy": Cookies.get('userId')
        }
        this.setState({
            loadingDelete: loading
        });
        FSMServices.deleteDiagnosisList(id, body).then(res => {
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
                    description: 'Delete Diagnosis Success'
                })
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getDiagnosisList(
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
                            res.data.Message :'Delete Diagnosis Error',
                })
            }
        })
        loading[id] = false;
        this.setState({
            loadingDelete: loading
        });
    }

    render() {
        const { loading, loadingDelete, diagnosisList, pagination } = this.state

        const paginationCus = { ...pagination, showSizeChanger: false }

        const columns = [
            {
                width: 1,
                render: record => (
                    <Popconfirm
                        title="Are you sure?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => this.deleteDiagnosisList(record.diagnosisId)}
                    >
                        <Button
                            className="btn-delete"
                            type="danger"
                            icon={<CloseOutlined />}
                            size={'middle'}
                            loading={loadingDelete[record.diagnosisId]}
                        />
                    </Popconfirm>
                )
            },
            {
                title: 'ID',
                dataIndex: 'diagnosisId',
                key: 'diagnosis_id',
                sorter: true,
            },
            {
                title: 'Diagnosis',
                dataIndex: 'diagnosisDesc',
                key: 'diagnosis_desc',
                sorter: true,
            },
            {
                title: 'Class',
                dataIndex: 'jobClassName',
                key: 'jcl.job_class_name',
                sorter: true,
            },
            {
                title: 'Category',
                dataIndex: 'jobCategoryName',
                key: 'jc.job_category_name',
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
                                Diagnosis
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
                                title="Update Diagnosis"
                                visible={this.state.visibleUpdate}
                                buttonCancel={this.handleModalUpdate}
                                datarow={this.state.datarow}
                                onFinish={values => this.editDiagnosisList(values)}
                                optionCategory={this.state.optionCategory}
                            />
                            <Modal
                                title="New Diagnosis"
                                visible={this.state.visibleCreate}
                                buttonCancel={this.handleModalCreate}
                                onFinish={values => this.createDiagnosisList(values)}
                                optionCategory={this.state.optionCategory}
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
                                dataSource={diagnosisList}
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

export default withRouter(Diagnosis);
