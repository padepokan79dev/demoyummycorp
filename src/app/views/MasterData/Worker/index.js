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
    Table,
    Popconfirm
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    CloseOutlined,
    EditFilled,
    BranchesOutlined
} from '@ant-design/icons';
import ModalCreateEdit from './modal';
import { withRouter } from "react-router-dom";
import { FSMServices } from '../../../service';
import { GlobalFunction } from '../../../global/function';
import PermissionDenied from '../../../global/permissionDenied'
import _debounce from 'lodash.debounce';
import Swal from "sweetalert2";
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;

class MasterDataWorker extends React.Component {
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
            loadingRecord: [],
            workerId: '',
            message: {
                edit: {
                    success: "Edit Worker Success",
                    error: "Edit Worker Failed"
                },
                delete: {
                    success: "Delete Worker Success",
                    error: "Delete Worker Failed"
                }
            },
            currentPos: null,
            infoWindowVisible: false,
            activeMarker: {},
            mapCenter: null,
            tempCurrentPos: null,
            accessRight: '',
            tenantList: [],
            totalTenantAdded: [0]
        }
    }

    componentDidMount() {
        this.getOptionListCity();
        this.getOptionListWorkerGroup();
        this.getOptionListUserIdentity();
        this.getOptionListTenant('');
        this.getWorker(
            this.state.search,
            this.state.pagination.current - 1,
            this.state.pagination.pageSize,
            this.state.sort
        );
        this.setState({
            userId: this.props.userId
        });
        if (navigator.geolocation) {
            this.getCurrentPosition();
        }
        setTimeout(() => this.setState({ accessRight: sessionStorage.getItem("accessRight") }), 500);
    }

    getCurrentPosition() {
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

    showModalCreate = () => {
        this.getCurrentPosition();
        this.setState({ visibleCreate: true });
    };

    handleCancelCreate = e => {
        this.getCurrentPosition();
        this.setState({ visibleCreate: false });
    };

    async getOptionListTenant(search) {
        this.setState({ loadingTenant: true })
        await FSMServices.getTenantLOV(search).then(res => {
            this.setState({
                tenantList:
                    res &&
                        res.data &&
                        res.data.items ?
                        res.data.items : []
            });
        });
        this.setState({ loadingTenant: false })
    }

    searchTenant = (key) => {
        this.processSearchTenant(GlobalFunction.searchEncode(key))
    }

    processSearchTenant = _debounce(key => {
        const { tenantList } = this.state
        let data = null
        FSMServices.getTenantLOV(key).then(res => {
            data = res ? res.data.items : tenantList
            this.setState({
                tenantList: data
            })
        })
    }, 500)

    showModalUpdate = async workerId => {
        let loading = this.state.loadingRecord;
        loading[workerId] = true;
        this.setState({ loadingRecord: loading });
        await FSMServices.getWorkerDetail(workerId).then(res => {
            this.setState({
                dataRow: res ? res.data.Data : [],
                visibleUpdate: true,
                workerId: workerId,
                mapCenter: {
                    lat: res ? res.data.Data[0].userLatitude : 0,
                    lng: res ? res.data.Data[0].userLongatitude : 0
                },
                currentPos: {
                    lat: res ? res.data.Data[0].userLatitude : 0,
                    lng: res ? res.data.Data[0].userLongatitude : 0
                },
                tempCurrentPos: {
                    lat: res ? res.data.Data[0].userLatitude : 0,
                    lng: res ? res.data.Data[0].userLongatitude : 0
                }
            })
        })
            .catch(err => console.log(err))
        loading[workerId] = false;
        this.setState({ loadingRecord: loading });
    };

    handleCancelUpdate = e => {
        this.getCurrentPosition();
        this.setState({ visibleUpdate: false });
    };

    async getWorker(search, page, size, sort) {
        this.setState({
            loading: true
        });
        let listTemp = [];
        await FSMServices.getWorker(search, page, size, sort)
            .then(res => {
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
                                res.data.TotalData ?
                                res.data.TotalData : 0
                    }
                });
            });
        this.setState({
            workerList: listTemp.map(item => {
                return {
                    ...item,
                    key: item.userId
                }
            }),
            loading: false
        });
    }

    searchHandler = (e) => {
        let key = e.target.value;
        this.processSearchWorker(key);
    }

    processSearchWorker = _debounce(key => {
        this.setState({
            search: GlobalFunction.searchEncode(key),
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.getWorker(
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
            this.getWorker(
                this.state.search,
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort
            );
        });
    };

    async getOptionListCity() {
        this.setState({ loadingCity: true })
        await FSMServices.searchCityList("")
            .then(res => {
                this.setState({
                    optionListCity:
                        res &&
                            res.data &&
                            res.data.Data ?
                            res.data.Data : []
                });
            });
        this.setState({ loadingCity: false })
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
    }, 500)

    async getOptionListWorkerGroup() {
        this.setState({ loadingWorkerGroup: true })
        await FSMServices.getOptionListWorkerGroup()
            .then(res => {
                this.setState({
                    optionListWorkerGroup:
                        res &&
                            res.data &&
                            res.data.items ?
                            res.data.items : []
                });
            });
        this.setState({ loadingWorkerGroup: false })
    }

    async getOptionListUserIdentity() {
        this.setState({ loadingUserIdentity: true });
        await FSMServices.getOptionListUserIdentity()
            .then(res => {
                this.setState({
                    optionListUserIdentity:
                        res &&
                            res.data &&
                            res.data.items ?
                            res.data.items : []
                });
            });
        this.setState({ loadingUserIdentity: false });
    }

    searchSkill = (key) => {
        this.processSearchSkill(GlobalFunction.searchEncode(key))
    }

    processSearchSkill = _debounce(key => {
        this.setState({ loadingJob: true })
        const { optionListJob } = this.state
        let data = null
        FSMServices.getOptionListJob(key).then(res => {
            data = res ? res.data.Data : []
            let dataFix = data.map(item => {
                return {
                    value: item.jobId,
                    label: item.jobName
                }
            })
            this.setState({
                optionListJob: (data.length > 0) ? dataFix : optionListJob,
                loadingJob: false
            })
        })
    }, 500)

    createWorker = async data => {
        await FSMServices.createWorker(data)
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
                                res.data.Message : "Create Worker Success"
                    })
                    this.handleCancelCreate();
                    this.getWorker(
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
                                res.data.Message : "Create Worker Error",
                    });
                }
            });
    }

    onCreate = async values => {
        let checkTenantId = true;
        if ( values.tenant.length > 1 ) {
            for (let i = 0; i < values.tenant.length; i++) {
                if (values.tenant[i + 1]?.tenantId) {
                    if (values.tenant[i].tenantId === values.tenant[i + 1].tenantId) {
                        checkTenantId = false;
                        break;
                    }
                }
            }
        }
        if (checkTenantId) {
            this.setState({ loadingCreate: true });
            const { currentPos } = this.state;
            const data = {
                primaryAreaId: {
                    cityId: values.primaryArea.toString()
                },
                secondaryAreaId: {
                    cityId: values.secondaryArea.toString()
                },
                roleId: {
                    roleId: "8"
                },
                userName: values.workerUsername,
                userPassword: values.workerPassword,
                userAddress: values.address,
                phone: values.phoneNumber,
                mobilePhone: values.phoneNumber,
                userEmail: values.email,
                userIdentity: values.userIdentity,
                userIdentityNo: values.nik,
                userGender: values.workerGender.toString(),
                userImage: null,
                userLatitude: currentPos.lat,
                userLongatitude: currentPos.lng,
                userFullName: values.name,
                createdBy: this.props.userId,
                lastModifiedBy: this.props.userId,
                tenant: values.tenant
            }
            await this.createWorker(data);
            this.setState({ loadingCreate: false, currentPosUpdate: null });
        } else {
            Swal.fire({
                type: "info",
                title: "Warning!",
                text: "Cannot add duplicate Tenant",
                animation: false,
                allowOutsideClick: false,
            })
        }
    }

    updateWorker = async (workerId, data) => {
        await FSMServices.updateWorker(workerId, data)
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
                                res.data.Message : "Edit Worker Success",
                    });
                    this.handleCancelUpdate();
                    this.getWorker(
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
                                res.data.Message : "Edit Worker Error",
                    });
                }
            })
    }

    onUpdate = async values => {
        let checkTenantId = true;
        if (values.tenant.length > 1) {
            for (let i = 0; i < values.tenant.length; i++) {
                if (values.tenant[i + 1]?.tenantId) {
                    if (values.tenant[i].tenantId === values.tenant[i + 1].tenantId) {
                        checkTenantId = false;
                        break;
                    }
                }
            }
        }
        
        if ( checkTenantId ) {
            this.setState({ loadingUpdate: true });
            const { currentPos } = this.state;
            const workerId = this.state.workerId;
            const data = {
                primaryAreaId: {
                    cityId: values.primaryArea.toString()
                },
                secondaryAreaId: {
                    cityId: values.secondaryArea.toString()
                },
                roleId: {
                    roleId: "8"
                },
                userName: values.workerUsername,
                userPassword: values.workerPassword,
                userAddress: values.address,
                phone: values.phoneNumber,
                mobilePhone: values.phoneNumber,
                userEmail: values.email,
                userIdentity: values.userIdentity,
                userIdentityNo: values.nik,
                userGender: values.workerGender.toString(),
                userImage: this.state.dataRow[0].userImage,
                userLatitude: currentPos.lat,
                userLongatitude: currentPos.lng,
                userFullName: values.name,
                createdBy: this.props.userId,
                lastModifiedBy: this.props.userId,
                tenant: values.tenant
            }
            await this.updateWorker(workerId, data);
            this.setState({ loadingUpdate: false, currentPosUpdate: null });
        } else {
            Swal.fire({
                type: "info",
                title: "Warning!",
                text: "Cannot add duplicate Tenant",
                animation: false,
                allowOutsideClick: false,
            })
        }
    }

    deleteWorker = async (workerId, data) => {
        await FSMServices.deleteWorker(workerId, data)
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
                                res.data.Message : "Delete Worker Success",
                    });
                    this.setState({ visibleUpdate: false });
                    this.getWorker(
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
                                res.data.Message : "Delete worker error",
                    });
                }
            });
    }

    onDelete = async workerId => {
        let loading = this.state.loadingDelete;
        loading[workerId] = true;
        this.setState({ loadingDelete: loading });
        const data = {
            lastModifiedBy: this.state.userId
        }
        await this.deleteWorker(workerId, data);
        loading[workerId] = false;
        this.setState({ loadingDelete: loading });
    }

    handleMaps = () => {
        this.setState({ visibleMaps: true })
    }

    handleMapsUpdate = () => {
        this.setState({ visibleMapsUpdate: true })
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

    handleClickOk = () => {
        this.setState(state => ({
            visibleMaps: false,
            visibleMapsUpdate: false,
            currentPos: state.tempCurrentPos,
            mapCenter: state.tempCurrentPos
        }));
    }

    onPlacesChanged = async place => {
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

    render() {
        const {
            workerList,
            loading,
            visibleCreate,
            optionListCity,
            loadingCity,
            loadingWorkerGroup,
            loadingCreate,
            pagination,
            loadingUserIdentity,
            optionListUserIdentity,
            visibleUpdate,
            optionListJob,
            loadingJob,
            dataRow,
            loadingUpdate,
            mapCenter,
            tempCurrentPos,
            accessRight,
            tenantList,
            loadingTenant,
            totalTenantAdded
        } = this.state;

        const paginationCus = { ...pagination, showSizeChanger: false };

        const columns = [
            {
                width: 1,
                render: (record) => (
                    <Popconfirm
                        title="Are you sure?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => this.onDelete(record.key)}
                    >
                        { (accessRight.includes('Delete')) ?
                            <Button
                                className="btn-delete"
                                type="danger"
                                icon={<CloseOutlined />}
                                size={'middle'}
                                loading={this.state.loadingDelete[record.key]}
                            />
                            : <></>
                        }
                    </Popconfirm>
                )
            },
            {
                title: 'Worker ID',
                dataIndex: 'userId',
                key: 'user_id',
                sorter: true,
            },
            {
                title: 'Name',
                dataIndex: 'userFullName',
                key: 'user_full_name',
                sorter: true,
            },
            {
                title: 'Email',
                dataIndex: 'userEmail',
                key: 'user_email',
                sorter: true,
            },
			{
				title: 'Role',
				dataIndex: 'roleName',
				key: 'role_name',
				sorter: true,
			},
			{
				title: 'Tenant',
				dataIndex: 'tenantDesc',
				key: 'tenantDesc',
				sorter: false,
			},
            {
                title: 'Role',
                dataIndex: 'roleName',
                key: 'role_name',
                sorter: true,
            },
            {
                title: 'Tenant',
                dataIndex: 'tenantDesc',
                key: 'tenantDesc',
                sorter: false,
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
                                onClick={() => this.showModalUpdate(record.key)}
                                loading={this.state.loadingRecord[record.key]}
                            />
                            : <></>
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
                            <Col xs={24} sm={24} md={6} lg={6} xl={6} style={{ textAlign: "center" }}>
                                <Space size={20}>
                                    <Title
                                        level={2}
                                        style={{
                                            display: 'inline-block',
                                            margin: '0'
                                        }}
                                    >
                                        Worker
                              </Title>
                                    {(accessRight.includes('Create')) ?
                                        <Button
                                            className="button-create"
                                            icon={<PlusOutlined />}
                                            type="primary"
                                            onClick={this.showModalCreate}
                                        >
                                            CREATE
                                </Button>
                                        : <></>
                                    }
                                    <ModalCreateEdit
                                        title="New Worker"
                                        visible={visibleCreate}
                                        buttonCancel={this.handleCancelCreate}
                                        isUpdate={false}
                                        onFinish={this.onCreate}
                                        city={optionListCity}
                                        loadingCity={loadingCity}
                                        jobList={optionListJob}
                                        searchSkill={val => this.searchSkill(val)}
                                        loadingJob={loadingJob}
                                        loadingWorkerGroup={loadingWorkerGroup}
                                        userIdentity={optionListUserIdentity}
                                        loadingUserIdentity={loadingUserIdentity}
                                        loading={loadingCreate}
                                        mapsVisible={this.handleMaps}
                                        mapView={this.state.visibleMaps}
                                        currentPos={this.state.currentPos}
                                        currentPosUpdate={this.state.currentPosUpdate}
                                        handleClickOk={this.handleClickOk}
                                        onMarkerDragEnd={this.onMarkerDragEnd}
                                        onPlacesChanged={this.onPlacesChanged}
                                        onClickMap={this.onClickMap}
                                        mapCenter={mapCenter}
                                        onCancelMaps={this.onCancelMaps}
                                        tempCurrentPos={tempCurrentPos}
                                        searchCity={val => this.searchCity(val)}
                                        tenantList={tenantList}
                                        loadingTenant={loadingTenant}
                                        searchTenant={val => this.searchTenant(val)}
                                        totalTenantAdded={totalTenantAdded}
                                    // addTenant={val => {
                                    //     totalTenantAdded.push(val);
                                    //     this.setState({ totalTenantAdded }, () => console.log('totalTenantAdded : ', totalTenantAdded));
                                    // }}
                                    />
                                    <ModalCreateEdit
                                        title="Edit Worker"
                                        visible={visibleUpdate}
                                        isUpdate={true}
                                        buttonCancel={this.handleCancelUpdate}
                                        onFinish={values => {
                                            this.onUpdate(values)
                                        }}
                                        city={optionListCity}
                                        loadingCity={loadingCity}
                                        jobList={optionListJob}
                                        loadingJob={loadingJob}
                                        loadingWorkerGroup={loadingWorkerGroup}
                                        userIdentity={optionListUserIdentity}
                                        loadingUserIdentity={loadingUserIdentity}
                                        data={dataRow}
                                        loading={loadingUpdate}
                                        mapsVisible={this.handleMapsUpdate}
                                        mapView={this.state.visibleMapsUpdate}
                                        currentPos={this.state.currentPos}
                                        currentPosUpdate={this.state.currentPosUpdate}
                                        handleClickOk={this.handleClickOk}
                                        onMarkerDragEnd={this.onMarkerDragEnd}
                                        onPlacesChanged={this.onPlacesChanged}
                                        onClickMap={this.onClickMap}
                                        mapCenter={mapCenter}
                                        onCancelMaps={this.onCancelMaps}
                                        tempCurrentPos={tempCurrentPos}
                                        searchCity={val => this.searchCity(val)}
                                        tenantList={tenantList}
                                        loadingTenant={loadingTenant}
                                        searchTenant={val => this.searchTenant(val)}
                                        totalTenantAdded={totalTenantAdded}
                                    // addTenant={val => {
                                    //     totalTenantAdded.push(val);
                                    //     this.setState({ totalTenantAdded }, () => console.log('totalTenantAdded : ', totalTenantAdded));
                                    // }}
                                    />
                                </Space>
                            </Col>
                            <Col xs={24} sm={24} md={{ span: 8, offset: 10 }} lg={{ span: 7, offset: 11 }} xl={{ span: 7, offset: 11 }} style={{ textAlign: "right" }}>
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
                                        dataSource={workerList}
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

export default withRouter(MasterDataWorker);
