import React from "react";
import { Layout, Row, Col, Typography, Card, Button, Modal, Input, Table, Avatar, notification } from "antd";
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
// import 'leaflet/dist/leaflet.css';
import { Pie } from 'react-chartjs-2';
// import { Map, Popup, TileLayer, Marker } from "react-leaflet";
// import L from "leaflet";
import { FSMServices } from "../../service";
import { withRouter } from "react-router-dom";
import _debounce from 'lodash.debounce';
import { GlobalFunction } from "../../global/function";
import MapMonitoring from "../MasterData/GoogleMaps/monitoring";
import { Marker, InfoWindow } from "react-google-maps";
import PermissionDenied from '../../global/permissionDenied'
import Cookies from 'js-cookie'

const { Content } = Layout;
// const iconPerson = new L.icon({
//     iconUrl: require("../../../assets/iconPerson.png"),
//     iconRetinaUrl: null,
//     shadowUrl: null,
//     shadowSize: null,
//     shadowAnchor: null,
//     iconSize: new L.Point(40, 40),
// })

class Monitoring extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"

        this.state = {
            mapCenter: {
                lat: null,
                lng: null
            },
            zoom: 13,
            visible: false,
            loading: true,
            technicianAvaibility: [],
            technicianStatus: [],
            technicianWorkerStandBy: [],
            assigmentPosition: [],
            standByPosition: [],
            onDutyPosition: [],
            search: "",
            sort: "user_id,asc",
            pagination: {
                current: 1,
                pageSize: 10,
            },
            icon:require("../../../assets/iconPerson.png"),
            nameMarkerActive: null,
            latMarkerActive: 0,
            lngMarkerActive: 0,
            statusMarkerActive: null,
            visibleInfoWindowStandByPosition: [],
            visibleInfoWindowOnDutyPosition: [],
            visibleInfoWindowAssigmentPosition: [],
            accessRight: '',
            usersMarkerActive: []
        }
        this.link = React.createRef();
    }

    onMarkerClick = (users, lat, lng, i, typeVisible) => {
        let visibleInfoWindowStandByPosition = [];
        let visibleInfoWindowOnDutyPosition = [];
        let visibleInfoWindowAssigmentPosition = [];

        if (typeVisible === "visibleInfoWindowStandByPosition") {
            if (this.state[typeVisible][i] === false || this.state[typeVisible][i] === undefined) {
                visibleInfoWindowStandByPosition[i] = true;
            } else {
                visibleInfoWindowStandByPosition[i] = false;
            }
        } else if (typeVisible === "visibleInfoWindowOnDutyPosition") {
            if (this.state[typeVisible][i] === false || this.state[typeVisible][i] === undefined) {
                visibleInfoWindowOnDutyPosition[i] = true;
            } else {
                visibleInfoWindowOnDutyPosition[i] = false;
            }
        } else {
            if (this.state[typeVisible][i] === false || this.state[typeVisible][i] === undefined) {
                visibleInfoWindowAssigmentPosition[i] = true;
            } else {
                visibleInfoWindowAssigmentPosition[i] = false;
            }
        }

        var listUsersMarkerActive = ""

        for (var i = 0; i < users.length; i++) {
          listUsersMarkerActive = ( listUsersMarkerActive == "" ) ? listUsersMarkerActive + `${users[i].name} - ${users[i].status}` : listUsersMarkerActive + `${'\n'}${users[i].name} - ${users[i].status}`
        }

        this.setState({
            latMarkerActive: lat,
            lngMarkerActive: lng,
            usersMarkerActive: users,
            listUsersMarkerActive: listUsersMarkerActive,
            visibleInfoWindowStandByPosition: visibleInfoWindowStandByPosition,
            visibleInfoWindowOnDutyPosition: visibleInfoWindowOnDutyPosition,
            visibleInfoWindowAssigmentPosition: visibleInfoWindowAssigmentPosition,
        });
    }

    onPlacesChanged = place => {
        place.map(res => {
            this.setState({
                mapCenter: {
                    lat: res.geometry.location.lat(),
                    lng: res.geometry.location.lng()
                }
            });
            return null;
        })
    }

    componentDidMount() {
        this.getTechnicianStatus();
        this.getTechnicianWorkerStandBy(
            this.state.pagination.current,
			      this.state.pagination.pageSize,
            this.state.sort,
            this.state.search
        );
        this.getTechnicianAvaibility();
        this.getTechnicianPosition();
        if (navigator.geolocation) {
            this.getCurrentPosition();
        }
        setTimeout(() => this.setState({accessRight: sessionStorage.getItem("accessRight")}),500);
    }

    async getTechnicianWorkerStandBy(page, size, sort, search) {
        this.setState({
          loading: true
        });
        let listTemp = [];
        await FSMServices.getTechnicianWorkerStandBy(page, size, sort, search)
        .then(res => {
            listTemp = res ? res.data.Data : [];
            this.setState({
                pagination: {
					...this.state.pagination,
					total: res ? res.data.totalListStandby : []
				}
            });
        });
        this.setState({
            technicianWorkerStandBy: listTemp.map(item => {
                return {
                    key: item.userId,
                    photo: item.userImage,
                    user_full_name: item.userName,
                    user_email: item.userEmail,
                    mobile_phone: item.mobilePhone,
                    worker_status: item.workerStatus,
                    //description: item.,
                }
            }),
            loading: false
        });
    }

    donwloadCSVStandBy = () => {
        FSMServices.downloadCSVStandBy().then(res => {
            if ( res ? res.status === 200 : false ) {
                this.setState({
                    link: res && res.data && res.data.Link ? res.data.Link : ""
                }, () => {
                    window.open(this.state.link, "_self")
                })
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: res.data.Message ? res.data.Message : 'Download Failed'
                });
            }
        })
    }

    donwloadExcelStandBy = () => {
        FSMServices.downloadExcelStandBy().then(res => {
            if ( res ? res.status === 200 : false ) {
                this.setState({
                    link: res && res.data && res.data.Link ? res.data.Link : ""
                }, () => {
                    window.open(this.state.link, "_self")
                })
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: res.data.Message ? res.data.Message : 'Download Failed'
                });
            }
        })
    }

    donwloadPDFStandBy = () => {
        FSMServices.downloadPDFStandBy().then(res => {
            if ( res ? res.status === 200 : false ) {
                this.setState({
                    link: res && res.data && res.data.Link ? res.data.Link : ""
                }, () => {
                    window.open(this.state.link, "_self")
                })
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: res.data.Message ? res.data.Message : 'Download Failed'
                });
            }
        })
    }

    // search handler
    searchHandler(e) {
        let key = e.target.value;
        this.processSearchStandByList(key);
    }

    processSearchStandByList = _debounce(key => {
        this.setState({
            search: GlobalFunction.searchEncode(key),
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.getTechnicianWorkerStandBy(
                this.state.pagination.current,
				this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            );
        });
    }, 500)

    // Table Change
    handleTableChange = (pagination, filters, sorter) => {
        if (sorter.order === "ascend") {
            sorter.order = "asc";
        } else if (sorter.order === "descend") {
            sorter.order = "desc";
        }

        this.setState({
            sort: `${sorter.order ? `${sorter.columnKey},${sorter.order}` : 'user_id,asc'}`,
            pagination: pagination
        }, () => {
            this.getTechnicianWorkerStandBy(
                this.state.pagination.current,
				this.state.pagination.pageSize,
                this.state.sort,
                this.state.search
            );
        });
    };

    getTechnicianAvaibility() {
        this.setState({
          loading: true
        })
        FSMServices.getTechnicianAvaibility()
        .then(res => {
          this.setState({
            technicianAvaibility: res ? res.data.Data : [],
            loading: false
          })
        })
      }

    getTechnicianStatus() {
        this.setState({
          loading: true
        })
        FSMServices.getTechnicianStatus()
        .then(res => {
          this.setState({
            technicianStatus: res ? res.data.Data : [],
            loading: false
          })
        })
      }

      getTechnicianPosition(){
        this.setState({
            loading: true
        });
        let tempAssigment=[]
        let tempStandBy=[]
        let tempOnDuty=[]
        let dataTempStandBy=[]
        let dataTempOnDuty=[]
        let dataTempAssigment=[]
        FSMServices.getTechnicianPosition()
        .then(res => {
            dataTempStandBy= res ? res.data.Data : []
            dataTempStandBy.map(item =>(
                tempStandBy.push({
                    userLatitude: item.userLatitude ? item.userLatitude:0,
                    userLongitude: item.userLongitude ? item.userLongitude:0,
                    users: item.users ? item.users : []
                })
            ))
            dataTempOnDuty= []
            dataTempOnDuty.map(item =>(
                tempOnDuty.push({
                    userLatitude: item.userLatitude ? item.userLatitude:0,
                    userLongitude: item.userLongitude ? item.userLongitude:0,
                    users: item.users ? item.users : []
                })
            ))
            dataTempAssigment= []
            dataTempAssigment.map(item =>(
                tempOnDuty.push({
                    userLatitude: item.userLatitude ? item.userLatitude:0,
                    userLongitude: item.userLongitude ? item.userLongitude:0,
                    users: item.users ? item.users : []
                })
            ))
          this.setState({
            assigmentPosition: tempAssigment,
            standByPosition: tempStandBy,
            onDutyPosition: tempOnDuty,
            loading: false
          })
        })
    }

    getCurrentPosition(){
        navigator.geolocation.getCurrentPosition(position => {
            this.setState({
                mapCenter: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }
            })
        });
    }

    handleShowModal = () => {
        this.setState({
            visible: !this.state.visible,
        });
    };

    render() {
        const {loading, technicianAvaibility, technicianStatus,
            technicianWorkerStandBy, assigmentPosition, standByPosition,
            onDutyPosition, pagination, mapCenter,
            visibleInfoWindowStandByPosition, visibleInfoWindowOnDutyPosition,
            visibleInfoWindowAssigmentPosition, accessRight, usersMarkerActive } = this.state

        const paginationCus = { ...pagination, showSizeChanger: false }

        const columns = [
            {
                title: 'PHOTO',
                dataIndex: 'photo',
                key: 'photo',
                render: (photo, record) =>
                <Avatar shape="square" size={64} src={record.photo} icon={<UserOutlined />} ></Avatar>
            },
            {
                title: 'WORKER NAME',
                dataIndex: 'user_full_name',
                key: 'user_full_name',
                sorter: true
            },
            {
                title: 'EMAIL',
                dataIndex: 'user_email',
                key: 'user_email',
                sorter: true
            },
            {
                title: 'MOBILE PHONE',
                dataIndex: 'mobile_phone',
                key: 'mobile_phone',
                sorter: true
            },
            {
                title: 'WORKER STATUS',
                dataIndex: 'worker_status',
                key: 'worker_status',
            },
            {
                title: 'DESCRIPTION',
                dataIndex: 'description',
                key: 'description',
            }
        ];

        const dataTechnisianAvaibility = {
            labels: [
                'Available',
                'Off'
            ],
            datasets: [{
                data: [technicianAvaibility.Avaiable, technicianAvaibility.Off],
                backgroundColor: [
                    '#78CA6B',
                    '#E946A8'
                ],
                hoverBackgroundColor: [
                    'rgb(101, 185, 88)',
                    'rgb(212, 64, 153)'
                ]
            }]
        };

        const dataTechnisianStatus = {
            labels: [
                'Assignment',
                'On-Duty',
                'Standby'
            ],
            datasets: [{
                data: [technicianStatus.Assigment, technicianStatus.OnDuty, technicianStatus.StandBy],
                backgroundColor: [
                    '#41CBF6',
                    '#E88224',
                    '#F05379'
                ],
                hoverBackgroundColor: [
                    'rgb(59, 179, 216)',
                    'rgb(209, 118, 32)',
                    'rgb(216, 74, 109)'
                ]
            }]
        };

        return (
            <Content>
              { accessRight.includes('Read') || accessRight == "" ?
                <Row style={{ marginTop: "150px" }}>
                    <Col xs={{ span: 20, offset: 2 }} sm={{ span: 20, offset: 2 }} md={{ span: 22, offset: 1 }} lg={{ span: 13, offset: 2 }} xl={{ span: 13, offset: 2 }}>
                        <Typography.Title
                            level={2}
                            style={{
                                margin: 0,
                            }}
                        >
                            Monitoring
                        </Typography.Title>
                        <hr style={{ width: '100%', margin: 0, marginBottom: 10 }} />

                        {/* Gmaps */}
                        <MapMonitoring
                            center={mapCenter}
                            onPlacesChanged={this.onPlacesChanged}
                        >
                            <Marker position={mapCenter} />
                            {standByPosition.map( (marker, i) => (
                                <Marker
                                    onClick={() => this.onMarkerClick(marker.users, marker.userLatitude, marker.userLongitude, i, "visibleInfoWindowStandByPosition")}
                                    position={{ lat: marker.userLatitude, lng: marker.userLongitude }}
                                    icon={{
                                        url: this.state.icon
                                    }}
                                >
                                    {
                                        visibleInfoWindowStandByPosition[i] &&
                                        <InfoWindow
                                            position={{ lat: this.state.latMarkerActive, lng: this.state.lngMarkerActive }}
                                            onCloseClick={() => this.onMarkerClick([], null, null, i, "visibleInfoWindowStandByPosition")}
                                        >
                                            <p>
                                              { usersMarkerActive.map( (user) => (
                                                <p>
                                                  {user.name + ' - ' + user.Status}
                                                </p>
                                              ))}
                                            </p>
                                        </InfoWindow>
                                    }
                                </Marker>
                            ))}
                        </MapMonitoring>
                        {/* End */}

                        {/* <Map
                            center={positionCenter}
                            zoom={this.state.zoom}
                            style={{
                                width: '100%',
                                height: '540px',
                                borderRadius: '15px',
                                margin: '0 auto'
                            }}
                        >
                            <TileLayer
                                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {standByPosition.map(marker => (
                            <Marker position={[-6.9198306, 107.6071227]} icon={iconPerson} onclick={()=> console.log("Clicked")}>
                                <Popup>
                                    {marker.name} <br /> {marker.status}
                                </Popup>
                            </Marker>
                            ))}
                            {onDutyPosition.map(marker => (
                            <Marker position={[marker.userLatitude, marker.userLongitude]} icon={iconPerson} onclick={()=> console.log("Clicked")}>
                                <Popup>
                                    {marker.name} <br /> {marker.status}
                                </Popup>
                            </Marker>
                            ))}
                            {assigmentPosition.map(marker => (
                            <Marker position={[marker.userLatitude, marker.userLongitude]} icon={iconPerson} onclick={()=> console.log("Clicked")}>
                                <Popup>
                                    {marker.name} <br /> {marker.status}
                                </Popup>
                            </Marker>
                            ))}
                        </Map> */}
                    </Col>
                    <Col xs={{ span: 22, offset: 1 }} sm={{ span: 22, offset: 1 }} md={{ span: 24,offset: 0 }} lg={{ span: 7, offset: 1 }} xl={{ span: 7, offset: 1 }}>
                        <Row>
                            <Col xs={{ span: 22, offset: 1 }} sm={{ span: 22, offset: 1 }} md={10} lg={24} xl={24}>
                                <Typography.Title
                                    level={2}
                                    style={{
                                        margin: 0,
                                    }}
                                >
                                    Technician Avaibility


                                </Typography.Title>

                                <hr style={{ width: '80%', margin: 0, marginBottom: 10 }} />
                                <Card
                                    style={{
                                        backgroundColor: "#EEE",
                                        borderRadius: "15px"
                                    }}
                                >
                                    <Pie
                                        data={dataTechnisianAvaibility}
                                        height={170}
                                    />
                                </Card>
                            </Col>
                            <Col xs={{ span: 22, offset: 1 }} sm={{ span: 22, offset: 1 }} md={{span: 10, offset: 1}} lg={24} xl={24}>
                                <Typography.Title
                                    level={2}
                                    style={{
                                        margin: 0,
                                    }}
                                >
                                    Technician Status
                                </Typography.Title>
                                <hr style={{ width: '80%', margin: 0, marginBottom: 10 }} />
                                <Card
                                    style={{
                                        backgroundColor: "#EEE",
                                        borderRadius: "15px"
                                    }}
                                >
                                    <Pie
                                        data={dataTechnisianStatus}
                                        height={170}
                                    />
                                    <Button type="primary" shape="round" className="button-standbyList" onClick={this.handleShowModal}>
                                        Standby List
                                    </Button>
                                    <Modal
                                        visible={this.state.visible}
                                        footer={false}
                                        onCancel={this.handleShowModal}
                                        width='90%'
                                        centered
                                    >
                                        <Row>
                                            <Col span={24}>
                                                <Typography.Title level={2} style={{ fontWeight: 'normal', margin: 0 }}>
                                                    Worker List
                                                </Typography.Title>
                                                <hr />
                                            </Col>
                                        </Row>
                                        <Row gutter={[0, 10]}>
                                            <Col className="gutter-row" style={{ overflow: 'auto' }} xs={24} sm={24} md={15} lg={14}>
                                                <div style={{ minWidth: '400px'}}>
                                                    <Button
                                                        shape="round"
                                                        className="button-modal-standByList"
                                                    >
                                                        Copy
                                                    </Button>
                                                    <Button
                                                        shape="round"
                                                        className="button-modal-standByList"
                                                        onClick={this.donwloadCSVStandBy}
                                                    >
                                                        CSV
                                                    </Button>
                                                    <Button
                                                        shape="round"
                                                        className="button-modal-standByList"
                                                        onClick={this.donwloadExcelStandBy}
                                                    >
                                                        Excel
                                                    </Button>
                                                    <Button
                                                        shape="round"
                                                        className="button-modal-standByList"
                                                        onClick={this.donwloadPDFStandBy}
                                                    >
                                                        PDF
                                                    </Button>
                                                </div>
                                            </Col>
                                            <Col className="gutter-row" xs={24} sm={24} md={9} lg={{ span: 5, offset: 5 }}>
                                                <Input
                                                    prefix={<SearchOutlined />}
                                                    className="input-search-monitoring"
                                                    placeholder="Search.."
                                                    onChange={(e) => this.searchHandler(e)}
                                                    />
                                            </Col>
                                        </Row>
                                        <Row style={{ marginTop: 25 }}>
                                            <Col span={24}>
                                                <Table
                                                    columns={columns}
                                                    dataSource={technicianWorkerStandBy}
                                                    scroll={{x:1100}}
                                                    pagination={paginationCus}
                                                    onChange={this.handleTableChange}
                                                    loading={loading}
                                                />
                                            </Col>
                                        </Row>
                                    </Modal>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                :
                <Row style={{ marginTop: "150px" }}>
                  <Col span={24}>
                    <PermissionDenied />
                  </Col>
                </Row>
              }
            </Content >
        );
    }
}

export default withRouter(Monitoring);

// export default withRouter(Monitoring)
