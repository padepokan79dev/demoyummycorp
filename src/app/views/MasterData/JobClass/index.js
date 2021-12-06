import React from "react";
import { withRouter } from "react-router-dom";
import { Layout, Typography, Row, Col, Button, Input, Card, Space, notification, Table, Popconfirm } from "antd";
import { PlusOutlined, SearchOutlined, CloseOutlined, EditFilled } from '@ant-design/icons';
import Modal from './modal';
import { FSMServices } from "../../../service";
import _debounce from 'lodash.debounce';
import { GlobalFunction } from "../../../global/function";
import PermissionDenied from '../../../global/permissionDenied'
import Cookie from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;

class JobClass extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"
        this.state = {
            visibleCreate: false,
            visibleUpdate: false,
            dataRow: [],
            loading: true,
            loadingDelete: [],
            jobClass: [],
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
        this.getJobClass(
            this.state.pagination.current - 1,
			this.state.pagination.pageSize,
            this.state.sort,
            this.state.search
        )
    }

    handleModalCreate = e => {
        this.setState({ visibleCreate: !this.state.visibleCreate })
    }

    handleModalUpdate = e => {
        this.setState({
            dataRow: e,
            visibleUpdate: !this.state.visibleUpdate
        })
    }

    // get list api
    async getJobClass(page, size, sort, search) {
        this.setState({
            loading: true,
        })
        let listTemp = [];
        await FSMServices.getJobClass(page, size, sort, search)
        .then(res => {
            listTemp = res && res.data && res.data.Data ? res.data.Data : [];
            this.setState({
                pagination: {
					...this.state.pagination,
					total: res && res.data && res.data.totalListJobClass ? res.data.totalListJobClass : 0
				}
            });
        });
        this.setState({
            jobClass: listTemp.map(item => {
                return {
                    ...item,
                    key: item.jobClassId
                }
            }),
            loading: false
        });
    }

    // search handler
    searchHandler(e) {
        let key = e.target.value;
        this.processSearchJobClass(key);
    }

    processSearchJobClass = _debounce((key) => {
        this.setState({
            search: GlobalFunction.searchEncode(key),
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.getJobClass(
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
            this.getJobClass(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            )
        });
    };

    // Create
    async createJobClass(data) {
        this.setState({
          loadingCreate: true
        });
        await FSMServices.createJobClass(data).then(res => {
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
              description: 'Create Job Class Success',
            });
            this.handleModalCreate();
            this.setState({
                pagination:{
                    ...this.state.pagination,
                    current: 1
                }
            });
            this.getJobClass(
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
                    res.data.Message :'Create Job Class Error',
            });
          }
        });
        this.setState({
          loadingCreate: false
        });
      }

    onFinishCreate = values => {
        const data = {
            jobClassName: values.jobClassName,
            createdOn: Date.now(),
            createdBy: this.state.userIdAkun,
            lastModifiedOn: Date.now(),
            lastModifiedBy: this.state.userIdAkun,
            deleted: false
        }

        this.createJobClass(data);
    }

    // Edit
    editJobClass = (id, data) => {
        this.setState({
            loadingUpdate: true
        });
        FSMServices.editJobClass(id, data).then(res => {
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
                    description: 'Edit Job Class Success',
                });
                this.handleModalUpdate();
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getJobClass(
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
                            res.data.Message :'Edit Job Class Error',
                })
            }
        });
        this.setState({
            loadingUpdate: false
        });
    }

    onFinishEdit = values => {
        const data = {
            jobClassId: this.state.dataRow.jobClassId,
            jobClassName: values.jobClassName,
            lastModifiedOn: Date.now(),
            lastModifiedBy: this.state.userIdAkun,
            deleted: false
        }
        this.editJobClass(this.state.dataRow.jobClassId, data);
    }
    //End

    //Delete

    deleteJobClass(jobClassId) {
        let loading = this.state.loadingDelete;
        loading[jobClassId] = true;
        let body =
        {
            "lastModifiedBy": Cookie.get('userId')
        }
        this.setState({
            loadingDelete: loading
        });
        FSMServices.deleteJobClass(jobClassId, body).then( res => {
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
                    description: 'Delete Job Class Success',
                });
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getJobClass(
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
                            res.data.Message :'Delete Job Class Error',
                });
            }
        })
        loading[jobClassId] = false;
        this.setState({
            loadingDelete: loading
        });
    }

    //End

    render() {
        const { loading, loadingCreate, loadingUpdate, loadingDelete, jobClass, dataRow, pagination, accessRight } = this.state

        const paginationCus = { ...pagination, showSizeChanger: false }

        const columns = [
            {
                width: 1,
                render: record => (
                    <Popconfirm
                        title="Are you sure?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => this.deleteJobClass(record.key)}
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
                dataIndex: 'jobClassId',
                key: 'job_class_id',
                sorter: true
            },
            {
                title: 'Name',
                dataIndex: 'jobClassName',
                key: 'job_class_name',
                sorter: true
            },
            {
                title: 'Tenant',
                dataIndex: 'tenantDesc',
                key: 'tenantDesc',
                sorter: false
            },
            {
                width: 1,
                onCell: (record) => {
                    return { onClick: () => this.handleModalUpdate(record) }
                },
                render: () => (
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
                                  Job Class
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
                                  title="New Job Class"
                                  visible={this.state.visibleCreate}
                                  buttonCancel={this.handleModalCreate}
                                  onFinish={values => this.onFinishCreate(values)}
                                  loading={loadingCreate}
                              />
                              <Modal
                                  title="Update Job Class"
                                  visible={this.state.visibleUpdate}
                                  buttonCancel={this.handleModalUpdate}
                                  dataEdit={dataRow}
                                  onFinish={values => this.onFinishEdit(values)}
                                  loading={loadingUpdate}
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
                                  dataSource={jobClass}
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

export default withRouter(JobClass);
