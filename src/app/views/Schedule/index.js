import React from "react";
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { Layout, Row, Col, Typography, Card, notification, Select } from "antd";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from './modal';
import ModalTL from './../TicketingList/modal';

import _debounce from 'lodash.debounce';
import { GlobalFunction } from '../../global/function';
// import { start } from "repl";
import { FSMServices } from '../../service';
import PermissionDenied from '../../global/permissionDenied'
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;

function InfoStatus (props) {
    return (
        <div className="info-status">
            <div
                className="color-status"
                style={{
                    backgroundColor: props.color ? props.color : "#FFF"
                }}
            />
            <span className="status-ticket">{props.statusTitle}</span>
        </div>
    )
}

function Legend (props) {
    return (
        <div className="legend">
            <span className="title">Legend</span>
            <InfoStatus color="#4e8ed0" statusTitle="Start" />
            <InfoStatus color="red" statusTitle="Canceled" />
            <InfoStatus color="green" statusTitle="Confirmed" />
            <InfoStatus color="orange" statusTitle="Hold" />
            <InfoStatus color="#365f88" statusTitle="Finish" />
            <InfoStatus color="rgb(167, 61, 61)" statusTitle="Reported" />
            <InfoStatus color="#d742f5" statusTitle="Confirm Reported" />
        </div>
    )
}

class Schedule extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"
        this.handleModalCreateTLClose = this.handleModalCreateTLClose.bind(this);
        this.state = {
            visibleCreateTL: false,
            visibleDetail: false,
            calendarWeekends: true,
            optionListJob: [],
            allDataSchedule : [],
            dataPic: [],
            scheduleDetail: [],
            currentDate: [],
            todayDate: moment(new Date()).format("YYYY-MM-DD"),
            duration: [
                {
                  id: 1,
                  duration: 1
                },
                {
                  id: 2,
                  duration: 2
                },
                {
                  id: 3,
                  duration: 3
                },
                {
                  id: 4,
                  duration: 4
                },
                {
                  id: 5,
                  duration: 5
                },
                {
                  id: 6,
                  duration: 6
                },
                {
                  id: 7,
                  duration: 7
                },
                {
                  id: 8,
                  duration: 8
                },
                {
                  id: 9,
                  duration: 9
                },
                {
                  id: 10,
                  duration: 10
                },
                {
                  id: 11,
                  duration: 11
                },
                {
                  id: 12,
                  duration: 12
                },
              ],
              accessRight: '',
              optionListRefTicket: [],
              branchByCompanyUpdate: [],
              optionListBranchByCompany: [],
              isDisabledBranch: true,
              loadingCreateTicket: false,
        }
    }

    calendarComponentRef = React.createRef()

    componentDidMount() {
        this.getAllDataSchedule();
        this.getOptionListCutomer();
        this.getOptionListSLA();
        this.getOptionListPriority();
        this.getOptionListPIC();
        this.getOptionListJob();
        this.getOptionListRefTicket();
        this.getOptionListJobCategory();
        this.getOptionListJobClass();
        this.getOptionListCategory();
        this.getOptionListReport();
        this.setState({
          userIdAkun: this.props.userId
        })
        setTimeout(() => this.setState({accessRight: sessionStorage.getItem("accessRight")}),500);
    }

    async getScheduleById(orderId) {
        this.setState({ loadingDetail: true });
        await FSMServices.getDetailDataSchedule(orderId)
        .then( res => {
            this.setState({
                scheduleDetail: res ? res.data.Data : [],
            });
        });
        this.setState({ loadingDetail: false });
    }

    async getAllDataSchedule() {
        this.setState({
            loading : true
        });
        await FSMServices.getAllDataSchedule().then(res => {
            this.setState({
                allDataSchedule: res ? res.data.Data : [],
            });
        });
        let temp = this.state.allDataSchedule.map(item => {
            if (item.status === "Start" ) {
                return{
                    id: item.orderid,
                    title: item.customer,
                    start: item.dispatchDate + " " + item.dispatchTime,
                    color: '#4e8ed0'
                }
            } else if ( item.status === "Canceled" ) {
                return{
                    id: item.orderid,
                    title: item.customer,
                    start: item.dispatchDate + " " + item.dispatchTime,
                    color: 'red'
                }
            } else if (item.status === "Confirmed") {
                return{
                    id: item.orderid,
                    title: item.customer,
                    start: item.dispatchDate + " " + item.dispatchTime,
                    color: 'green'
                }
            } else if (item.status === "Hold") {
                return {
                    id: item.orderid,
                    title: item.customer,
                    start: item.dispatchDate + " " + item.dispatchTime,
                    color: 'orange'
                }
            } else if (item.status === "Finish") {
                return {
                    id: item.orderid,
                    title: item.customer,
                    start: item.dispatchDate + " " + item.dispatchTime,
                    color: '#365f88'
                }
            } else if (item.status === "Reported") {
                return {
                    id: item.orderid,
                    title: item.customer,
                    start: item.dispatchDate + " " + item.dispatchTime,
                    color: 'rgb(167, 61, 61)'
                }
            } else if (item.status === "Confirm Reported") {
                return {
                    id: item.orderid,
                    title: item.customer,
                    start: item.dispatchDate + " " + item.dispatchTime,
                    color: '#d742f5'
                }
            } else {
                return {
                    id: item.orderid,
                    title: item.customer,
                    start: item.dispatchDate + " " + item.dispatchTime,
                }
            }
        })
        this.setState({
            allDataSchedule: temp
        })
      }

    // Form Ticketing and Create Ticketing
    getOptionListCutomer() {
        FSMServices.getOptionListCustomer().then( res => {
            this.setState({
                optionListCustomer: res ? res.data.Data : []
            });
        })
    }

    getOptionListBranch(companyId) {
      this.setState({
          isDisabledBranch: true
      })
        FSMServices.getOptionListBranch(companyId).then( res => {
            this.setState({
                optionListBranch: res ? res.data.Data : [],
                branchByCompanyUpdate: res ? res.data.Data : [],
                optionListBranchByCompany: res ? res.data.Data : [],
                isDisabledBranch: false
            })
        });
    }

    onChangeCustomer = e => {
      this.getOptionListBranch(e)
    }

    getOptionListPIC() {
        FSMServices.getOptionListPIC().then(res => {
            this.setState({
                dataPic: res ? res.data.Data : []
            })
        });
    }

    async getOptionListSLA() {
      let data = []
      await FSMServices.getSLAOptions().then(res => {
        data = res ? res.data.Data : []
      })
      this.setState({
        dataSLA: data
      })
    }


    async getOptionListPriority() {
      let data = []
      await FSMServices.getPriority().then(res => {
        data = res ? res.data.Data : []
      })
      this.setState({
        dataPriority: data
      })
    }

    async getOptionListReport() {
      let data = []
      await FSMServices.getReport().then(res => {
        data = res ? res.data.Data : []
      })
      this.setState({
        dataReport: data
      })
    }

    onChangeSubLocation = e => {
        let dataMapping = [];
        this.state.optionListPIC.map(item => {
            if (item.branchId === e) {
                let data = item;
                dataMapping.push(data);
            }

            return '';
        });
        this.setState({
            picByCompanyUpdate: dataMapping,
            optionListPICBySubLocation: dataMapping
        })
    }

    getOptionListJob() {
        FSMServices.searchGetListJob('').then(res => {
            this.setState({
                optionListJob: res ? res.data.Data : []
            })
        });
    }

    getOptionListRefTicket() {
        FSMServices.searchGetListRefTicket('').then(res => {
            this.setState({
                optionListRefTicket: res ? res.data.Data : []
            })
        });
    }

    getOptionListJobCategory() {
        FSMServices.getOptionListJobCategory().then(res => {
            this.setState({
                optionListJobCategory: res ? res.data.Data : []
            })
        });
    }

    onChangeJobCategory = e => {
        let dataMapping = [];
        this.state.optionListJob.map(item => {
            if (item.jobCategoryId === e) {
                let data = item;
                dataMapping.push(data);
            }

            return '';
        });
        this.setState({
            jobByCategoryUpdate: dataMapping,
            optionListJobByJobCategory: dataMapping
        })
    }

    getOptionListJobClass(){
        FSMServices.getOptionListJobClass().then(res => {
            this.setState({
                optionListJobClass: res ? res.data.Data : []
            })
        });
    }

    onChangeJobClass = e => {
        let dataMapping = [];
        this.state.optionListJobCategory.map(item => {
            if (item.jobClassId === e) {
                let data = item;
                dataMapping.push(data);
            }

            return '';
        });
        this.setState({
            categoryByClassUpdate: dataMapping,
            optionListJobCategoryByjobClass: dataMapping
        })
    }

    getOptionListCategory() {
        FSMServices.getOptionListCategory().then(res => {
            this.setState({
                optionListCategory: res ? res.data.Data : []
            })
        });
    }

    createTicket = (data) => {
        FSMServices.createTicket(data).then( res => {
            if ( res ? res.status === 200 : false ) {
                notification.success({
                    placement: 'bottomRight',
                    message: 'Success',
                    description: 'Create Ticket Success',
                });
                this.setState({
                    visibleCreateTL: false
                })
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: 'Create Ticket Error',
                });
            }
            this.setState({ loadingCreateTicket: false })
        })
    }

    onFinishCreate = (values, fileName, filePath) => {
      this.setState({ loadingCreateTicket: true })
        const data = {
            ticketStatusId: "8",
            categoryId: values.categoryId.toString(),
            branchId: {
              branchId: values.branchId.toString()
            },
            companyId: {
              companyId: values.companyId.toString()
            },
            slaId: {
              slaId: values.slaId.toString()
            },
            jobId: {
              jobId: values.jobId.toString()
            },
            picId: {
              picId: values.picId.toString()
            },
            priorityId: values.priorityId.toString(),
            fileName: fileName,
            filePath: filePath,
            ticketTitle: values.ticketTitle,
            ticketDescription: values.description,
            ticketDurationTime: values.ticketDurationTime,
            createdBy: this.state.userIdAkun,
            lastModifiedBy: this.state.userIdAkun,
            referenceTicketCode: values.refTicketCode
        }

        this.createTicket(data);
    }
    // End

    handleModalCreateTL = e => {
        this.setState({
            visibleCreateTL: !this.state.visibleCreateTL,
            loadingCreateTicket: false
        })
    }

    handleModalCreateTLClose() {
        this.setState({
            visibleCreateTL: false,
            loadingCreateTicket: true,
            isDisabledBranch: true
        })
    }

    handleModalDetail = e => {
        this.setState({ visibleDetail: !this.state.visibleDetail })
    }

    handleDateClick = (arg) => {
      if (arg.dateStr === this.state.todayDate){
          this.setState({
          visibleCreateTL: true,
          loadingCreateTicket: false
        })
      }
    }

    handleDateSelect = (arg) => {
        this.setState(
            {
                dateString: arg ? arg.startStr : [],
                timeString: new Date().getHours() + ':' + new Date().getMinutes(),
                currentDate: {
                    ticketDate: arg ? arg.start : [],
                    ticketTime: new Date()
                }
            }
        )
    }

    handleEventClick = (info) => {
        this.getScheduleById(info.event.id);
        this.setState({ visibleDetail: true })
    }

    searchJob = (key) => {
        this.processSearchJob(GlobalFunction.searchEncode(key))
      }

      processSearchJob = _debounce(key => {
        const { optionListJob } = this.state
        let data = null
        FSMServices.searchGetListJob(key).then(res => {
          data = res ? res.data.Data : optionListJob
          this.setState({
            optionListJob: data
          })
        })
      },500)

    searchRefTicket = (key) => {
        this.processSearchRefTicket(GlobalFunction.searchEncode(key))
    }

    processSearchRefTicket = _debounce(key => {
      const { optionListRefTicket } = this.state
      let data = null
      FSMServices.searchGetListRefTicket(key).then(res => {
        data = res ? res.data.Data : optionListJob
        this.setState({
          optionListRefTicket: data
        })
      })
    },500)

    render() {
        const {
            allDataSchedule,
            calendarWeekends,
            scheduleDetail,
            loadingDetail,
            dataSLA,
            dataPriority,
            dataReport,
            optionListJob,
            dataPic,
            accessRight,
            optionListRefTicket,
            isDisabledBranch
        } = this.state;
        const optionsListJob = optionListJob.map((item, index) => {
            return <Select.Option key={item.jobId + 'job' + index} value={item.jobId}>{item.jobName}</Select.Option>
        })

        const optionsListRefTicket = optionListRefTicket.map((item, index) => {
            return <Select.Option key={item.ticketCode + 'refTicket' + index} value={item.ticketCode}>{item.ticketCode}</Select.Option>
        })
        return (
            <Content>
              { accessRight.includes('Read') || accessRight == "" ?
                <Row justify="center" style={{ marginTop: 150 }}>
                    <Col xs={23} lg={20}>
                        <Row gutter={[10, 10]}>
                            <Col xs={24}>
                                <Title level={2} className="text-heading">
                                    Schedule
                                </Title>
                            </Col>
                            <Col xs={24}>
                                <Card className="card">
                                    <FullCalendar
                                        timeZone='Asia/Jakarta'
                                        defaultView="dayGridMonth"
                                        header={{
                                            left: 'prevYear,prev,next,nextYear today',
                                            center: 'title',
                                            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                                        }}
                                        plugins={[ dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin ]}
                                        ref={this.calenderRef }
                                        editable={true}
                                        selectable={true}
                                        weekends={calendarWeekends}
                                        events={allDataSchedule}
                                        eventClick={this.handleEventClick}
                                        dateClick={accessRight.includes('Create') ? this.handleDateClick : null}
                                        select={this.handleDateSelect}
                                    />
                                    <Legend />
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                :
                <Row justify="center" style={{ marginTop: 150 }}>
                  <PermissionDenied />
                </Row>
              }
                <ModalTL
                    title="New Ticket"
                    visible={this.state.visibleCreateTL}
                    buttonCancel={this.handleModalCreateTLClose}
                    customer={this.state.optionListCustomer}
                    onChangeCustomer={e => this.onChangeCustomer(e)}
                    subLocation={this.state.optionListBranchByCompany}
                    onChangeSubLocation={e => this.onChangeSubLocation(e)}
                    searchJob={val => this.searchJob(val)}
                    dataSLA={dataSLA}
                    dataPriority={dataPriority}
                    dataReport={dataReport}
                    pic={dataPic}
                    job={optionsListJob}
                    jobCategory={this.state.optionListJobCategoryByjobClass}
                    onChangeJobCategory={e => this.onChangeJobCategory(e)}
                    jobClass={this.state.optionListJobClass}
                    onChangeJobClass={e => this.onChangeJobClass(e)}
                    category={this.state.optionListCategory}
                    duration={this.state.duration}
                    onFinish={(values, fileName, filePath) => this.onFinishCreate(values, fileName, filePath)}
                    onChangeDate={(date, dateString) => this.onChangeDate(date, dateString) }
                    onChangeTime={(time, timeString) => this.onChangeTime(time, timeString)}
                    refTicket={optionsListRefTicket}
                    searchRefTicket={val => this.searchRefTicket(val)}
                    isDisabledBranch={isDisabledBranch}
                    loadingCreateTicket={this.state.loadingCreateTicket}
                />
                <Modal
                    title="Detail Ticket"
                    visible={this.state.visibleDetail}
                    buttonCancel={this.handleModalDetail}
                    scheduleDetail={scheduleDetail}
                    loading={loadingDetail}
                />
            </Content>
        );
    }
}

export default withRouter(Schedule);
