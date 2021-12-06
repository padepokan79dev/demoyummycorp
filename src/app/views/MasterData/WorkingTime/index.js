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
import { FSMServices } from '../../../service';
import _debounce from 'lodash.debounce';
import { GlobalFunction } from "../../../global/function";
import PermissionDenied from '../../../global/permissionDenied'
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;

class MasterDataWorkingTime extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"

        this.state = {
            orderBy: 'createdOn desc',
            sort: "created_on,desc",
            filterBy: '',
            search: "",
            pagination: {
                current: 1,
                pageSize: 10,
            },
            loadingDelete: [],
            accessRight: ''
        }
    }

    componentDidMount() {
        this.getWorkingTime(
            this.state.search,
            this.state.pagination.current - 1,
            this.state.pagination.pageSize,
            this.state.sort
        );
        this.setState({
          userId: this.props.userId
        });
        setTimeout(() => this.setState({accessRight: sessionStorage.getItem("accessRight")}),500);
    }

    toggleModalCreate = () => {
        this.setState({
            visibleCreate: !this.state.visibleCreate,
        });
    }

    toggleModalUpdate = record => {
        this.setState({
            visibleUpdate: !this.state.visibleUpdate,
            dataRow: record
        });
    }

    async getWorkingTime(search, page, size, sort) {
        this.setState({
            loading: true
        });
        let listTemp = [];
        await FSMServices.getWorkingTime(search, page, size, sort)
        .then( res => {
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
            workingTimeList: listTemp.map(item => {
                return {
                    ...item,
                    key: item.wtimeId
                }
            }),
            loading: false
        });
    }

    searchHandler = (e) => {
        let key = e.target.value;
        this.processSearchWorkingTime(key);
    }

    processSearchWorkingTime = _debounce(key => {
        this.setState({
            search: GlobalFunction.searchEncode(key),
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.getWorkingTime(
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
            this.getWorkingTime(
                this.state.search,
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort
            );
        });
    };

    createWorkingTime = async (data) => {
        await FSMServices.createWorkingTime(data)
        .then(res => {
            if (
                res &&
                res.data &&
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
                        res.data.Message : "Create Working Time Success",
                });
                this.setState({ visibleCreate: false });
                this.getWorkingTime(
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
                        res.data.Message : "Create Working Time Error",
                });
            }
        });
    }

    onCreate = async values => {
        this.setState({ loadingCreate: true });
        const data = {
            wtimeName: values.name,
            wtimeStart: this.state.startTime,
            wtimeEnd: this.state.endTime,
            wtimeDesc: values.description,
            createdBy: this.state.userId,
            lastModifiedBy: this.state.userId
        }
        await this.createWorkingTime(data);
        this.setState({ loadingCreate: false });
    }

    editWorkingTime = async (data, wTimeId) => {
        await FSMServices.editWorkingTime(data, wTimeId)
        .then( res => {
            if (
                res &&
                res.data &&
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
                        res.data.Message : "Edit Working Time Success",
                });
                this.setState({
                    visibleUpdate: false,
                    dataRow: null
                });
                this.getWorkingTime(
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
                        res.data.Message : "Edit Working Time Error"
                });
            }
        });
    }

    onEdit = async values =>{
        this.setState({ loadingUpdate: true });
        const wTimeId = this.state.dataRow.wtimeId;
        const startTime = this.state.dataRow.wtimeStart;
        const endTime = this.state.dataRow.wtimeEnd;
        const data = {
            wtimeName: values.name,
            wtimeStart: this.state.startTime ? this.state.startTime : startTime,
            wtimeEnd: this.state.endTime ? this.state.endTime : endTime,
            wtimeDesc: values.description,
            lastModifiedBy: this.state.userId
        };
        await this.editWorkingTime( data, wTimeId );
        this.setState({ loadingUpdate: false });
    }

    deleteWorkingTime = async (data, wtimeId) => {
        await FSMServices.deleteWorkingTime(data, wtimeId)
        .then(res => {
            if (
                res &&
                res.data &&
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
                        res.data.Message : "Delete Working Time Success"
                });
                this.getWorkingTime(
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
                        res.data.Message : "Delete Working Time Error"
                });
            }
        });
    }

    onDelete = async record => {
        let loading =  this.state.loadingDelete;
        const wtimeId = record.key;
        loading[wtimeId] = true;
        this.setState({ loadingDelete: loading });
        const data = {
            userId: this.state.userId
        }
        this.deleteWorkingTime(data, wtimeId)
        loading[wtimeId] = false;
        this.setState({ loadingDelete: loading });
    }

    handleStartTime = values => {
        this.setState({
            startTime: values + ":00"
        });
    }

    handleEndTime = values => {
        this.setState({
            endTime: values + ":00"
        });
    }

    render() {
        const {
            loading,
            workingTimeList,
            pagination,
            loadingCreate,
            loadingUpdate,
            loadingDelete,
            accessRight
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
                dataIndex: 'wtimeId',
                key: 'wtime_id',
                sorter: true
            },
            {
                title: 'Name',
                dataIndex: 'wtimeName',
                key: 'wtime_name',
                sorter: true
            },
            {
                title: 'Description',
                dataIndex: 'wtimeDesc',
                key: 'wtime_desc',
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
                render: record => (
                  <div>
                    { (accessRight.includes('Update')) ?
                      <Button
                          className="btn-edit"
                          icon={<EditFilled />}
                          size={'middle'}
                          onClick={() => this.toggleModalUpdate(record)}
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
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                          <Space size={20}>
                              <Title
                                  level={2}
                                  style={{
                                      display: 'inline-block',
                                      margin: '0'
                                  }}
                              >
                                  Working Time
                              </Title>
                              { (accessRight.includes('Create')) ?
                                <Button
                                    className="button-create"
                                    icon={<PlusOutlined />}
                                    type="primary"
                                    onClick={this.toggleModalCreate}
                                >
                                    CREATE
                                </Button>
                                :<></>
                              }
                              <ModalCreateEdit
                                  title="New Working Time"
                                  visible={this.state.visibleCreate}
                                  buttonCancel={this.toggleModalCreate}
                                  onFinish={this.onCreate}
                                  startTime={this.handleStartTime}
                                  endTime={this.handleEndTime}
                                  loading={loadingCreate}
                              />
                              <ModalCreateEdit
                                  title="Update Working Time"
                                  visible={this.state.visibleUpdate}
                                  buttonCancel={this.toggleModalUpdate}
                                  data={this.state.dataRow}
                                  onFinish={this.onEdit}
                                  startTime={this.handleStartTime}
                                  endTime={this.handleEndTime}
                                  loading={loadingUpdate}
                              />
                          </Space>
                      </Col>
                      <Col xs={24} sm={24} md={{ span: 8, offset: 6 }} lg={{ span: 7, offset: 7 }} xl={{ span: 7, offset: 7 }} style={{ textAlign: "right" }}>
                          <Input
                              className="input-search"
                              placeholder="Search.."
                              onChange={e => this.searchHandler(e)}
                              style={{
                                  width: '250px',
                                  maxWidth: '80%',
                                  marginRight: '10px'
                              }}
                              prefix={<SearchOutlined />}
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
                                  dataSource={workingTimeList}
                                  pagination={paginationCus}
                                  loading={loading}
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

export default withRouter(MasterDataWorkingTime);
