import React from "react";
import { withRouter } from "react-router-dom";
import { Layout, Typography, Row, Col, Button, Input, Card, Space, notification, Table, Popconfirm } from "antd";
import { PlusOutlined, SearchOutlined, CloseOutlined, EditFilled } from '@ant-design/icons';
import {ModalCreateEdit} from './modalFunc';
import { FSMServices } from "../../../service";
import _debounce from 'lodash.debounce';
import { GlobalFunction } from "../../../global/function";
import PermissionDenied from '../../../global/permissionDenied'
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;

class JobCategory extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"

        this.state = {
            visibleCreate: false,
            visibleUpdate: false,
            dataRow: [],
            loading: true,
            loadingDelete: [],
            jobCategory: [],
            sort: "created_on,desc",
            search: "",
            pagination: {
                current: 1,
                pageSize: 10,
            },
            dataReport: [],
            isReport: false,
            isReportEdit: 2,
            isUpdate: false,
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
        this.getJobCategory(
            this.state.pagination.current - 1,
			this.state.pagination.pageSize,
            this.state.sort,
            this.state.search
        )
        this.getOptionListJobClass();
        this.getOptionListReport();
        this.getOptionListExistingReport();
        this.getListChildField();

    }

    handleModalCreate = e => {
        this.setState({
            visibleCreate: !this.state.visibleCreate,
            dataReport: [],
            isUpdate: false
        })
    }

    handleModalClose = () => {
        this.setState({
            visibleCreate: false,
            visibleUpdate: false,
            dataReport: []
        })
    }

    handleModalUpdate = e => {
        if (e && "jobCategoryId" in e) {
            FSMServices.getReportById(e.jobCategoryId).then(res => {
                let dataReport = []
                let tempReport = {}
                let tempListKey = []
                res.data.Data.map((data, index) => {
                    if (data.fieldName in tempReport) {
                        tempReport[data.fieldName]["fieldOption"].push({
                            fieldOptionName:{
                                fieldOptionName: data.fieldOptionName,
                            },
                            fieldOptionParentId: data.fieldOptionParentName
                        })
                    } else {
                        tempListKey.push(data.fieldName)
                        tempReport[data.fieldName] = {
                            fieldName: data.fieldName,
                            fieldOption: [{
                                fieldOptionName:{
                                    fieldOptionName: data.fieldOptionName,
                                },
                                fieldOptionParentId: data.fieldOptionParentName
                            }],
                            parentId: Object.keys(tempReport).length > 0 ? Object.keys(tempReport).length-1 : null
                        }
                    }
                })
                for (let report in tempReport) {
                    dataReport.push(tempReport[report])
                }
                this.setState({
                    dataReport: dataReport
                })
            })
        }
        this.setState({
            isReportEdit: e.isReport ? 1 : 2,
            isReport: e.isReport,
            isUpdate: true,
            dataRow: e,
            visibleUpdate: !this.state.visibleUpdate,
        })
    }

    setDataReport = (data) => {
        this.setState({
            dataReport: data,
        })
    }

    setIsReport = (value) => {
        this.setState({
            isReport: value === 1 ? true : false,
            isReportEdit: value
        })
    }

    // get list api
    async getJobCategory(page, size, sort, search) {
        this.setState({
            loading: true,
        })
        let listTemp = [];
        await FSMServices.getJobCategory(page, size, sort, search)
        .then(res => {
            listTemp = res && res.data && res.data.Data ? res.data.Data : [];
            this.setState({
                pagination: {
					...this.state.pagination,
					total: res && res.data && res.data.totalListJobCategory ? res.data.totalListJobCategory : 0
				}
            });
        });
        this.setState({
            jobCategory: listTemp.map(item => {
                return {
                    ...item,
                    key: item.jobCategoryId,
                    jobClassName: item.jobClass ? item.jobClass.jobClassName : "-",
                }
            }),
            loading: false
        });
    }

    // search handler
    searchHandler(e) {
        let key = e.target.value;
        this.processSearchJobCategory(key);
    }

    processSearchJobCategory = _debounce((key) => {
        this.setState({
            search: GlobalFunction.searchEncode(key),
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.getJobCategory(
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
            this.getJobCategory(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            )
        });
    };

    // Create
    getOptionListJobClass() {
        FSMServices.getOptionListJobClass().then(res => {

            this.setState({
            optionListJobClass: res ? res.data.Data : []
            })
        });
    }

    getOptionListExistingReport(){
        FSMServices.getOptionListExistingReport() .then(res =>{
            this.setState({
                optionListExistingReport : res ? res.data.data: []
            })
        })
    }

    async getReportByJobCategory(id){
        return await FSMServices.getReportByJobCategory(id)
    }

    getReportById(id) {
        return FSMServices.getReportById(id)
    }

    getListChildField(fieldJobCategoryId, fieldOptionParentId, pageNo, pageSize){
        FSMServices.getListChildField(9,3,0,100) .then(res =>{
            this.setState({
                listChildField: res ? res.data.data:[]
            })
        })
    }



    async getOptionListReport() {
        this.setState({loadingReport: true })
        await FSMServices.getReport().then(res => {
            let temp = res ? res.data.Data: []
            let data = temp.map(item => {
            return {
                    value: item.reportId,
                    label: item.reportName
                }
            })
            this.setState({
                optionListReport: data
            })
        })
        this.setState({ loadingReport: false })
    }

    async createJobCategory(data) {
        this.setState({
            loadingCreate: true
        });
        await FSMServices.createJobCategory(data).then(res => {
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
                    description: 'Create Job Category Success',
                });
                this.handleModalCreate();
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getJobCategory(
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
                            res.data.Message:'Create Job Category Error',
                });
            }
        });
        this.setState({
            loadingCreate: false
        });
    }

    onFinishCreate = values => {
        const data = {
            jobClassId: {
                jobClassId: values.jobClassId
            },
            jobCategoryName: values.jobCategoryName,
            jobCategoryTag: values.jobCategoryTag,
            jobCategoryDesc: values.jobCategoryDesc,
            // createdOn: Date.now(),
            createdBy: this.state.userIdAkun,
            // lastModifiedOn: Date.now(),
            lastModifiedBy: this.state.userIdAkun,
            deleted: false,
            // reportId: {
            //     reportId: values.reportId
            // }
            isReport: this.state.isReport,
            reportField:{
              reportOptionField:this.state.dataReport
            }
        }

        this.createJobCategory(data);
    }

    // Edit
    editJobCategory = (id, data) => {
        this.setState({
            loadingUpdate: true
        });
        FSMServices.editJobCategory(id, data).then(res => {
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
                    description: 'Edit Job Category Success',
                });
                // this.handleModalUpdate();
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
                    },
                    visibleUpdate: false
				});
                this.getJobCategory(
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
                            res.data.Message:'Edit Job Category Error',
                })
            }
        });
        this.setState({
            loadingUpdate: false
        });
    }

    onFinishEdit = values => {
        const data = {
            jobClassId: {
                jobClassId: values.jobClassId
            },
            jobCategoryName: values.jobCategoryName,
            jobCategoryTag: values.jobCategoryTag,
            jobCategoryDesc: values.jobCategoryDesc,
            lastModifiedOn: Date.now(),
            lastModifiedBy: this.state.userIdAkun,
            reportId: {
                reportId: values.reportId
            },
            isReport: this.state.isReport,
            reportField:{
              reportOptionField:this.state.dataReport
            }
        }
        this.editJobCategory(this.state.dataRow.jobCategoryId, data);
    }
    //End

    //Delete
    deleteJobCategory(jobCategoryId) {
        let loading = this.state.loadingDelete;
        loading[jobCategoryId] = true;
        let body =
        {
            "lastModifiedBy": Cookies.get('userId')
        }
        this.setState({
            loadingDelete: loading
        });
        FSMServices.deleteJobCategory(jobCategoryId, body).then( res => {
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
                    description: 'Delete Job Category Success',
                });
                this.setState({
					pagination:{
						...this.state.pagination,
						current: 1
					}
				});
                this.getJobCategory(
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
                            res.data.Message :'Delete Job Category Error',
                });
            }
        })
        loading[jobCategoryId] = false;
        this.setState({
            loadingDelete: loading
        });
    }
    //End

    render() {
        const {
            loading,
            loadingCreate,
            loadingUpdate,
            loadingDelete,
            jobCategory,
            dataRow,
            pagination,
            isReportEdit,
            isUpdate,
            dataReport,
            accessRight
        } = this.state

        const paginationCus = { ...pagination, showSizeChanger: false }
        const columns = [
            {
                width: 1,
                render: record => (
                    <Popconfirm
                        title="Are you sure?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => this.deleteJobCategory(record.key)}
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
                dataIndex: 'jobCategoryId',
                key: 'job_category_id',
                sorter: true
            },
            {
                title: 'Name',
                dataIndex: 'jobCategoryName',
                key: 'job_category_name',
                sorter: true
            },
            {
                title: 'Class',
                dataIndex: 'jobClassName',
                key: 'jcs.job_class_name',
                sorter: true
            },
            {
                title: 'Tag',
                dataIndex: 'jobCategoryTag',
                key: 'job_category_tag',
                sorter: true
            },
            {
                title: 'Description',
                dataIndex: 'jobCategoryDesc',
                key: 'job_category_desc',
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
                                  Job Category
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
                              <ModalCreateEdit
                                  isUpdate={isUpdate}
                                  title="New Job Category"
                                  visible={this.state.visibleCreate}
                                  buttonCancel={this.handleModalClose}
                                  jobClass={this.state.optionListJobClass}
                                  report={this.state.optionListReport}
                                  onFinish={values => this.onFinishCreate(values)}
                                  loading={loadingCreate}
                                  setDataReport={this.setDataReport}
                                  setIsReport={this.setIsReport}
                                  dataReport={dataReport}
                                  isReportEdit={isReportEdit}
                                  optionListExistingReport={this.state.optionListExistingReport}
                                  getReportByJobCategory={this.getReportByJobCategory}
                              />

                              <ModalCreateEdit
                                  isUpdate={isUpdate}
                                  title="Update Job Category"
                                  visible={this.state.visibleUpdate}
                                  buttonCancel={this.handleModalClose}
                                  isReportEdit={isReportEdit}
                                  dataEdit={dataRow}
                                  jobClass={this.state.optionListJobClass}
                                  report={this.state.optionListReport}
                                  onFinish={values => this.onFinishEdit(values)}
                                  loading={loadingUpdate}
                                  setDataReport={this.setDataReport}
                                  setIsReport={this.setIsReport}
                                  dataReport={dataReport}
                                  optionListExistingReport={this.state.optionListExistingReport}
                                  getReportByJobCategory={this.getReportByJobCategory}
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
                                  dataSource={jobCategory}
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

export default withRouter(JobCategory);
