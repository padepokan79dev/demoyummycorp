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
import PermissionDenied from '../../../global/permissionDenied'
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;

class MasterDataUOM extends React.Component {
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
            loadingDelete: [],
            accessRight: ''
        }
    }

    componentDidMount() {
        this.getUOMList(
            this.state.search,
            this.state.pagination.current - 1,
            this.state.pagination.pageSize,
            this.state.sort,
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

    toggleModalUpdate = (data) => {
        this.setState({
            visibleUpdate: !this.state.visibleUpdate,
            dataRow: data
        });
    }

    // get list api
    async getUOMList(search, page, size, sort) {
        this.setState({
            loading: true
        });
        let listTemp = [];
        await FSMServices.getUOMList(search, page, size, sort).then( res => {
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
            uomList: listTemp.map(item => {
                return {
                    ...item,
                    key: item.uomId
                }
            }),
            loading: false
        });
    }

    searchHandler(e) {
        let key = e.target.value;
        this.processSearchUOM(key);
    }

    processSearchUOM = _debounce( key => {
        this.setState({
            search: GlobalFunction.searchEncode(key),
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.getUOMList(
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
            this.getUOMList(
                this.state.search,
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort
            );
        });
    };

    createUOM = async data => {
        await FSMServices.createUOM(data)
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
                        res.data.Message : "Create UOM Success",
                });
                this.toggleModalCreate();
                this.getUOMList(
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
                        res.data.Message : "Create UOM Error",
                });
            }
        });
    }

    onCreate = async values => {
        this.setState({ loadingCreate: true });
        const data = {
            uomName: values.name,
            createdBy: this.state.userId,
            lastModifiedBy: this.state.userId,
        }
        await this.createUOM(data);
        this.setState({ loadingCreate: false });
    }

    editUOM = async (data, uomId) => {
        await FSMServices.editUOM(data, uomId)
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
                        res.data.Message : "Edit UOM Success"
                });
                this.toggleModalUpdate();
                this.getUOMList(
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
                        res.data.Message : "Edit UOM Error"
                });
            }
        });
    }

    onEdit = async values => {
        this.setState({ loadingUpdate: true});
        const uomId = this.state.dataRow.uomId;
        const data = {
            uomName: values.name,
            lastModifiedBy: this.state.userId
        }
        await this.editUOM(data, uomId);
        this.setState({ loadingUpdate: false });
    }

    deleteUOM = async (data, uomId) => {
        await FSMServices.deleteUOM(data, uomId)
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
                        res.data.Message : "Delete UOM Success",
                });
                this.getUOMList(
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
                        res.data.Message : "Delete UOM Error",
                });
            }
        });
    }

    onDelete = async record => {
        let loading = this.state.loadingDelete;
        const uomId = record.key;
        loading[uomId] = true;
        this.setState({ loadingDelete: loading });
        const data = {
            userId: this.state.userId
        }
        this.deleteUOM(data, uomId)
        loading[uomId] = false;
        this.setState({ loadingDelete: loading });
    }

    render() {
        const {
            uomList,
            loading,
            pagination,
            visibleCreate,
            loadingCreate,
            loadingUpdate,
            dataRow,
            visibleUpdate,
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
                            loading={this.state.loadingDelete[record.key]}
                        />
                        :<></>
                      }
                    </Popconfirm>
                )
            },
            {
                title: 'UOM ID',
                dataIndex: 'uomId',
                key: 'uom_id',
                sorter: true
            },
            {
                title: 'Name',
                dataIndex: 'uomName',
                key: 'uom_name',
                sorter: true
            },
            {
                title: 'Tenant',
                dataIndex: 'tenantDesc',
                key: 'tenantDesc',
                sorter: false
            },
            {
                width: 300,
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
                      <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                          <Space size={20}>
                              <Title
                                  level={2}
                                  style={{
                                      display: 'inline-block',
                                      margin: '0'
                                  }}
                              >
                                  UOM
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
                                  title="New UOM"
                                  visible={visibleCreate}
                                  buttonCancel={this.toggleModalCreate}
                                  onFinish={this.onCreate}
                                  loading={loadingCreate}
                              />
                              <ModalCreateEdit
                                  title="Update UOM"
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
                                  dataSource={uomList}
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

export default withRouter(MasterDataUOM);
