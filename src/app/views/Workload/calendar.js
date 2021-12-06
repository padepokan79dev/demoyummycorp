import React from "react";
import { withRouter, NavLink } from "react-router-dom";
import { Layout, Typography, Row, Col, Button, Card, Space, Table, Select, Avatar, Tag, DatePicker, Pagination, Modal, Spin, Input } from "antd";
import { FileDoneOutlined, CalendarOutlined, TagFilled, SearchOutlined } from '@ant-design/icons';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import ModalCreateEdit from '../MasterData/Worker/modal';
import { FSMServices } from "../../service";
import _debounce from 'lodash.debounce';
import { GlobalFunction } from '../../global/function';
import moment from 'moment';
import PermissionDenied from '../../global/permissionDenied'

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const dateFormat = 'dddd, DD/MM/YYYY';
const startColor = '#4e8ed0';
const confirmedColor = '#4faf61';
const offColor = '#ee6566';
const finishColor = '#365f88';
const reportedColor = '#a73d3e';
const confirmReportedColor = '#d742f5';

class WorkloadCalendar extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"

        this.state = {
            loading: false,
            loadingDetail: false,
            modalDetail: false,
            modalDetailMonth:false,
            dayType: 1,
            dataRow: [],
            workloadList: [],
            sort: "task desc",
            search: "",
            pagination: {
                current: 1,
                pageSize: 10,
            },
            date: new Date(),
            dateString: new Date(),
            detailData: {},
            timeDetail: [],
            loadingDetailCalender: false,
            modalDetailCalender: false,
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
            'today',
            this.state.date
        )
    }

    // get list api
    async getWorkload(page, size, sort, search, time, date) {
        this.setState({
            loading: true,
        })
        let listTemp = [];
        await FSMServices.getWorkloadCalendar(page, size, sort, search, time, date)
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
                                task: item.workerTotalTask,
                                workerFullName: item.workerFullName,
                            }
                        }),
                        loading: false
                    }, () => console.log('data : ', this.state.workloadList));
                });
            });
    }

    searchHandler(e) {
        let key = e.target.value;
        this.setState({
          search: GlobalFunction.searchEncode(key),
        })
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
                this.state.dayType === 1 || this.state.dayType === 'today' ? 'today' : this.state.dayType === 'week' ? 'week' : 'today',
                this.state.date
            )
        });
    }, 500)

    onChangePage(page, pageSize) {
        this.setState({
            pagination: {
                ...this.state.pagination,
                current: page
            }
        }, () => {
            this.getWorkload(
                page - 1,
                pageSize,
                this.state.sort,
                this.state.search,
                this.state.dayType === 1 || this.state.dayType === 'today' ? 'today' : this.state.dayType === 'week' ? 'week' : 'today',
                this.state.date
            )
        })
    }

    handleChange(value) {
        let type = value === 1 ? 'today' : value === 2 ? 'week' : 'month';
        this.setState({ dayType: type, date: new Date(), dateString: new Date() }, () => {
            this.getWorkload(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search,
                this.state.dayType,
                this.state.date
            )
        });
    }

    onChange(date, dateString) {
        console.log(JSON.stringify(date));
        this.setState({ date: date, dateString: dateString }, () => {
            console.log('date : ', date);
            console.log('dateString : ', dateString);
            this.getWorkload(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search,
                this.state.dayType === 1 || this.state.dayType === 'today' ? 'today' : this.state.dayType === 'week' ? 'week' : 'today',
                date
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
            pagination: this.state.pagination
        }, () => {
            this.getWorkload(
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort,
                this.state.search,
                this.state.dayType === 1 || this.state.dayType === 'today' ? 'today' : this.state.dayType === 'week' ? 'week' : 'today',
                this.state.date
            );
        });
    };

    async getDetail(orderId) {
        await FSMServices.getDetailWorkload(orderId)
            .then(res => {
                if (res && res.data) {
                    this.setState({ detailData: res.data }, () => {
                        if (this.state.dayType == "month"){
                          this.setState({ modalDetailMonth: true })
                        } else {
                          this.setState({ modalDetail: true })
                        }
                    })
                }
            }).catch(error => {
                this.setState({ modalDetail: false })
                console.log('error : ', error);
            });
    }

    async getDetailWeek(workerId, date) {
        await FSMServices.getDetailWorkloadWeek(workerId, date)
            .then(res => {
                if (res && res.data) {
                    this.setState({ detailData: res.data, timeDetail: res.data && res.data.workloadCalenderDetail ? res.data.workloadCalenderDetail : [] }, () => {
                        this.setState({ modalDetail: true })
                        console.log('timeDetail : ', this.state.timeDetail)
                    })
                }
            }).catch(error => {
                this.setState({ modalDetail: false })
                console.log('error : ', error);
            });
    }

    handleDateClick = (arg) => {
      var dateSelected = moment(arg.date, dateFormat)
      var dateString = moment(arg.date).format(dateFormat)
      this.setState({ date: dateSelected, dateString: dateString, modalDetailCalender: true }, () => {
          console.log('date : ', dateSelected);
          console.log('dateString : ', dateString);
          this.getWorkload(
              this.state.pagination.current - 1,
              this.state.pagination.pageSize,
              this.state.sort,
              this.state.search,
              this.state.dayType === 1 || this.state.dayType === 'today' ? 'today' : this.state.dayType === 'week' ? 'week' : 'today',
              dateSelected
          )
      });
    }

    handleModalDetailCalender = e => {
        this.setState({ modalDetailCalender: false })
    }

    showModalWorker = async workerId => {
        let loading = this.state.loadingRecord;
        loading[workerId] = true;
        this.setState({ loadingRecord: loading });
        await FSMServices.getWorkerDetail(workerId).then(res => {
            this.setState({
                dataRow: res ? res.data.Data : [],
                visibleDetail: (this.state.dayType == "month")? false : true,
                visibleDetailMonth: (this.state.dayType == "month")? true : false,
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
        this.setState({
          visibleDetail: false,
          visibleDetailMonth: false
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
          dayType,
          visibleDetail,
          visibleDetailMonth,
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
        ];
        return (
            <Content className="content">
              { accessRight.includes('Read') || accessRight == "" ?
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
                                  Workload Management - Calendar
                              </Title>
                          </Space>
                      </Col>
                      <Col offset={5} md={2}>
                          <NavLink to="/workload">
                              <Button
                                  className="button-task"
                                  icon={<FileDoneOutlined />}
                                  type="primary"
                              >
                                  Task
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
                  <Row style={{ marginBottom: 10, alignItems: 'center', display: dayType === "month" ? 'none' : '' }}>
                      <Col span={6}>
                        <Input
                          className="input-search"
                          placeholder="Search..."
                          onChange={ e => this.searchHandler(e) }
                          style={{
                              width: '250px',
                              maxWidth: '80%',
                              marginRight: '10px'
                          }}
                          prefix={<SearchOutlined />}
                          value={this.state.search}
                        />
                      </Col>
                      <Col span={2}>
                          <Text><strong>Legend : </strong></Text>
                      </Col>
                      <Col span={2}>
                          <Tag color={startColor} style={{ height: '10px' }} />
                          <Text>Start</Text>
                      </Col>
                      <Col span={3}>
                          <Tag color={confirmedColor} style={{ height: '10px' }} />
                          <Text>Confirmed</Text>
                      </Col>
                      <Col span={2}>
                          <Tag color={offColor} style={{ height: '10px' }} />
                          <Text>Off</Text>
                      </Col>
                      <Col span={2}>
                          <Tag color={finishColor} style={{ height: '10px' }} />
                          <Text>Finish</Text>
                      </Col>
                      <Col span={3}>
                          <Tag color={reportedColor} style={{ height: '10px' }} />
                          <Text>Reported</Text>
                      </Col>
                      <Col span={4}>
                          <Tag color={confirmReportedColor} style={{ height: '10px' }} />
                          <Text>Confirm Reported</Text>
                      </Col>
                  </Row>
                  <Row style={{ marginBottom: 10 }}>
                      <Col span={24}>
                          <Card
                              bordered={false}
                              className="card-master-data"
                              style={{ display: (dayType == "month") ? 'none': '' }}
                          >
                              <Row>
                                  <Col span={8}>
                                      <Table
                                          columns={columns}
                                          dataSource={workloadList}
                                          loading={loading}
                                          pagination={false}
                                          onChange={this.handleTableChange}
                                          size="middle"
                                      />
                                  </Col>
                                  <Col span={16}>
                                      {
                                          (this.state.dayType == 'today' || this.state.dayType == 1) &&
                                          <div className={loading ? 'header-workload-disabled' : 'header-workload'}>
                                              <DatePicker style={{ width: '200px' }} onChange={this.onChange.bind(this)} defaultValue={moment(this.state.dateString, dateFormat)} format={dateFormat} disabledDate={d => !d || d.isAfter(new Date())} />
                                          </div>
                                      }
                                      <table id="tbody-scroll" style={{ width: '100%', display: 'block', overflow: 'auto', whiteSpace: 'nowrap' }} >
                                          {
                                              (this.state.dayType == 'week' || this.state.dayType == 2 || this.state.dayType == 'month') &&
                                              <thead className={loading ? 'header-workload-disabled' : 'header-workload'}>
                                                  <tr>
                                                      {
                                                          workloadList.length > 0 &&
                                                          workloadList[0].dispatchDate.map(item => {
                                                              return (
                                                                  <td style={{ height: '46px' }}>{item.dispatchDate}<br />{item.day}</td>
                                                              )
                                                          })
                                                      }
                                                  </tr>
                                              </thead>
                                          }
                                          <tbody>
                                              {
                                                  workloadList.map(row => {
                                                      return (
                                                          <tr style={{ height: '57px' }}>
                                                              {
                                                                  (this.state.dayType == 'today' || this.state.dayType == 1) &&
                                                                  (
                                                                      row.dispatchDate[0].dispatchDetail.length > 0 ?
                                                                          row.dispatchDate[0].dispatchDetail.map(cell => {
                                                                              return (
                                                                                  <Tag
                                                                                      color={
                                                                                          cell.dispatchStatus === 'Start' ? startColor :
                                                                                              cell.dispatchStatus === 'Confirmed' ? confirmedColor :
                                                                                                  cell.dispatchStatus === 'Off' ? offColor :
                                                                                                      cell.dispatchStatus === 'Finish' ? finishColor :
                                                                                                          cell.dispatchStatus === 'Reported' ? reportedColor :
                                                                                                              confirmReportedColor
                                                                                      }
                                                                                      style={{ cursor: 'pointer' }}
                                                                                      className="tag-calendar"
                                                                                      onClick={() => this.getDetail(cell.orderId)}
                                                                                  >
                                                                                      {`${cell.dispatchTime} WIB`}
                                                                                  </Tag>
                                                                              )
                                                                          })
                                                                          :
                                                                          <Tag color={offColor} className="tag-calendar" style={{ width: document.getElementById('tbody-scroll').offsetWidth }}>
                                                                              OFF DAY
                                                                          </Tag>
                                                                  )
                                                              }


                                                              {
                                                                  (this.state.dayType == 'week' || this.state.dayType == 2 || this.state.dayType == "month") &&
                                                                  (
                                                                      row.dispatchDate.length > 0 && row.dispatchDate.map(item => {
                                                                          return (
                                                                              <td>
                                                                                  {
                                                                                      item.dispatchDetail.length > 0 ?
                                                                                          <Tag
                                                                                              color={
                                                                                                  item.dispatchDetail[0].dispatchStatus === 'Start' ? startColor :
                                                                                                      item.dispatchDetail[0].dispatchStatus === 'Confirmed' ? confirmedColor :
                                                                                                          item.dispatchDetail[0].dispatchStatus === 'Off' ? offColor :
                                                                                                              item.dispatchDetail[0].dispatchStatus === 'Finish' ? finishColor :
                                                                                                                  item.dispatchDetail[0].dispatchStatus === 'Reported' ? reportedColor :
                                                                                                                      confirmReportedColor
                                                                                              }
                                                                                              style={{ cursor: 'pointer' }}
                                                                                              className="tag-calendar"
                                                                                              onClick={() => this.getDetailWeek(row.workerId, item.dispatchDate)}
                                                                                          >
                                                                                              {`${item.dispatchDetail[0].dispatchTime} WIB`}
                                                                                          </Tag>
                                                                                          :
                                                                                          <Tag color={offColor} className="tag-calendar">
                                                                                              OFF DAY
                                                                                          </Tag>
                                                                                  }
                                                                              </td>
                                                                          )
                                                                      })
                                                                  )
                                                              }
                                                          </tr>
                                                      )
                                                  })
                                              }
                                          </tbody>
                                      </table>
                                  </Col>
                              </Row>
                              <br />
                              <Row>
                                  <Col span={24} style={{ textAlign: 'center' }}>
                                      <Pagination
                                          size="small"
                                          onChange={this.onChangePage.bind(this)}
                                          showSizeChanger={false}
                                          current={paginationCus.current}
                                          total={paginationCus.total}
                                      />
                                  </Col>
                              </Row>
                          </Card>

                          { (dayType == "month") ?
                            <Card className="card">
                                <FullCalendar
                                    timeZone='Asia/Jakarta'
                                    defaultView="dayGridMonth"
                                    header={{
                                        left: 'prev,next',
                                        center: 'title',
                                        right: ''
                                    }}
                                    plugins={[ dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin ]}
                                    ref={this.calenderRef }
                                    editable={false}
                                    selectable={false}
                                    dateClick={this.handleDateClick}
                                />
                            </Card>
                            :<></>
                          }
                      </Col>
                  </Row>
                  <Modal
                      visible={this.state.modalDetail}
                      className="form-modal"
                      footer={null}
                      centered
                      width={650}
                      onCancel={() => this.setState({ modalDetail: false })}
                  >
                      <Spin spinning={this.state.loadingDetail} tip={'Loading'}>
                          <Row gutter={15}>
                              <Col span={24}>
                                  <Title level={3}>{'Detail Workload Management'}</Title>
                              </Col>
                              <Col span={24}>
                                  <Text><b>Worker Name</b></Text>
                              </Col>
                              <Col span={24}>
                                  <Title className="body-detail" level={4}>{this.state.detailData.workerFullName ? this.state.detailData.workerFullName : '-'}</Title>
                              </Col>
                              <Col span={(this.state.dayType == 1 || this.state.dayType == 'today' || this.state.dayType == 'month') ? 12 : 24}>
                                  <Text><b>Date</b></Text>
                              </Col>
                              {(this.state.dayType == 1 || this.state.dayType == 'today' || this.state.dayType == 'month') &&
                                  <Col span={12}>
                                      <Text><b>Time</b></Text>
                                  </Col>
                              }
                              <Col span={(this.state.dayType == 1 || this.state.dayType == 'today' || this.state.dayType == 'month') ? 12 : 24}>
                                  <Title className="body-detail" level={4}>{this.state.detailData.dispatchDate ? this.state.detailData.dispatchDate : '-'}</Title>
                              </Col>
                              {(this.state.dayType == 1 || this.state.dayType == 'today' || this.state.dayType == 'month') &&
                                  <Col span={12}>
                                      <Title className="body-detail" level={4}>{this.state.detailData.dispatchTime ? this.state.detailData.dispatchTime : '-'}</Title>
                                  </Col>
                              }
                              {(this.state.dayType == 2 || this.state.dayType == 'week') &&
                                  <>
                                      <Col span={24}>
                                          <Text><b>Time</b></Text>
                                      </Col>
                                      <Col span={24}>
                                          {
                                              this.state.timeDetail.length > 0 ?
                                                  this.state.timeDetail.map(item => {
                                                      return (
                                                          <Tag
                                                              color={
                                                                  item.dispatchStatus === 'Start' ? startColor :
                                                                      item.dispatchStatus === 'Confirmed' ? confirmedColor :
                                                                          item.dispatchStatus === 'Off' ? offColor :
                                                                              item.dispatchStatus === 'Finish' ? finishColor :
                                                                                  item.dispatchStatus === 'Reported' ? reportedColor :
                                                                                      confirmReportedColor
                                                              }
                                                              style={{ cursor: 'pointer', marginLeft: '0px' }}
                                                              className="tag-calendar"
                                                          >
                                                              {item.dispatchTime} WIB
                                                          </Tag>
                                                      )
                                                  })
                                                  :
                                                  '-'
                                          }
                                      </Col>
                                  </>
                              }
                              {(this.state.dayType == 1 || this.state.dayType == 'today' || this.state.dayType == 'month') &&
                                  <>
                                      <Col span={12}>
                                          <Text><b>Status</b></Text>
                                      </Col>
                                      <Col span={12}>
                                          <Text><b>Duration (Hours)</b></Text>
                                      </Col>
                                      <Col span={12}>
                                          {
                                              this.state.detailData.dispatchStatus ?
                                                  <Tag
                                                      color={
                                                          this.state.detailData.dispatchStatus === 'Start' ? startColor :
                                                              this.state.detailData.dispatchStatus === 'Confirmed' ? confirmedColor :
                                                                  this.state.detailData.dispatchStatus === 'Off' ? offColor :
                                                                      this.state.detailData.dispatchStatus === 'Finish' ? finishColor :
                                                                          this.state.detailData.dispatchStatus === 'Reported' ? reportedColor :
                                                                              confirmReportedColor
                                                      }
                                                      style={{ cursor: 'pointer', marginLeft: '0px', width:'125px' }}
                                                      className="tag-calendar"
                                                  >
                                                      {this.state.detailData.dispatchStatus}
                                                  </Tag>
                                                  : '-'
                                          }
                                      </Col>
                                      <Col span={12}>
                                          <Title className="body-detail" level={4}>{this.state.detailData.duration ? this.state.detailData.duration : '-'}</Title>
                                      </Col>
                                      <Col span={24}>
                                          <Text><b>Ticket</b></Text>
                                      </Col>
                                      <Col span={24}>
                                          <Title className="body-detail" level={4}>{this.state.detailData.ticketTitle ? this.state.detailData.ticketTitle : '-'}</Title>
                                      </Col>
                                  </>
                              }
                          </Row>
                          <br />
                      </Spin>
                  </Modal>
                  <Modal
                      visible={this.state.modalDetailCalender}
                      className="form-modal"
                      footer={null}
                      onCancel={this.handleModalDetailCalender}
                      centered
                      width={1000}
                  >
                      <Spin spinning={loading}>
                          <Row style={{ marginBottom: 10, alignItems: 'center' }}>
                              <Col span={6}>
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
                                  value={this.state.search}
                                />
                              </Col>
                              <Col span={2}>
                                  <Text><strong>Legend : </strong></Text>
                              </Col>
                              <Col span={2}>
                                  <Tag color={startColor} style={{ height: '10px' }} />
                                  <Text>Start</Text>
                              </Col>
                              <Col span={3}>
                                  <Tag color={confirmedColor} style={{ height: '10px' }} />
                                  <Text>Confirmed</Text>
                              </Col>
                              <Col span={2}>
                                  <Tag color={offColor} style={{ height: '10px' }} />
                                  <Text>Off</Text>
                              </Col>
                              <Col span={2}>
                                  <Tag color={finishColor} style={{ height: '10px' }} />
                                  <Text>Finish</Text>
                              </Col>
                              <Col span={3}>
                                  <Tag color={reportedColor} style={{ height: '10px' }} />
                                  <Text>Reported</Text>
                              </Col>
                              <Col span={4}>
                                  <Tag color={confirmReportedColor} style={{ height: '10px' }} />
                                  <Text>Confirm Reported</Text>
                              </Col>
                          </Row>
                          <Row>
                              <Col span={8}>
                                  <Table
                                      columns={columns}
                                      dataSource={workloadList}
                                      loading={loading}
                                      pagination={false}
                                      onChange={this.handleTableChange}
                                      size="middle"
                                  />
                              </Col>
                              <Col span={16}>
                                  {
                                      (this.state.dayType == 'today' || this.state.dayType == 1 || this.state.dayType == 'month') &&
                                      <div className={loading ? 'header-workload-disabled' : 'header-workload'}>
                                          <DatePicker style={{ width: '200px' }} onChange={this.onChange.bind(this)} value={moment(this.state.dateString, dateFormat)} format={dateFormat} />
                                      </div>
                                  }
                                  <table id="tbody-scroll" style={{ width: '100%', display: 'block', overflow: 'auto', whiteSpace: 'nowrap' }} >
                                      {
                                          (this.state.dayType == 'week' || this.state.dayType == 2) &&
                                          <thead className={loading ? 'header-workload-disabled' : 'header-workload'}>
                                              <tr>
                                                  {
                                                      workloadList.length > 0 &&
                                                      workloadList[0].dispatchDate.map(item => {
                                                          return (
                                                              <td style={{ height: '46px' }}>{item.dispatchDate}<br />{item.day}</td>
                                                          )
                                                      })
                                                  }
                                              </tr>
                                          </thead>
                                      }
                                      <tbody>
                                          {
                                              workloadList.map(row => {
                                                  return (
                                                      <tr style={{ height: '57px' }}>
                                                          {
                                                              (this.state.dayType == 'today' || this.state.dayType == 1 || this.state.dayType == "month") &&
                                                              (
                                                                  row.dispatchDate[0].dispatchDetail.length > 0 ?
                                                                      row.dispatchDate[0].dispatchDetail.map(cell => {
                                                                          return (
                                                                              <Tag
                                                                                  color={
                                                                                      cell.dispatchStatus === 'Start' ? startColor :
                                                                                          cell.dispatchStatus === 'Confirmed' ? confirmedColor :
                                                                                              cell.dispatchStatus === 'Off' ? offColor :
                                                                                                  cell.dispatchStatus === 'Finish' ? finishColor :
                                                                                                      cell.dispatchStatus === 'Reported' ? reportedColor :
                                                                                                          confirmReportedColor
                                                                                  }
                                                                                  style={{ cursor: 'pointer' }}
                                                                                  className="tag-calendar"
                                                                                  onClick={() => this.getDetail(cell.orderId)}
                                                                              >
                                                                                  {`${cell.dispatchTime} WIB`}
                                                                              </Tag>
                                                                          )
                                                                      })
                                                                      :
                                                                      <Tag color={offColor} className="tag-calendar" style={{ width: '600px' }}>
                                                                          OFF DAY
                                                                      </Tag>
                                                              )
                                                          }


                                                          {
                                                              (this.state.dayType == 'week' || this.state.dayType == 2 ) &&
                                                              (
                                                                  row.dispatchDate.length > 0 && row.dispatchDate.map(item => {
                                                                      return (
                                                                          <td>
                                                                              {
                                                                                  item.dispatchDetail.length > 0 ?
                                                                                      <Tag
                                                                                          color={
                                                                                              item.dispatchDetail[0].dispatchStatus === 'Start' ? startColor :
                                                                                                  item.dispatchDetail[0].dispatchStatus === 'Confirmed' ? confirmedColor :
                                                                                                      item.dispatchDetail[0].dispatchStatus === 'Off' ? offColor :
                                                                                                          item.dispatchDetail[0].dispatchStatus === 'Finish' ? finishColor :
                                                                                                              item.dispatchDetail[0].dispatchStatus === 'Reported' ? reportedColor :
                                                                                                                  confirmReportedColor
                                                                                          }
                                                                                          style={{ cursor: 'pointer' }}
                                                                                          className="tag-calendar"
                                                                                          onClick={() => this.getDetailWeek(row.workerId, item.dispatchDate)}
                                                                                      >
                                                                                          {`${item.dispatchDetail[0].dispatchTime} WIB`}
                                                                                      </Tag>
                                                                                      :
                                                                                      <Tag color={offColor} className="tag-calendar">
                                                                                          OFF DAY
                                                                                      </Tag>
                                                                              }
                                                                          </td>
                                                                      )
                                                                  })
                                                              )
                                                          }
                                                      </tr>
                                                  )
                                              })
                                          }
                                      </tbody>
                                  </table>
                              </Col>
                          </Row>
                          <br />
                          <Row>
                              <Col span={24} style={{ textAlign: 'center', marginBottom: '20px'}}>
                                  <Pagination
                                      size="small"
                                      onChange={this.onChangePage.bind(this)}
                                      showSizeChanger={false}
                                      current={paginationCus.current}
                                      total={paginationCus.total}
                                  />
                              </Col>
                          </Row>
                      </Spin>
                  </Modal>
                  <Modal
                      visible={this.state.modalDetailMonth}
                      className="form-modal"
                      footer={null}
                      centered
                      width={650}
                      onCancel={() => this.setState({ modalDetailMonth: false })}
                  >
                      <Spin spinning={this.state.loadingDetail} tip={'Loading'}>
                          <Row gutter={15}>
                              <Col span={24}>
                                  <Title level={3}>{'Detail Workload Management'}</Title>
                              </Col>
                              <Col span={24}>
                                  <Text><b>Worker Name</b></Text>
                              </Col>
                              <Col span={24}>
                                  <Title className="body-detail" level={4}>{this.state.detailData.workerFullName ? this.state.detailData.workerFullName : '-'}</Title>
                              </Col>
                              <Col span={(this.state.dayType == 1 || this.state.dayType == 'today' || this.state.dayType == 'month') ? 12 : 24}>
                                  <Text><b>Date</b></Text>
                              </Col>
                              {(this.state.dayType == 1 || this.state.dayType == 'today' || this.state.dayType == 'month') &&
                                  <Col span={12}>
                                      <Text><b>Time</b></Text>
                                  </Col>
                              }
                              <Col span={(this.state.dayType == 1 || this.state.dayType == 'today' || this.state.dayType == 'month') ? 12 : 24}>
                                  <Title className="body-detail" level={4}>{this.state.detailData.dispatchDate ? this.state.detailData.dispatchDate : '-'}</Title>
                              </Col>
                              {(this.state.dayType == 1 || this.state.dayType == 'today' || this.state.dayType == 'month') &&
                                  <Col span={12}>
                                      <Title className="body-detail" level={4}>{this.state.detailData.dispatchTime ? this.state.detailData.dispatchTime : '-'}</Title>
                                  </Col>
                              }
                              {(this.state.dayType == 2 || this.state.dayType == 'week') &&
                                  <>
                                      <Col span={24}>
                                          <Text><b>Time</b></Text>
                                      </Col>
                                      <Col span={24}>
                                          {
                                              this.state.timeDetail.length > 0 ?
                                                  this.state.timeDetail.map(item => {
                                                      return (
                                                          <Tag
                                                              color={
                                                                  item.dispatchStatus === 'Start' ? startColor :
                                                                      item.dispatchStatus === 'Confirmed' ? confirmedColor :
                                                                          item.dispatchStatus === 'Off' ? offColor :
                                                                              item.dispatchStatus === 'Finish' ? finishColor :
                                                                                  item.dispatchStatus === 'Reported' ? reportedColor :
                                                                                      confirmReportedColor
                                                              }
                                                              style={{ cursor: 'pointer', marginLeft: '0px' }}
                                                              className="tag-calendar"
                                                          >
                                                              {item.dispatchTime} WIB
                                                          </Tag>
                                                      )
                                                  })
                                                  :
                                                  '-'
                                          }
                                      </Col>
                                  </>
                              }
                              {(this.state.dayType == 1 || this.state.dayType == 'today' || this.state.dayType == 'month') &&
                                  <>
                                      <Col span={12}>
                                          <Text><b>Status</b></Text>
                                      </Col>
                                      <Col span={12}>
                                          <Text><b>Duration (Hours)</b></Text>
                                      </Col>
                                      <Col span={12}>
                                          {
                                              this.state.detailData.dispatchStatus ?
                                                  <Tag
                                                      color={
                                                          this.state.detailData.dispatchStatus === 'Start' ? startColor :
                                                              this.state.detailData.dispatchStatus === 'Confirmed' ? confirmedColor :
                                                                  this.state.detailData.dispatchStatus === 'Off' ? offColor :
                                                                      this.state.detailData.dispatchStatus === 'Finish' ? finishColor :
                                                                          this.state.detailData.dispatchStatus === 'Reported' ? reportedColor :
                                                                              confirmReportedColor
                                                      }
                                                      style={{ cursor: 'pointer', marginLeft: '0px' }}
                                                      className="tag-calendar"
                                                  >
                                                      {this.state.detailData.dispatchStatus}
                                                  </Tag>
                                                  : '-'
                                          }
                                      </Col>
                                      <Col span={12}>
                                          <Title className="body-detail" level={4}>{this.state.detailData.duration ? this.state.detailData.duration : '-'}</Title>
                                      </Col>
                                      <Col span={24}>
                                          <Text><b>Ticket</b></Text>
                                      </Col>
                                      <Col span={24}>
                                          <Title className="body-detail" level={4}>{this.state.detailData.ticketTitle ? this.state.detailData.ticketTitle : '-'}</Title>
                                      </Col>
                                  </>
                              }
                          </Row>
                          <br />
                      </Spin>
                  </Modal>
                  <ModalCreateEdit
                      title="Detail Worker"
                      visible={visibleDetailMonth}
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
                </div>
                :<PermissionDenied />
              }
            </Content>
        );
    }
}

export default withRouter(WorkloadCalendar);
