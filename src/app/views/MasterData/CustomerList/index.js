import React from "react";
import { withRouter } from "react-router-dom";
import { Layout, Typography, Row, Col, Button, Input, Card, Space, notification, Table, Popconfirm } from "antd";
import { PlusOutlined, SearchOutlined, CloseOutlined, EditFilled } from '@ant-design/icons';
import ModalCreateEdit from './modal';
import ModalCreateBranch from '../CustomerBranchList/modal'
import { FSMServices }  from "../../../service";
import _debounce from 'lodash.debounce'
import { GlobalFunction } from '../../../global/function';
import PermissionDenied from '../../../global/permissionDenied'
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title, Text } = Typography;

class MasterDataCustomerList extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"

        this.state = {
            visibleCreate: false,
            visibleUpdate: false,
            visibleDetail: false,
            visibleCreateBranch: false,
            orderBy: "created_on,desc",
            filterBy: "",
            dataRow: [],
            dataBranch: [],
            clientCompanyList: [],
            optionListCity: [],
            optionListCustomer: [],
            loadingDelete: [],
            companyId: '',
            companyName: '',
            search: '',
            pagination: {
                defaultCurrent: 1,
                pageSize: 10,
            },
            visibleMaps: false,
            currentPos: null,
            mapCenter: null,
            tempCurrentPos: null,
            accessRight: ''
        }
    }

    componentDidMount() {
        this.getOptionCity()
        this.getOptionListCutomer()
        this.getClientCompany(
            '',
            1,
            10,
            'created_on,desc'
        );
        if (navigator.geolocation) {
            this.getCurrentPosition();
        }
        setTimeout(() => this.setState({accessRight: sessionStorage.getItem("accessRight")}),500);
    }

    getCurrentPosition(){
        navigator.geolocation.getCurrentPosition(position => {
            this.setState({
                currentPos: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                },
                mapCenter: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                },
                tempCurrentPos: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }
            })
        });
    }


    toggleModalCreate = () => {
        this.setState({
            visibleCreate: !this.state.visibleCreate
        });
    }

    toggleModalCreateBranch = id => {
        this.getCurrentPosition();
        this.setState({
            companyId: id,
            visibleCreateBranch: !this.state.visibleCreateBranch
        });
    }

    toggleModalUpdate = e => {
        this.setState({
            dataRow: e,
            visibleUpdate: !this.state.visibleUpdate
        });
    }

    // maps

    handleMaps = () => {
        this.setState({
            visibleMaps: true,
        })
    }

    handleClickOk = () => {
        this.setState( state => ({
            visibleMaps: false,
            currentPos: state.tempCurrentPos,
            mapCenter: state.tempCurrentPos
        }));
    }

    onCancelMaps = event => {
        this.setState(state => ({
            visibleMaps: false,
            visibleMapsUpdate: false,
            tempCurrentPos: state.currentPos,
            mapCenter: {
                lat: state.currentPos.lat + 0.00001,
                lng: state.currentPos.lng + 0.00001
            }
        }))
    }

    onClickMap = event => {
        const coords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        }
        this.setState({
            tempCurrentPos: coords
        })
    }

    onMarkerDragEnd = event => {
        const coords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        }
        this.setState({
            tempCurrentPos: coords
        })
    }

    onPlacesChanged = place => {
        let coords;
        place.map(res => {
            coords = {
                lat: res.geometry.location.lat(),
                lng: res.geometry.location.lng()
            }
            return null;
        })
        this.setState({
            tempCurrentPos: coords,
            mapCenter: coords
        })
    }

    handleModalDetail = async e => {
        if (!this.state.visibleDetail) {
            let listTemp = []
            await FSMServices.getClientCompanyBranchPic(e.company_id).then(res => {
                listTemp = res ? res.data.Data : []
            })
            this.setState({
                dataBranch: listTemp.map(data => {
                    return {
                        ...data,
                        companyId: e.company_id,
                           companyName: e.company_name
                    }
                }),
                visibleDetail: true,
                companyName: e.company_name
            })
        } else {
            this.setState({ visibleDetail: false })
        }
    }

    async getOptionCity() {
        await FSMServices.searchCityList("")
        .then(res => {
            this.setState({
                optionListCity: res ? res.data.Data : []
            })
        })
    }

    searchCity = (key) => {
        this.processSearchCity(GlobalFunction.searchEncode(key))
    }

    processSearchCity = _debounce(key => {
        const { optionListCity } = this.state
        let data = null
        FSMServices.searchCityList(key).then(res => {
            data = res ? res.data.Data : optionListCity
            this.setState({
                optionListCity: data
            })
        })
    },500)

    async getOptionListCutomer() {
        await FSMServices.getOptionListCustomer().then(res => {
          this.setState({
            optionListCustomer: res ? res.data.Data : []
          });
        })
    }

    // get list api
    async getClientCompany(search, page, size, orderBy) {
        this.setState({
            loading: true
        });
        await FSMServices.getClientCompany(search, page, size, orderBy).then( res => {
            let data = res ? res.data.Data : []
            this.setState({
                clientCompanyList: data.map( item => {
                    return {
                        key: item.companyId,
                        company_id: item.companyId,
                        company_name: item.companyName,
                        companyEmail: item.companyEmail,
                        companyPassword: item.companyPassword,
                        companyAddress1: item.companyAddress1,
                        companyAddress2: item.companyAddress2,
                        cityId: item.cityId,
                        companyZipCode: item.companyZipCode,
                        companyPhone: item.companyPhone,
                        picId: item.picId,
                        picName: item.picName,
                        picEmail: item.picEmail,
                        picPhone: item.picPhone,
                        picDesc: item.picDesc,
                        tenantDesc: item.tenantDesc
                    }
                }),
                pagination: {
					current: page,
					total: res ? res.data.totalListCustomer : 0
				}
            });
        });
        this.setState({
            loading: false
        });
    }

    // on Search
    searchHandler = (e) => {
        const target = e.target.value
        this.processSearchCustomer(GlobalFunction.searchEncode(target))
    }

    processSearchCustomer = _debounce(key => {
        this.setState({
            search: key
        }, () => {
            this.getClientCompany(
                key,
                1,
                10,
                this.state.orderBy
                )
        })
    }, 500)


    handleTableChange = (pagination, filters, sorter) => {
        const { search } = this.state
        let sorterField = sorter.field

        let orderBy = "created_on,desc";
        if (sorter.order === "ascend" ) {
            orderBy = `${sorterField},asc`;
        } else if (sorter.order === "descend") {
            orderBy = `${sorterField},desc`;
        }
        this.setState({
            orderBy: orderBy
        }, () => {
            this.getClientCompany(search, pagination.current, pagination.pageSize, orderBy)
        })
    }

    // Create
    createClientCompany = values => {
        this.setState({ loadingCreate: true })
        const data = {
            city: {
                cityId: values.cityId.toString()
            },
            companyName: values.companyName,
            companyEmail: values.companyEmail,
            companyPassword: '',
            companyAddress1: values.companyAddress1,
            companyAddress2: values.companyAddress2 ? values.companyAddress2 : '',
            companyZipCode: values.companyZipCode,
            companyPhone: values.companyPhone,
            picName: values.picName,
            picPhone: values.picPhone,
            picEmail: values.picEmail,
            picDescription: '',
            userId: Cookies.get('userId')
        }

        FSMServices.createClientCompany(data).then(res => {
            if (res.status === 200){
                if (res.data.Status === 'OK') {
                    notification.success({
                        placement: 'bottomRight',
                        message: 'Success',
                        description: res.data.Message ? res.data.Message : 'Create Customer Success',
                    });
                    this.toggleModalCreate();
                    this.getOptionListCutomer()
                    this.getClientCompany(
                        '',
                        1,
                        10,
                        'created_on,desc',
                    );
                } else {
                    notification.error({
                        placement: 'bottomRight',
                        message: 'Error',
                        description: res.data.Message ? res.data.Message : 'Create Customer Failed'
                    })
                }
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: res.data.Message ? res.data.Message : 'Create Customer Failed'
                })
            }
        }).catch(err => {
            console.log(err)
        });
        this.setState({ loadingCreate: false })
    }

    createClientCompanyBranch = values => {
        this.setState({ loadingCreate: true })
        const data = {
            cityId : {
                cityId : values.cityId
            },
            companyId: {
                companyId: values.companyId
            },
            branchName: values.branchName,
            // branchLatitude: values.branchLatitude,
            branchLatitude: this.state.currentPos.lat,
            // branchLongitude: values.branchLongitude,
            branchLongitude: this.state.currentPos.lng,
            branchAddress: values.branchAddress,
            branchDesc: values.branchDesc,
            picName: values.picName,
            picEmail: values.picEmail,
            picPhone: values.picPhone,
            picDesc: '',
            createdBy: Cookies.get('userId'),
            lastModifiedBy: Cookies.get('userId'),
        }

        FSMServices.createClientCompanyBranch(data).then(res => {
            if (res.status === 200){
                if (res.data.Status === 'OK') {
                    notification.success({
                        placement: 'bottomRight',
                        message: 'Success',
                        description: res.data.Message ? res.data.Message : 'Create Branch Success',
                    });
                    this.toggleModalCreateBranch();
                    this.getClientCompany(
                        '',
                        1,
                        10,
                        'created_on,desc',
                    );
                } else {
                    notification.error({
                        placement: 'bottomRight',
                        message: 'Error',
                        description: res.data.Message ? res.data.Message : 'Create Branch Failed'
                    })
                }
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: res.data.Message ? res.data.Message : 'Create Branch Failed'
                })
            }
        })
        .catch(err => console.log(err))
        this.setState({ loadingCreate: false })
    }

    editClientCompany = values => {
        this.setState({ loadingUpdate: true })
        const data = {
            // companyId: values.companyId,
            city: {
                cityId: values.cityId.toString()
            },
            companyName: values.companyName,
            companyEmail: values.companyEmail,
            companyPassword: values.companyPassword,
            companyAddress1: values.companyAddress1,
            companyAddress2: values.companyAddress2,
            companyZipCode: values.companyZipCode,
            companyPhone: values.companyPhone,
            picName: values.picName,
            picPhone: values.picPhone,
            picEmail: values.picEmail,
            picDescription: '',
            userId: Cookies.get('userId')
        }

        FSMServices.editClientCompany(values.companyId, data)
        .then(res => {
            if (res.status === 200) {
                if (res.data.Status === 'OK') {
                    notification.success({
                        placement: 'bottomRight',
                        message: 'Success',
                        description: res.data.Message ? res.data.Message : 'Edit Customer Success'
                    })
                    this.toggleModalUpdate();
                    this.getOptionListCutomer()
                    this.getClientCompany(
                        '',
                        1,
                        10,
                        'created_on,desc',
                    )
                } else {
                    notification.error({
                        placement: 'bottomRight',
                        message: 'Error',
                        description: res.data.Message ? res.data.Message : 'Edit Customer Failed'
                    })
                }
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: res.data.Message ? res.data.Message : 'Edit Customer Failed'
                })
            }
        })
        .catch(err => {
            console.log(err)
        })
        this.setState({ loadingUpdate: false })
    }

    deleteClientCompany = id => {
        let loading = this.state.loadingDelete
        loading[id] = true
        this.setState({
            loadingDelete: loading
        })
        const data = {
            userId: Cookies.get('userId')
        }

        FSMServices.deleteClientCompany(id, data)
        .then(res => {
            if (res.status === 200) {
                if (res.data.Status === 'OK') {
                    notification.success({
                        placement: 'bottomRight',
                        message: 'Success',
                        description: res.data.Message ? res.data.Message : 'Delete Customer Success'
                    })
                } else {
                    notification.error({
                        placement: 'bottomRight',
                        message: 'Error',
                        description: res.data.Message ? res.data.Message : 'Delete Customer Failed'
                    })
                }
                this.getClientCompany(
                    '',
                    1,
                    10,
                    'created_on,desc',

                )
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: res.data.Message ? res.data.Message : 'Delete Customer Failed'
                })
            }
        })
        loading[id] = false
        this.setState({ loadingDelete: loading })
    }

    render() {
        const { loading, clientCompanyList, pagination, optionListCity, optionListCustomer,
            mapCenter, tempCurrentPos, accessRight } = this.state

        let paginationCus = { ...pagination, showSizeChanger: false }
        const columns = [
            {
                width: 1,
                render: (record) => (
                    <Popconfirm
                        title="Are you sure?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => this.deleteClientCompany(record.company_id)}
                    >
                      { (accessRight.includes('Delete')) ?
                        <Button
                            className="btn-delete"
                            type="danger"
                            icon={<CloseOutlined />}
                            size={'middle'}
                            loading={this.state.loadingDelete[record.company_id]} />
                        :<></>
                      }
                    </Popconfirm>

                )
            },
            {
                title: 'Customer ID',
                dataIndex: 'company_id',
                key: 'company_id',
                sorter: true
            },
            {
                title: 'Name',
                dataIndex: 'company_name',
                key: 'company_name',
                sorter: true
            },
            {
                title: 'Tenant',
                dataIndex: 'tenantDesc',
                key: 'tenantDesc',
                sorter: false
            },
            {
                title: 'Branch',
                key: 'branch',
                onCell: (record) => {
                    return { onClick: () => this.handleModalDetail(record) }
                },
                render: (record) => (
                    // <Spin spinning={this.state.loadingDetail[record.companyId]}>
                        <Text
                            className="text-detail"
                            // onClick={ () => this.handleModalDetail(record) }
                        >detail
                        </Text>
                    // </Spin>
                )
            },
            {
                title: '',
                key: 'action',
                render: (record) => (
                  <div>
                    { (accessRight.includes('Add Branch')) ?
                     <Button
                       className="button-create"
                       type="primary"
                       style={{borderRadius:"8px"}}
                       onClick={ () => this.toggleModalCreateBranch(record.company_id) }>
                         ADD BRANCH
                     </Button>
                     :<></>
                   }
                  </div>
               ),
            },
            {
                width: 1,
                render: (record) => (
                  <div>
                    { (accessRight.includes('Update')) ?
                      <Button
                          className="btn-edit"
                          icon={<EditFilled />}
                          size={'middle'}
                          onClick={ () => this.toggleModalUpdate(record) }
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
                                  Customer List
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
                                  title="New Customer"
                                  isDetail={false}
                                  visible={this.state.visibleCreate}
                                  buttonCancel={this.toggleModalCreate}
                                  onFinish={this.createClientCompany}
                                  optionListCity={optionListCity}
                                  loading={this.state.loadingCreate}
                                  searchCity={val => this.searchCity(val)}
                              />
                              <ModalCreateEdit
                                  title="Update Customer"
                                  isDetail={false}
                                  visible={this.state.visibleUpdate}
                                  buttonCancel={this.toggleModalUpdate}
                                  dataRow={this.state.dataRow}
                                  onFinish={this.editClientCompany}
                                  optionListCity={optionListCity}
                                  loading={this.state.loadingUpdate}
                                  searchCity={val => this.searchCity(val)}
                              />
                              <ModalCreateEdit
                                  title="Detail Customer"
                                  isDetail={true}
                                  visible={this.state.visibleDetail}
                                  buttonCancel={this.handleModalDetail}
                                  dataBranch={this.state.dataBranch}
                                  loading={this.state.loading}
                                  companyName={this.state.companyName}
                                  searchCity={val => this.searchCity(val)}
                              />
                              <ModalCreateBranch
                                  title="New Customer Branch List"
                                  visible={this.state.visibleCreateBranch}
                                  buttonCancel={this.toggleModalCreateBranch}
                                  loading={this.state.loadingCreate}
                                  optionListCity={optionListCity}
                                  optionListCustomer={optionListCustomer}
                                  onFinish={this.createClientCompanyBranch}
                                  mapsVisible={()=> this.handleMaps()}
                                  mapView={this.state.visibleMaps}
                                  currentPos={this.state.currentPos}
                                  onMarkerDragEnd={this.onMarkerDragEnd}
                                  onPlacesChanged={this.onPlacesChanged}
                                  onClickMap={this.onClickMap}
                                  mapCenter={mapCenter}
                                  onCancelMaps={this.onCancelMaps}
                                  tempCurrentPos={tempCurrentPos}
                                  handleClickOk={this.handleClickOk}
                                  isCustomer={true}
                                  companyId={this.state.companyId}
                                  searchCity={val => this.searchCity(val)}
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
                  <Row>
                      <Col span={24}>
                          <Card
                              bordered={false}
                              className="card-master-data"
                          >
                              <Table
                                  columns={columns}
                                  dataSource={clientCompanyList}
                                  loading={loading}
                                  pagination={paginationCus}
                                  onChange={this.handleTableChange}
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

export default withRouter(MasterDataCustomerList);
