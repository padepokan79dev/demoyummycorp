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
import Cookie from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;

class MasterDataSLA extends React.Component {
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
            optionListWorkingTime: [],
            optionListType: [],
            optionListBranch: [],
            optionListCompany: [],
            isDisabledBranch: true,
            loadingDelete: [],
            isIncludeWeekend: null,
            accessRight: ''
        }
    }

    componentDidMount() {
        this.getSLAList(
            this.state.search,
            this.state.pagination.current - 1,
            this.state.pagination.pageSize,
            this.state.sort
        );
        this.getOptionListType();
        this.getOptionListWorkingTime();
        this.getOptionListCompany();
        this.setState({
          userId: this.props.userId
        });
        setTimeout(() => this.setState({accessRight: sessionStorage.getItem("accessRight")}),500);
    }

    showModalCreate = () => {
        this.setState({
            visibleCreate: true,
        });
    }

    handleCancelCreate = e => {
        this.setState({
            visibleCreate: false,
            isDisabledBranch: true,
            isIncludeWeekend: null
        });
    };

    showModalUpdate = async record => {
        this.setState({
            dataRow: record,
            visibleUpdate: true,
            isIncludeWeekend: null
        });
    }

    handleCancelUpdate = e => {
        this.setState({
            visibleUpdate: false,
        });
    };

    async getSLAList(search, page, size, sort) {
        this.setState({
            loading: true
        });
        let listTemp = [];
        await FSMServices.getSLAList(search, page, size, sort).then(res => {
            listTemp = res && res.data && res.data.Data ? res.data.Data : [];
            this.setState({
                pagination: {
                    ...this.state.pagination,
                    total: res && res.data && res.data.totalListSLA ? res.data.totalListSLA : 0
                }
            });
        });
        this.setState({
            slaList: listTemp.map(item => {
                return {
                    ...item,
                    key: item.slaId
                }
            }),
            loading: false
        });
    }

    searchHandler(e) {
        let key = e.target.value;
        this.processSearchSLA(key);
    }

    processSearchSLA = _debounce(key => {
        this.setState({
            search: GlobalFunction.searchEncode(key),
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.getSLAList(
                this.state.search,
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort
            );
        });
    }, 500)

    createSLA = async data => {
        await FSMServices.createSLA(data).then(res => {
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
                        res.data.Message : "Create SLA Success",
                });
                this.setState({
                    visibleCreate: false,
                    isIncludeWeekend: null
                });
                this.getSLAList(
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
                        res.data.Message : "Create SLA Error",
                });
            }
        });
    }

    onCreate = async values => {
        this.setState({ loadingCreate: true });
        const data = {
            slaTypeId: {
                slaTypeId: values.type.toString()
            },
            wtimeId: {
                wtimeId: values.workingTime.toString()
            },
            branchId: {
                branchId: values.branch.toString()
            },
            slaResponseTime: values.responseTime,
            slaResolutionTime: values.resolutionTime,
            includeWeekend: this.state.isIncludeWeekend !== null ? this.state.isIncludeWeekend : false,
            createdBy: this.state.userId,
            lastModifiedBy: this.state.userId,
            deleted: false
        }
        await this.createSLA(data);
        this.setState({ loadingCreate: false });

    }

    editSLA = async (data, slaId) => {
        await FSMServices.editSLA(data, slaId).then(res => {
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
                        res.data.Message : "Edit SLA Success",
                });
                this.setState({
                    visibleUpdate: false,
                    isIncludeWeekend: null
                });
                this.getSLAList(
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
                        res.data.Message : "Edit SLA Error",
                });
            }
        });
    }

    onEdit = async values => {
        this.setState({ loadingUpdate: true });
        const slaId = this.state.dataRow.slaId;
        const data = {
            slaTypeId: {
                slaTypeId: values.type.toString()
            },
            wtimeId: {
                wtimeId: values.workingTime.toString()
            },
            branchId: {
                branchId: this.state.dataRow.branchId
            },
            slaResponseTime: values.responseTime,
            slaResolutionTime: values.resolutionTime,
            includeWeekend: this.state.isIncludeWeekend !== null ? this.state.isIncludeWeekend : this.state.dataRow.includeWeekend,
            createdBy: this.state.dataRow.createdBy,
            lastModifiedBy: this.state.userId,
            deleted: false
        }
        await this.editSLA(data, slaId);
        this.setState({ loadingUpdate: false });
    }

    deleteSLA = async (slaId, data) => {
        await FSMServices.deleteSLA(slaId, data).then(res => {
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
                        res.data.Message : "Delete SLA Success",
                });
                this.getSLAList(
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
                        res.data.Message : "Delete SLA Error"
                });
            }
        });
    }

    onDelete = async record => {
        let loading = [];
        loading[record.slaId] = true;
        this.setState({ loadingDelete: loading });
        const slaId = record.key;
        const data = {
            userId: this.state.userId
        }
        await this.deleteSLA(slaId, data);
        loading[record.slaId] = false;
        this.setState({ loadingDelete: loading });
    }

    handleTableChange = (pagination, filters, sorter) => {
        if (sorter.order === "ascend") {
            sorter.order = "asc";
        } else if (sorter.order === "descend") {
            sorter.order = "desc";
        }

        if (sorter.columnKey === "companyName") {
            sorter.columnKey = "e.company_name";
        } else if (sorter.columnKey === "branchName" ) {
            sorter.columnKey = "d.branch_name";
        } else if ( sorter.columnKey === "slaTypeName" ) {
            sorter.columnKey = "b.sla_type_name";
        } else if (sorter.columnKey === "cityName") {
            sorter.columnKey = "f.city_name"
        } else if (sorter.columnKey === "slaId") {
            sorter.columnKey = "sla_id"
        }

        this.setState({
            sort: `${sorter.order ? `${sorter.columnKey},${sorter.order}` : 'created_on,desc'}`,
            pagination
        }, () => {
            this.getSLAList(
                this.state.search,
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort
            );
        });
    };

    getOptionListBranch = async companyId => {
        this.setState({
            loadingBranch: true,
            isDisabledBranch: true
        });
        await FSMServices.optionListBranchByComapany(companyId).then(res => {
            this.setState({
                optionListBranch:
                    res &&
                    res.data &&
                    res.data.Data ?
                    res.data.Data : [],
                loadingBranch: false,
                isDisabledBranch: false
            });
        });
    }

    getOptionListType = () => {
        this.setState({ loadingType: true });
        FSMServices.optionListType().then(res => {
            this.setState({
                optionListType:
                    res &&
                    res.data &&
                    res.data.Data ?
                    res.data.Data : [],
                loadingType: false
            });
        });
    }

    getOptionListWorkingTime = () => {
        this.setState({ loadingWorkingTime: true });
        FSMServices.optionListWorkingTime().then(res => {
            this.setState({
                optionListWorkingTime:
                    res &&
                    res.data &&
                    res.data.Data ?
                    res.data.Data : [],
                loadingWorkingTime: false
            });
        });
    }

    async getOptionListCompany() {
        this.setState({ loadingCompany: true });
        await FSMServices.optionListCompany().then(res => {
            this.setState({
                optionListCompany:
                    res &&
                    res.data &&
                    res.data.Data ?
                    res.data.Data : [],
                loadingCompany: false
            });
        });
    }


    onChangeCompany = value => {
        this.getOptionListBranch(value);
    }

    render() {
        const {
            pagination,
            loading,
            slaList,
            optionListBranch,
            loadingBranch,
            optionListType,
            optionListWorkingTime,
            optionListCompany,
            loadingCreate,
            visibleUpdate,
            dataRow,
            visibleCreate,
            loadingUpdate,
            loadingDelete,
            isDisabledBranch,
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
                dataIndex: 'slaId',
                key: 'slaId',
                sorter: true
            },
            {
                title: 'Customer',
                dataIndex: 'companyName',
                key: 'companyName',
                sorter: true
            },
            {
                title: 'Branch',
                dataIndex: 'branchName',
                key: 'branchName',
                sorter: true
            },
            {
                title: 'Type',
                dataIndex: 'slaTypeName',
                key: 'slaTypeName',
                sorter: true
            },
            {
                title: 'Working Time',
                dataIndex: 'wTimeName',
                key: 'wtimeName'
            },
            {
                title: 'City',
                dataIndex: 'cityName',
                key: 'cityName',
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
                render: record => {
                    return (
                      <div>
                        { (accessRight.includes('Update')) ?
                          <Button
                              className="btn-edit"
                              icon={<EditFilled />}
                              size={'middle'}
                              onClick={() => this.showModalUpdate(record)}
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
                      <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                          <Space size={20}>
                              <Title
                                  level={2}
                                  style={{
                                      display: 'inline-block',
                                      margin: '0'
                                  }}
                              >
                                  SLA
                              </Title>
                              { (accessRight.includes('Create')) ?
                                <Button
                                    className="button-create"
                                    icon={<PlusOutlined />}
                                    type="primary"
                                    visible=""
                                    onClick={this.showModalCreate}
                                >
                                    CREATE
                                </Button>
                                :<></>
                              }
                              <ModalCreateEdit
                                  title="New SLA"
                                  visible={visibleCreate}
                                  buttonCancel={this.handleCancelCreate}
                                  onFinish={values => this.onCreate(values)}
                                  loading={loadingCreate}
                                  includeWeekend={e => {
                                      this.setState({
                                          isIncludeWeekend: e.target.checked
                                      });
                                  }}
                                  optionListBranch={optionListBranch}
                                  loadingBranch={loadingBranch}
                                  optionListType={optionListType}
                                  optionListWorkingTime={optionListWorkingTime}
                                  optionListCompany={optionListCompany}
                                  onChangeCompany={this.onChangeCompany}
                                  isDisabledBranch={isDisabledBranch}
                              />
                              <ModalCreateEdit
                                  title="Update SLA"
                                  visible={visibleUpdate}
                                  buttonCancel={this.handleCancelUpdate}
                                  onFinish={this.onEdit}
                                  loading={loadingUpdate}
                                  data={dataRow}
                                  includeWeekend={e => {
                                      this.setState({
                                          isIncludeWeekend: e.target.checked
                                      });
                                  }}
                                  optionListBranch={optionListBranch}
                                  optionListType={optionListType}
                                  optionListWorkingTime={optionListWorkingTime}
                                  optionListCompany={optionListCompany}
                                  onChangeCompany={this.onChangeCompany}
                                  isDisabledBranch={isDisabledBranch}
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
                                  dataSource={slaList}
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

export default withRouter(MasterDataSLA);
