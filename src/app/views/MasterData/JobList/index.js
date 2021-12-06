import React from "react";
import { withRouter } from "react-router-dom";
import { Layout, Typography, Row, Col, Button, Input, Card, Space, notification, Table, Popconfirm } from "antd";
import { PlusOutlined, SearchOutlined, CloseOutlined, EditFilled } from '@ant-design/icons';
import Modal from './modal';
import { FSMServices } from "../../../service";
import _debounce from 'lodash.debounce';
import { GlobalFunction } from '../../../global/function';
import PermissionDenied from '../../../global/permissionDenied'
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title} = Typography;

class JobList extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"

        this.state = {
            visibleCreate: false,
            visibleUpdate: false,
            visibleDetail: false,
            loading: true,
            loadingDelete: [],
            dataRow: [],
            jobList: [],
            sort: "created_on,desc",
            search: "",
            pagination: {
                current: 1,
                pageSize: 10,
            },
            accessRight: ''
        }
    }

    componentDidMount() {
        this.setState({
            userIdAkun: this.props.userId
        })
        setTimeout(() => this.setState({accessRight: sessionStorage.getItem("accessRight")}),500);
    }

    componentWillMount() {
        this.getJobList(
            this.state.pagination.current - 1,
			this.state.pagination.pageSize,
            this.state.sort,
            this.state.search
        )
        this.optionCategory()
        this.optionUom()
    }

    handleModalCreate = e => {
        this.setState({ visibleCreate: !this.state.visibleCreate })
    }

    handleModalUpdate = (data) => {
        this.setState({
            dataRow: data,
            visibleUpdate: !this.state.visibleUpdate
        })
    }

    handleModalDetail = e => {
        this.setState({
            dataRow: e,
            visibleDetail: !this.state.visibleDetail,
            loadingDetail: true
        })
        this.setState({ loadingDetail: false });
    }

    optionCategory() {
        this.setState({ loadingCategory: true });
        FSMServices.getOptionListJobCategory()
        .then(res => {
            this.setState({
                optionCategory: res ? res.data.Data : [],
                loadingCategory: false
            })
        })
    }

    optionUom() {
        this.setState({ loadingUom: true });
        FSMServices.getUOMList('', '', '', '')
        .then(res => {
            this.setState({
                optionUom: res ? res.data.Data : [],
                loadingUom: false
            })
        })
    }

    // get list api
    async getJobList(page, size, sort, search) {
        this.setState({
            loading: true,
        })
        let listTemp = [];
        await FSMServices.getJobList(page, size, sort, search)
        .then(res => {
            listTemp = res && res.data && res.data.Data ? res.data.Data : [];
            this.setState({
                pagination: {
					...this.state.pagination,
					total: res && res.data && res.data.totalListJob ? res.data.totalListJob : 0
				}
            });
        });
        this.setState({
            jobList: listTemp.map(item => {
                return {
                    ...item,
                    key: item.jobId,
                    uomName: item.uomId ? item.uomId.uomName : "-",
                    jobCategoryName: item.jobCategoryId ? item.jobCategoryId.jobCategoryName : "-",
                    tenantDesc: item.tenantDesc ? item.tenantDesc : "-",
                }
            }),
            loading: false
        });
    }

    // search handler
    searchHandler(e) {
        let key = e.target.value;
        this.processSearchJobList(key);
    }

    processSearchJobList = _debounce((key) => {
        this.setState({
            search: GlobalFunction.searchEncode(key),
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.getJobList(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            )
        });
    }, 500)

    // Table Change
    handleTableChange = (pagination, search, sorter) => {
        if (sorter.order === "ascend") {
            sorter.order = "asc";
        } else if (sorter.order === "descend") {
            sorter.order = "desc";
        }

        this.setState({
            sort: `${sorter.order ? `${sorter.columnKey},${sorter.order}` : 'created_on,desc'}`,
            pagination: pagination
        }, () => {
            this.getJobList(
                this.state.pagination.current - 1,
				this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            );
        });
    };

    // Create
    async createJobList(data) {
        this.setState({
            loadingCreate: true
        });
        await FSMServices.createJobList(data).then(res => {
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
                    description: 'Create Job Success',
                });
                this.handleModalCreate();
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getJobList(
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
                            res.data.Message :'Create Job Error',
                })
            }
        });
        this.setState({
            loadingCreate: false
        });
    }

    onFinishCreate = values => {
        const data = {
            uomId: {
                uomId: values.uomId
            },
            jobCategoryId: {
                jobCategoryId: values.jobCategoryId
            },
            jobName: values.jobName,
            jobTag: values.jobTag,
            jobDesc: values.jobDesc,
            transportFee: 0,
            inclTransport: true,
            createdOn: Date.now(),
            createdBy: this.state.userIdAkun,
            lastModifiedOn: Date.now(),
            lastModifiedBy: this.state.userIdAkun,
            deleted: false
        }

        this.createJobList(data);
    }
    //End

    // Edit JobList
    editJobList = async (id, data) => {
        this.setState({
            loadingUpdate: true
        });
        await FSMServices.editJobList(id, data).then(res => {
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
                    description: 'Edit Job Success',
                });
                this.setState({
                    visibleUpdate: !this.state.visibleUpdate,
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getJobList(
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
                            res.data.Message :'Edit Job Error',
                })
            }
        });
        this.setState({
            loadingUpdate: false
        });
    }

    onFinishEdit = values => {
        const data = {
            jobId: values.jobId,
            uomId: {
                uomId: values.uomId
            },
            jobCategoryId: {
                jobCategoryId: values.jobCategoryId
            },
            jobName: values.jobName,
            jobTag: values.jobTag,
            jobDesc: values.jobDesc,
            transportFee: 0,
            inclTransport: true,
            lastModifiedOn: Date.now(),
            lastModifiedBy: this.state.userIdAkun,
            deleted: false
        }

        this.editJobList(this.state.dataRow.jobId, data);
    }
    //End

    //Delete
    deleteJobList(jobId) {
        let loading = this.state.loadingDelete;
        loading[jobId] = true;
        let body =
        {
            "lastModifiedBy": Cookies.get('userId')
        }
        this.setState({
            loadingDelete: loading
        });
        FSMServices.deleteJobList(jobId, body).then( res => {
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
                    description: 'Delete Job Success',
                });
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getJobList(
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
                            res.data.Message :'Delete Job Error',
                });
            }
        })
        loading[jobId] = false;
        this.setState({
            loadingDelete: loading
        });
    }
    //End

    render() {
        const { loading, loadingCreate, loadingUpdate, loadingDelete, loadingDetail, jobList, pagination, dataRow, accessRight } = this.state

        const paginationCus = { ...pagination, showSizeChanger: false }

        const columns = [
            {
                width: 1,
                render: record => (
                    <Popconfirm
                        title="Are you sure?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => this.deleteJobList(record.key)}
                    >
                      { (accessRight.includes('Delete')) ?
                        <Button
                            className="btn-delete"
                            type="danger"
                            icon={<CloseOutlined />}
                            size={'middle'}
                            loading={loadingDelete[record.key]}
                        />
                        :<></>
                      }
                    </Popconfirm>
                )
            },
            {
                title: 'ID',
                dataIndex: 'jobId',
                key: 'job_id',
                sorter: true,
            },
            {
                title: 'Name',
                dataIndex: 'jobName',
                key: 'job_name',
                sorter: true,
            },
            {
                title: 'Category',
                dataIndex: 'jobCategoryName',
                key: 'jc.job_category_name',
                sorter: true,
            },
            {
                title: 'UOM Name',
                dataIndex: 'uomName',
                key: 'u.uom_name',
                sorter: true,
            },
            {
                title: 'Tag',
                dataIndex: 'jobTag',
                key: 'job_tag',
                sorter: true,
            },
            {
                title: 'Tenant',
                dataIndex: 'tenantDesc',
                key: 'tenantDesc',
                sorter: false
            },
            {
                width: 1,
                render: (record) => {
                    return (
                        <Button type="primary" size="small" onClick= {() => this.handleModalDetail(record)}>
                            Detail
                        </Button>
                    )
                }
            },
            {
                width: 1,
                onCell: (record) => {
                    return { onClick: () =>
                        this.handleModalUpdate(record)
                    }
                },
                render: () => {
                    return (
                      <div>
                        { (accessRight.includes('Update')) ?
                          <Button
                              className="btn-edit"
                              icon={<EditFilled />}
                              size={'middle'}
                          />
                          :<></>
                        }
                      </div>
                    )
                }
            },
        ];
        return (
            <Content className="content">
              { (accessRight.includes('Read')) || accessRight == "" ?
                <div>
                  <Row
                      style={{
                          marginBottom: '15px'
                      }}
                  >
                      <Col md={12}>
                          <Space size={20}>
                              <Title
                                  level={2}
                                  style={{
                                      display: 'inline-block',
                                      margin: '0'
                                  }}
                              >
                                  Job List
                              </Title>
                              { (accessRight.includes('Create')) ?
                                <Button
                                    className="button-create"
                                    icon={<PlusOutlined />}
                                    type="primary"
                                    onClick={this.handleModalCreate}
                                >
                                    CREATE
                                </Button>
                                :<></>
                              }
                              <Modal
                                  title="New Job"
                                  visible={this.state.visibleCreate}
                                  optionCategory={this.state.optionCategory}
                                  optionUom={this.state.optionUom}
                                  buttonCancel={this.handleModalCreate}
                                  onFinish={values => this.onFinishCreate(values)}
                                  loading={loadingCreate}
                              />
                              <Modal
                                  title="Update Job"
                                  visible={this.state.visibleUpdate}
                                  buttonCancel={this.handleModalUpdate}
                                  optionCategory={this.state.optionCategory}
                                  optionUom={this.state.optionUom}
                                  dataRow={dataRow}
                                  onFinish={values => this.onFinishEdit(values)}
                                  loading={loadingUpdate}
                              />
                              <Modal
                                  title="Detail Job"
                                  visible={this.state.visibleDetail}
                                  optionCategory={this.state.optionCategory}
                                  optionUom={this.state.optionUom}
                                  dataRow={dataRow}
                                  buttonCancel={this.handleModalDetail}
                                  loading={loadingDetail}
                              />
                          </Space>
                      </Col>
                      <Col md={12} style={{ textAlign: 'right' }}>
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
                  <Row style={{marginBottom: 10}}>
                      <Col span={24}>
                          <Card
                              bordered={false}
                              className="card-master-data"
                          >
                              <Table
                                  columns={columns}
                                  dataSource={jobList}
                                  loading={loading}
                                  pagination={paginationCus}
                                  onChange={this.handleTableChange}
                                  size="middle"
                              />
                          </Card>
                      </Col>
                  </Row>
                </div>
                :
                <PermissionDenied />
              }
            </Content>
        );
    }
}

export default withRouter(JobList);
