import React from "react";
import { withRouter, NavLink } from "react-router-dom";
import { Layout, Typography, Row, Col, Button, Card, Space, Table, Select, Avatar, Input } from "antd";
import { FileDoneOutlined, CalendarOutlined, SearchOutlined } from '@ant-design/icons';
import { FSMServices } from "../../service";
import _debounce from 'lodash.debounce';
import { GlobalFunction } from '../../global/function';
import moment from 'moment';
import ModalCreateEdit from '../MasterData/Worker/modal';
import PermissionDenied from '../../global/permissionDenied'
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const dateFormat = 'dddd, DD/MM/YYYY';

const now = moment();
const dow = now.day() - 1;
const eow = 6 - dow;
const firstday = moment().subtract(dow, "days").format("YYYY-MM-DD");
const lastday = moment().add(eow, "days").format("YYYY-MM-DD");
const year = now.format('YYYY');
const month = now.format('MM');
const dayOfMonth = moment().daysInMonth();
const firstDayofMonth = moment(year + "-" + month + "-01").format('YYYY-MM-DD')
const lastDayofMonth = moment(year + "-" + month + "-" + dayOfMonth).format('YYYY-MM-DD')

class Workload extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"

        this.state = {
            loading: false,
            dayType: 1,
            dataRow: [],
            workloadList: [],
            sort: "task desc",
            search: "",
            pagination: {
                current: 1,
                pageSize: 10,
            },
            loadingRecord: [],
            visibleDetail: false,
            currentPos: null,
            mapCenter: null,
            tempCurrentPos: null,
            accessRight: '',
            tenantList: []
        }
    }

    componentDidMount() {
        this.getOptionListCity();
        this.getOptionListWorkerGroup();
        this.getOptionListUserIdentity();
        this.getOptionListJob();
        this.getOptionListTenant('');
        if (navigator.geolocation) {
            this.getCurrentPosition();
        }

        this.setState({
            userIdAkun: this.props.userId
        })
        setTimeout(() => this.setState({accessRight: sessionStorage.getItem("accessRight")}),500);
    }

    componentWillMount() {
        this.getWorkload(
            this.state.pagination.current - 1,
            this.state.pagination.pageSize,
            this.state.sort,
            this.state.search,
            'today'
        )
    }

    // get list api
    async getWorkload(page, size, sort, search, time) {
        this.setState({
            loading: true,
        })
        let listTemp = [];
        await FSMServices.getWorkloadTask(page, size, sort, search, time)
            .then(res => {
                listTemp = res && res.data && res.data.data ? res.data.data : [];
                this.setState({
                    pagination: {
                        ...this.state.pagination,
                        total: res && res.data && res.data.totalData ? res.data.totalData : 0
                    }
                }, () => {
                    this.setState({
                        workloadList: listTemp.map(item => {
                            return {
                                ...item,
                                task: item.workerTotalTask
                            }
                        }),
                        loading: false
                    }, () => console.log('data : ', this.state.workloadList));
                });
            });
    }

    searchHandler(e) {
        let key = e.target.value;
        this.processSearchWorkload(key);
    }

    processSearchWorkload = _debounce((key) => {
        this.setState({
            search: GlobalFunction.searchEncode(key),
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.getWorkload(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search,
                this.state.dayType === 1 || this.state.dayType === 'today' ? 'today' : this.state.dayType === 'week' ? 'week' : 'month'
            )
        });
    }, 500)


    handleChange(value) {
        let type = value === 1 ? 'today' : value === 2 ? 'week' : 'month';
        this.setState({ dayType: type }, () => {
            this.getWorkload(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search,
                this.state.dayType
            )
        });
    }

    handleTableChange = (pagination, search, sorter) => {
        if (sorter.order === "ascend") {
            sorter.order = "asc";
        } else if (sorter.order === "descend") {
            sorter.order = "desc";
        }

        this.setState({
            sort: `${sorter.order ? `${sorter.columnKey} ${sorter.order}` : `task desc`}`,
            pagination: pagination
        }, () => {
            this.getWorkload(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search,
                this.state.dayType === 1 || this.state.dayType === 'today' ? 'today' : this.state.dayType === 'week' ? 'week' : 'month'
            );
        });
    };

    showModalWorker = async workerId => {
        let loading = this.state.loadingRecord;
        loading[workerId] = true;
        this.setState({ loadingRecord: loading });
        await FSMServices.getWorkerDetail(workerId).then(res => {
            this.setState({
                dataRow: res ? res.data.Data : [],
                visibleDetail: true,
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

    handleCloseModalWorker = e => {
        this.setState({ visibleDetail: false });
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

    async getOptionListJob() {
        this.setState({ loadingJob: true })
        await FSMServices.getOptionListJob('').then(res => {
            let temp =
                res &&
                    res.data &&
                    res.data.Data ?
                    res.data.Data : []
            let data = temp.map(item => {
                return {
                    value: item.jobId,
                    label: item.jobName
                }
            })
            this.setState({
                optionListJob: data
            });
        })
        this.setState({ loadingJob: false })
    }

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

    render() {
        const optionList = [
            {
                key: 1,
                name: 'Today'
            },
            {
                key: 2,
                name: 'This Week'
            },
            {
                key: 3,
                name: 'This Month'
            },
        ]

        const {
          loading,
          workloadList,
          pagination,
          visibleDetail,
          dataRow,
          mapCenter,
          tempCurrentPos,
          optionListCity,
          loadingCity,
          loadingWorkerGroup,
          loadingUserIdentity,
          optionListUserIdentity,
          loadingJob,
          optionListJob,
          accessRight,
          tenantList
         } = this.state

        const paginationCus = { ...pagination, showSizeChanger: false }

        const columns = [
            {
                title: '',
                dataIndex: 'workerImagePath',
                key: 'workerImagePath',
                width: 50,
                render: workerImagePath => (
                    <Avatar src={workerImagePath ? workerImagePath : 'https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png'} />
                ),
            },
            {
                title: 'Worker Name',
                key: 'workerFullName',
                ellipsis: true,
                sorter: true,
                render: (record) => (
                  <Button
                      type={'link'}
                      loading={this.state.loadingRecord[record.key]}
                      onClick={() => this.showModalWorker(record.workerId)}
                  >
                    {record.workerFullName}
                  </Button>
                )
            },
            {
                title: `Total Task / ${this.state.dayType == 1 || this.state.dayType == "today" ? 'Day' : this.state.dayType == "week" ? 'Week' : 'Month'}`,
                dataIndex: 'task',
                key: 'task',
                sorter: true,
            },
            {
                title: 'Primary Area',
                dataIndex: 'workerPrimaryAreaName',
                key: 'workerPrimaryAreaName',
                ellipsis: true,
                sorter: true,
            },
            {
                title: 'Secondary Area',
                dataIndex: 'workerSecondaryAreaName',
                key: 'workerSecondaryAreaName',
                ellipsis: true,
                sorter: true,
            },
        ];
        return (
            <Content className="content">
              { (accessRight.includes('Read')) || accessRight == "" ?
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
                                Workload Management - Task
                            </Title>
                        </Space>
                    </Col>
                    <Col offset={4} md={3}>
                        <NavLink to="/workload-calendar">
                            <Button
                                className="button-calendar"
                                icon={<CalendarOutlined />}
                                type="primary"
                            >
                                Calendar
                            </Button>
                        </NavLink>
                    </Col>
                    <Col offset={1} md={4}>
                        <Select defaultValue={1} className="select-work-day" onChange={this.handleChange.bind(this)}>
                            {
                                optionList.map(function (item) {
                                    return (
                                        <Option key={item.key} value={item.key}>
                                            {item.name}
                                        </Option>
                                    );
                                })
                            }
                        </Select>
                    </Col>
                    <ModalCreateEdit
                        title="Detail Worker"
                        visible={visibleDetail}
                        isUpdate={true}
                        buttonCancel={this.handleCloseModalWorker}
                        onFinish={null}
                        city={optionListCity}
                        loadingCity={loadingCity}
                        jobList={optionListJob}
                        loadingJob={loadingJob}
                        loadingWorkerGroup={loadingWorkerGroup}
                        userIdentity={optionListUserIdentity}
                        loadingUserIdentity={loadingUserIdentity}
                        data={dataRow}
                        loading={false}
                        mapsVisible={null}
                        mapView={false}
                        currentPos={this.state.currentPos}
                        currentPosUpdate={this.state.currentPosUpdate}
                        handleClickOk={null}
                        onMarkerDragEnd={null}
                        onPlacesChanged={null}
                        onClickMap={null}
                        mapCenter={mapCenter}
                        onCancelMaps={null}
                        tempCurrentPos={tempCurrentPos}
                        searchCity={null}
                        tenantList={tenantList}
                    />
                </Row>
                : <></>
              }
              { (accessRight.includes('Read')) || accessRight == "" ?
                <Row style={{ marginBottom: 10 }}>
                    <Col span={24}>
                        <Card
                            bordered={false}
                            className="card-master-data"
                        >
                            <Row>
                                <Col span={12}>
                                    <Input
                                      className="input-search"
                                      placeholder="Search..."
                                      onChange={ e => this.searchHandler(e) }
                                      style={{
                                          width: '250px',
                                          maxWidth: '80%',
                                          marginRight: '10px',
                                          border: '1px solid rgba(0, 0, 0, 0.85)',
                                          boxShadow: 'none'
                                      }}
                                      prefix={<SearchOutlined />}
                                    />
                                </Col>
                                <Col span={12} style={{ textAlign: 'right' }}>
                                    {this.state.dayType == 'today' || this.state.dayType == 1 ?
                                        <strong>{moment(new Date()).format(dateFormat)}</strong>
                                        : this.state.dayType == 'week' ?
                                        <strong>{moment(firstday).format(dateFormat)} - {moment(lastday).format(dateFormat)}</strong>
                                        :
                                        <strong>{moment(firstDayofMonth).format("MMMM, YYYY")}</strong>
                                    }
                                </Col>
                            </Row>
                            <br />
                            <Table
                                columns={columns}
                                dataSource={workloadList}
                                loading={loading}
                                pagination={paginationCus}
                                onChange={this.handleTableChange}
                                size="middle"
                            />
                        </Card>
                    </Col>
                </Row>
                :<PermissionDenied />
              }
            </Content>
        );
    }
}

export default withRouter(Workload);
