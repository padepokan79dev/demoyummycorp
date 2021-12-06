import React from "react";
import { withRouter } from "react-router-dom";
import { Layout, Typography, Row, Col, Button, Input, Card, Space, notification, Table, Popconfirm } from "antd";
import { PlusOutlined, SearchOutlined, CloseOutlined, EditFilled } from '@ant-design/icons';
import ModalCreateEdit from './modal';
import { FSMServices }  from "../../../service";
import { GlobalFunction } from '../../../global/function';
import PermissionDenied from '../../../global/permissionDenied'
import _debounce from 'lodash.debounce'
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;

class MasterDataCustomerBranchList extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"

        this.state = {
            optionListCity: [],
            optionListCustomer: [],
            visibleCreateBranch: false,
            visibleUpdateBranch: false,
            visibleMaps: false,
            visibleMapsUpdate: false,
            orderBy: "created_on,desc",
            filterBy: "",
            search: '',
            dataRow: [],
            clientCompanyBranchList: [],
            loadingDelete: [],
            loading: true,
            pagination: {
                current: 1,
                pageSize: 10,
            },
            currentPos: null,
            currentPosUpdate: null,
            infoWindowVisible: false,
            mapCenter: null,
            tempCurrentPos: null,
            accessRight: ''
        }
    }

    componentDidMount() {
        this.getOptionCity()
        this.getOptionListCutomer()
        this.getClientCompanyBranch(
            '',
            1,
            10,
            this.state.orderBy
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

    handleMaps = () => {
        this.setState({
            visibleMaps: true
        })
    }

    handleClickOk = () => {
        this.setState( state => ({
            visibleMaps: false,
            visibleMapsUpdate: false,
            currentPos: state.tempCurrentPos,
            mapCenter: state.tempCurrentPos
        }))
    }

    handleMapsUpdate = () => {
        this.setState({
            visibleMapsUpdate: true
        })
    }

    toggleModalCreateBranch = () => {
        this.setState({
            visibleCreateBranch: !this.state.visibleCreateBranch
        });
        this.getCurrentPosition();
    }

    toggleModalUpdateBranch = e => {
        if ( this.state.visibleUpdateBranch ) {
            this.getCurrentPosition();
            this.setState({
                dataRow: null
            })
        } else {
            this.setState({
                dataRow: e,
                currentPos: {
                    lat: e && e.branchLatitude ? e.branchLatitude : null,
                    lng: e && e.branchLongitude ? e.branchLongitude : null
                },
                mapCenter: {
                    lat: e && e.branchLatitude ? e.branchLatitude : null,
                    lng: e && e.branchLongitude ? e.branchLongitude : null
                },
                tempCurrentPos: {
                    lat: e && e.branchLatitude ? e.branchLatitude : null,
                    lng: e && e.branchLongitude ? e.branchLongitude : null
                }
            })
        }

        this.setState(state => ({
            visibleUpdateBranch: !state.visibleUpdateBranch
        }));
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

    handleTableChange = (pagination, filters, sorter) => {
        const { search } = this.state
        let sorterField = ""
        if ( sorter.field === "company_name" ) {
            sorterField = "c.company_name";
        }else if ( sorter.field === "pic_name" ) {
            sorterField = "p.pic_name";
        } else {
            sorterField = sorter.field;
        }

        let orderBy = "created_on,desc";
        if (sorter.order === "ascend" ) {
            orderBy = `${sorterField},asc`;
        } else if (sorter.order === "descend") {
            orderBy = `${sorterField},desc`;
        }
        this.setState({
            orderBy: orderBy
        }, () => {
            this.getClientCompanyBranch(search, pagination.current, pagination.pageSize, orderBy)
        })
    }

    // on Search
    searchHandler = (e) => {
        const target = e.target.value
        this.processSearchBranch(GlobalFunction.searchEncode(target))
    }

    processSearchBranch = _debounce(key => {
        this.setState({
            search: key
        }, () => {
            this.getClientCompanyBranch(key, 1, 10, this.state.orderBy)
        })
    }, 500)

    // get list api
    async getClientCompanyBranch(search, page, size, order) {
        this.setState({
            loading: true
        });
        await FSMServices.getClientCompanyBranch(search, page, size, order).then( res => {
            let data = res ? res.data.Data : []
            this.setState({
                clientCompanyBranchList: data.map( item => {
                    return {
                        key: item.branchId,
                        branch_id: item.branchId,
                        company_id: item.companyId ? item.companyId.companyId : "",
                        company_name: item.companyId ? item.companyId.companyName : "",
                        branch_name: item.branchName,
                        branchDesc: item.branchDesc,
                        branchLatitude: item.branchLatitude,
                        branchLongitude: item.branchLongitude,
                        branchAddress: item.branchAdress,
                        cityId: item.cityId ? item.cityId.cityId : "",
                        pic_name: item.picName,
                        picEmail: item.picEmail,
                        picPhone: item.picPhone,
                        picDesc: item.picDesc,
                        tenantDesc: item.tenantDesc
                    }
                }),
                pagination: {
					current: page,
					total: res ? res.data.totalListData : 0
				},
            })
            this.setState({
				loading: false
			});
        })
    }

    // Create
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
                if(res.data.Status === 'OK') {
                    notification.success({
                        placement: 'bottomRight',
                        message: 'Success',
                        description: res.data.Message ? res.data.Message : 'Create Customer Branch Success',
                    });
                    this.toggleModalCreateBranch();
                    this.getClientCompanyBranch(
                        '',
                        1,
                        10,
                        this.state.orderBy
                    );
                }else {
                    notification.error({
                        placement: 'bottomRight',
                        message: 'Error',
                        description: res.data.Message ? res.data.Message : 'Create Customer Branch Failed',
                    });
                }
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: res.data.Message ? res.data.Message : 'Create Customer Branch Failed'
                })
            }
        })
        .catch(err => console.log(err))
        this.setState({ loadingCreate: false })
    }

    editClientCompanyBranch = values => {
        this.setState({ loadingUpdate: true })
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
            lastModifiedBy: Cookies.get('userId'),
        }

        FSMServices.editClientCompanyBranch(values.branchId, data)
        .then(res => {
            if (res.status === 200) {
                if(res.data.Status === 'OK') {
                    notification.success({
                        placement: 'bottomRight',
                        message: 'Success',
                        description: res.data.Message ? res.data.Message : 'Edit Customer Branch Success'
                    })
                    this.toggleModalUpdateBranch()
                    this.getClientCompanyBranch(
                        '',
                        1,
                        10,
                        this.state.orderBy
                    )
                }else {
                    notification.error({
                        placement: 'bottomRight',
                        message: 'Error',
                        description: res.data.Message ? res.data.Message : 'Edit Customer Branch Failed'
                    })
                }
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: res.data.Message ? res.data.Message : 'Edit Customer Branch Failed'
                })
            }

        })
        this.setState({ loadingUpdate: false })
    }

    deleteClientCompanyBranch = async id => {
        let loading = this.state.loadingDelete
        loading[id] = true
        this.setState({
            loadingDelete: loading
        })
        const data = {
            userId: Cookies.get('userId')
        }

        await FSMServices.deleteClientCompanyBranch(id, data)
        .then(res => {
            if (res.status === 200) {
                if (res.data.Status === 'OK') {
                    notification.success({
                        placement: 'bottomRight',
                        message: 'Success',
                        description: res.data.Message ? res.data.Message : 'Delete Customer Branch Success'
                    })
                } else {
                    notification.error({
                        placement: 'bottomRight',
                        message: 'Error',
                        description: res.data.Message ? res.data.Message : 'Delete Customer Branch Failed'
                    })
                }
                this.getClientCompanyBranch(
                    '',
                    1,
                    10,
                    this.state.orderBy
                )
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: res.data.Message ? res.data.Message : 'Delete Customer Branch Failed'
                })
            }
        })
        loading[id] = false
        this.setState({ loadingDelete: loading })
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

    onClickMap = event => {
        const coords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        }
        this.setState({
            tempCurrentPos: coords
        })
    }

    onCancelMaps = event => {
        this.setState( state => ({
            visibleMaps: false,
            visibleMapsUpdate: false,
            tempCurrentPos: state.currentPos,
            mapCenter: {
                lat: state.currentPos.lat + 0.00001,
                lng: state.currentPos.lng + 0.00001
            }
        }))
    }

    render() {
        const { clientCompanyBranchList, loading, pagination, optionListCity, optionListCustomer, mapCenter, tempCurrentPos, accessRight } = this.state
        const paginationCus = { ...pagination, showSizeChanger: false }
        const columns = [
            {
                width: 1,
                render: (record) => (
                    <Popconfirm
                        title="Are you sure?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={ () => this.deleteClientCompanyBranch(record.key) }
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
                title: 'Customer ID',
                dataIndex: 'company_id',
                key: 'company_id',
                sorter: true
            },
            {
                title: 'Branch ID',
                dataIndex: 'branch_id',
                key: 'branch_id',
                sorter: true
            },
            {
                title: 'Customer Name',
                dataIndex: 'company_name',
                key: 'company_name',
                sorter: true
            },
            {
                title: 'Branch Name',
                dataIndex: 'branch_name',
                key: 'branch_name',
                sorter: true
            },
            {
                title: 'PIC',
                dataIndex: 'pic_name',
                key: 'pic_name',
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
                render: (record) => (
                  <div>
                    { (accessRight.includes('Update')) ?
                      <Button
                          className="btn-edit"
                          icon={<EditFilled />}
                          size={'middle'}
                          onClick={ () => this.toggleModalUpdateBranch(record) }
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
                                  Customer Branch List
                              </Title>
                              { (accessRight.includes('Create')) ?
                                <Button
                                    className="button-create"
                                    icon={<PlusOutlined />}
                                    type="primary"
                                    onClick={this.toggleModalCreateBranch}
                                >
                                    CREATE
                                </Button>
                                :<></>
                              }
                              <ModalCreateEdit
                                  title="New Customer Branch"
                                  visible={this.state.visibleCreateBranch}
                                  optionListCity={optionListCity}
                                  optionListCustomer={optionListCustomer}
                                  buttonCancel={this.toggleModalCreateBranch}
                                  onFinish={this.createClientCompanyBranch}
                                  loading={this.state.loadingCreate}
                                  mapsVisible={()=> this.handleMaps()}
                                  mapView={this.state.visibleMaps}
                                  currentPos={this.state.currentPos}
                                  handleClickOk={this.handleClickOk}
                                  isCustomer={false}
                                  onMarkerDragEnd={this.onMarkerDragEnd}
                                  onPlacesChanged={this.onPlacesChanged}
                                  onClickMap={this.onClickMap}
                                  mapCenter={mapCenter}
                                  onCancelMaps={this.onCancelMaps}
                                  tempCurrentPos={tempCurrentPos}
                                  searchCity={val => this.searchCity(val)}
                              />
                              <ModalCreateEdit
                                  title="Update Customer Branch"
                                  visible={this.state.visibleUpdateBranch}
                                  optionListCity={optionListCity}
                                  optionListCustomer={optionListCustomer}
                                  handleClickOk={this.handleClickOk}
                                  buttonCancel={this.toggleModalUpdateBranch}
                                  dataRow={this.state.dataRow}
                                  loading={this.state.loadingUpdate}
                                  mapsVisible={() => this.handleMapsUpdate()}
                                  mapView={this.state.visibleMapsUpdate}
                                  currentPos={this.state.currentPos}
                                  onFinish={this.editClientCompanyBranch}
                                  isCustomer={false}
                                  onMarkerDragEnd={this.onMarkerDragEnd}
                                  onPlacesChanged={this.onPlacesChanged}
                                  onClickMap={this.onClickMap}
                                  mapCenter={mapCenter}
                                  onCancelMaps={this.onCancelMaps}
                                  tempCurrentPos={tempCurrentPos}
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
                                  dataSource={clientCompanyBranchList}
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

export default withRouter(MasterDataCustomerBranchList);
